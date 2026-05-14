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

const HomeRedesign = ({ onSignUp, onLogin, onSearch }: { onSignUp: () => void, onLogin: () => void, onSearch: (q: string) => void }) => {
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
            className="max-w-[700px] mb-6"
          >
            <h1 className="text-4xl md:text-[56px] font-[800] text-[#0B1D35] tracking-tight leading-[1.15] mb-6">
              {h.hero.title1} {h.hero.title2}<br />
              <span className="text-[#00C9B1]">{h.hero.title3}</span>
            </h1>
            <p className="text-base md:text-[18px] text-[#64748B] leading-[1.7] max-w-[500px] mx-auto">
              {language === 'UR' 
                ? 'پاکستان کے تمام ہسپتال اور کلینک ایک جگہ۔ گھر بیٹھے ٹوکن بک کریں۔'
                : 'Pakistan ke tamam hospitals aur clinics ek jagah. Ghar baithe token book karein.'
              }
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-[540px] mt-8 mb-10 group"
          >
            <div className="flex items-center bg-white h-[52px] px-4 rounded-[10px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] border-[1.5px] border-[#E2E8F0] focus-within:border-[#0B5FFF] transition-all">
              <Search className="text-[#64748B] mr-2" size={18} />
              <input 
                type="text" 
                placeholder={h.hero.searchPlaceholder}
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch(searchVal)}
                className="flex-1 bg-transparent border-none focus:ring-0 text-base text-slate-800 placeholder-slate-400"
              />
              <button 
                onClick={() => onSearch(searchVal)}
                className="ml-2 px-4 h-[38px] bg-[#0B5FFF] text-white font-medium rounded-[7px] hover:bg-blue-600 transition-all text-sm"
              >
                {h.hero.searchBtn}
              </button>
            </div>
          </motion.div>

          {/* Buttons Group */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-3 mb-10"
          >
            <button 
              onClick={onSignUp}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#0B5FFF] text-white font-medium rounded-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
            >
              {h.hero.signUpFree} <ArrowRight size={16} />
            </button>
            <button 
              onClick={onLogin}
              className="w-full sm:w-auto px-7 py-3.5 bg-transparent border-1.5 border-[#CBD5E0] text-[#1E293B] font-medium rounded-lg hover:bg-slate-50 transition-all"
            >
              {h.hero.loginNow}
            </button>
          </motion.div>

          {/* Trust Points */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-x-6 gap-y-3"
          >
            {[
              { text: h.hero.free },
              { text: h.hero.instant },
              { text: h.hero.secure }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500">
                <Check size={14} className="text-[#16A34A]" />
                {item.text}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 2. STATS STRIP */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4">
          <div className="border-r border-slate-100 last:border-r-0">
             <StatItem end={counts.hospitals} label={h.stats.hospitals} />
          </div>
          <div className="border-r border-slate-100 last:border-r-0 max-sm:border-r-0">
             <StatItem end={counts.doctors} label={h.stats.doctors} />
          </div>
          <div className="border-r border-slate-100 last:border-r-0 lg:max-xl:border-r-0">
             <StatItem end={counts.cities} label={h.stats.cities} />
          </div>
          <div className="border-r border-slate-100 last:border-r-0">
             <StatItem end={counts.patients} label={h.stats.patients} />
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
