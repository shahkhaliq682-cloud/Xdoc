import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Clock, User, Phone, 
  MessageSquare, ChevronRight, CheckCircle2,
  Stethoscope, ShieldCheck, MapPin, ArrowRight,
  Shield, AlertCircle, Wallet, Hospital as HospitalIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { 
  collection, addDoc, serverTimestamp, 
  query, where, getDocs, doc, setDoc, getDoc, runTransaction,
  onSnapshot
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
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Form State
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [patientName, setPatientName] = useState(userData?.fullName || userData?.name || userData?.displayName || '');
  const [patientPhone, setPatientPhone] = useState(userData?.phone || userData?.phoneFull || '');
  const [note, setNote] = useState('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const morningSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'];
  const afternoonSlots = ['02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'];

  // Check hospital's open days
  const openDays = hospital.openDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    if (selectedDate && doctor?.id) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const q = query(
        collection(db, 'tokens'),
        where('doctorId', '==', doctor.id),
        where('appointmentDate', '==', dateStr),
        where('status', 'in', ['waiting', 'in-progress', 'completed'])
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const booked = snapshot.docs.map(doc => doc.data().appointmentTime);
        setBookedSlots(booked);
      });

      return () => unsubscribe();
    }
  }, [selectedDate, doctor?.id]);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const handleBooking = async () => {
    if (!currentUser || !selectedDate || !selectedSlot || !patientName || !patientPhone) return;
    setLoading(true);

    try {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const hospitalId = hospital.id || hospital.uid;

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
          hospitalId: hospitalId,
          hospitalName: hospital.hospitalName || hospital.name,
          doctorId: doctor.id,
          doctorName: doctor.name,
          specialization: doctor.specialization,
          patientId: currentUser.uid,
          patientName,
          patientPhone,
          patientNote: note,
          appointmentDate: dateStr,
          appointmentTime: selectedSlot,
          consultationFee: Number(doctor.fee || hospital.startingFee || 0),
          status: 'waiting',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        const tokenRef = doc(collection(db, 'tokens'));
        transaction.set(tokenRef, bookingData);

        const hospitalTokenRef = doc(db, 'hospitals', hospitalId, 'tokens', tokenRef.id);
        transaction.set(hospitalTokenRef, bookingData);

        const patientBookingRef = doc(db, 'users', currentUser.uid, 'bookings', tokenRef.id);
        transaction.set(patientBookingRef, bookingData);

        return { ...bookingData, tokenId: tokenRef.id, id: tokenRef.id };
      });

      onSuccess(result);
    } catch (err) {
      console.error("Booking error:", err);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="w-24 h-24 bg-health-teal bg-opacity-10 rounded-full flex items-center justify-center text-health-teal text-4xl font-bold border-4 border-white shadow-lg">
          {doctor.name?.[0]}
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-bold text-slate-900">Dr. {doctor.name}</h3>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="px-3 py-1 bg-health-teal/10 text-health-teal text-xs font-bold rounded-full uppercase tracking-widest leading-none">
              {doctor.specialization}
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-3 font-medium">{doctor.qualification || 'Senior Consultant'}</p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
            <Wallet size={16} className="text-health-teal" />
            <span className="text-slate-900 font-bold">Rs. {doctor.fee || hospital.startingFee}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-4 pt-4">
        <button onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs">
          {t.patient.logout.cancel}
        </button>
        <button onClick={nextStep} className="flex-1 py-4 bg-health-teal text-white font-bold rounded-2xl shadow-xl shadow-health-teal/20 transition-all uppercase tracking-widest text-xs">
          {t.patient.booking.continue}
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-health-teal/10 flex items-center justify-center text-health-teal">
          <Calendar size={18} />
        </div>
        <h4 className="text-lg font-bold text-slate-900">{t.patient.booking.selectDate}</h4>
      </div>
      
      <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide -mx-1 px-1 custom-scrollbar">
        {dates.map((date, idx) => {
          const isSelected = selectedDate?.toDateString() === date.toDateString();
          const dayShort = date.toLocaleDateString('en-US', { weekday: 'short' });
          const isOpen = openDays.includes(dayShort);
          const isToday = new Date().toDateString() === date.toDateString();

          return (
            <button
              key={idx}
              disabled={!isOpen}
              onClick={() => setSelectedDate(date)}
              className={`min-w-[85px] p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-1 shrink-0 ${
                isSelected 
                  ? 'bg-health-teal border-health-teal text-white shadow-xl scale-105' 
                  : isOpen 
                    ? `bg-white ${isToday ? 'border-primary' : 'border-slate-100'} text-slate-600 hover:border-health-teal/30`
                    : 'bg-slate-50 border-slate-50 text-slate-300 cursor-not-allowed'
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                {dayShort}
              </span>
              <span className="text-2xl font-black">{date.getDate()}</span>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                {date.toLocaleDateString('en-US', { month: 'short' })}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-4 pt-4">
        <button onClick={prevStep} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs">
          {t.patient.logout.cancel}
        </button>
        <button 
          disabled={!selectedDate}
          onClick={nextStep} 
          className={`flex-1 py-4 font-bold rounded-2xl transition-all uppercase tracking-widest text-xs ${
            selectedDate ? 'bg-health-teal text-white shadow-lg shadow-health-teal/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {t.patient.booking.continue}
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-health-teal/10 flex items-center justify-center text-health-teal">
          <Clock size={18} />
        </div>
        <h4 className="text-lg font-bold text-slate-900">{t.patient.booking.selectTime}</h4>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">{t.patient.booking.morningSlots}</p>
          <div className="grid grid-cols-3 gap-3">
            {morningSlots.map(slot => {
              const isBooked = bookedSlots.includes(slot);
              const isSelected = selectedSlot === slot;
              return (
                <button
                  key={slot}
                  disabled={isBooked}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-3 rounded-2xl border-2 font-bold text-xs transition-all ${
                    isSelected 
                      ? 'bg-health-teal border-health-teal text-white shadow-lg' 
                      : isBooked
                        ? 'bg-slate-100 border-slate-100 text-slate-300 line-through cursor-not-allowed'
                        : 'bg-white border-health-teal/30 text-health-teal hover:bg-health-teal hover:text-white'
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">{t.patient.booking.afternoonSlots}</p>
          <div className="grid grid-cols-3 gap-3">
            {afternoonSlots.map(slot => {
              const isBooked = bookedSlots.includes(slot);
              const isSelected = selectedSlot === slot;
              return (
                <button
                  key={slot}
                  disabled={isBooked}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-3 rounded-2xl border-2 font-bold text-xs transition-all ${
                    isSelected 
                      ? 'bg-health-teal border-health-teal text-white shadow-lg' 
                      : isBooked
                        ? 'bg-slate-100 border-slate-100 text-slate-300 line-through cursor-not-allowed'
                        : 'bg-white border-health-teal/30 text-health-teal hover:bg-health-teal hover:text-white'
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button onClick={prevStep} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs">
          {t.patient.logout.cancel}
        </button>
        <button 
          disabled={!selectedSlot}
          onClick={nextStep} 
          className={`flex-1 py-4 font-bold rounded-2xl transition-all uppercase tracking-widest text-xs ${
            selectedSlot ? 'bg-health-teal text-white shadow-lg shadow-health-teal/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {t.patient.booking.continue}
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-health-teal/10 flex items-center justify-center text-health-teal">
          <User size={18} />
        </div>
        <h4 className="text-lg font-bold text-slate-900">{t.patient.booking.patientDetails}</h4>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t.patient.booking.fullName}</label>
           <div className="relative">
             <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input
               value={patientName}
               onChange={(e) => setPatientName(e.target.value)}
               className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-health-teal"
               placeholder="Full name"
             />
           </div>
        </div>

        <div className="space-y-2">
           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t.patient.booking.phoneNumber}</label>
           <div className="relative">
             <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input
               value={patientPhone}
               onChange={(e) => setPatientPhone(e.target.value)}
               className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-health-teal"
               placeholder="0300-1234567"
             />
           </div>
        </div>

        <div className="space-y-2">
           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t.patient.booking.noteForDoctor}</label>
           <div className="relative">
             <MessageSquare className="absolute left-4 top-4 text-slate-400" size={18} />
             <textarea
               value={note}
               onChange={(e) => setNote(e.target.value)}
               className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-health-teal"
               placeholder="Symptoms ya koi note..."
               rows={3}
             />
           </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button onClick={prevStep} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs">
          {t.patient.logout.cancel}
        </button>
        <button 
          disabled={!patientName || !patientPhone}
          onClick={nextStep} 
          className={`flex-1 py-4 font-bold rounded-2xl transition-all uppercase tracking-widest text-xs ${
            patientName && patientPhone ? 'bg-health-teal text-white shadow-lg shadow-health-teal/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {t.patient.booking.continue}
        </button>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-health-teal/10 flex items-center justify-center text-health-teal">
          <ShieldCheck size={18} />
        </div>
        <h4 className="text-lg font-bold text-slate-900">{t.patient.booking.bookingSummary}</h4>
      </div>

      <div className="bg-slate-900 rounded-[32px] p-6 text-white space-y-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-health-teal/10 rounded-full -mr-16 -mt-16 blur-2xl" />
        
        <div className="flex items-center gap-4 relative">
          <HospitalIcon size={20} className="text-health-teal" />
          <span className="font-bold">{hospital.hospitalName || hospital.name}</span>
        </div>
        
        <div className="flex items-center gap-4 relative">
          <Stethoscope size={20} className="text-health-teal" />
          <span className="font-bold">Dr. {doctor.name}</span>
        </div>

        <div className="flex items-center gap-4 relative">
          <Calendar size={20} className="text-health-teal" />
          <span className="font-bold">
            {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        <div className="flex items-center gap-4 relative">
          <Clock size={20} className="text-health-teal" />
          <span className="font-bold">{selectedSlot}</span>
        </div>

        <div className="flex items-center gap-4 relative border-t border-white/10 pt-4">
          <Wallet size={20} className="text-health-teal" />
          <span className="font-bold text-xl">Rs. {doctor.fee || hospital.startingFee}</span>
        </div>

        <div className="flex items-center gap-4 relative border-t border-white/10 pt-4">
          <User size={20} className="text-health-teal" />
          <span className="font-bold text-slate-300">{patientName}</span>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button onClick={prevStep} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs">
          {t.patient.logout.cancel}
        </button>
        <button 
          disabled={loading}
          onClick={handleBooking} 
          className="flex-1 py-4 bg-health-teal text-white font-bold rounded-2xl shadow-xl shadow-health-teal/20 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
        >
          {loading ? (
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
             >
               <Clock size={20} />
             </motion.div>
          ) : t.patient.booking.confirmBooking}
        </button>
      </div>

      {loading && (
        <div className="text-center">
          <p className="text-sm font-bold text-health-teal animate-pulse">{t.patient.booking.bookingInProgress}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white w-full max-w-xl rounded-t-[40px] sm:rounded-[48px] shadow-2xl overflow-hidden"
      >
        <div className="p-8 pb-10 sm:pb-8">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                  <div className="flex h-1.5 w-12 gap-1">
                      {[1,2,3,4,5].map(i => (
                          <div key={i} className={`h-full flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-health-teal' : 'bg-slate-100'}`} />
                      ))}
                  </div>
                  <span className="text-[10px] font-bold text-health-teal uppercase tracking-widest ml-2">{t.patient.booking.step} {step} {t.patient.booking.of} 5</span>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors"
              >
                <X size={24} />
              </button>
           </div>

           <AnimatePresence mode="wait">
             <motion.div
               key={step}
               initial={{ x: 20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               exit={{ x: -20, opacity: 0 }}
               transition={{ duration: 0.2 }}
             >
               {step === 1 && renderStep1()}
               {step === 2 && renderStep2()}
               {step === 3 && renderStep3()}
               {step === 4 && renderStep4()}
               {step === 5 && renderStep5()}
             </motion.div>
           </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );

};

export default BookingFlow;
