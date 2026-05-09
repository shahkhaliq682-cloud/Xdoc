import React from 'react';
import { 
  CheckCircle2, Calendar, Clock, Stethoscope, 
  MapPin, User, ArrowRight, Download, Home
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

interface BookingSuccessProps {
  tokenData: any;
  onHome: () => void;
}

const BookingSuccess: React.FC<BookingSuccessProps> = ({ tokenData, onHome }) => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-[120] bg-slate-50 flex flex-col items-center justify-center p-6 overflow-y-auto">
      <div className="w-full max-w-lg">
        <div className="text-center mb-12">
           <motion.div 
             initial={{ scale: 0, rotate: -200 }}
             animate={{ scale: 1, rotate: 0 }}
             transition={{ type: "spring", damping: 12, stiffness: 200 }}
             className="w-32 h-32 bg-emerald-500 rounded-[48px] shadow-2xl shadow-emerald-500/30 flex items-center justify-center text-white mx-auto mb-8"
           >
              <CheckCircle2 size={64} />
           </motion.div>
           <h2 className="text-4xl font-bold text-slate-900 mb-2">{t.patient.booking.tokenConfirmed}</h2>
           <p className="text-slate-400 font-bold text-lg uppercase tracking-widest leading-none">Alhamdulillah!</p>
        </div>

        <div className="bg-white rounded-[64px] shadow-2xl shadow-slate-200/50 p-10 relative overflow-hidden mb-12 border border-slate-100">
           {/* Decorative elements */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-health-teal/5 rounded-full -mr-16 -mt-16" />
           <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/5 rounded-full -ml-20 -mb-20" />

           <div className="text-center mb-10">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-4">{t.patient.booking.yourTokenNumber}</p>
              <div className="text-7xl font-bold bg-gradient-to-r from-health-teal to-primary bg-clip-text text-transparent drop-shadow-sm">
                {tokenData.tokenNumber}
              </div>
           </div>

           <div className="space-y-6 pt-10 border-t-2 border-dashed border-slate-100">
              <div className="flex items-center gap-5">
                 <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                   <MapPin size={24} />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Hospital</p>
                    <p className="font-bold text-slate-800">{tokenData.hospitalName}</p>
                 </div>
              </div>

              <div className="flex items-center gap-5">
                 <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                   <Stethoscope size={24} />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Doctor</p>
                    <p className="font-bold text-slate-800">Dr. {tokenData.doctorName}</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                     <Calendar size={24} />
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Date</p>
                      <p className="font-bold text-slate-800">{tokenData.appointmentDate}</p>
                   </div>
                </div>
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                     <Clock size={24} />
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Time</p>
                      <p className="font-bold text-slate-800">{tokenData.appointmentTime}</p>
                   </div>
                </div>
              </div>

              <div className="flex items-center gap-5 pt-6 border-t border-slate-50">
                 <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                   <User size={24} />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Your Name</p>
                    <p className="font-bold text-slate-800">{tokenData.patientName}</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <button 
             className="w-full py-5 bg-white border-2 border-slate-100 rounded-3xl font-bold text-slate-600 flex items-center justify-center gap-3 hover:bg-slate-50 transition-all"
             onClick={() => window.print()}
           >
             <Download size={24} /> {t.patient.booking.saveToken}
           </button>
           <button 
             className="w-full py-5 bg-slate-900 border-2 border-slate-900 rounded-3xl font-bold text-white flex items-center justify-center gap-3 shadow-2xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all"
             onClick={onHome}
           >
             <Home size={24} /> {t.patient.booking.goToHome}
           </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
