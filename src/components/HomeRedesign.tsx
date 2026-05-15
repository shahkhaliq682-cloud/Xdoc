import React, { useState, useEffect, useRef } from 'react';
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

const HomeRedesign = ({ onSignUp, onLogin, onSearch, onHospitalClick }: { onSignUp: () => void, onLogin: () => void, onSearch: (q: string) => void, onHospitalClick?: (h: any) => void }) => {
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
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#F1F5F9] border border-[#CBD5E0] rounded-full mb-8"
          >
            <ShieldCheck size={14} className="text-slate-600" />
            <span className="text-[13px] font-medium text-slate-600">{h.hero.badge}</span>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-[800px] mb-8"
          >
            <h1 className="text-5xl md:text-[72px] font-[900] text-[#0B1D35] tracking-tight leading-[1.1] mb-8">
              {h.hero.title1} {h.hero.title2}<br />
              <span className="text-[#0B5FFF]">{h.hero.title3}</span>
            </h1>
            <p className="text-lg md:text-[22px] text-[#64748B] leading-[1.6] max-w-[600px] mx-auto font-medium">
              {language === 'UR' 
                ? 'پاکستان کی نمبر 1 ڈیجیٹل ہیلتھ کیئر ایپ۔ ڈاکٹرز کو تلاش کریں اور سیکنڈز میں ٹوکن بک کریں۔'
                : 'Pakistan #1 Digital Healthcare App. Find top doctors and book tokens in seconds.'
              }
            </p>
          </motion.div>

          {/* Main Search Bar - Focal Point */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-[720px] mb-6"
          >
            <div className="flex flex-col md:flex-row items-center bg-white p-2 md:p-3 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-100 focus-within:border-[#0B5FFF]/30 transition-all gap-2 md:gap-4">
              <div className="flex-1 flex items-center px-4 w-full h-[60px] md:h-auto border-b md:border-b-0 md:border-r border-slate-100">
                <Search className="text-[#0B5FFF] mr-3" size={24} strokeWidth={2.5} />
                <input 
                  type="text" 
                  placeholder={h.hero.searchPlaceholder}
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onSearch(searchVal)}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-lg text-slate-800 placeholder-slate-400 font-semibold"
                />
              </div>
              <div className="flex items-center px-4 w-full md:w-auto h-[60px] md:h-auto">
                <MapPin className="text-slate-400 mr-2" size={20} />
                <span className="text-slate-700 font-bold">Karachi</span>
              </div>
              <button 
                onClick={() => onSearch(searchVal)}
                className="w-full md:w-auto px-10 py-4 bg-[#0B5FFF] text-white font-bold rounded-[18px] hover:bg-blue-600 transition-all text-base shadow-lg shadow-blue-500/20 active:scale-95"
              >
                {h.hero.searchBtn}
              </button>
            </div>
          </motion.div>

          {/* Quick Categories */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {['General Physician', 'Specialist', 'Dentist', 'Emergency'].map((cat, i) => (
              <button key={i} className="px-5 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-600 hover:border-[#0B5FFF] hover:text-[#0B5FFF] transition-all shadow-sm">
                {cat}
              </button>
            ))}
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
                   <div className="w-8 h-8 bg-[#0B5FFF] rounded-lg flex items-center justify-center text-white">
                     <Activity size={18} />
                   </div>
                   <span className="text-2xl font-bold tracking-tight">Xdoc</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-xs">{h.footer.desc}</p>
                <div className="flex gap-4">
                   {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
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
                <h4 className="text-sm font-bold mb-6 text-white">{h.footer.company.title}</h4>
                <ul className="space-y-4 text-slate-400 text-sm">
                   <li><button className="hover:text-white transition-colors cursor-pointer text-left">Privacy Policy</button></li>
                   <li><button className="hover:text-white transition-colors cursor-pointer text-left">Terms of Service</button></li>
                   <li><a href="mailto:support@xdoc.pk" className="hover:text-white transition-colors cursor-pointer text-left">{h.footer.company.contact}</a></li>
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
