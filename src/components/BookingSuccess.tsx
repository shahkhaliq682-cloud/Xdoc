import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Calendar, Clock, Stethoscope, 
  MapPin, User, ArrowRight, Download, Home,
  Hospital as HospitalIcon, Wallet, Phone, FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { InvoiceModal } from './ui/InvoiceModal';

interface BookingSuccessProps {
  tokenData: any;
  onHome: () => void;
  onViewBookings: () => void;
}

const BookingSuccess: React.FC<BookingSuccessProps> = ({ tokenData, onHome, onViewBookings }) => {
  const { t, language } = useLanguage();
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const openInvoiceModal = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('invoice', 'true');
    window.history.pushState(null, '', url.pathname + url.search);
    window.dispatchEvent(new Event('popstate'));
  };

  const closeInvoiceModal = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('invoice');
    window.history.pushState(null, '', url.pathname + url.search);
    window.dispatchEvent(new Event('popstate'));
  };

  useEffect(() => {
    const handleInvoicePopState = () => {
      const searchParams = new URLSearchParams(window.location.search);
      setIsInvoiceOpen(searchParams.get('invoice') === 'true');
    };

    handleInvoicePopState();
    window.addEventListener('popstate', handleInvoicePopState);
    return () => window.removeEventListener('popstate', handleInvoicePopState);
  }, []);

  return (
    <div className="fixed inset-0 z-[120] bg-white flex flex-col items-center p-6 overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-lg pt-12 pb-20">
        {/* Step 1: Animated Checkmark */}
        <div className="text-center mb-8">
           <motion.div 
             initial={{ scale: 0, rotate: -20 }}
             animate={{ scale: 1, rotate: 0 }}
             transition={{ type: "spring", damping: 10, stiffness: 100 }}
             className="w-24 h-24 bg-green-500 rounded-full shadow-2xl shadow-green-500/30 flex items-center justify-center text-white mx-auto mb-6"
           >
              <CheckCircle2 size={52} strokeWidth={3} />
           </motion.div>
           <h2 className="text-3xl font-black text-slate-900 mb-2">
             {t.patient.booking.tokenConfirmedHeading}
           </h2>
        </div>

        {/* Step 2: Huge Token Number */}
        <div className="bg-white rounded-[40px] border-4 border-slate-50 p-8 text-center mb-8 shadow-sm">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mb-4">
             {t.patient.booking.yourTokenNumber}
           </p>
           <div className="py-6 px-10 bg-health-teal/5 rounded-[32px] inline-block border-2 border-dashed border-health-teal/20">
             <span className="text-7xl font-black text-health-teal tracking-tighter" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
               {tokenData?.tokenNumber}
             </span>
           </div>
        </div>

        {/* Step 3: Details */}
        <div className="bg-slate-50 rounded-[40px] p-8 space-y-6 mb-8">
            <div className="flex items-center gap-4">
              <HospitalIcon size={20} className="text-health-teal shrink-0" />
              <span className="font-bold text-slate-700">{tokenData?.hospitalName}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Stethoscope size={20} className="text-health-teal shrink-0" />
              <span className="font-bold text-slate-700">Dr. {tokenData?.doctorName}</span>
            </div>

            <div className="flex items-center gap-4">
              <Calendar size={20} className="text-health-teal shrink-0" />
              <span className="font-bold text-slate-700">{tokenData?.appointmentDate}</span>
            </div>

            <div className="flex items-center gap-4">
              <Clock size={20} className="text-health-teal shrink-0" />
              <span className="font-bold text-slate-700">{tokenData?.appointmentTime}</span>
            </div>

            <div className="flex items-center gap-4 border-t border-slate-200 pt-6">
              <Wallet size={20} className="text-health-teal shrink-0" />
              <span className="font-bold text-slate-900">Rs. {tokenData?.consultationFee}</span>
            </div>

            <div className="flex items-center justify-between items-center gap-4 border-t border-slate-200 pt-6">
              <div className="flex items-center gap-4">
                <Phone size={20} className="text-health-teal shrink-0" />
                <span className="font-bold text-slate-600">{tokenData?.patientPhone}</span>
              </div>
              <div className="px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                {t.patient.booking.waiting}
              </div>
            </div>
        </div>

        {/* Step 4: Important Note */}
        <div className="bg-health-teal/5 rounded-3xl p-6 mb-12 flex gap-4 border border-health-teal/10">
          <div className="w-10 h-10 bg-health-teal rounded-full flex items-center justify-center text-white shrink-0">
             <span className="font-black">!</span>
          </div>
          <p className="text-sm font-bold text-health-teal leading-relaxed">
            "{t.patient.booking.hospitalPahunchein}"
          </p>
        </div>

        {/* Step 5: Action Buttons */}
        <div className="space-y-4">
           <button 
             onClick={onViewBookings}
             className="w-full py-5 bg-health-teal text-white font-black rounded-3xl shadow-2xl shadow-health-teal/20 hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-3"
           >
             {t.patient.booking.meriBookings} <ArrowRight size={20} />
           </button>
           <button 
             onClick={openInvoiceModal}
             className="w-full py-5 bg-white border-2 border-primary text-primary font-black rounded-3xl hover:bg-primary/5 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
           >
             <span>{language === 'UR' ? '🧾 انوائس دیکھیں' : '🧾 Invoice Dekhen'}</span>
           </button>
           <button 
             onClick={onHome}
             className="w-full py-5 bg-white border-2 border-slate-100 text-slate-400 font-black rounded-3xl hover:bg-slate-50 transition-all"
           >
             {t.patient.booking.wapasJayen}
           </button>
        </div>
      </div>

      <InvoiceModal 
        isOpen={isInvoiceOpen} 
        onClose={closeInvoiceModal} 
        token={tokenData} 
      />
    </div>
  );
};

export default BookingSuccess;
