import React, { useState, useEffect, useRef } from 'react';
import { BrandLogo } from './ui/BrandLogo';
import { 
  Search, 
  Activity, 
  ArrowRight, 
  ShieldCheck, 
  Building2, 
  Users, 
  Calendar, 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin,
  Youtube,
  Zap,
  DollarSign,
  Building,
  Clock,
  Check,
  Stethoscope,
  LayoutDashboard,
  Smartphone,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { 
  collection, 
  getCountFromServer, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useLanguage } from '../contexts/LanguageContext';

// --- Stat Item for the Strip ---
const StatItem = ({ end, label }: { end: number, label: string }) => {
  const [count, setCount] = useState(0);
  const [actualEnd, setActualEnd] = useState(end);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    setActualEnd(end);
  }, [end]);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 2000;
      const increment = actualEnd / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= actualEnd) {
          setCount(actualEnd);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, actualEnd]);

  return (
    <div ref={ref} className="flex flex-col items-center justify-center py-8">
      <h4 className="text-[24px] md:text-[28px] font-bold text-[#0B1D35] mb-1">
        {count.toLocaleString()}+
      </h4>
      <p className="text-[12px] md:text-[14px] text-slate-500 font-medium">{label}</p>
    </div>
  );
};

// --- Feature Card Component ---
const FeatureCard = ({ title, desc, icon: Icon }: { title: string, desc: string, icon: any }) => (
  <motion.div 
    whileHover={{ borderColor: '#0B5FFF', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}
    className="p-7 bg-white rounded-2xl border border-slate-200 transition-all group text-left h-full"
  >
    <div className="w-8 h-8 rounded-lg flex items-center justify-start text-[#0B5FFF] mb-5">
      <Icon size={32} strokeWidth={1.5} />
    </div>
    <h3 className="text-base font-bold text-[#0B1D35] mb-2">{title}</h3>
    <p className="text-sm text-slate-500 leading-relaxed font-normal">{desc}</p>
  </motion.div>
);

// --- Step Component ---
const Step = ({ number, title, desc, icon: Icon, isLast = false }: { number: number, title: string, desc: string, icon: any, isLast?: boolean }) => (
  <div className="flex flex-col items-center text-center relative w-full">
    {!isLast && (
      <div className="hidden lg:block absolute top-[60px] left-[calc(50%+40px)] w-[calc(100%-80px)] h-px border-t border-dashed border-slate-300 z-0" />
    )}
    <div className="w-12 h-12 bg-white text-[#0B5FFF] border border-blue-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm z-10">
      <Icon size={24} />
    </div>
    <div className="w-8 h-8 rounded-full bg-[#0B5FFF] text-white flex items-center justify-center text-xs font-bold mb-4 shadow-lg shadow-blue-500/20 z-10">
      {number}
    </div>
    <h4 className="text-base font-bold text-[#0B1D35] mb-2">{title}</h4>
    <p className="text-sm text-slate-500 max-w-[200px] leading-relaxed">{desc}</p>
  </div>
);

const HomeRedesign = ({ onSignUp, onLogin, onSearch, onHospitalClick, onNavigate }: { onSignUp: () => void, onLogin: () => void, onSearch: (q: string) => void, onHospitalClick?: (h: any) => void, onNavigate?: (view: 'privacy' | 'terms' | 'contact' | 'about' | 'content_policy' | 'pricing', path: string) => void }) => {
  const { t, language } = useLanguage();
  const [searchVal, setSearchVal] = useState('');

  const [counts, setCounts] = useState({
    hospitals: 500,
    doctors: 2000,
    cities: 50,
    patients: 15000
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const hospitalCount = await getRealCount('users', where('role', '==', 'hospital_admin'));
        const doctorCount = await getRealCount('doctors');
        const patientCount = await getRealCount('users', where('role', '==', 'patient'));
        
        setCounts(prev => ({
          ...prev,
          hospitals: hospitalCount > 0 ? hospitalCount : prev.hospitals,
          doctors: doctorCount > 0 ? doctorCount : prev.doctors,
          patients: patientCount > 0 ? patientCount : prev.patients
        }));
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchCounts();
  }, []);

  const getRealCount = async (coll: string, qry?: any) => {
    try {
      const collRef = collection(db, coll);
      const snapshot = await getCountFromServer(qry ? query(collRef, qry) : collRef);
      return snapshot.data().count;
    } catch (e) {
      return 0;
    }
  };

  const h = t.homeRedesign;

  return (
    <div className="bg-[#FAFAFA]">
      {/* 1. HERO SECTION */}
      <section className="relative px-6 pt-28 pb-20 md:pt-32 md:pb-24 border-b border-slate-100 overflow-hidden bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          
          {/* Trust Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50/50 border border-blue-100/80 rounded-full mb-8 shadow-[0_2px_12px_rgba(11,95,255,0.03)]"
          >
            <ShieldCheck size={14} className="text-[#0B5FFF]" />
            <span className="text-[12px] font-bold text-slate-700 tracking-wide uppercase">{h.hero.badge}</span>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-[800px] mb-8"
          >
            <h1 className="text-4xl md:text-[64px] font-bold text-[#0B1D35] tracking-tight leading-[1.15] mb-6">
              {h.hero.title1} {h.hero.title2}<br />
              <span className="text-[#0B5FFF]">{h.hero.title3}</span>
            </h1>
            <p className="text-base md:text-lg text-slate-700 leading-[1.6] max-w-[620px] mx-auto font-medium">
              {language === 'UR' 
                ? 'پاکستان کی نمبر 1 ڈیجیٹل ہیلتھ کیئر ایپ۔ ڈاکٹرز کو تلاش کریں اور سیکنڈز میں ٹوکن بک کریں۔'
                : 'Pakistan\'s #1 Digital Healthcare App. Find top doctors and book tokens in seconds.'
              }
            </p>
          </motion.div>

          {/* Optimized Search Container */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-[720px] mb-8"
          >
            <div className={`p-4 md:p-5 bg-white rounded-[28px] border border-slate-200/60 shadow-[0_16px_48px_rgba(11,95,255,0.04)] focus-within:border-[#0B5FFF]/40 transition-all text-left ${language === 'UR' ? 'md:text-right' : 'md:text-left'}`}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Field 1: Doctor/Hospital Search */}
                <div className="md:col-span-8 flex flex-col">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1 block">
                    {language === 'UR' ? 'آپ کس کی تلاش کر رہے ہیں؟' : 'What are you looking for?'}
                  </label>
                  <div className="flex items-center px-4 bg-slate-50/60 border border-slate-200/40 hover:border-slate-200 focus-within:bg-white focus-within:border-[#0B5FFF]/50 h-[56px] rounded-2xl transition-all">
                    <Search className="text-[#0B5FFF] mr-3 shrink-0" size={18} strokeWidth={2.5} />
                    <input 
                      type="text" 
                      placeholder={h.hero.searchPlaceholder}
                      value={searchVal}
                      onChange={(e) => setSearchVal(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && onSearch(searchVal)}
                      className="flex-1 bg-transparent border-none p-0 focus:ring-0 text-sm text-slate-800 placeholder-slate-400 font-semibold"
                    />
                  </div>
                </div>

                {/* Field 2: Location Selector */}
                <div className="md:col-span-4 flex flex-col">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1 block">
                    {language === 'UR' ? 'آپ کا شہر' : 'Location'}
                  </label>
                  <div className="flex items-center justify-between px-4 bg-slate-50/60 border border-slate-200/40 h-[56px] rounded-2xl">
                    <div className="flex items-center gap-2">
                      <MapPin className="text-slate-400 shrink-0" size={18} />
                      <span className="text-slate-700 font-bold text-sm">Karachi</span>
                    </div>
                    <span className="text-[10px] font-black bg-blue-100 text-[#0B5FFF] px-2 py-0.5 rounded-full uppercase tracking-wider">PK</span>
                  </div>
                </div>
              </div>

              {/* Spaced Search Button */}
              <div className="mt-5 flex justify-end">
                <button 
                  onClick={() => onSearch(searchVal)}
                  className="w-full md:w-auto px-10 py-3.5 bg-[#0B5FFF] hover:bg-[#0B5FFF]/95 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-blue-500/15 active:scale-[0.98] duration-200"
                >
                  {h.hero.searchBtn}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Quick Access Categories (Above the Fold) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-[720px] mb-12 text-left"
          >
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center md:text-left px-1">
              {language === 'UR' ? 'فوری رسائی' : 'Quick Access Categories'}
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-6 px-6 md:mx-0 md:px-0 scroll-smooth">
              {[
                { 
                  name: language === 'UR' ? 'عام معالج' : 'General Physician', 
                  query: 'General Physician', 
                  icon: Stethoscope,
                  color: 'bg-blue-50/70 border-blue-100 text-[#0B5FFF] hover:bg-blue-50' 
                },
                { 
                  name: language === 'UR' ? 'ماہر امراض' : 'Specialist', 
                  query: 'Specialist', 
                  icon: Activity,
                  color: 'bg-pink-50/70 border-pink-100 text-pink-600 hover:bg-pink-50' 
                },
                { 
                  name: language === 'UR' ? 'دندان ساز' : 'Dentist', 
                  query: 'Dentist', 
                  icon: Check, // Tooth is Check
                  color: 'bg-indigo-50/70 border-indigo-100 text-indigo-600 hover:bg-indigo-50' 
                },
                { 
                  name: language === 'UR' ? 'ایمرجنسی' : 'Emergency', 
                  query: 'Emergency', 
                  icon: ShieldCheck,
                  color: 'bg-rose-50/70 border-rose-100 text-rose-600 hover:bg-rose-50' 
                }
              ].map((cat, i) => {
                const IconComp = cat.icon;
                return (
                  <motion.button 
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    key={i} 
                    onClick={() => onSearch(cat.query)}
                    className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl border ${cat.color} font-bold text-xs uppercase tracking-wider shadow-sm transition-all whitespace-nowrap shrink-0`}
                  >
                    <IconComp size={16} strokeWidth={2.5} />
                    <span>{cat.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Real App Preview - Glassmorphism UI */}
          <motion.div
             initial={{ opacity: 0, y: 40 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.5, duration: 0.8 }}
             className="relative w-full max-w-[1000px] mt-12 mx-auto"
          >
            <div className="absolute -inset-10 bg-gradient-to-tr from-[#0B5FFF]/10 via-transparent to-[#00C9B1]/10 blur-[100px] opacity-50" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 p-4">
               {/* UI Card 1: Token */}
               <motion.div 
                 whileHover={{ y: -5 }}
                 className="bg-white/80 backdrop-blur-xl p-8 rounded-[32px] border border-white shadow-[0_32px_64px_rgba(0,0,0,0.08)] transform -rotate-2"
               >
                  <div className="flex justify-between items-center mb-6">
                    <div className="w-10 h-10 bg-[#0B5FFF]/10 text-[#0B5FFF] rounded-xl flex items-center justify-center">
                      <Zap size={20} fill="currentColor" />
                    </div>
                    <span className="text-[10px] font-bold text-[#00C9B1] uppercase tracking-widest bg-[#00C9B1]/10 px-3 py-1 rounded-full">LIVE</span>
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Your Token</p>
                  <h4 className="text-5xl font-black text-[#0B1D35] mb-2 tracking-tighter">T-0047</h4>
                  <p className="text-sm font-bold text-slate-500">Wait time: ~10 mins</p>
               </motion.div>

               {/* UI Card 2: Hospital Info */}
               <motion.div 
                 whileHover={{ y: -5 }}
                 className="bg-white/90 backdrop-blur-xl p-8 rounded-[32px] border border-white shadow-[0_40px_80px_rgba(0,0,0,0.1)] z-20 md:mt-12"
               >
                  <div className="flex gap-4 mb-6">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl overflow-hidden">
                       <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 leading-tight">Aga Khan Hospital</h4>
                      <p className="text-xs text-slate-500 font-medium">Karachi, Pakistan</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                     <div className="h-2 w-full bg-slate-100 rounded-full" />
                     <div className="h-2 w-2/3 bg-slate-100 rounded-full" />
                  </div>
                  <button className="w-full mt-8 py-3 bg-[#0B5FFF] text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/20">BOOK TOKEN</button>
               </motion.div>

               {/* UI Card 3: Doctor */}
               <motion.div 
                 whileHover={{ y: -5 }}
                 className="bg-white/80 backdrop-blur-xl p-8 rounded-[32px] border border-white shadow-[0_32px_64px_rgba(0,0,0,0.08)] transform rotate-2 md:mt-4"
               >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full border-2 border-[#00C9B1] p-0.5">
                       <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80" className="w-full h-full object-cover rounded-full" />
                    </div>
                    <span className="text-sm font-bold text-slate-900">Dr. Sarah Khan</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available</p>
                      <p className="text-xs font-bold text-[#00C9B1]">Today, 4:00 PM</p>
                    </div>
                    <div className="text-lg font-black text-[#0B5FFF]">Rs. 1,500</div>
                  </div>
               </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. TRUST STRIP (REPLACING OLD STATS) */}
      <section className="bg-white py-12 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center md:justify-between items-center gap-10 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="flex items-center gap-3">
                <ShieldCheck size={28} className="text-[#0B1D35]" />
                <div>
                   <p className="text-sm font-black text-[#0B1D35] uppercase tracking-widest leading-none">Verified</p>
                   <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Hospitals</p>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <Stethoscope size={28} className="text-[#0B1D35]" />
                <div>
                   <p className="text-sm font-black text-[#0B1D35] uppercase tracking-widest leading-none">Real</p>
                   <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Doctors</p>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <Zap size={28} className="text-[#0B1D35]" />
                <div>
                   <p className="text-sm font-black text-[#0B1D35] uppercase tracking-widest leading-none">Secure</p>
                   <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Booking</p>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <Building2 size={28} className="text-[#0B1D35]" />
                <div>
                   <p className="text-sm font-black text-[#0B1D35] uppercase tracking-widest leading-none">Pakistan</p>
                   <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Wide Access</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section id="features" className="bg-white py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0B1D35] mb-4">{h.features.title}</h2>
            <p className="text-base text-slate-500 font-normal max-w-lg mx-auto leading-relaxed">{h.features.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={Calendar} title={h.features.card1.title} desc={h.features.card1.desc} />
            <FeatureCard icon={Zap} title={h.features.card2.title} desc={h.features.card2.desc} />
            <FeatureCard icon={DollarSign} title={h.features.card3.title} desc={h.features.card3.desc} />
            <FeatureCard icon={Building} title={h.features.card4.title} desc={h.features.card4.desc} />
            <FeatureCard icon={Activity} title={h.features.card5.title} desc={h.features.card5.desc} />
            <FeatureCard icon={Clock} title={h.features.card6.title} desc={h.features.card6.desc} />
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="bg-[#F8FAFC] py-24 md:py-32 px-6 border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold text-[#0B1D35] mb-4">{h.howItWorks.title}</h2>
            <p className="text-base text-slate-500">{h.howItWorks.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 relative">
            <Step number={1} icon={Search} title={h.howItWorks.step1.title} desc={h.howItWorks.step1.desc} />
            <Step number={2} icon={Stethoscope} title={h.howItWorks.step2.title} desc={h.howItWorks.step2.desc} />
            <Step number={3} icon={Zap} title={h.howItWorks.step3.title} desc={h.howItWorks.step3.desc} />
            <Step number={4} icon={Building2} title={h.howItWorks.step4.title} desc={h.howItWorks.step4.desc} isLast />
          </div>
        </div>
      </section>

      {/* 5. CTA SECTION */}
      <section className="py-24 px-6 bg-[#0B5FFF] text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight leading-[1.2]">{h.cta.title}</h2>
          <p className="text-lg text-blue-100 mb-12 max-w-2xl mx-auto">{h.cta.subtitle}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onSignUp}
              className="w-full sm:w-auto px-10 py-4 bg-white text-[#0B5FFF] font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg"
            >
              {h.cta.registerBtn}
            </button>
            <button 
              onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-10 py-4 bg-transparent border-1.5 border-white/40 text-white font-bold rounded-xl hover:bg-white/10 transition-all"
            >
              See How It Works
            </button>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-[#0F172A] pt-24 pb-12 px-6 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
             <div>
                <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                   <BrandLogo size={32} />
                   <span className="text-2xl font-bold tracking-tight">Xdoc</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-xs">{h.footer.desc}</p>
                <div className="flex gap-4">
                   {[
                      { Icon: Linkedin, url: "https://www.linkedin.com/in/x-doc-a37ba9414", label: "Xdoc LinkedIn", color: "#0A66C2" },
                      { Icon: Youtube, url: "https://youtube.com/@xdoc.official", label: "Xdoc YouTube", color: "#FF0000" },
                      { Icon: Instagram, url: "https://www.instagram.com/xdoc.official", label: "Xdoc Instagram", gradient: true }
                    ].map((m, i) => (
                      <a 
                        key={i} 
                        href={m.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        aria-label={m.label}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 hover:brightness-110 cursor-pointer"
                        style={m.gradient ? { background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" } : { backgroundColor: m.color }}
                      >
                        <m.Icon size={18} />
                      </a>
                    )) || [].map((Icon, i) => (
                     <a key={i} href="#" className="w-10 h-10 rounded-lg bg-slate-800/50 flex items-center justify-center text-slate-300 hover:bg-[#0B5FFF] hover:text-white transition-all">
                       <Icon size={18} />
                     </a>
                   ))}
                </div>
             </div>

             <div>
                <h4 className="text-sm font-bold mb-6 text-white">{h.footer.quickLinks.title}</h4>
                <ul className="space-y-4 text-slate-400 text-sm">
                   <li><button onClick={onLogin} className="hover:text-white transition-colors cursor-pointer text-left">{h.footer.quickLinks.hospitals}</button></li>
                   <li><button onClick={onLogin} className="hover:text-white transition-colors cursor-pointer text-left">{h.footer.quickLinks.login}</button></li>
                   <li><button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors cursor-pointer text-left">{h.footer.quickLinks.about}</button></li>
                   <li><button onClick={onSignUp} className="hover:text-white transition-colors cursor-pointer text-left">{h.footer.quickLinks.join}</button></li>
                </ul>
             </div>

             <div>
                <h4 className="text-sm font-bold mb-6 text-white">{h.footer.hospitalTypes.title}</h4>
                <ul className="space-y-4 text-slate-400 text-sm">
                   <li><button onClick={onLogin} className="hover:text-white transition-colors cursor-pointer text-left">{h.footer.hospitalTypes.govt}</button></li>
                   <li><button onClick={onLogin} className="hover:text-white transition-colors cursor-pointer text-left">{h.footer.hospitalTypes.private}</button></li>
                   <li><button onClick={onLogin} className="hover:text-white transition-colors cursor-pointer text-left">{h.footer.hospitalTypes.clinic}</button></li>
                   <li><button onClick={onLogin} className="hover:text-white transition-colors cursor-pointer text-left">{h.footer.hospitalTypes.govtClinic}</button></li>
                </ul>
             </div>

             <div>
                <h4 className="text-sm font-bold mb-6 text-white tracking-wider uppercase text-xs">{h.footer.company.title}</h4>
                <ul className="space-y-4 text-slate-400 text-sm">
                   <li>
                     <button 
                       onClick={() => onNavigate?.('pricing', '/pricing')}
                        className="hover:text-[#0B5FFF] hover:translate-x-1.5 transition-all duration-300 cursor-pointer text-left font-sans font-medium flex items-center gap-2 group w-full outline-all-none"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-[#0B5FFF] transition-all shrink-0"></span>
                        <span>{language === 'UR' ? 'قیمتیں' : 'Pricing'}</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => onNavigate?.('privacy', '/privacy-policy')}
                       className="hover:text-[#0B5FFF] hover:translate-x-1.5 transition-all duration-300 cursor-pointer text-left font-sans font-medium flex items-center gap-2 group w-full outline-all-none"
                     >
                       <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-[#0B5FFF] transition-all shrink-0"></span>
                       <span>{language === 'UR' ? 'پرائیویسی پالیسی' : 'Privacy Policy'}</span>
                     </button>
                   </li>
                   <li>
                     <button 
                       onClick={() => onNavigate?.('terms', '/terms')}
                       className="hover:text-[#0B5FFF] hover:translate-x-1.5 transition-all duration-300 cursor-pointer text-left font-sans font-medium flex items-center gap-2 group w-full outline-all-none"
                     >
                       <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-[#0B5FFF] transition-all shrink-0"></span>
                       <span>{language === 'UR' ? 'شرائط و ضوابط' : 'Terms of Service'}</span>
                     </button>
                   </li>
                   <li>
                     <button 
                       onClick={() => onNavigate?.('content_policy', '/content-policy')}
                       className="hover:text-[#0B5FFF] hover:translate-x-1.5 transition-all duration-300 cursor-pointer text-left font-sans font-medium flex items-center gap-2 group w-full"
                     >
                       <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-[#0B5FFF] transition-all shrink-0"></span>
                       <span>{language === 'UR' ? 'مواد کی پالیسی' : 'Content Policy'}</span>
                     </button>
                   </li>
                   <li>
                     <button 
                       onClick={() => onNavigate?.('about', '/about')}
                       className="hover:text-[#0B5FFF] hover:translate-x-1.5 transition-all duration-300 cursor-pointer text-left font-sans font-medium flex items-center gap-2 group w-full"
                     >
                       <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-[#0B5FFF] transition-all shrink-0"></span>
                       <span>{language === 'UR' ? 'ہمارے بارے میں' : 'About Us'}</span>
                     </button>
                   </li>
                   <li>
                     <button 
                       onClick={() => onNavigate?.('contact', '/contact')}
                       className="hover:text-[#0B5FFF] hover:translate-x-1.5 transition-all duration-300 cursor-pointer text-left font-sans font-medium flex items-center gap-2 group w-full"
                     >
                       <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-[#0B5FFF] transition-all shrink-0"></span>
                       <span>{language === 'UR' ? 'ہم سے رابطہ کریں' : 'Contact Us'}</span>
                     </button>
                   </li>
                </ul>
             </div>
          </div>

          <div className="pt-8 border-t border-slate-800 text-center">
             <p className="text-xs text-slate-500 font-medium">
               {h.footer.copyright}
             </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeRedesign;
