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
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp,
  doc,
  writeBatch
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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueLoading, setIssueLoading] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [lastNotification, setLastNotification] = useState<any>(null);
  const [screenEffect, setScreenEffect] = useState<'none' | 'green' | 'red'>('none');
  
  const prevTokensRef = useRef<any[]>([]);

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter today's tokens and sort them
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysTokens = tokens.filter(tok => tok.appointmentDate === todayStr);

  const stats = {
    total: todaysTokens.length,
    waiting: todaysTokens.filter(tok => tok.status === 'waiting' || tok.status === 'Waiting').length,
    completed: todaysTokens.filter(tok => tok.status === 'completed' || tok.status === 'Completed').length,
    missed: todaysTokens.filter(tok => tok.status === 'not-arrived').length
  };

  const inProgressToken = todaysTokens.find(tok => tok.status === 'in-progress');
  const waitingTokens = todaysTokens
    .filter(tok => tok.status === 'waiting' || tok.status === 'Waiting')
    .sort((a, b) => (a.tokenNumber || '').localeCompare(b.tokenNumber || ''));

  const nextWaiting = waitingTokens.slice(0, 5);

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

  const handleAction = async (action: 'start' | 'done' | 'missed') => {
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
          await updateTokenStatus(waitingTokens[0].id, 'in-progress', waitingTokens[0].patientId);
        }
      }
    } else if (action === 'missed') {
      if (inProgressToken) {
        setScreenEffect('red');
        setTimeout(() => setScreenEffect('none'), 500);
        await updateTokenStatus(inProgressToken.id, 'not-arrived', inProgressToken.patientId);
        // Auto-advance
        if (waitingTokens[0]) {
          await updateTokenStatus(waitingTokens[0].id, 'in-progress', waitingTokens[0].patientId);
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

  const issueToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName || !selectedDoctorId) return;

    setIssueLoading(true);
    try {
      const doctor = doctors.find(d => d.id === selectedDoctorId);
      const hospitalId = hospitalData.uid;
      
      // Calculate token number
      const existingTokens = tokens.filter(t => t.appointmentDate === todayStr);
      const nextNum = existingTokens.length + 1;
      const tokenNumber = `T-${nextNum.toString().padStart(3, '0')}`;

      const newToken = {
        hospitalId,
        doctorId: selectedDoctorId,
        doctorName: doctor?.name || 'Unknown Doctor',
        patientName: newPatientName,
        phone: newPatientPhone,
        appointmentDate: todayStr,
        appointmentTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        tokenNumber,
        status: 'waiting',
        type: 'walk-in',
        fee: doctor?.fee || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
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
          <p className="text-3xl font-black tracking-tighter">
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
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
                  {t.patient.booking.start} {waitingTokens[0].tokenNumber}
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
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{inProgressToken.appointmentTime} — Rs. {inProgressToken.fee}</p>
                </div>
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 font-black text-xs uppercase tracking-widest mt-6 animate-pulse">
                  <Play size={14} fill="currentColor" /> {t.patient.booking.inProgress}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-6 w-full max-w-3xl">
                <button 
                  onClick={() => handleAction('done')}
                  className="flex flex-col items-center justify-center p-8 bg-emerald-500 text-white rounded-[40px] shadow-2xl shadow-emerald-500/20 hover:scale-105 transition-all group"
                >
                  <CheckCircle2 size={40} className="mb-4" />
                  <span className="font-black text-sm uppercase tracking-widest">{t.patient.booking.markDone}</span>
                </button>
                <button 
                  onClick={() => handleAction('missed')}
                  className="flex flex-col items-center justify-center p-8 bg-red-500 text-white rounded-[40px] shadow-2xl shadow-red-500/20 hover:scale-105 transition-all group"
                >
                  <AlertCircle size={40} className="mb-4" />
                  <span className="font-black text-sm uppercase tracking-widest">{t.patient.booking.absent}</span>
                </button>
                <button 
                  onClick={handleNext}
                  className="flex flex-col items-center justify-center p-8 bg-amber-500 text-[#04111D] rounded-[40px] shadow-2xl shadow-amber-500/20 hover:scale-105 transition-all group"
                >
                  <ChevronRight size={40} className="mb-4" />
                  <span className="font-black text-sm uppercase tracking-widest">{t.patient.booking.next}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next Up Queue */}
        <div className="w-full max-w-4xl mt-24">
          <div className="flex items-center justify-between px-8 mb-6">
            <h3 className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">{t.patient.booking.nextUp}</h3>
            <span className="text-teal-400 font-black text-[10px] uppercase tracking-widest">{waitingTokens.length} PATIENTS WAITING</span>
          </div>
          <div className="space-y-4">
            <AnimatePresence>
              {nextWaiting.map((token, idx) => (
                <motion.div 
                  key={token.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-6 bg-white/2 hover:bg-white/5 border border-white/5 rounded-3xl transition-all"
                >
                  <div className="flex items-center gap-6">
                    <span className="text-2xl font-mono font-black text-teal-400">{token.tokenNumber}</span>
                    <div>
                      <p className="text-lg font-black tracking-tight">{token.patientName}</p>
                      <p className="text-xs font-bold text-slate-500">{token.doctorName} — {token.appointmentTime}</p>
                    </div>
                  </div>
                  <div className="px-5 py-2 bg-slate-800/50 rounded-xl text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    {t.patient.booking.waiting}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {waitingTokens.length > 5 && (
              <div className="text-center py-4 text-slate-600 font-black text-[10px] uppercase tracking-widest">
                + {waitingTokens.length - 5} MORE IN QUEUE
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div className="grid grid-cols-4 border-t border-white/5 bg-white/2 backdrop-blur-md z-10">
        {[
          { label: t.patient.booking.totalToday, value: stats.total, color: 'text-white' },
          { label: t.patient.booking.waiting, value: stats.waiting, color: 'text-amber-500' },
          { label: t.patient.booking.completed, value: stats.done, color: 'text-emerald-500' },
          { label: t.patient.booking.missed, value: stats.missed, color: 'text-red-500' },
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
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-10 text-white font-bold focus:border-teal-500 outline-none transition-colors appearance-none"
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                    >
                      <option value="" disabled className="bg-[#04111D]">Select Doctor</option>
                      {doctors.map(doc => (
                        <option key={doc.id} value={doc.id} className="bg-[#04111D]">{doc.name} ({doc.specialization})</option>
                      ))}
                    </select>
                  </div>
                </div>

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
