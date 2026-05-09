import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Clock, User, Phone, 
  MessageSquare, ChevronRight, CheckCircle2,
  Stethoscope, ShieldCheck, MapPin, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { 
  collection, addDoc, serverTimestamp, 
  query, where, getDocs, doc, setDoc, getDoc, runTransaction 
} from 'firebase/firestore';

interface BookingFlowProps {
  hospital: any;
  doctor: any;
  onClose: () => void;
  onSuccess: (tokenData: any) => void;
}

const BookingFlow: React.FC<BookingFlowProps> = ({ hospital, doctor, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const { userData, currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [patientName, setPatientName] = useState(userData?.name || '');
  const [patientPhone, setPatientPhone] = useState(userData?.profile?.phone || '');
  const [note, setNote] = useState('');

  const morningSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'];
  const afternoonSlots = ['02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'];

  // Calendar logic
  const getDates = () => {
    const dates = [];
    const today = new Date();
    const openDays = hospital.openDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (let i = 0; i < 14; i++) {
        const d = new Date();
        d.setDate(today.getDate() + i);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
        if (openDays.includes(dayName)) {
            dates.push(d);
        }
    }
    return dates;
  };

  const dates = getDates();

  const handleBooking = async () => {
    if (!currentUser || !selectedDate || !selectedSlot) return;
    setLoading(true);

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const hospitalId = hospital.id;

      // Transaction to safely increment token number
      const result = await runTransaction(db, async (transaction) => {
        const counterRef = doc(db, 'hospitals', hospitalId, 'counters', dateStr);
        const counterDoc = await transaction.get(counterRef);
        
        let newCount = 1;
        if (counterDoc.exists()) {
          newCount = counterDoc.data().count + 1;
        }
        
        transaction.set(counterRef, { count: newCount }, { merge: true });
        
        const tokenNumber = `T-${newCount.toString().padStart(3, '0')}`;
        
        const bookingData = {
          tokenNumber,
          hospitalId: hospital.id,
          hospitalName: hospital.hospitalName,
          doctorId: doctor.id,
          doctorName: doctor.name,
          doctorSpecialization: doctor.specialization,
          patientId: currentUser.uid,
          patientName,
          patientPhone,
          appointmentDate: dateStr,
          appointmentTime: selectedSlot,
          fee: doctor.fee || 0,
          status: 'waiting',
          note,
          createdAt: serverTimestamp(),
          hospitalArea: hospital.area,
          hospitalCity: hospital.city
        };

        // Create main token record
        const tokenRef = doc(collection(db, 'tokens'));
        transaction.set(tokenRef, bookingData);

        // Add to hospital tokens sub-collection
        const hospitalTokenRef = doc(db, 'hospitals', hospitalId, 'tokens', tokenRef.id);
        transaction.set(hospitalTokenRef, bookingData);

        // Add to patient history
        const patientHistoryRef = doc(db, 'users', currentUser.uid, 'history', tokenRef.id);
        transaction.set(patientHistoryRef, bookingData);

        return { ...bookingData, id: tokenRef.id };
      });

      onSuccess(result);
    } catch (err) {
      console.error("Booking error:", err);
      alert("Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-health-teal/10 rounded-full flex items-center justify-center text-health-teal mx-auto mb-4">
          <Stethoscope size={40} />
        </div>
        <h3 className="text-2xl font-bold text-slate-900">Confirm Doctor</h3>
        <p className="text-slate-400 font-medium">Step 1 of 5</p>
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 font-bold text-xl overflow-hidden">
          {doctor.photo ? <img src={doctor.photo} className="w-full h-full object-cover" /> : doctor.name?.[0]}
        </div>
        <div>
          <h4 className="text-lg font-bold text-slate-900">Dr. {doctor.name}</h4>
          <p className="text-xs font-bold text-health-teal uppercase tracking-widest">{doctor.specialization}</p>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-xs font-bold text-slate-400">Fee: Rs. {doctor.fee || '0'}</span>
          </div>
        </div>
      </div>

      <button 
        onClick={() => setStep(2)}
        className="w-full py-5 bg-health-teal text-white rounded-3xl font-bold text-lg shadow-xl shadow-health-teal/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
      >
        Confirm Doctor <ChevronRight size={20} />
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-slate-900">{t.patient.booking.selectDate}</h3>
        <p className="text-slate-400 font-medium">Step 2 of 5</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {dates.map((date, idx) => {
          const isSelected = selectedDate?.toDateString() === date.toDateString();
          return (
            <button
              key={idx}
              onClick={() => setSelectedDate(date)}
              className={`p-4 rounded-3xl border transition-all flex flex-col items-center gap-1 ${
                isSelected 
                  ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-105' 
                  : 'bg-white border-slate-100 text-slate-600 hover:border-primary/30'
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-tighter ${isSelected ? 'text-white/60' : 'text-slate-400'}`}>
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className="text-lg font-bold">{date.getDate()}</span>
              <span className={`text-[10px] font-bold ${isSelected ? 'text-white/60' : 'text-slate-400'}`}>
                {date.toLocaleDateString('en-US', { month: 'short' })}
              </span>
            </button>
          );
        })}
      </div>

      <button 
        disabled={!selectedDate}
        onClick={() => setStep(3)}
        className="w-full py-5 bg-health-teal text-white rounded-3xl font-bold text-lg shadow-xl shadow-health-teal/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
      >
        Next <ChevronRight size={20} />
      </button>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-slate-900">{t.patient.booking.selectTime}</h3>
        <p className="text-slate-400 font-medium">Step 3 of 5</p>
      </div>

      <div className="space-y-6">
        <div>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
             <Clock size={14} /> {t.patient.booking.morningSlots}
           </p>
           <div className="grid grid-cols-3 gap-3">
             {morningSlots.map(slot => (
               <button
                 key={slot}
                 onClick={() => setSelectedSlot(slot)}
                 className={`py-3 rounded-2xl border font-bold text-sm transition-all ${
                   selectedSlot === slot 
                     ? 'bg-primary border-primary text-white shadow-lg' 
                     : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                 }`}
               >
                 {slot}
               </button>
             ))}
           </div>
        </div>

        <div>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
             <Clock size={14} /> {t.patient.booking.afternoonSlots}
           </p>
           <div className="grid grid-cols-3 gap-3">
             {afternoonSlots.map(slot => (
               <button
                 key={slot}
                 onClick={() => setSelectedSlot(slot)}
                 className={`py-3 rounded-2xl border font-bold text-sm transition-all ${
                   selectedSlot === slot 
                     ? 'bg-primary border-primary text-white shadow-lg' 
                     : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                 }`}
               >
                 {slot}
               </button>
             ))}
           </div>
        </div>
      </div>

      <button 
        disabled={!selectedSlot}
        onClick={() => setStep(4)}
        className="w-full py-5 bg-health-teal text-white rounded-3xl font-bold text-lg shadow-xl shadow-health-teal/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
      >
        Next <ChevronRight size={20} />
      </button>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-slate-900">{t.patient.booking.patientDetails}</h3>
        <p className="text-slate-400 font-medium">Step 4 of 5</p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
           <div className="relative">
             <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
             <input
               value={patientName}
               onChange={(e) => setPatientName(e.target.value)}
               className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
               placeholder="Enter full name"
             />
           </div>
        </div>

        <div className="space-y-2">
           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
           <div className="relative">
             <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
             <input
               value={patientPhone}
               onChange={(e) => setPatientPhone(e.target.value)}
               className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
               placeholder="0300-1234567"
             />
           </div>
        </div>

        <div className="space-y-2">
           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t.patient.booking.noteForDoctor}</label>
           <div className="relative">
             <MessageSquare className="absolute left-4 top-4 text-slate-400" size={20} />
             <textarea
               value={note}
               onChange={(e) => setNote(e.target.value)}
               rows={3}
               className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
               placeholder="Mention symtoms or reason..."
             />
           </div>
        </div>
      </div>

      <button 
        disabled={!patientName || !patientPhone}
        onClick={() => setStep(5)}
        className="w-full py-5 bg-health-teal text-white rounded-3xl font-bold text-lg shadow-xl shadow-health-teal/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
      >
        Next <ChevronRight size={20} />
      </button>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-slate-900">{t.patient.booking.bookingSummary}</h3>
        <p className="text-slate-400 font-medium">Step 5 of 5</p>
      </div>

      <div className="bg-slate-50 rounded-[40px] p-8 space-y-6">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
             <MapPin size={24} />
           </div>
           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Hospital</p>
              <p className="font-bold text-slate-800">{hospital.hospitalName}</p>
           </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-health-teal/10 rounded-2xl flex items-center justify-center text-health-teal">
             <Stethoscope size={24} />
           </div>
           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Doctor</p>
              <p className="font-bold text-slate-800">Dr. {doctor.name}</p>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
              <Calendar size={20} />
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Date</p>
                <p className="font-bold text-slate-800">{selectedDate?.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
              <Clock size={20} />
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Time</p>
                <p className="font-bold text-slate-800">{selectedSlot}</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between text-lg">
             <span className="font-bold text-slate-400">Consultation Fee</span>
             <span className="font-bold text-slate-900">Rs. {doctor.fee || '0'}</span>
          </div>
        </div>
      </div>

      <button 
        disabled={loading}
        onClick={handleBooking}
        className="w-full py-5 bg-gradient-to-r from-health-teal to-[#00C9B1] text-white rounded-3xl font-bold text-xl shadow-2xl shadow-health-teal/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
      >
        {loading ? (
          <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>{t.patient.booking.confirmBooking} <ArrowRight size={20} /></>
        )}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white w-full max-w-lg rounded-[48px] shadow-2xl overflow-hidden relative"
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-50">
           <motion.div 
             className="h-full bg-health-teal"
             initial={{ width: '0%' }}
             animate={{ width: `${(step / 5) * 100}%` }}
           />
        </div>

        <div className="p-8 pb-12">
           <div className="flex items-center justify-between mb-8">
              <button 
                onClick={step > 1 ? () => setStep(step - 1) : onClose}
                className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400"
              >
                {step > 1 ? < ChevronRight className="rotate-180" size={24} /> : <X size={24} />}
              </button>
              <div className="text-center font-bold text-slate-400 uppercase tracking-widest text-xs">
                {hospital.hospitalName}
              </div>
              <div className="w-10" />
           </div>

           <AnimatePresence mode="wait">
             {step === 1 && renderStep1()}
             {step === 2 && renderStep2()}
             {step === 3 && renderStep3()}
             {step === 4 && renderStep4()}
             {step === 5 && renderStep5()}
           </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingFlow;
