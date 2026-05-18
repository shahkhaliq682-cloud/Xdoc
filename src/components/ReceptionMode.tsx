import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Clock, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Plus, 
  User, 
  Stethoscope, 
  Phone,
  Bell,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { db, auth } from '../firebase';
import { 
  getKarachiTime, 
  formatKarachiClock, 
  formatKarachiDate, 
  getKarachiDateStr, 
  getKarachiTimeStr 
} from '../lib/timeUtils';
import { 
  collection, 
  addDoc, 
  serverTimestamp,
  doc,
  writeBatch,
  query,
  onSnapshot,
  where,
  getDocs
} from 'firebase/firestore';

interface ReceptionModeProps {
  hospitalData: any;
  tokens: any[];
  onClose: () => void;
  updateTokenStatus: (tokenId: string, status: string, patientId?: string) => Promise<void>;
  doctors: any[];
}

const ReceptionMode: React.FC<ReceptionModeProps> = ({ 
  hospitalData, 
  tokens, 
  onClose, 
  updateTokenStatus,
  doctors 
}) => {
  const { t, language } = useLanguage();
  const [currentTime, setCurrentTime] = useState(getKarachiTime());
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueLoading, setIssueLoading] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [localDoctors, setLocalDoctors] = useState<any[]>([]);
  const [lastNotification, setLastNotification] = useState<any>(null);
  const [screenEffect, setScreenEffect] = useState<'none' | 'green' | 'red'>('none');
  const [inProgressStartTime, setInProgressStartTime] = useState<number | null>(null);
  const [showNoShowAlert, setShowNoShowAlert] = useState<any>(null);
  const [consultationTime, setConsultationTime] = useState(0);
  
  const prevTokensRef = useRef<any[]>([]);

  // Live Clock Update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getKarachiTime());
    }, 30000); // Update every 30 seconds for minute accuracy
    return () => clearInterval(timer);
  }, []);

  // Filter today's tokens and sort them
  const todayStr = getKarachiDateStr(new Date());
  const todaysTokens = tokens
    .filter(t => 
      t.appointmentDate === todayStr || 
      t.bookingDate === todayStr ||
      (t.createdAt?.toDate ? getKarachiDateStr(t.createdAt.toDate()) === todayStr : false)
    )
    .sort((a, b) => {
      // Completed, Not-Arrived, Expired go to bottom
      const statusOrder: any = { 'in-progress': 0, 'waiting': 1, 'active': 1, 'not-arrived': 2, 'completed': 3, 'expired': 4 };
      const aStatus = (a.status || a.tokenStatus || 'waiting').toLowerCase();
      const bStatus = (b.status || b.tokenStatus || 'waiting').toLowerCase();
      if (statusOrder[aStatus] !== statusOrder[bStatus]) {
        return statusOrder[aStatus] - statusOrder[bStatus];
      }
      return (a.tokenNumber || '').localeCompare(b.tokenNumber || '');
    });

  const stats = {
    total: todaysTokens.length,
    waiting: todaysTokens.filter(tok => {
      const s = (tok.status || tok.tokenStatus || '').toLowerCase();
      return s === 'waiting' || s === 'active';
    }).length,
    completed: todaysTokens.filter(tok => (tok.status || '').toLowerCase() === 'completed').length,
    missed: todaysTokens.filter(tok => (tok.status || '').toLowerCase() === 'not-arrived').length
  };

  const inProgressToken = todaysTokens.find(tok => (tok.status || '').toLowerCase() === 'in-progress');
  const waitingTokens = todaysTokens.filter(tok => {
    const s = (tok.status || tok.tokenStatus || '').toLowerCase();
    return s === 'waiting' || s === 'active';
  });
  
  const missedToday = todaysTokens.filter(tok => (tok.status || '').toLowerCase() === 'not-arrived');
  const doneToday = todaysTokens.filter(tok => (tok.status || '').toLowerCase() === 'completed');
  const expiredToday = todaysTokens.filter(tok => tok.status === 'expired' || tok.expired === true);

  const nextWaiting = waitingTokens.slice(0, 5);

  // Consultation Timer
  useEffect(() => {
    if (inProgressToken) {
      if (!inProgressStartTime) setInProgressStartTime(Date.now());
      const timer = setInterval(() => {
        const start = inProgressToken.updatedAt?.toMillis?.() || inProgressStartTime || Date.now();
        setConsultationTime(Math.floor((Date.now() - start) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setInProgressStartTime(null);
      setConsultationTime(0);
    }
  }, [inProgressToken?.id]);

  // Auto No-Show Local Detection for Alerts
  useEffect(() => {
    const timer = setInterval(() => {
      const settings = hospitalData?.settings || {};
      if (settings.alertBeforeAutoMark === false) return;
      
      const limitMinutes = Number(settings.noShowLimit) || 15;
      const now = new Date();

      waitingTokens.forEach(token => {
        try {
          const [time, period] = (token.appointmentTime || '').split(' ');
          let [hours, minutes] = time.split(':').map(Number);
          if (period === 'PM' && hours !== 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;
          
          const apptTime = new Date();
          apptTime.setHours(hours, minutes, 0, 0);
          
          const diffInMinutes = (now.getTime() - apptTime.getTime()) / (1000 * 60);
          if (diffInMinutes > limitMinutes && !showNoShowAlert) {
            setShowNoShowAlert(token);
          }
        } catch (e) {}
      });
    }, 10000);
    return () => clearInterval(timer);
  }, [waitingTokens, showNoShowAlert, hospitalData?.settings]);

  // Auto Expiry Logic (Checks if appointment time has passed)
  useEffect(() => {
    const checkExpiries = async () => {
      const now = getKarachiTime(); // Current Karachi Time
      
      const tokensToExpire = tokens.filter(token => {
        const status = (token.status || token.tokenStatus || '').toLowerCase();
        // Only expire 'waiting' or 'active' tokens
        if (status !== 'waiting' && status !== 'active') return false;
        if (token.expired) return false;
        
        const apptDate = token.appointmentDate || token.bookingDate;
        const apptTime = token.appointmentTime || token.bookingTime;
        
        if (!apptDate || !apptTime) return false;

        try {
          const [timePart, period] = apptTime.split(' ');
          let [hours, minutes] = timePart.split(':').map(Number);
          if (period === 'PM' && hours !== 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;

          const targetTime = new Date(apptDate);
          targetTime.setHours(hours, minutes, 0, 0);

          // Expire if currently at least 15 minutes PAST the appointment time
          // (Giving some grace period)
          return now.getTime() > (targetTime.getTime() + (15 * 60 * 1000));
        } catch (e) {
          return false;
        }
      });

      if (tokensToExpire.length > 0) {
        const batch = writeBatch(db);
        const kTime = getKarachiTime();
        const expiredAtStr = formatKarachiClock(kTime);

        tokensToExpire.forEach(token => {
          const updateData = {
            status: 'expired',
            tokenStatus: 'expired',
            expired: true,
            expiredAt: expiredAtStr,
            updatedAt: serverTimestamp()
          };
          batch.update(doc(db, 'tokens', token.id), updateData);
          if (token.hospitalId) {
            batch.update(doc(db, 'hospitals', token.hospitalId, 'tokens', token.id), updateData);
          }
        });
        await batch.commit();
      }
    };

    const interval = setInterval(checkExpiries, 30000); // Check more frequently (30s)
    checkExpiries();
    return () => clearInterval(interval);
  }, [tokens]);

  const getWaitMinutes = (token: any) => {
    try {
      const bookingTime = token.bookingTimestamp?.toMillis?.() || token.createdAt?.toMillis?.();
      if (bookingTime) {
        return Math.floor((Date.now() - bookingTime) / (1000 * 60));
      }

      const [time, period] = (token.appointmentTime || '').split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      const apptTime = new Date();
      apptTime.setHours(hours, minutes, 0, 0);
      return Math.floor((Date.now() - apptTime.getTime()) / (1000 * 60));
    } catch (e) { return 0; }
  };

  // New token notification detection
  useEffect(() => {
    if (prevTokensRef.current.length > 0 && tokens.length > prevTokensRef.current.length) {
      const newToken = tokens.find(t => !prevTokensRef.current.find(pt => pt.id === t.id));
      if (newToken && newToken.appointmentDate === todayStr) {
        setLastNotification(newToken);
        setTimeout(() => setLastNotification(null), 3000);
      }
    }
    prevTokensRef.current = tokens;
  }, [tokens, todayStr]);

  const handleAction = async (action: 'start' | 'done' | 'missed' | 'skip') => {
    if (action === 'start') {
      const next = waitingTokens[0];
      if (next) {
        await updateTokenStatus(next.id, 'in-progress', next.patientId);
      }
    } else if (action === 'done') {
      if (inProgressToken) {
        setScreenEffect('green');
        setTimeout(() => setScreenEffect('none'), 500);
        await updateTokenStatus(inProgressToken.id, 'completed', inProgressToken.patientId);
        // Auto-advance
        if (waitingTokens[0]) {
          setTimeout(() => updateTokenStatus(waitingTokens[0].id, 'in-progress', waitingTokens[0].patientId), 300);
        }
      }
    } else if (action === 'missed' || action === 'skip') {
      const target = action === 'skip' ? inProgressToken : inProgressToken;
      if (target) {
        setScreenEffect('red');
        setTimeout(() => setScreenEffect('none'), 500);
        await updateTokenStatus(target.id, 'not-arrived', target.patientId);
        // Auto-advance
        if (waitingTokens[0]) {
           setTimeout(() => updateTokenStatus(waitingTokens[0].id, 'in-progress', waitingTokens[0].patientId), 300);
        }
      }
    }
  };

  const handleNext = async () => {
    if (inProgressToken) {
      await handleAction('done');
    } else if (waitingTokens[0]) {
      await handleAction('start');
    }
  };

  // Fetch doctors when modal opens - Combining doctors and staff subcollections
  useEffect(() => {
    if (showIssueModal) {
      const hId = hospitalData?.uid || hospitalData?.id || auth.currentUser?.uid;
      if (!hId) return;

      setDoctorsLoading(true);
      
      const qDocs = query(collection(db, `hospitals/${hId}/doctors`));
      const qStaff = query(collection(db, `hospitals/${hId}/staff`), where('role', '==', 'Doctor'));
      
      let docsData: any[] = [];
      let staffData: any[] = [];

      const combineAndSet = () => {
        const combined = [...docsData];
        staffData.forEach(s => {
          if (!combined.find(c => c.name === s.name)) {
            combined.push(s);
          }
        });
        setLocalDoctors(combined);
        setDoctorsLoading(false);
      };

      const unsubscribeDocs = onSnapshot(qDocs, (snap) => {
        docsData = snap.docs.map(d => ({ 
          id: d.id, 
          name: d.data().name, 
          specialization: d.data().specialization || 'General'
        }));
        combineAndSet();
      });

      const unsubscribeStaff = onSnapshot(qStaff, (snap) => {
        staffData = snap.docs.map(s => ({ 
          id: s.id, 
          name: s.data().name, 
          specialization: s.data().department || 'General'
        }));
        combineAndSet();
      });

      return () => {
        unsubscribeDocs();
        unsubscribeStaff();
      };
    }
  }, [showIssueModal, hospitalData?.uid, hospitalData?.id]);

  const [showError, setShowError] = useState(false);

  // Generate and filter available slots
  const allSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
    '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM'
  ];

  const getAvailableSlots = () => {
    // Collect all booked slots for today and the selected doctor
    const bookedSlots = todaysTokens
      .filter(t => t.doctorId === selectedDoctorId && (t.status !== 'cancelled' && t.status !== 'expired'))
      .map(t => t.appointmentTime || t.bookingTime);
    
    return allSlots.filter(slot => !bookedSlots.includes(slot));
  };

  const issueToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName || !selectedDoctorId || (!selectedSlot && selectedDoctorId !== 'walk-in')) {
      setShowError(true);
      return;
    }
    setShowError(false);
    setIssueLoading(true);
    try {
      let doctorName = 'General';
      let doctorSpecialization = 'Clinic Walk-in';
      let docId: any = selectedDoctorId;
      let finalSlot = selectedSlot;
      
      if (selectedDoctorId === 'walk-in') {
        doctorName = 'Walk-in';
        doctorSpecialization = 'No Specific Doctor';
        docId = null;
        finalSlot = getKarachiTimeStr(getKarachiTime()); // Immediate
      } else {
        const doctor = localDoctors.find(d => d.id === selectedDoctorId);
        if (doctor) {
          doctorName = doctor.name;
          doctorSpecialization = doctor.specialization;
        }
      }

      const hospitalId = hospitalData?.uid || hospitalData?.id || auth.currentUser?.uid;
      if (!hospitalId) throw new Error("Hospital ID missing");
      const existingTokens = tokens.filter(t => t.appointmentDate === todayStr);
      const nextNum = existingTokens.length + 1;
      const tokenNumber = `T-${nextNum.toString().padStart(3, '0')}`;

      const kTime = getKarachiTime();
      const bookingDate = getKarachiDateStr(kTime);
      const bookingTime = getKarachiTimeStr(kTime);

      const newToken = {
        patientName: newPatientName,
        phoneNumber: newPatientPhone || 'N/A',
        doctorId: docId,
        doctorName: doctorName,
        tokenNumber,
        hospitalName: hospitalData?.hospitalName || 'Clinic',
        hospitalId,
        bookingTime,
        bookingDate,
        bookingTimestamp: serverTimestamp(),
        tokenStatus: 'active',
        status: 'waiting',
        expired: false,
        expiredAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        appointmentDate: bookingDate,
        appointmentTime: finalSlot || bookingTime,
        source: 'Reception',
        type: 'walk-in',
        fee: hospitalData?.opdFee || 0,
        doctorSpecialization: doctorSpecialization
      };

      const batch = writeBatch(db);
      const tokenRef = doc(collection(db, 'tokens'));
      batch.set(tokenRef, newToken);
      const hospitalTokenRef = doc(db, 'hospitals', hospitalId, 'tokens', tokenRef.id);
      batch.set(hospitalTokenRef, newToken);
      
      await batch.commit();

      setShowIssueModal(false);
      setNewPatientName('');
      setNewPatientPhone('');
      setSelectedDoctorId('');
      
      setLastNotification({ ...newToken, id: tokenRef.id });
      setTimeout(() => setLastNotification(null), 3000);
    } catch (err) {
      console.error("Error issuing token:", err);
    } finally {
      setIssueLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] bg-[#04111D] text-white flex flex-col overflow-hidden font-sans ${language === 'UR' ? 'font-urdu' : ''}`}>
      {/* Background Effects */}
      <AnimatePresence>
        {screenEffect === 'green' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-emerald-500 z-0 pointer-events-none"
          />
        )}
        {screenEffect === 'red' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-500 z-0 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <div className="flex items-center justify-between px-10 py-6 border-b border-white/5 bg-white/2 backdrop-blur-sm z-10">
        <div className="flex flex-col">
          <h1 className="text-sm font-black uppercase tracking-[0.2em] text-teal-400">{hospitalData?.hospitalName}</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.patient.booking.receptionMode}</p>
        </div>

        <div className="flex flex-col items-center">
          <p className="text-5xl font-black tracking-tighter text-white">
            {formatKarachiClock(currentTime)}
          </p>
          <p className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mt-1">
            {formatKarachiDate(currentTime)}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowIssueModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-teal-500 text-[#04111D] rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-teal-500/20"
          >
            <Plus size={18} strokeWidth={3} /> {t.patient.booking.issueNewToken}
          </button>
          <button 
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            <X size={18} strokeWidth={3} /> {t.patient.booking.exitReceptionMode}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-10 overflow-y-auto no-scrollbar relative">
        <AnimatePresence mode="wait">
          {!inProgressToken ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center space-y-6"
            >
              <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="text-6xl">😊</span>
              </div>
              <h2 className="text-3xl font-black">{t.patient.booking.noPatients}</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">{t.patient.booking.noPatientsSub}</p>
              {waitingTokens.length > 0 && (
                <button 
                  onClick={() => handleAction('start')}
                  className="mt-8 px-12 py-6 bg-teal-500 text-[#04111D] rounded-[32px] font-black text-xl uppercase tracking-[0.2em] shadow-2xl shadow-teal-500/20 hover:scale-105 transition-all"
                >
                  {t.patient.booking.startNow} {waitingTokens[0].tokenNumber}
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key={inProgressToken.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="w-full max-w-4xl flex flex-col items-center space-y-12"
            >
              <div className="text-center space-y-2">
                <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-xs">{t.patient.booking.nowServing}</p>
                <div className="relative group">
                  <div className="absolute inset-0 bg-teal-400/20 blur-[80px] rounded-full group-hover:bg-teal-400/40 transition-all duration-1000" />
                  <h1 className="text-[12rem] font-dm-mono font-black text-teal-400 tracking-tighter leading-none relative drop-shadow-[0_0_30px_rgba(45,212,191,0.5)]">
                    {inProgressToken.tokenNumber}
                  </h1>
                </div>
                <div className="space-y-1">
                  <h2 className="text-5xl font-black tracking-tight">{inProgressToken.patientName}</h2>
                  <p className="text-xl font-bold text-slate-400">{inProgressToken.doctorName} — {inProgressToken.specialization || 'General'}</p>
                </div>
                
                {/* Consultation timer */}
                <div className="mt-8 flex flex-col items-center gap-4">
                   <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
                      <Clock size={16} className="text-slate-400" />
                      <span className="text-2xl font-black font-mono">
                        {Math.floor(consultationTime / 60).toString().padStart(2, '0')}:
                        {(consultationTime % 60).toString().padStart(2, '0')}
                      </span>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.patient.booking.consultationTime}</span>
                   </div>
                   <div className="w-64 h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((consultationTime / 900) * 100, 100)}%` }}
                        className={`h-full transition-colors duration-500 ${consultationTime > 900 ? 'bg-red-500' : 'bg-teal-500'}`}
                      />
                   </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-6 w-full max-w-3xl">
                <button 
                  onClick={() => handleAction('done')}
                  className="flex flex-col items-center justify-center p-8 bg-emerald-500 text-white rounded-[40px] shadow-2xl shadow-emerald-500/20 hover:scale-105 transition-all group"
                >
                  <CheckCircle2 size={40} className="mb-4" />
                  <span className="font-black text-sm uppercase tracking-widest leading-none">{t.patient.booking.markDone}</span>
                </button>
                <button 
                  onClick={() => handleAction('missed')}
                  className="flex flex-col items-center justify-center p-8 bg-red-500 text-white rounded-[40px] shadow-2xl shadow-red-500/20 hover:scale-105 transition-all group"
                >
                  <AlertCircle size={40} className="mb-4" />
                  <span className="font-black text-sm uppercase tracking-widest leading-none">{t.patient.booking.absent}</span>
                </button>
                <button 
                  onClick={handleNext}
                  className="flex flex-col items-center justify-center p-8 bg-amber-500 text-[#04111D] rounded-[40px] shadow-2xl shadow-amber-500/20 hover:scale-105 transition-all group"
                >
                  <ChevronRight size={40} className="mb-4" />
                  <span className="font-black text-sm uppercase tracking-widest leading-none">{t.patient.booking.continue}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Segmented Queue */}
        <div className="w-full max-w-6xl mt-24 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* NEXT UP */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">{t.patient.booking.nextUp}</h3>
              <span className="text-teal-400 font-black text-[10px] uppercase tracking-widest">{waitingTokens.length}</span>
            </div>
            <div className="space-y-3">
               <AnimatePresence>
                {nextWaiting.map((token, idx) => {
                  const waitTime = getWaitMinutes(token);
                  return (
                    <motion.div 
                      key={token.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between p-4 bg-white/2 hover:bg-white/5 border border-white/5 rounded-3xl transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-dm-mono font-black text-teal-400">{token.tokenNumber}</span>
                        <div>
                          <p className="text-sm font-black tracking-tight line-clamp-1">{token.patientName}</p>
                          <p className={`text-[10px] font-bold ${waitTime > 15 ? 'text-red-400' : 'text-slate-500'}`}>
                            Waiting: {waitTime}m
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* DONE TODAY */}
          <div className="space-y-6">
            <h3 className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] px-4">{t.patient.booking.completed}</h3>
            <div className="space-y-3 opacity-60">
               {doneToday.slice(0, 3).map(token => (
                 <div key={token.id} className="flex items-center justify-between p-4 bg-white/2 border border-white/5 rounded-3xl">
                    <div className="flex items-center gap-4">
                       <span className="text-lg font-dm-mono font-black text-slate-500">{token.tokenNumber}</span>
                       <p className="text-sm font-bold text-slate-400 line-clamp-1">{token.patientName}</p>
                    </div>
                    <CheckCircle2 size={16} className="text-emerald-500" />
                 </div>
               ))}
               {doneToday.length === 0 && <p className="text-[10px] font-bold text-slate-700 text-center py-4 tracking-[0.2em]">NO TOKENS DONE</p>}
            </div>
          </div>

          {/* MISSED TODAY */}
          <div className="space-y-6">
            <h3 className="text-red-500/50 font-black uppercase tracking-[0.3em] text-[10px] px-4">{t.patient.booking.missed}</h3>
            <div className="space-y-3 opacity-60">
               {missedToday.slice(0, 3).map(token => (
                 <div key={token.id} className="flex items-center justify-between p-4 bg-white/2 border border-red-500/10 rounded-3xl">
                    <div className="flex items-center gap-4">
                       <span className="text-lg font-dm-mono font-black text-red-400/50">{token.tokenNumber}</span>
                       <p className="text-sm font-bold text-slate-500 line-clamp-1">{token.patientName}</p>
                    </div>
                    <span className="px-2 py-1 bg-red-500/10 text-red-500 text-[8px] font-black rounded-lg">MISSED</span>
                 </div>
               ))}
               {missedToday.length === 0 && <p className="text-[10px] font-bold text-slate-700 text-center py-4 tracking-[0.2em]">ZERO NO-SHOWS</p>}
            </div>
          </div>

          {/* SLOTS OVERVIEW */}
          <div className="lg:col-span-3 mt-12 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-teal-500 font-black uppercase tracking-[0.3em] text-xs">Today's Slots Overview</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full" />
                  <span className="text-[10px] font-bold text-slate-500">AVAILABLE</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  <span className="text-[10px] font-bold text-slate-500">BOOKED</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {allSlots.map(slot => {
                const booking = todaysTokens.find(t => (t.appointmentTime === slot || t.bookingTime === slot) && t.status !== 'cancelled' && t.status !== 'expired');
                return (
                  <div 
                    key={slot}
                    className={`px-4 py-2 rounded-xl border text-[10px] font-black transition-all ${
                      booking 
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' 
                        : 'bg-teal-500/5 border-teal-500/10 text-teal-400'
                    }`}
                  >
                    {slot}
                    {booking && (
                      <span className="block text-[8px] opacity-70 mt-0.5 uppercase">{booking.patientName.split(' ')[0]}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* EXPIRED TOKENS */}
          <div className="lg:col-span-3 mt-12 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-amber-500 font-black uppercase tracking-[0.3em] text-xs">Expired Tokens (Auto)</h3>
              <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-black">{expiredToday.length} TOKENS</span>
            </div>
            {expiredToday.length === 0 ? (
               <div className="py-12 text-center bg-white/2 rounded-[40px] border border-dashed border-white/5">
                 <p className="text-slate-600 font-bold uppercase tracking-widest text-[10px]">No tokens expired yet</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {expiredToday.map(token => (
                   <motion.div 
                    layout
                    key={token.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 bg-white/2 border border-amber-500/10 rounded-[32px] relative overflow-hidden group"
                   >
                     <div className="absolute top-0 right-0 p-4">
                        <Trash2 size={16} className="text-amber-500/20" />
                     </div>
                     <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 font-dm-mono font-black border border-amber-500/5">
                          {token.tokenNumber}
                        </div>
                        <div>
                          <h4 className="font-bold text-white tracking-tight">{token.patientName}</h4>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">DR. {token.doctorName}</p>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                        <div>
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Booked At</p>
                          <p className="text-xs font-bold text-white">{token.bookingTime || token.appointmentTime}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Expired At</p>
                          <p className="text-xs font-bold text-amber-500">{token.expiredAt || 'Unknown'}</p>
                        </div>
                     </div>
                   </motion.div>
                 ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* No-Show Alert Popup */}
      <AnimatePresence>
        {showNoShowAlert && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 backdrop-blur-3xl bg-red-500/10">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-[#1A0C0E] border border-red-500/20 p-12 rounded-[56px] w-full max-w-xl text-center shadow-[0_0_100px_rgba(239,68,68,0.2)]"
            >
              <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                <AlertCircle size={48} className="text-red-500" />
              </div>
              <h2 className="text-4xl font-black mb-2 text-red-100">{showNoShowAlert.tokenNumber} {showNoShowAlert.patientName}</h2>
              <p className="text-red-500/60 font-black uppercase tracking-[0.3em] text-xs mb-10">{t.patient.booking.waitingTooLong}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={async () => {
                    await updateTokenStatus(showNoShowAlert.id, 'not-arrived', showNoShowAlert.patientId);
                    setShowNoShowAlert(null);
                  }}
                  className="py-6 bg-red-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all"
                >
                  {t.patient.booking.missed}
                </button>
                <button 
                  onClick={() => setShowNoShowAlert(null)}
                  className="py-6 bg-white/5 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  {t.patient.booking.fiveMinMore}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Stats Bar */}
      <div className="grid grid-cols-4 border-t border-white/5 bg-white/2 backdrop-blur-md z-10">
        {[
          { label: t.patient.booking.totalToday, value: stats.total, color: 'text-white' },
          { label: t.patient.booking.waiting, value: stats.waiting, color: 'text-amber-500' },
          { label: t.patient.booking.completed, value: stats.completed, color: 'text-emerald-500' },
          { label: t.patient.booking.notArrived, value: stats.missed, color: 'text-red-500' },
        ].map((stat, idx) => (
          <div key={idx} className="flex flex-col items-center justify-center py-6 border-r border-white/5 last:border-0 grow">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* New Online Token Notification */}
      <AnimatePresence>
        {lastNotification && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[110] bg-blue-600 text-white px-8 py-4 rounded-[32px] shadow-2xl flex items-center gap-4"
          >
            <Bell size={20} className="animate-bounce" />
            <div className="flex flex-col">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{t.patient.booking.newTokenReceived}</p>
              <p className="text-sm font-bold">{lastNotification.tokenNumber} — {lastNotification.patientName}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Issue Token Modal */}
      <AnimatePresence>
        {showIssueModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/60">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#04111D] border border-white/10 p-10 rounded-[48px] w-full max-w-lg shadow-2xl relative"
            >
              <button 
                onClick={() => setShowIssueModal(false)}
                className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="mb-10 text-center">
                <div className="w-16 h-16 bg-teal-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4 text-teal-400">
                  <User size={32} />
                </div>
                <h2 className="text-3xl font-black tracking-tight">{t.patient.booking.nayaTokenIssueKaro}</h2>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">{hospitalData?.hospitalName}</p>
              </div>

              <form onSubmit={issueToken} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">{t.patient.booking.fullName}</label>
                  <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input 
                      required
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white font-bold focus:border-teal-500 outline-none transition-colors"
                      placeholder="Enter patient name"
                      value={newPatientName}
                      onChange={(e) => setNewPatientName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">{t.patient.booking.phoneNumber}</label>
                  <div className="relative">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input 
                      type="tel"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white font-bold focus:border-teal-500 outline-none transition-colors"
                      placeholder="Optional"
                      value={newPatientPhone}
                      onChange={(e) => setNewPatientPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">{t.patient.booking.selectDoctor}</label>
                  <div className="relative">
                    <Stethoscope className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <select 
                      required
                      disabled={doctorsLoading}
                      className={`w-full bg-white/5 border ${showError && !selectedDoctorId ? 'border-red-500' : 'border-white/10'} rounded-2xl py-4 pl-14 pr-10 text-white font-bold focus:border-teal-500 outline-none transition-colors appearance-none disabled:opacity-50`}
                      value={selectedDoctorId}
                      onChange={(e) => {
                        setSelectedDoctorId(e.target.value);
                        if (showError) setShowError(false);
                      }}
                    >
                      <option value="" disabled className="bg-[#04111D]">
                        {doctorsLoading ? 'Loading Doctors...' : t.patient.booking.selectDoctor}
                      </option>
                      <option value="walk-in" className="bg-[#04111D]">{t.patient.booking.walkIn}</option>
                      {localDoctors.map(doc => (
                        <option key={doc.id} value={doc.id} className="bg-[#04111D]">
                          Dr. {doc.name} — ({doc.specialization})
                        </option>
                      ))}
                    </select>
                    {showError && !selectedDoctorId && (
                      <p className="text-red-500 text-[10px] font-bold mt-2 ml-4">{t.patient.booking.pleaseSelectDoctor}</p>
                    )}
                    {doctorsLoading && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                {selectedDoctorId && selectedDoctorId !== 'walk-in' && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">Select Time Slot</label>
                    <div className="relative">
                      <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                      <select 
                        required
                        className={`w-full bg-white/5 border ${showError && !selectedSlot ? 'border-red-500' : 'border-white/10'} rounded-2xl py-4 pl-14 pr-10 text-white font-bold focus:border-teal-500 outline-none transition-colors appearance-none`}
                        value={selectedSlot}
                        onChange={(e) => {
                          setSelectedSlot(e.target.value);
                          if (showError) setShowError(false);
                        }}
                      >
                        <option value="" disabled className="bg-[#04111D]">Select Time Slot</option>
                        {getAvailableSlots().map(slot => (
                          <option key={slot} value={slot} className="bg-[#04111D]">{slot}</option>
                        ))}
                        {getAvailableSlots().length === 0 && (
                          <option disabled className="bg-[#04111D]">No Slots Available</option>
                        )}
                      </select>
                      {showError && !selectedSlot && (
                        <p className="text-red-500 text-[10px] font-bold mt-2 ml-4">Please select an available slot</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowIssueModal(false)}
                    className="flex-1 py-4 rounded-2xl text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
                  >
                    {t.common.cancel}
                  </button>
                  <button 
                    disabled={issueLoading}
                    type="submit"
                    className="flex-[2] py-4 bg-teal-500 text-[#04111D] rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {issueLoading ? 'Processing...' : t.patient.booking.issueToken}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReceptionMode;
