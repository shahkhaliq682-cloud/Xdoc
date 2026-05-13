import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  Activity, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  Users, 
  Calendar, 
  Plus, 
  Smartphone, 
  Heart,
  Brain,
  Stethoscope,
  Smile,
  Eye,
  Bone,
  Baby,
  Dna,
  Syringe,
  Microscope,
  BabyIcon,
  Ticket,
  Check,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  MessageCircle,
  Zap,
  DollarSign,
  Building,
  Star,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { 
  getFirestore, 
  collection, 
  getCountFromServer, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useLanguage } from '../contexts/LanguageContext';

// --- Stat Counter Component ---
const StatCounter = ({ end, label, icon: Icon, realCountPromise }: { end: number, label: string, icon: any, realCountPromise?: Promise<number> }) => {
  const [count, setCount] = useState(0);
  const [actualEnd, setActualEnd] = useState(end);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (realCountPromise) {
      realCountPromise.then(val => {
        if (val > 0) setActualEnd(val);
      }).catch(() => {});
    }
  }, [realCountPromise]);

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
    <div ref={ref} className="text-center p-6 bg-white rounded-[32px] border border-blue-50 shadow-sm hover:shadow-xl transition-all group">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
        <Icon size={32} />
      </div>
      <h4 className="text-4xl font-black text-slate-900 tracking-tighter mb-1">
        {count.toLocaleString()}+
      </h4>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
  );
};

// --- Step Card Component ---
const StepCard = ({ number, title, desc, icon: Icon, colorClass = "bg-primary" }: { number: number, title: string, desc: string, icon: any, colorClass?: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="relative flex flex-col items-center text-center p-8 bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 group"
  >
    <div className={`w-20 h-20 rounded-[28px] ${colorClass} text-white flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20 group-hover:rotate-6 transition-transform`}>
      <Icon size={36} />
    </div>
    <div className={`absolute top-8 right-8 w-10 h-10 rounded-full ${colorClass} text-white flex items-center justify-center text-sm font-black border-4 border-white shadow-lg`}>
      {number}
    </div>
    <h4 className="text-xl font-black text-slate-900 mb-3 tracking-tight">{title}</h4>
    <p className="text-sm text-slate-500 font-bold leading-relaxed">{desc}</p>
  </motion.div>
);

// --- Feature Card ---
const FeatureCard = ({ title, desc, icon: Icon, colorClass }: { title: string, desc: string, icon: any, colorClass: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-8 bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer group"
  >
    <div className={`w-14 h-14 rounded-2xl ${colorClass} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
      <Icon size={28} />
    </div>
    <h3 className="text-lg font-black text-slate-900 mb-3 tracking-tight">{title}</h3>
    <p className="text-xs text-slate-500 font-bold leading-relaxed">{desc}</p>
  </motion.div>
);

const HomeRedesign = ({ onSignUp, onLogin, onSearch }: { onSignUp: () => void, onLogin: () => void, onSearch: (q: string) => void }) => {
  const { t, language } = useLanguage();
  const [journeyTab, setJourneyTab] = useState<'patient' | 'hospital'>('patient');
  const [searchVal, setSearchVal] = useState('');

  const specializations = [
    { name: 'Cardiology', icon: Heart, key: 'Cardiology' },
    { name: 'Neurology', icon: Brain, key: 'Neurology' },
    { name: 'Orthopedic', icon: Bone, key: 'Orthopedic' },
    { name: 'Gynecology', icon: Smile, key: 'Gynecology' },
    { name: 'Pediatrics', icon: Baby, key: 'Pediatrics' },
    { name: 'Dentistry', icon: Smile, key: 'Dentistry' },
    { name: 'General Physician', icon: Stethoscope, key: 'General' },
    { name: 'Dermatology', icon: Syringe, key: 'Dermatology' },
    { name: 'Ophthalmology', icon: Eye, key: 'Ophthalmology' },
    { name: 'ENT', icon: Stethoscope, key: 'ENT' },
    { name: 'Psychiatry', icon: Brain, key: 'Psychiatry' },
    { name: 'Pulmonology', icon: Activity, key: 'Pulmonology' },
    { name: 'Urology', icon: Activity, key: 'Urology' },
    { name: 'Gastroenterology', icon: Activity, key: 'Gastro' },
    { name: 'Oncology', icon: Microscope, key: 'Oncology' },
    { name: 'Radiology', icon: Microscope, key: 'Radiology' },
    { name: 'Nephrology', icon: Activity, key: 'Nephrology' },
    { name: 'Endocrinology', icon: Activity, key: 'Endocrinology' },
    { name: 'Rheumatology', icon: Activity, key: 'Rheumatology' },
    { name: 'Hematology', icon: Activity, key: 'Hematology' },
    { name: 'Plastic Surgery', icon: Activity, key: 'Plastic' },
    { name: 'Physiotherapy', icon: Activity, key: 'Physiotherapy' }
  ];

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
    <div className="bg-white">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col justify-center pt-20 overflow-hidden">
        {/* Sky Gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#EBF4FF] via-white to-white pointer-events-none" />
        
        {/* Floating Background Props */}
        <div className="absolute top-[20%] left-[5%] w-64 h-64 bg-blue-100 rounded-full blur-[100px] opacity-40 animate-pulse" />
        <div className="absolute bottom-[20%] right-[5%] w-96 h-96 bg-teal-50 rounded-full blur-[120px] opacity-40" />

        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 w-full py-20">
          
          {/* Left Column (60%) */}
          <div className={`lg:col-span-7 ${language === 'UR' ? 'text-right' : 'text-left'}`}>
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-primary/20 rounded-full mb-8 shadow-sm"
            >
              <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">{h.hero.badge}</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-2 mb-8"
            >
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[1.1]">
                {h.hero.title1} <br />
                {h.hero.title2} <br />
                <span className="text-health-teal">{h.hero.title3}</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-slate-500 font-bold max-w-xl mb-12 leading-relaxed"
            >
              {h.hero.subtitle}
            </motion.p>

            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative max-w-2xl mb-8 group"
            >
              <div className="flex items-center bg-white p-2 rounded-[24px] shadow-2xl shadow-blue-500/10 border-2 border-slate-100 group-focus-within:border-primary transition-all">
                <Search className="ml-6 text-slate-400" size={24} />
                <input 
                  type="text" 
                  placeholder={h.hero.searchPlaceholder}
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onSearch(searchVal)}
                  className="w-full px-4 py-4 bg-transparent border-none focus:ring-0 font-bold text-lg text-slate-900"
                />
                <button 
                  onClick={() => onSearch(searchVal)}
                  className="hidden md:block px-10 py-4 bg-health-teal text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
                >
                  {h.hero.searchBtn}
                </button>
              </div>
            </motion.div>

            {/* Specialty Pills */}
            <div className="flex flex-wrap gap-3 mb-12">
              {[
                { name: h.hero.cardiology, icon: Heart },
                { name: h.hero.neurology, icon: Brain },
                { name: h.hero.dental, icon: Smile },
                { name: h.hero.pediatrics, icon: Baby },
                { name: h.hero.eye, icon: Eye },
                { name: h.hero.orthopedic, icon: Bone }
              ].map((s, i) => (
                <button 
                  key={i} 
                  onClick={() => onSearch(s.name)}
                  className="px-5 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-black text-slate-500 hover:border-primary hover:text-primary transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
                >
                  <s.icon size={14} />
                  {s.name}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-5 mb-16">
              <button 
                onClick={onSignUp}
                className="px-10 py-5 bg-health-teal text-white font-black rounded-2xl shadow-xl shadow-health-teal/20 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-[0.1em] flex items-center justify-center gap-3"
              >
                {h.hero.signUpFree}
              </button>
              <button 
                onClick={onLogin}
                className="px-10 py-5 bg-white border-2 border-slate-100 text-slate-900 font-black rounded-2xl hover:border-primary hover:text-primary transition-all text-sm uppercase tracking-[0.1em]"
              >
                {h.hero.loginNow}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              {[
                { text: h.hero.verified, icon: ShieldCheck },
                { text: h.hero.free, icon: CheckCircle2 },
                { text: h.hero.instant, icon: Clock },
                { text: h.hero.secure, icon: ShieldCheck }
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <t.icon size={14} className="text-emerald-500" />
                  {t.text}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (40%) - Illustration */}
          <div className="hidden lg:block lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative z-10"
            >
              {/* Main SVG/Image Placeholder */}
              <div className="w-full aspect-square bg-white rounded-[80px] shadow-2xl overflow-hidden border border-slate-100 p-12">
                 <img 
                    src="https://images.unsplash.com/photo-1576091160550-217359f4ecf8?auto=format&fit=crop&q=80&w=800" 
                    className="w-full h-full object-cover rounded-[48px]"
                    alt="Doctor"
                 />
              </div>

              {/* Floating Cards */}
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 bg-white p-6 rounded-3xl shadow-2xl border border-slate-50 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-health-teal text-white flex items-center justify-center">
                  <Ticket size={24} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 leading-none mb-1">🎫 Token Confirmed!</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ghar baithe booking</p>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 15, 0] }}
                transition={{ repeat: Infinity, duration: 5, delay: 0.5, ease: "easeInOut" }}
                className="absolute top-1/2 -left-16 bg-white p-6 rounded-3xl shadow-2xl border border-slate-50 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-white flex items-center justify-center">
                  <Star size={24} fill="currentColor" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 leading-none mb-1">⭐ 4.9 Rating</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pakistan's Top Doctors</p>
                </div>
              </motion.div>

              <motion.div 
                animate={{ x: [0, 15, 0] }}
                transition={{ repeat: Infinity, duration: 6, delay: 1, ease: "easeInOut" }}
                className="absolute -bottom-10 right-10 bg-white p-6 rounded-3xl shadow-2xl border border-slate-50 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center">
                  <Stethoscope size={24} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 leading-none mb-1">👨⚕️ Dr. Available</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Consult Now</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="bg-[#F0F7FF] py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
          <StatCounter end={500} label={h.stats.hospitals} icon={Building2} realCountPromise={getRealCount('users', where('role', '==', 'hospital_admin'))} />
          <StatCounter end={2000} label={h.stats.doctors} icon={Stethoscope} realCountPromise={getRealCount('doctors')} />
          <StatCounter end={50} label={h.stats.cities} icon={MapPin} />
          <StatCounter end={15000} label={h.stats.patients} icon={Users} realCountPromise={getRealCount('users', where('role', '==', 'patient'))} />
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section id="features" className="bg-white py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <span className="px-5 py-2 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-6 inline-block">CORE FEATURES</span>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6">{h.features.title}</h2>
            <p className="text-xl text-slate-500 font-bold max-w-2xl mx-auto">{h.features.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            <FeatureCard icon={Calendar} title={h.features.card1.title} desc={h.features.card1.desc} colorClass="bg-blue-500" />
            <FeatureCard icon={Zap} title={h.features.card2.title} desc={h.features.card2.desc} colorClass="bg-teal-500" />
            <FeatureCard icon={DollarSign} title={h.features.card3.title} desc={h.features.card3.desc} colorClass="bg-orange-500" />
            <FeatureCard icon={Building} title={h.features.card4.title} desc={h.features.card4.desc} colorClass="bg-purple-500" />
            <FeatureCard icon={MessageCircle} title={h.features.card5.title} desc={h.features.card5.desc} colorClass="bg-emerald-500" />
            <FeatureCard icon={Clock} title={h.features.card6.title} desc={h.features.card6.desc} colorClass="bg-red-500" />
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section className="bg-[#F8FAFF] py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-6">{h.howItWorks.title}</h2>
          <p className="text-lg text-slate-500 font-bold">{h.howItWorks.subtitle}</p>

          <div className="flex justify-center gap-4 mt-12 bg-white/50 p-2 rounded-[28px] border border-slate-100 max-w-sm mx-auto">
             <button 
                onClick={() => setJourneyTab('patient')}
                className={`flex-1 py-4 px-8 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${journeyTab === 'patient' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-slate-400 hover:text-primary'}`}
             >
               {h.howItWorks.patient}
             </button>
             <button 
                onClick={() => setJourneyTab('hospital')}
                className={`flex-1 py-4 px-8 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${journeyTab === 'hospital' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-slate-400 hover:text-primary'}`}
             >
               {h.howItWorks.hospital}
             </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {journeyTab === 'patient' ? (
              <motion.div 
                key="patient-steps"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              >
                <StepCard number={1} icon={Search} title={h.howItWorks.patientSteps.step1.title} desc={h.howItWorks.patientSteps.step1.desc} />
                <StepCard number={2} icon={Stethoscope} title={h.howItWorks.patientSteps.step2.title} desc={h.howItWorks.patientSteps.step2.desc} />
                <StepCard number={3} icon={Ticket} title={h.howItWorks.patientSteps.step3.title} desc={h.howItWorks.patientSteps.step3.desc} />
                <StepCard number={4} icon={Building2} title={h.howItWorks.patientSteps.step4.title} desc={h.howItWorks.patientSteps.step4.desc} />
              </motion.div>
            ) : (
              <motion.div 
                key="hospital-steps"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              >
                <StepCard number={1} icon={Building2} title={h.howItWorks.hospitalSteps.step1.title} desc={h.howItWorks.hospitalSteps.step1.desc} colorClass="bg-health-teal" />
                <StepCard number={2} icon={Users} title={h.howItWorks.hospitalSteps.step2.title} desc={h.howItWorks.hospitalSteps.step2.desc} colorClass="bg-health-teal" />
                <StepCard number={3} icon={Smartphone} title={h.howItWorks.hospitalSteps.step3.title} desc={h.howItWorks.hospitalSteps.step3.desc} colorClass="bg-health-teal" />
                <StepCard number={4} icon={LayoutDashboard} title={h.howItWorks.hospitalSteps.step4.title} desc={h.howItWorks.hospitalSteps.step4.desc} colorClass="bg-health-teal" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 5. HOSPITAL TYPES SECTION */}
      <section className="bg-white py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-6">{h.hospitalTypes.title}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { type: h.hospitalTypes.govt, color: "border-emerald-500", icon: Building },
              { type: h.hospitalTypes.private, color: "border-primary", icon: Building2 },
              { type: h.hospitalTypes.clinic, color: "border-purple-500", icon: MapPin },
              { type: h.hospitalTypes.govtClinic, color: "border-teal-500", icon: Activity }
            ].map((t, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className={`bg-white rounded-[40px] border-t-4 ${t.color} border-l border-r border-b border-slate-100 p-10 shadow-xl shadow-slate-200/50 flex flex-col h-full items-center text-center`}
              >
                <div className="bg-slate-50 p-6 rounded-3xl mb-8 group-hover:scale-110 transition-transform">
                  <t.icon size={48} className="text-slate-400" />
                </div>
                <div className="px-4 py-1.5 bg-success-green/10 text-success-green text-[10px] font-black uppercase tracking-widest rounded-lg mb-6">
                   {t.type.badge}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight leading-tight">{t.type.title}</h3>
                <p className="text-sm text-slate-500 font-bold leading-relaxed mb-10 flex-1">{t.type.desc}</p>
                <button 
                  onClick={() => onSearch(t.type.title)}
                  className="w-full py-5 border-2 border-slate-100 rounded-2xl font-black text-sm uppercase tracking-widest text-[#0B5FFF] hover:bg-[#0B5FFF] hover:text-white transition-all shadow-sm flex items-center justify-center gap-3"
                >
                  {h.hospitalTypes.findNow}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SPECIALIZATIONS */}
      <section className="bg-[#F0F7FF] py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-6">{h.specializations.title}</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
            {specializations.map((s, i) => (
              <motion.button 
                key={i}
                whileHover={{ scale: 1.05 }}
                onClick={() => onSearch(s.name)}
                className="flex items-center gap-3 p-5 bg-white border border-blue-50 rounded-2xl text-slate-700 font-black text-sm hover:bg-health-teal hover:text-white hover:border-health-teal transition-all shadow-sm"
              >
                <s.icon size={20} className="opacity-70" />
                <span className="flex-1 text-left line-clamp-1">{s.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* 7. JOIN CTA */}
      <section className="py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-[#0B5FFF] to-[#0D4FD0] rounded-[60px] p-8 md:p-20 relative overflow-hidden flex flex-col lg:flex-row items-center gap-20 shadow-[0_40px_100px_-20px_rgba(11,95,255,0.4)]">
             {/* bg pattern */}
             <div className="absolute inset-0 opacity-10 pointer-events-none">
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-[100px]" />
             </div>

             <div className="flex-1 relative z-10 text-center lg:text-left">
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8 leading-[1.1]">{h.cta.title}</h2>
                <p className="text-xl text-white/80 font-bold mb-12 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  {h.cta.subtitle}
                </p>

                <div className="space-y-6 mb-16">
                   {[h.cta.benefit1, h.cta.benefit2, h.cta.benefit3, h.cta.benefit4, h.cta.benefit5].map((b, i) => (
                     <div key={i} className="flex items-center gap-4 text-white font-bold text-lg justify-center lg:justify-start">
                       <CheckCircle2 size={24} className="text-health-teal" fill="white" />
                       {b}
                     </div>
                   ))}
                </div>

                <button 
                  onClick={onSignUp}
                  className="px-12 py-6 bg-white text-primary font-black rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all text-lg uppercase tracking-widest"
                >
                  {h.cta.registerBtn}
                </button>
             </div>

             <div className="w-full lg:w-[400px] relative z-10">
                <div className="space-y-6">
                   <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[40px] border border-white/20 text-center scale-105">
                      <p className="text-4xl font-black text-white mb-2 tracking-tighter">500+</p>
                      <p className="text-xs font-black text-white/60 uppercase tracking-widest">{h.cta.alreadyOn}</p>
                   </div>
                   <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[40px] border border-white/20 text-center">
                      <p className="text-4xl font-black text-white mb-2 tracking-tighter">⭐ 4.8</p>
                      <p className="text-xs font-black text-white/60 uppercase tracking-widest">{h.cta.rating}</p>
                   </div>
                   <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[40px] border border-white/20 text-center">
                      <p className="text-4xl font-black text-white mb-2 tracking-tighter">10,000+</p>
                      <p className="text-xs font-black text-white/60 uppercase tracking-widest">{h.cta.monthlyTokens}</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-[#0B1D35] py-24 px-6 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20 relative z-10">
           <div>
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-[#0B5FFF] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                   <Activity size={28} />
                 </div>
                 <span className="text-3xl font-black tracking-tighter">Xdoc</span>
              </div>
              <p className="text-slate-400 font-bold mb-10 leading-relaxed">
                {h.footer.desc}
              </p>
              <div className="flex gap-4">
                 {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                   <a key={i} href="#" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-health-teal hover:bg-health-teal hover:text-white transition-all">
                     <Icon size={24} />
                   </a>
                 ))}
              </div>
           </div>

           <div>
              <h4 className="text-lg font-black mb-10 tracking-tight">{h.footer.quickLinks}</h4>
              <ul className="space-y-4 text-slate-400 font-bold">
                 <li><a href="#" className="hover:text-white transition-colors">Find Hospitals</a></li>
                 <li><a href="#" className="hover:text-white transition-colors">Find Doctors</a></li>
                 <li><a href="#" className="hover:text-white transition-colors">Book Token</a></li>
                 <li><a href="#" className="hover:text-white transition-colors">Emergency Services</a></li>
                 <li><a href="#" className="hover:text-white transition-colors">Join as Provider</a></li>
              </ul>
           </div>

           <div>
              <h4 className="text-lg font-black mb-10 tracking-tight">{h.footer.hospitalTypes}</h4>
              <ul className="space-y-4 text-slate-400 font-bold">
                 <li><a href="#" className="hover:text-white transition-colors">Government Hospitals</a></li>
                 <li><a href="#" className="hover:text-white transition-colors">Private Hospitals</a></li>
                 <li><a href="#" className="hover:text-white transition-colors">Private Clinics</a></li>
                 <li><a href="#" className="hover:text-white transition-colors">Govt Clinics</a></li>
                 <li><a href="#" className="hover:text-white transition-colors">All Specializations</a></li>
              </ul>
           </div>

           <div>
              <h4 className="text-lg font-black mb-10 tracking-tight">{h.footer.company}</h4>
              <ul className="space-y-4 text-slate-400 font-bold">
                 <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                 <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                 <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                 <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
                 <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              </ul>
           </div>
        </div>

        <div className="max-w-7xl mx-auto pt-10 border-t border-white/5 text-center">
           <p className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">
             {h.footer.copyright}
           </p>
        </div>
      </footer>
    </div>
  );
};

export default HomeRedesign;
