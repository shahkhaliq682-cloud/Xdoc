import React, { useState, useEffect } from 'react';
import { 
  Tv, Users, ClipboardList, CheckCircle, ArrowLeft, 
  ArrowRight, Activity, Clock, Calendar, Volume2, VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { formatKarachiClock, formatKarachiDate, getKarachiTime } from '../lib/timeUtils';

interface LiveQueueProps {
  hospitalId: string;
  onBack: () => void;
}

export default function HospitalLiveQueuePage({ hospitalId, onBack }: LiveQueueProps) {
  const [tokens, setTokens] = useState<any[]>([]);
  const [nowServing, setNowServing] = useState<any[]>([]);
  const [nextUp, setNextUp] = useState<any[]>([]);
  const [completed, setCompleted] = useState<any[]>([]);
  const [hospitalName, setHospitalName] = useState<string>("Healthcare Hub");
  const [liveTime, setLiveTime] = useState<Date>(getKarachiTime());
  const [chimeEnabled, setChimeEnabled] = useState(true);

  // Karachi live clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(getKarachiTime());
    }, 60000); // Only update once a minute as requested
    return () => clearInterval(timer);
  }, []);

  // Audio vocalizer synthesizer chime
  const playArrivalBell = () => {
    if (!chimeEnabled) return;
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AC();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      // Multi-tone airport attention chime
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(440.00, ctx.currentTime + 0.2); // A4
      osc.frequency.setValueAtTime(523.25, ctx.currentTime + 0.4); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.6); // E5
      
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.9);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.9);
    } catch (e) {
      console.warn("Unable to play TV announce chime:", e);
    }
  };

  // Real-time listener for all tokens today in this hospital
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const qToken = query(
      collection(db, 'tokens'),
      where('hospitalId', '==', hospitalId),
      where('appointmentDate', '==', todayStr)
    );

    const unsub = onSnapshot(qToken, (snapshot) => {
      const allTokens = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      
      // Determine hospital name from first token found or default
      if (allTokens.length > 0 && allTokens[0].hospitalName) {
        setHospitalName(allTokens[0].hospitalName);
      }

      // Sort tokens chronologically by tokenNumber format (e.g. numeric sort or code-based)
      const sorted = allTokens.sort((a, b) => {
        const numA = parseInt(a.tokenNumber?.replace(/\D/g, '') || '0');
        const numB = parseInt(b.tokenNumber?.replace(/\D/g, '') || '0');
        return numA - numB;
      });

      // Filter statuses
      const serving = sorted.filter(t => t.status === 'in-progress' || t.status === 'In Progress');
      const waiting = sorted.filter(t => t.status === 'waiting' || t.status === 'Waiting');
      const done = sorted.filter(t => t.status === 'completed' || t.status === 'Completed' || t.status === 'done').slice(-4);

      // Trigger announcement sound when Now Serving length increases
      if (serving.length > nowServing.length && nowServing.length > 0) {
        playArrivalBell();
      }

      setTokens(sorted);
      setNowServing(serving);
      setNextUp(waiting.slice(0, 5));
      setCompleted(done.reverse());
    });

    return () => unsub();
  }, [hospitalId, nowServing.length]);

  return (
    <div className="min-h-screen bg-[#020912] text-white flex flex-col font-mono select-none overflow-hidden p-6 sm:p-10 relative">
      {/* Decorative ambient background */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-sky-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-teal-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header section */}
      <header className="flex flex-col lg:flex-row items-center justify-between gap-6 border-b border-white/5 pb-6 mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all scale-90 sm:scale-100"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-sky-500/15 rounded-2xl flex items-center justify-center text-sky-400 border border-sky-500/10 animate-pulse">
              <Tv size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">{hospitalName}</h1>
              <p className="text-[10px] text-sky-400/60 font-bold uppercase tracking-widest mt-0.5">Live Reception TV Screen Mode</p>
            </div>
          </div>
        </div>

        {/* Karachi centered Clock Panel */}
        <div className="flex items-center gap-8 bg-white/5 px-6 py-3 rounded-3xl border border-white/5 shadow-inner shrink-0 text-center lg:text-left">
          <div className="flex items-center gap-3">
            <Clock size={22} className="text-sky-400 animate-pulse" />
            <span className="text-xl font-black tracking-tight">{formatKarachiClock(liveTime)}</span>
          </div>
          <div className="w-[1px] h-6 bg-white/10 hidden sm:block" />
          <div className="text-[10px] text-slate-400 font-bold tracking-wider hidden sm:block">
            {formatKarachiDate(liveTime)}
          </div>
          
          {/* Sound Controls */}
          <button 
            onClick={() => setChimeEnabled(!chimeEnabled)} 
            className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            {chimeEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </header>

      {/* Primary Display Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 relative z-10 overflow-hidden">
        
        {/* Left Section (Now Serving) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-gradient-to-br from-sky-950/20 to-[#020d1c] border border-sky-500/15 rounded-[48px] p-8 sm:p-12 flex-1 flex flex-col justify-between shadow-[inset_0_4px_30px_rgba(0,123,255,0.05)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 bg-emerald-500 rounded-full animate-ping" />
                <h2 className="text-lg font-black tracking-widest text-emerald-400 uppercase">NOW SERVING • اب دیکھ رہے ہیں</h2>
              </div>
              <ClipboardList className="text-white/10" size={32} />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center my-6">
              <AnimatePresence mode="wait">
                {nowServing.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center space-y-4 py-8"
                  >
                    <Activity size={56} className="text-slate-600 animate-pulse mx-auto" />
                    <p className="text-xl font-bold text-slate-400">All Consultations Completed</p>
                    <p className="text-xs text-slate-600 uppercase tracking-widest">Awaiting Patients at Reception</p>
                  </motion.div>
                ) : (
                  nowServing.slice(0, 1).map(token => (
                    <motion.div 
                      key={token.id}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="w-full space-y-10"
                    >
                      {/* Ticket big display */}
                      <div className="relative inline-flex items-center justify-center p-8 bg-sky-500/10 border-2 border-sky-500/30 rounded-[48px] shadow-2xl scale-110 min-w-[200px]">
                        <span className="text-8xl sm:text-9xl font-black font-mono tracking-tighter text-sky-400 leading-none">
                          {token.tokenNumber}
                        </span>
                      </div>

                      {/* Doctor details */}
                      <div className="space-y-3">
                        <p className="text-white text-3xl sm:text-4xl font-black tracking-tight uppercase">
                          {token.patientName}
                        </p>
                        <p className="text-lg text-emerald-400 font-bold uppercase tracking-wider">
                          Go to: CLINIC OF DR. {token.doctorName}
                        </p>
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">
                          Room {token.roomNumber || 'Opd Room B'} • {token.appointmentTime}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Minor tickers scrolling bottom */}
            {nowServing.length > 1 && (
              <div className="border-t border-white/5 pt-6 flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                <span>Also Called:</span>
                <div className="flex gap-4">
                  {nowServing.slice(1).map(t => (
                    <span key={t.id} className="bg-white/5 border border-white/10 px-3 py-1 rounded-xl text-sky-400 font-black">
                      #{t.tokenNumber} &rarr; Dr. {t.doctorName}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section (Next Up / Completed) */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          
          {/* Next Up list */}
          <div className="bg-[#040e1c] border border-white/5 rounded-[44px] p-6 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6 px-2">
              <div className="flex items-center gap-3">
                <Users size={20} className="text-sky-400" />
                <h3 className="text-sm font-black tracking-widest text-slate-400 uppercase">NEXT IN QUEUE • قطار میں اگلا</h3>
              </div>
              <span className="text-[10px] font-bold tracking-wider bg-white/5 px-2.5 py-1 rounded-lg text-white/55">UPCOMING</span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[350px] pr-1">
              <AnimatePresence>
                {nextUp.length === 0 ? (
                  <div className="h-full flex items-center justify-center p-8 text-center">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">No Patients Waiting</p>
                  </div>
                ) : (
                  nextUp.map((token, idx) => (
                    <motion.div 
                      key={token.id}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl p-4 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white font-mono font-black border border-white/5 text-lg group-hover:text-sky-400 transition-colors">
                          {token.tokenNumber}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-200 uppercase">{token.patientName}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">DR. {token.doctorName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 bg-white/5 rounded-lg text-[9px] text-slate-400 font-bold">
                          {token.appointmentTime}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Completed / History Panel */}
          <div className="bg-[#050b12]/50 border border-white/5 rounded-[44px] p-6 h-[220px] flex flex-col">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-3">
                <CheckCircle size={18} className="text-emerald-400" />
                <h3 className="text-sm font-black tracking-widest text-slate-400 uppercase">RECENTLY COMPLETED</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 flex-1 overflow-hidden">
              {completed.slice(0, 4).map(token => (
                <div key={token.id} className="bg-emerald-900/10 border border-emerald-500/10 rounded-2xl p-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-emerald-400 tracking-wider">#{token.tokenNumber}</h4>
                    <span className="text-[9px] text-slate-500 block truncate max-w-[100px] uppercase">{token.patientName}</span>
                  </div>
                  <span className="text-[8px] text-emerald-500/70 border border-emerald-550/20 px-2 py-0.5 rounded-lg font-bold">DONE</span>
                </div>
              ))}
              {completed.length === 0 && (
                <div className="col-span-2 flex items-center justify-center text-xs text-slate-600 font-bold uppercase tracking-widest">
                  Not Started
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
