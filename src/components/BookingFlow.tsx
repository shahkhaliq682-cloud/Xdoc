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
  const [loading, setLoading] = useState(false);

  // Form State
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [patientName, setPatientName] = useState(userData?.name || userData?.displayName || '');
  const [patientPhone, setPatientPhone] = useState(userData?.phone || userData?.profile?.phone || '');
  const [note, setNote] = useState('');

  const morningSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'];
  const afternoonSlots = ['02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'];

  // Calendar logic
  const getDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(today.getDate() + i);
        dates.push(d);
    }
    return dates;
  };

  const dates = getDates();

  const handleBooking = async () => {
    if (!currentUser || !selectedDate || !selectedSlot || !patientName || !patientPhone) return;
    setLoading(true);

    try {
      // Use local date string YYYY-MM-DD to avoid UTC shift issues for appointment days
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
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
          hospitalName: hospital.hospitalName || hospital.name,
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
          hospitalArea: hospital.area || '',
          hospitalCity: hospital.city || ''
        };

        // Create main token record
        const tokenRef = doc(collection(db, 'tokens'));
        transaction.set(tokenRef, bookingData);

        // Also add to hospital and user as requested
        // Note: The user asked for 3 places: /tokens, /hospitals/tokens, /users/bookings
        
        const hospitalTokenRef = doc(db, 'hospitals', hospitalId, 'tokens', tokenRef.id);
        transaction.set(hospitalTokenRef, bookingData);

        const patientBookingRef = doc(db, 'users', currentUser.uid, 'bookings', tokenRef.id);
        transaction.set(patientBookingRef, bookingData);

        return { ...bookingData, id: tokenRef.id };
      });

      onSuccess(result);
    } catch (err) {
      console.error("Booking error:", err);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = selectedDate && selectedSlot && patientName && patientPhone;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden relative"
      >
        <div className="p-6 md:p-8">
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-health-teal/10 rounded-2xl flex items-center justify-center text-health-teal font-bold text-lg">
                   {doctor.name?.[0]}
                </div>
                <div>
                   <h3 className="text-xl font-bold text-slate-900">Dr. {doctor.name}</h3>
                   <p className="text-xs font-bold text-health-teal uppercase tracking-widest">{doctor.specialization}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400"
              >
                <X size={24} />
              </button>
           </div>

           <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1 pr-2 custom-scrollbar">
             {/* Date Selection */}
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">{t.patient.booking.selectDate}</p>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {dates.map((date, idx) => {
                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                    const isToday = new Date().toDateString() === date.toDateString();
                    const isTomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toDateString() === date.toDateString();
                    
                    let label = date.toLocaleDateString('en-US', { weekday: 'short' });
                    if (isToday) label = 'Today';
                    if (isTomorrow) label = 'Tomorrow';

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(date)}
                        className={`p-2 rounded-2xl border transition-all flex flex-col items-center gap-0.5 shrink-0 ${
                          isSelected 
                            ? 'bg-health-teal border-health-teal text-white shadow-lg shadow-health-teal/20 scale-105' 
                            : 'bg-white border-slate-100 text-slate-600 hover:border-health-teal/30'
                        }`}
                      >
                        <span className={`text-[8px] font-bold uppercase tracking-tighter ${isSelected ? 'text-white/60' : 'text-slate-400'}`}>
                          {label}
                        </span>
                        <span className="text-base font-bold leading-none">{date.getDate()}</span>
                        <span className={`text-[8px] font-bold ${isSelected ? 'text-white/60' : 'text-slate-400'}`}>
                          {date.toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                      </button>
                    );
                  })}
                </div>
             </div>

             {/* Time Selection */}
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">{t.patient.booking.selectTime}</p>
                
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {[...morningSlots, ...afternoonSlots].map(slot => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`px-4 py-2.5 rounded-xl border font-bold text-xs transition-all ${
                          selectedSlot === slot 
                            ? 'bg-health-teal border-health-teal text-white shadow-md' 
                            : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
             </div>

             {/* Patient Details */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t.patient.booking.fullName}</label>
                   <div className="relative">
                     <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                     <input
                       value={patientName}
                       onChange={(e) => setPatientName(e.target.value)}
                       className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-health-teal/20 transition-all text-sm"
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
                       className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-health-teal/20 transition-all text-sm"
                       placeholder="0300-1234567"
                     />
                   </div>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t.patient.booking.noteForDoctor}</label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-4 text-slate-400" size={18} />
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-health-teal/20 transition-all text-sm"
                    placeholder="Briefly mention symptom..."
                  />
                </div>
             </div>
           </div>

           <div className="mt-8 pt-6 border-t border-slate-100">
             <div className="flex items-center justify-between mb-6">
                <div className="text-lg">
                   <span className="font-bold text-slate-400">Fee: </span>
                   <span className="font-bold text-slate-900">Rs. {doctor.fee}</span>
                </div>
                {selectedDate && selectedSlot && (
                  <div className="text-right">
                     <p className="text-[10px] font-bold text-health-teal uppercase tracking-widest">Appointment</p>
                     <p className="text-xs font-bold text-slate-600">{selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} • {selectedSlot}</p>
                  </div>
                )}
             </div>

             <button 
                disabled={loading || !isFormValid}
                onClick={handleBooking}
                className={`w-full py-4 text-white rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-3 ${
                  isFormValid 
                    ? 'bg-health-teal shadow-health-teal/20 hover:scale-[1.01] active:scale-[0.99]' 
                    : 'bg-slate-300 shadow-none cursor-not-allowed opacity-60'
                }`}
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>{t.patient.booking.confirmBooking} <ArrowRight size={20} /></>
                )}
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  );

};

export default BookingFlow;
