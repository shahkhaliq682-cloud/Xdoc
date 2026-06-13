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

// --- Step Number with Count-Up Animation on Scroll ---
const StepNumber = ({ num }: { num: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 1000;
      const increment = num / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= num) {
          setCount(num);
          clearInterval(timer);
        } else {
          setCount(Math.ceil(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, num]);

  return (
    <div ref={ref} className="w-12 h-12 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-lg font-bold mb-4 shadow-md transition-all">
      {count}
    </div>
  );
};

// --- HomeRedesign Component ---
const HomeRedesign = ({ 
  onSignUp, 
  onLogin, 
  onSearch, 
  onHospitalClick, 
  onNavigate 
}: { 
  onSignUp: () => void, 
  onLogin: () => void, 
  onSearch: (q: string) => void, 
  onHospitalClick?: (h: any) => void, 
  onNavigate?: (view: 'privacy' | 'terms' | 'contact' | 'about' | 'content_policy' | 'pricing', path: string) => void 
}) => {
  const { t, language } = useLanguage();
  const [searchVal, setSearchVal] = useState('');

  const h = t.homeRedesign;

  return (
    <div className="bg-[#F8FAFF] min-h-screen text-[#0F172A] font-sans antialiased overflow-x-hidden">
      
      {/* 3. HERO SECTION */}
      <section className="relative min-h-screen flex flex-col justify-center items-center py-20 px-4 md:px-6 overflow-hidden bg-[#F8FAFF]">
        {/* Subtle blue radial gradient in top-right corner */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#0EA5E9]/10 to-[#2563EB]/5 rounded-full filter blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10 w-full">
          
          {/* Top Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full mb-8"
          >
            <span className="text-[13px] font-semibold text-[#2563EB] tracking-wide">
              🏥 {language === 'UR' ? "پاکستان کا نمبر 1 ڈیجیٹل ہیلتھ کیئر پلیٹ فارم" : "Pakistan's #1 Digital Healthcare Platform"}
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full max-w-[900px] mx-auto mb-6 text-center"
          >
            <style dangerouslySetInnerHTML={{ __html: `
              .precise-hero-heading {
                font-size: 36px !important;
                font-weight: 800 !important;
                line-height: 1.1 !important;
                letter-spacing: -0.02em !important;
                text-align: center !important;
                max-width: 900px !important;
                margin: 0 auto !important;
              }
              @media (min-width: 641px) {
                .precise-hero-heading {
                  font-size: 64px !important;
                }
              }
            `}} />
            <h1 className="precise-hero-heading text-[#0F172A] mb-4">
              {language === 'UR' ? (
                <>
                  اپنے ہیلتھ کیئر کا انتظام کریں
                  <br />
                  <span className="text-[#2563EB]">ڈیجیٹل طور پر</span>
                </>
              ) : (
                <>
                  Manage Your Healthcare
                  <br />
                  <span className="text-[#2563EB]">Digitally</span>
                </>
              )}
            </h1>
            
            {/* Subtext */}
            <p className="text-[18px] text-[#64748B] font-normal leading-relaxed max-w-[500px] mx-auto mt-4">
              {language === 'UR' 
                ? 'تصدیق شدہ ڈاکٹروں کو تلاش کریں، فوری طور پر ٹوکن بک کریں، اور اپنی صحت کی دیکھ بھال کا ڈیجیٹل انتظام کریں۔'
                : 'Find verified doctors, book tokens instantly, and manage your healthcare digitally.'
              }
            </p>
          </motion.div>

          {/* Animated badge below subtext */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] rounded-full text-[13px] font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
              </span>
              <span>{language === 'UR' ? 'آن لائن اپائنٹمنٹس: سٹینڈرڈ اور پریمیم پر دستیاب ہیں' : 'Online Appointments: Available on Standard & Premium'}</span>
            </div>
          </motion.div>

          {/* Optimized SaaS Search Container */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.20 }}
            className="w-full max-w-2xl bg-white p-4 rounded-3xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all mb-8 text-left"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-8 flex items-center px-4 bg-slate-50 border border-[#E2E8F0] hover:border-slate-300 h-14 rounded-2xl focus-within:bg-white focus-within:border-[#2563EB]/40 transition-all">
                <Search className="text-[#2563EB] mr-2.5 shrink-0" size={18} strokeWidth={2.5} />
                <input 
                  type="text" 
                  placeholder={h?.hero?.searchPlaceholder || "Doctor, Hospital or City..."}
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onSearch(searchVal)}
                  className="flex-1 bg-transparent border-none p-0 focus:ring-0 text-sm text-[#0F172A] placeholder-slate-400 font-medium"
                />
              </div>
              
              <div className="md:col-span-4 h-14 flex items-center shrink-0">
                <button 
                  onClick={() => onSearch(searchVal)}
                  className="w-full h-full bg-[#2563EB] hover:bg-[#1E40AF] text-white font-semibold text-sm rounded-2xl transition-all shadow-md active:scale-[0.98] duration-200"
                >
                  {h?.hero?.searchBtn || "Search"}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Quick Access Categories */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="w-full max-w-2xl mb-10 text-left px-4"
          >
            <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest mb-3.5 text-center md:text-left">
              {language === 'UR' ? 'فوری رسائی' : 'Quick Access Categories'}
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none justify-center md:justify-start scroll-smooth">
              {[
                { 
                  name: language === 'UR' ? 'عام معالج' : 'General Physician', 
                  query: 'General Physician', 
                  icon: Stethoscope,
                  color: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB] hover:bg-[#EFF6FF]' 
                },
                { 
                  name: language === 'UR' ? 'ماہر امراض' : 'Specialist', 
                  query: 'Specialist', 
                  icon: Activity,
                  color: 'bg-[#F0F9FF] border-[#BAE6FD] text-[#0284C7] hover:bg-[#F0F9FF]' 
                },
                { 
                  name: language === 'UR' ? 'دندان ساز' : 'Dentist', 
                  query: 'Dentist', 
                  icon: Check, 
                  color: 'bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A] hover:bg-[#F0FDF4]' 
                },
                { 
                  name: language === 'UR' ? 'ایمرجنسی' : 'Emergency', 
                  query: 'Emergency', 
                  icon: ShieldCheck,
                  color: 'bg-[#FFF7ED] border-[#FED7AA] text-[#EA580C] hover:bg-[#FFF7ED]' 
                }
              ].map((cat, i) => {
                const IconComp = cat.icon;
                return (
                  <motion.button 
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    key={i} 
                    onClick={() => onSearch(cat.query)}
                    className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl border ${cat.color} font-semibold text-xs uppercase tracking-wider shadow-sm transition-all whitespace-nowrap shrink-0`}
                  >
                    <IconComp size={16} strokeWidth={2.5} />
                    <span>{cat.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* CTA buttons row */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 mb-8"
          >
            <button 
              onClick={onSignUp}
              className="w-full sm:w-auto px-8 py-3 bg-[#2563EB] hover:bg-[#1E40AF] text-white font-semibold rounded-full hover:shadow-lg transition-all active:scale-[0.98] duration-200"
            >
              {language === 'UR' ? 'مفت ٹرائل شروع کریں' : 'Start Free Trial'}
            </button>
            <button 
              onClick={() => onNavigate?.('pricing', '/pricing')}
              className="w-full sm:w-auto px-8 py-3 bg-transparent border-2 border-[#2563EB] hover:bg-[#2563EB]/5 text-[#2563EB] font-semibold rounded-full transition-all active:scale-[0.98] duration-200"
            >
              {language === 'UR' ? 'قیمتیں دیکھیں' : 'View Pricing'}
            </button>
          </motion.div>

          {/* Trust badges below buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 text-[#64748B] text-[14px] font-normal mb-16"
          >
            <span>✓ {language === 'UR' ? '7 دن کا مفت ٹرائل' : '7-day free trial'}</span>
            <span>✓ {language === 'UR' ? 'کسی کارڈ کی ضرورت نہیں' : 'No credit card required'}</span>
            <span>✓ {language === 'UR' ? '5 منٹ میں سیٹ اپ' : 'Setup in 5 minutes'}</span>
          </motion.div>

          {/* 3 Floating Preview Cards */}
          <motion.div
             initial={{ opacity: 0, y: 40 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.4, duration: 0.8 }}
             className="relative w-full max-w-5xl mt-8 mx-auto"
          >
            <div className="absolute -inset-10 bg-gradient-to-tr from-[#2563EB]/10 via-transparent to-[#0EA5E9]/10 blur-[100px] opacity-40 pointer-events-none" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 p-4 max-w-4xl mx-auto">
               
               {/* UI Card 1: Token */}
               <motion.div 
                 whileHover={{ y: -6, rotate: -3 }}
                 className="bg-white p-8 rounded-2xl border border-[#E2E8F0] shadow-xl transform -rotate-2 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between text-left"
               >
                  <div className="flex justify-between items-center mb-6">
                    <div className="w-10 h-10 bg-[#2563EB]/10 text-[#2563EB] rounded-xl flex items-center justify-center">
                      <Zap size={20} className="fill-current" />
                    </div>
                    <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest bg-[#10B981]/10 px-3 py-1 rounded-full">LIVE</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-1">
                      {language === 'UR' ? 'آپ کا ٹوکن' : 'Your Token'}
                    </p>
                    <h4 className="text-5xl font-extrabold text-[#0F172A] mb-2 tracking-tighter">T-0047</h4>
                    <p className="text-sm font-semibold text-[#64748B]">
                      {language === 'UR' ? 'باقی وقت: ~10 منٹ' : 'Wait: ~10 mins'}
                    </p>
                  </div>
               </motion.div>

               {/* UI Card 2: Hospital Info */}
               <motion.div 
                 whileHover={{ y: -6, scale: 1.07 }}
                 className="bg-white p-8 rounded-2xl border border-[#E2E8F0] shadow-xl z-20 md:scale-105 hover:shadow-2xl transition-all duration-300 text-left"
               >
                  <div className="flex gap-4 mb-6">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl overflow-hidden shrink-0">
                       <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80" className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="Hospital logo" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0F172A] leading-tight text-base">{language === 'UR' ? 'آغا خان ہسپتال' : 'Aga Khan Hospital'}</h4>
                      <p className="text-xs text-[#64748B] font-medium">{language === 'UR' ? 'کراچی، پاکستان' : 'Karachi, Pakistan'}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                     <div className="h-2 w-full bg-[#EFF6FF] rounded-full" />
                     <div className="h-2 w-2/3 bg-slate-100 rounded-full" />
                  </div>
                  <button 
                    onClick={onLogin}
                    className="w-full mt-8 py-3 bg-[#2563EB] hover:bg-[#1E40AF] text-white font-semibold rounded-full text-xs shadow-md tracking-wider uppercase transition-colors"
                  >
                    {language === 'UR' ? 'ٹوکن بک کریں' : 'BOOK TOKEN'}
                  </button>
               </motion.div>

               {/* UI Card 3: Doctor Availability */}
               <motion.div 
                 whileHover={{ y: -6, rotate: 3 }}
                 className="bg-white p-8 rounded-2xl border border-[#E2E8F0] shadow-xl transform rotate-2 hover:shadow-2xl transition-all duration-300 text-left"
               >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full border-2 border-[#10B981] p-0.5 shrink-0">
                       <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" alt="Doctor profile" />
                    </div>
                    <span className="text-sm font-bold text-[#0F172A]">{language === 'UR' ? 'ڈاکٹر سارہ خان' : 'Dr. Sarah Khan'}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">{language === 'UR' ? 'دستیاب ہے' : 'Available'}</p>
                      <p className="text-xs font-bold text-[#10B981]">{language === 'UR' ? 'آج، 4:00 بجے' : 'Today, 4:00 PM'}</p>
                    </div>
                    <div className="text-lg font-black text-[#2563EB]">Rs. 1,500</div>
                  </div>
               </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. TRUST BAR */}
      <section className="bg-[#0F172A] py-12 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:divide-x md:divide-slate-800">
            
            <div className="flex items-center gap-4 justify-center lg:justify-start lg:pl-0">
              <span className="text-2xl shrink-0">🛡️</span>
              <div>
                <p className="text-sm font-bold tracking-tight text-white uppercase">{language === 'UR' ? 'تصدیق شدہ ہسپتال' : 'VERIFIED HOSPITALS'}</p>
                <p className="text-xs text-[#94A3B8] font-normal mt-0.5">{language === 'UR' ? 'پاکستان بھر سے تصدیق شدہ' : 'Verified across Pakistan'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 justify-center lg:justify-start lg:pl-8">
              <span className="text-2xl shrink-0">🩺</span>
              <div>
                <p className="text-sm font-bold tracking-tight text-white uppercase">{language === 'UR' ? 'اصلی ڈاکٹرز' : 'REAL DOCTORS'}</p>
                <p className="text-xs text-[#94A3B8] font-normal mt-0.5">{language === 'UR' ? 'پی ایم ڈی سی رجسٹرڈ' : 'PMDC registered doctors'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center lg:justify-start lg:pl-8">
              <span className="text-2xl shrink-0">⚡</span>
              <div>
                <p className="text-sm font-bold tracking-tight text-white uppercase">{language === 'UR' ? 'محفوظ بکنگ' : 'SECURE BOOKING'}</p>
                <p className="text-xs text-[#94A3B8] font-normal mt-0.5">{language === 'UR' ? 'صرف ایک کلک میں' : 'Instant and safe appointment'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center lg:justify-start lg:pl-8">
              <span className="text-2xl shrink-0">🏥</span>
              <div>
                <p className="text-sm font-bold tracking-tight text-white uppercase">{language === 'UR' ? 'پاکستان بھر میں رسائی' : 'PAKISTAN WIDE ACCESS'}</p>
                <p className="text-xs text-[#94A3B8] font-normal mt-0.5">{language === 'UR' ? 'ہر شہر، ہر ہسپتال' : 'Connecting healthcare networks'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. "WHY XDOC?" SECTION */}
      <section id="features" className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-16">
            <span className="text-[#2563EB] tracking-widest text-[12px] font-bold uppercase block mb-3">
              {language === 'UR' ? 'کیوں ایکس ڈوک؟' : 'WHY XDOC?'}
            </span>
            <h2 className="text-[32px] md:text-[36px] font-bold text-[#0F172A] mb-4 tracking-tight -tracking-[0.02em]">
              {language === 'UR' ? 'سب کچھ ایک جگہ' : 'Everything in one place'}
            </h2>
            <p className="text-base text-[#64748B] font-normal max-w-lg mx-auto leading-relaxed">
              {h?.features?.subtitle || "Our marketplace simplifies healthcare management for patients and clinics alike."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: h?.features?.card1?.title || 'Online Token Booking', desc: h?.features?.card1?.desc, icon: Calendar, color: "bg-blue-50 text-[#2563EB]" },
              { title: h?.features?.card2?.title || 'Real-time Availability', desc: h?.features?.card2?.desc, icon: Zap, color: "bg-amber-50 text-amber-500" },
              { title: h?.features?.card3?.title || 'Transparent Fees', desc: h?.features?.card3?.desc, icon: DollarSign, color: "bg-green-50 text-[#10B981]" },
              { title: h?.features?.card4?.title || 'Govt & Private Both', desc: h?.features?.card4?.desc, icon: Building, color: "bg-purple-50 text-purple-600" },
              { title: h?.features?.card5?.title || 'WhatsApp Alerts', desc: h?.features?.card5?.desc, icon: Activity, color: "bg-rose-50 text-rose-500" },
              { title: h?.features?.card6?.title || 'Save Time', desc: h?.features?.card6?.desc, icon: Clock, color: "bg-indigo-50 text-indigo-600" },
            ].map((card, i) => {
              const IconComp = card.icon;
              return (
                <motion.div 
                  key={i}
                  whileHover={{ y: -4, borderColor: '#BFDBFE', boxShadow: '0 10px 25px -5px rgba(37,99,235,0.08)' }}
                  className="p-8 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-lg transition-all duration-300 text-left group"
                >
                  <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center mb-6`}>
                    <IconComp size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#0F172A] mb-3 leading-tight">{card.title}</h3>
                  <p className="text-sm text-[#64748B] leading-relaxed font-normal">{card.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. "4 EASY STEPS" SECTION */}
      <section id="how-it-works" className="bg-[#F8FAFF] py-20 px-6 border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-[32px] md:text-[36px] font-bold text-[#0F172A] mb-4 -tracking-[0.02em]">
              {h?.howItWorks?.title || "4 Easy Steps"}
            </h2>
            <p className="text-base text-[#64748B] font-normal leading-relaxed max-w-md mx-auto">
              {h?.howItWorks?.subtitle || "Experience simplified digital healthcare with our intuitive step-by-step process."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 relative">
            {[
              { number: 1, title: h?.howItWorks?.step1?.title || "Search", desc: h?.howItWorks?.step1?.desc },
              { number: 2, title: h?.howItWorks?.step2?.title || "Choose", desc: h?.howItWorks?.step2?.desc },
              { number: 3, title: h?.howItWorks?.step3?.title || "Book", desc: h?.howItWorks?.step3?.desc },
              { number: 4, title: h?.howItWorks?.step4?.title || "Visit", desc: h?.howItWorks?.step4?.desc },
            ].map((step, idx) => {
              const isLast = idx === 3;
              return (
                <div key={idx} className="flex flex-col items-center text-center relative w-full">
                  {!isLast && (
                    <div className="hidden lg:block absolute top-[24px] left-[calc(50%+40px)] w-[calc(100%-80px)] h-px border-t-2 border-dotted border-[#E2E8F0] z-0 pointer-events-none" />
                  )}
                  <div className="relative z-10 flex flex-col items-center">
                    <StepNumber num={step.number} />
                    <h4 className="text-lg font-semibold text-[#0F172A] mb-2">{step.title}</h4>
                    <p className="text-sm text-[#64748B] max-w-[200px] leading-relaxed font-normal">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. CTA BANNER */}
      <section className="py-20 px-6 bg-gradient-to-r from-[#1E40AF] to-[#2563EB] text-white text-center relative overflow-hidden">
        {/* Ambient subtle glow lights */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full filter blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-black/10 rounded-full filter blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-[32px] md:text-[40px] font-bold mb-4 tracking-tight leading-[1.2] -tracking-[0.02em]">
            {language === 'UR' ? "کیا آپ ڈیجیٹل ہونے کے لیے تیار ہیں؟" : "Ready to switch to digital?"}
          </h2>
          <p className="text-[18px] text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed font-normal">
            {h?.cta?.subtitle || "Join Pakistan's fastest growing healthcare marketplace and manage your clinic or booking instantly."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onSignUp}
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-[#2563EB] hover:text-[#1E40AF] hover:shadow-lg font-semibold rounded-full transition-all active:scale-[0.98] duration-200"
            >
              {language === 'UR' ? 'ابھی رجسٹر کریں →' : 'Register Now →'}
            </button>
            <button 
              onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-3.5 bg-transparent border-2 border-white/60 hover:border-white text-white hover:bg-white/10 font-semibold rounded-full transition-all active:scale-[0.98] duration-200"
            >
              {language === 'UR' ? 'یہ کیسے کام کرتا ہے؟' : 'See How It Works'}
            </button>
          </div>
        </div>
      </section>

      {/* 8. FOOTER REDESIGN */}
      <footer className="bg-[#0F172A] pt-20 pb-12 px-6 text-white border-t border-slate-800 font-sans">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
             
             {/* Column 1: Logo & Social */}
             <div>
                <div className="flex items-center gap-2.5 mb-6 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                   <Stethoscope className="text-[#2563EB] transition-transform group-hover:scale-110" size={28} />
                   <span className="text-2xl font-bold tracking-tight text-white mb-0.5">Xdoc</span>
                </div>
                <p className="text-[#94A3B8] text-sm leading-relaxed mb-6 max-w-xs">
                  {h?.footer?.desc || "Pakistan's premium digital healthcare marketplace, connecting patients with verified hospitals and clinics."}
                </p>
                <div className="flex gap-3">
                   {[
                      { Icon: Linkedin, url: "https://www.linkedin.com/in/x-doc-a37ba9414", label: "Xdoc LinkedIn", color: "#0A66C2" },
                      { Icon: Youtube, url: "https://youtube.com/@xdoc.official", label: "Xdoc YouTube", color: "#FF0000" },
                      { Icon: Instagram, url: "https://www.instagram.com/xdoc.official", label: "Xdoc Instagram", gradient: true },
                      { Icon: Facebook, url: "https://www.facebook.com/share/1JfJzXwzKS/", label: "Facebook", color: "#1877F2" }
                    ].map((m, i) => (
                      <a 
                        key={i} 
                        href={m.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        aria-label={m.label}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-[#1E293B] hover:scale-110 hover:brightness-110 shadow-sm transition-all cursor-pointer"
                      >
                        <m.Icon size={18} />
                      </a>
                    ))}
                </div>
             </div>

             {/* Column 2: Quick Links */}
             <div>
                <h4 className="text-sm font-semibold mb-6 text-white tracking-wider uppercase text-xs">
                  {h?.footer?.quickLinks?.title || "Quick Links"}
                </h4>
                <ul className="space-y-3.5 text-[#94A3B8] text-[14px]">
                   <li><button onClick={onLogin} className="hover:text-white transition-colors cursor-pointer text-left">{h?.footer?.quickLinks?.hospitals}</button></li>
                   <li><button onClick={onLogin} className="hover:text-white transition-colors cursor-pointer text-left">{h?.footer?.quickLinks?.login}</button></li>
                   <li><button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors cursor-pointer text-left">{h?.footer?.quickLinks?.about}</button></li>
                   <li><button onClick={onSignUp} className="hover:text-white transition-colors cursor-pointer text-left">{h?.footer?.quickLinks?.join}</button></li>
                </ul>
             </div>

             {/* Column 3: Hospital Types */}
             <div>
                <h4 className="text-sm font-semibold mb-6 text-white tracking-wider uppercase text-xs">
                  {h?.footer?.hospitalTypes?.title || "Hospital Types"}
                </h4>
                <ul className="space-y-3.5 text-[#94A3B8] text-[14px]">
                   <li><button onClick={onLogin} className="hover:text-white transition-colors cursor-pointer text-left">{h?.footer?.hospitalTypes?.govt}</button></li>
                   <li><button onClick={onLogin} className="hover:text-white transition-colors cursor-pointer text-left">{h?.footer?.hospitalTypes?.private}</button></li>
                   <li><button onClick={onLogin} className="hover:text-white transition-colors cursor-pointer text-left">{h?.footer?.hospitalTypes?.clinic}</button></li>
                   <li><button onClick={onLogin} className="hover:text-white transition-colors cursor-pointer text-left">{h?.footer?.hospitalTypes?.govtClinic}</button></li>
                </ul>
             </div>

             {/* Column 4: Company / Meta Links */}
             <div>
                <h4 className="text-sm font-semibold mb-6 text-white tracking-wider uppercase text-xs">
                  {h?.footer?.company?.title || "Company"}
                </h4>
                <ul className="space-y-3 text-[#94A3B8] text-[14px]">
                   <li>
                     <button 
                       onClick={() => onNavigate?.('pricing', '/pricing')}
                       className="hover:text-white hover:translate-x-1 transition-all duration-200 cursor-pointer text-left font-sans flex items-center gap-2 group w-full"
                     >
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-[#2563EB] transition-all"></span>
                        <span>{language === 'UR' ? 'قیمتیں' : 'Pricing'}</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => onNavigate?.('privacy', '/privacy-policy')}
                        className="hover:text-white hover:translate-x-1 transition-all duration-200 cursor-pointer text-left font-sans flex items-center gap-2 group w-full"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-[#2563EB] transition-all"></span>
                        <span>{language === 'UR' ? 'پرائیویسی پالیسی' : 'Privacy Policy'}</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => onNavigate?.('terms', '/terms')}
                        className="hover:text-white hover:translate-x-1 transition-all duration-200 cursor-pointer text-left font-sans flex items-center gap-2 group w-full"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-[#2563EB] transition-all"></span>
                        <span>{language === 'UR' ? 'شرائط و ضوابط' : 'Terms of Service'}</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => onNavigate?.('content_policy', '/content-policy')}
                        className="hover:text-white hover:translate-x-1 transition-all duration-200 cursor-pointer text-left font-sans flex items-center gap-2 group w-full"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-[#2563EB] transition-all"></span>
                        <span>{language === 'UR' ? 'مواد کی پالیسی' : 'Content Policy'}</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => onNavigate?.('about', '/about')}
                        className="hover:text-white hover:translate-x-1 transition-all duration-200 cursor-pointer text-left font-sans flex items-center gap-2 group w-full"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-[#2563EB] transition-all"></span>
                        <span>{language === 'UR' ? 'ہمارے بارے میں' : 'About Us'}</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => onNavigate?.('contact', '/contact')}
                        className="hover:text-white hover:translate-x-1 transition-all duration-200 cursor-pointer text-left font-sans flex items-center gap-2 group w-full"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-[#2563EB] transition-all"></span>
                        <span>{language === 'UR' ? 'ہم سے رابطہ کریں' : 'Contact Us'}</span>
                      </button>
                    </li>
                </ul>
             </div>
          </div>

          <div className="pt-8 border-t border-[#1E293B] text-center">
             <p className="text-[14px] text-[#475569] font-medium font-sans">
               © 2026 Xdoc. Built with ❤️ in Pakistan.
             </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeRedesign;
