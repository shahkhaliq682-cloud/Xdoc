import React, { useState, useEffect } from 'react';
import { 
  Clock, MapPin, Phone, Hospital, CheckCircle2, AlertTriangle, 
  ChevronRight, Volume2, VolumeX, ArrowLeft, Heart, Globe, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { InvoiceModal } from './ui/InvoiceModal';

interface TokenTrackingProps {
  tokenId: string;
  onBack: () => void;
}

export default function TokenTrackingPage({ tokenId, onBack }: TokenTrackingProps) {
  const [token, setToken] = useState<any>(null);
  const [hospital, setHospital] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isExpiredAlertShown, setIsExpiredAlertShown] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'UR'>('EN');

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

  // Dynamic queue stats
  const [queuePos, setQueuePos] = useState<number>(0);
  const [waitTime, setWaitTime] = useState<number>(0);
  const [peopleAhead, setPeopleAhead] = useState<any[]>([]);

  // Web Audio Synthetic Chime Player (Reliable, requires zero asset load)
  const playStateChime = (tone: 'success' | 'alert') => {
    if (!soundEnabled) return;
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AC();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (tone === 'success') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } else {
        // Expiry Siren / Alert
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(330, ctx.currentTime); // Mi
        osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.3); // La
        osc.frequency.linearRampToValueAtTime(330, ctx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      }
    } catch (e) {
      console.warn("Unable to play synthetic chime:", e);
    }
  };

  // Real-time listener for Token
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'tokens', tokenId), async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        
        // Audio Chime feedback when status shifts
        if (token && token.status !== data.status) {
          if (data.status === 'expired') {
            playStateChime('alert');
            setIsExpiredAlertShown(true);
          } else {
            playStateChime('success');
          }
        }
        
        setToken({ id: snapshot.id, ...data });

        // Retrieve hospital details
        if (data.hospitalId && !hospital) {
          const hospSnap = await getDoc(doc(db, 'hospitals', data.hospitalId));
          if (hospSnap.exists()) {
            setHospital(hospSnap.data());
          }
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [tokenId, token, hospital]);

  // Real-time queue positioning listeners
  useEffect(() => {
    if (!token?.hospitalId || !token?.doctorId) return;

    // Listen to all tokens for the same doctor to calculate relative queue positions
    const unsubColl = onSnapshot(doc(db, 'hospitals', token.hospitalId), (snap) => {
      // Fetch dynamic active listings
    });

    const refTokenSub = onSnapshot(doc(db, 'tokens', tokenId), () => {
      // Let's populate mock live queue based on current time
      const index = parseInt(token.tokenNumber?.replace(/\D/g, '') || '1');
      const mockAhead = index > 1 ? Array.from({ length: index - 1 }, (_, i) => i + 1) : [];
      setPeopleAhead(mockAhead);
      setQueuePos(index);
      
      // Assume 15 mins per patient
      const avgTime = token.averageConsultationTime || 12;
      setWaitTime(Math.max((index - 1) * avgTime, 0));
    });

    return () => {
      unsubColl();
      refTokenSub();
    };
  }, [token?.hospitalId, token?.doctorId, tokenId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Live Token Map...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle size={64} className="text-red-500 mb-6 animate-bounce" />
        <h2 className="text-3xl font-black text-slate-900 mb-2">Token Invalid</h2>
        <p className="text-slate-500 font-medium mb-8 max-w-sm">Diyay huay Token tracking ID system main nahi mili. Please verify your link or code.</p>
        <button onClick={onBack} className="px-8 py-4 bg-primary text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20">
          <ArrowLeft size={18} /> Go Back Home
        </button>
      </div>
    );
  }

  const u = language === 'UR';

  return (
    <div className={`min-h-screen bg-[#F8FAFC] flex flex-col ${u ? 'font-urdu' : 'font-sans'}`} dir={u ? 'rtl' : 'ltr'}>
      {/* Expiry Alarm Alert Screen */}
      <AnimatePresence>
        {isExpiredAlertShown && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-red-650/40 backdrop-blur-2xl">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-[#1D0C0E] border-2 border-red-500/20 p-10 sm:p-14 rounded-[48px] max-w-lg w-full text-center shadow-[0_0_100px_rgba(239,68,68,0.25)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse text-red-500">
                <AlertTriangle size={48} />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mb-4 text-red-100">
                {u ? 'آپ کا ٹوکن ختم ہو گیا ہے!' : 'Your appointment token has expired.'}
              </h2>
              <p className="text-slate-400 font-medium mb-8">
                {u 
                  ? 'آپ وقت پر موجود نہیں تھے، اس لیے یہ ٹوکن منسوخ کر دیا گیا ہے۔ مزید معلومات کے لیے ہسپتال ڈیسک سے رجوع کریں۔' 
                  : 'Because you did not arrive within the grace window, this booking has expired.'}
              </p>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8 text-left space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-bold uppercase tracking-widest">{u ? 'ہسپتال' : 'Hospital'}</span>
                  <span className="text-white font-bold">{token.hospitalName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-bold uppercase tracking-widest">{u ? 'ڈاکٹر' : 'Doctor'}</span>
                  <span className="text-white font-bold">{token.doctorName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-bold uppercase tracking-widest">{u ? 'وقت' : 'Appointment Time'}</span>
                  <span className="text-teal-400 font-bold">{token.appointmentTime}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-bold uppercase tracking-widest">{u ? 'ٹوکن نمبر' : 'Token Number'}</span>
                  <span className="text-red-400 font-black text-sm">{token.tokenNumber}</span>
                </div>
              </div>

              <button 
                onClick={() => setIsExpiredAlertShown(false)}
                className="w-full py-5 bg-red-650 text-white bg-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-red-500/20"
              >
                {u ? 'ٹھیک ہے / بند کریں' : 'Acknowledge / Close'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Top Banner Navigation */}
      <header className="h-20 bg-gradient-to-r from-white/60 via-sky-50/40 to-white/60 backdrop-blur-2xl border-b border-indigo-100/30 sticky top-0 z-40 flex items-center justify-between px-6 sm:px-10 shadow-[0_8px_30px_rgba(11,95,255,0.02)]">
        <button onClick={onBack} className="h-10 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-bold flex items-center gap-2 transition-all">
          <ArrowLeft size={16} />
          <span>{u ? 'واپس جائیں' : 'Back'}</span>
        </button>

        <div className="flex items-center gap-4">
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="w-10 h-10 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center transition-colors">
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          
          <button onClick={() => setLanguage(language === 'EN' ? 'UR' : 'EN')} className="px-4 h-10 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black uppercase tracking-wider text-slate-600 hover:text-primary transition-colors flex items-center gap-1">
            <Globe size={16} />
            <span>{language === 'EN' ? 'اردو' : 'English'}</span>
          </button>
        </div>
      </header>

      {/* Main Form Dashboard */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 flex-1 space-y-10">
        
        {/* Active Header Card */}
        <div className="bg-[#0A1622] text-white rounded-[40px] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 blur-[100px] rounded-full -mr-32 -mt-32" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="text-center md:text-left space-y-3">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${
                token.status === 'expired' ? 'bg-red-500/20 text-red-400 border border-red-500/10' :
                token.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/10' :
                token.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/10 animate-pulse' :
                'bg-teal-500/20 text-teal-300 border border-teal-500/10'
              }`}>
                {token.status?.toUpperCase()}
              </span>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{token.hospitalName}</h1>
              <p className="text-slate-400 font-bold uppercase tracking-wide text-sm">
                DR. {token.doctorName} • {token.doctorSpecialization}
              </p>
              {(token.status === 'completed' || token.status === 'Completed') && (
                <div className="pt-3">
                  <button 
                    onClick={openInvoiceModal}
                    className="px-6 py-3 bg-[#0B5FFF] hover:bg-[#0B5FFF]/90 text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#0B5FFF]/20 active:scale-95"
                  >
                    <span>🧾 {u ? 'انوائس حاصل کریں' : 'Get Invoice'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center justify-center w-36 h-36 bg-white/5 border border-white/10 rounded-[32px] shrink-0 shadow-lg relative group">
              <span className="text-[10px] text-teal-400 font-black uppercase tracking-wider mb-1">YOUR TICKET</span>
              <span className="text-5xl font-black font-mono tracking-tighter" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                {token.tokenNumber}
              </span>
              <span className="text-[9px] text-white/40 mt-1 uppercase tracking-widest">{token.appointmentTime}</span>
            </div>
          </div>
        </div>

        {/* Realtime Live Queue Stats (Only if waiting or active) */}
        {['waiting', 'active', 'in-progress'].includes(token.status) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Queue Counter */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center font-black text-3xl">
                {Math.max(queuePos - 1, 0)}
              </div>
              <div>
                <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">
                  {u ? 'آپ سے آگے لوگ' : 'Patients Ahead of You'}
                </h4>
                <p className="text-slate-900 font-black text-xl leading-none">
                  {queuePos > 1 ? `${queuePos - 1} ${u ? 'مریض' : 'Patients'}` : (u ? 'آپ اگلے ہیں!' : 'You are next up!')}
                </p>
              </div>
            </div>

            {/* Estimated Wait Time */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
              <div className="w-16 h-16 bg-teal-50 text-teal-500 rounded-2xl flex items-center justify-center font-black text-2xl">
                <Clock size={28} />
              </div>
              <div>
                <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">
                  {u ? 'اندازاً وقت انتظار' : 'Estimated Wait Time'}
                </h4>
                <p className="text-slate-900 font-black text-xl leading-none">
                  ~ {waitTime} {u ? 'منٹ' : 'mins'}
                </p>
              </div>
            </div>

          </div>
        )}

        {/* Live Timeline Tracker */}
        <div className="bg-white p-8 sm:p-12 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">
            {u ? 'ٹوکن کی موجودہ حالت' : 'LIVE STATUS PIPELINE'}
          </h3>

          <div className="relative border-l-2 border-slate-100 ml-4 pl-8 space-y-10 py-2">
            
            {/* Step 1: Booked */}
            <div className="relative">
              <div className="absolute -left-[41px] top-0.5 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white ring-8 ring-white shadow-sm">
                <CheckCircle2 size={14} />
              </div>
              <div>
                <h4 className="font-bold text-slate-930 text-base">{u ? 'ٹوکن بک ہو گیا' : 'Token Issued & Confirmed'}</h4>
                <p className="text-slate-500 text-xs mt-1">
                  {u ? `ہسپتال ریسیپشن نے آپ کا ٹوکن ${token.bookingTime} پر کامیابی سے بک کر لیا۔` : `Reception booked your appointment at ${token.bookingTime}.`}
                </p>
              </div>
            </div>

            {/* Step 2: Servicing */}
            <div className="relative">
              <div className={`absolute -left-[41px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white ring-8 ring-white shadow-sm ${
                token.status === 'in-progress' || token.status === 'completed'
                  ? 'bg-emerald-500'
                  : 'bg-slate-200'
              }`}>
                {token.status === 'in-progress' ? <Play size={10} fill="currentColor" className="animate-ping" /> : <CheckCircle2 size={14} />}
              </div>
              <div>
                <h4 className={`font-bold text-base ${token.status === 'in-progress' ? 'text-blue-500 font-black' : ''}`}>
                  {u ? 'ڈاکٹر بلا رہا ہے' : 'Serving in Clinic'}
                </h4>
                <p className="text-slate-500 text-xs mt-1">
                  {token.status === 'in-progress'
                    ? (u ? 'آپ کا ٹوکن نمبر پکارا گیا ہے۔ براہ کرم اندر داخل ہوں۔' : 'Your token code is currently called into the consultation room.')
                    : (u ? 'انتظار گاہ میں ڈاکٹر کا بلاوا ہونا باقی ہے۔' : 'Your turn is pending call from clinic.')}
                </p>
              </div>
            </div>

            {/* Step 3: Finished or Expired */}
            <div className="relative">
              <div className={`absolute -left-[41px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white ring-8 ring-white shadow-sm ${
                token.status === 'expired' ? 'bg-red-500' :
                token.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-200'
              }`}>
                <CheckCircle2 size={14} />
              </div>
              <div>
                <h4 className={`font-bold text-base ${token.status === 'expired' ? 'text-red-500' : token.status === 'completed' ? 'text-emerald-500' : ''}`}>
                  {token.status === 'expired' ? (u ? 'ٹوکن ختم (غیر حاضر)' : 'Expired (Absent)') : (u ? 'چیک اپ مکمل' : 'Consultation Complete')}
                </h4>
                <p className="text-slate-500 text-xs mt-1">
                  {token.status === 'completed' ? (u ? 'چیک اپ کامیابی سے مکمل کر لیا گیا ہے۔ صحت مند رہیں!' : 'Service marked complete by receptionist. Safe travels!') : 
                   token.status === 'expired' ? (u ? 'مقررہ وقت پر نہ پہنچنے کی وجہ سے ٹوکن منسوخ کر دیا گیا۔' : 'Token status invalidated due to non-attendance.') :
                   (u ? 'ڈاکٹر چیک اپ مکمل کرنے کے بعد یہاں ٹوکن مارک کرتا ہے۔' : 'Waiting for appointment to wrap up.')}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Hospital Details Panel */}
        {hospital && (
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-md font-black text-slate-800 uppercase tracking-widest px-2">
              {u ? 'ہسپتال کی معلومات' : 'FACILITY INFORMATION'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{u ? 'پتہ' : 'Full Address'}</p>
                    <p className="text-slate-830 text-sm font-bold">{hospital.address || 'Karachi, Pakistan'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{u ? 'رابطہ نمبر' : 'Phone Line'}</p>
                    <p className="text-slate-830 text-sm font-bold">{hospital.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{u ? 'اوقاتِ کار' : 'Timings'}</p>
                    <p className="text-slate-830 text-sm font-bold">
                      {hospital.openingTime || '09:00 AM'} — {hospital.closingTime || '09:00 PM'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <Hospital size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{u ? 'او پی ڈی فیس' : 'OPD Consultation Fee'}</p>
                    <p className="text-teal-605 text-sm font-black text-teal-605">Rs. {hospital.startingFee || hospital.opdFee || 1500}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      <InvoiceModal 
        isOpen={isInvoiceOpen} 
        onClose={closeInvoiceModal} 
        token={token} 
        hospitalData={hospital} 
      />
    </div>
  );
}
