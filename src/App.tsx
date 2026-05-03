import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Map as MapIcon, 
  Home, 
  Calendar, 
  User, 
  ChevronDown, 
  Star, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Phone, 
  Clock, 
  Check, 
  Share2, 
  Heart, 
  ArrowRight,
  Plus,
  Bell,
  Activity,
  History,
  SkipForward,
  AlertTriangle,
  Volume2,
  Stethoscope,
  LayoutDashboard,
  ShieldAlert,
  Settings,
  MoreHorizontal,
  LogOut,
  ChevronRight,
  Menu,
  X,
  PlusCircle,
  FileText,
  Users,
  Download,
  CreditCard,
  MessageSquare,
  Building2,
  Lock,
  Mail,
  Camera,
  Map,
  Layers,
  ArrowLeft,
  UserPlus,
  Ticket,
  Hospital as HospitalIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { hospitals, doctors, staffMembers, queueTokens } from './mockData';
import { Hospital, Doctor, Staff, Token, HospitalType, PaymentMethod, StaffStatus } from './types';
import { useAuth } from './contexts/AuthContext';
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/firebaseUtils';

// --- Shared Components ---

const Header = ({ darkMode = false, hospitalName = "Xdoc", onLogoClick, onSignUp, showMenu = false, isLanding = false }: { darkMode?: boolean, hospitalName?: string, onToggleSidebar?: () => void, onLogoClick?: () => void, showMenu?: boolean, onSignUp?: () => void, isLanding?: boolean }) => {
  const { userData, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  if (isLanding) {
    return (
      <>
        <header className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 px-4 md:px-6 h-[70px] flex items-center ${
          isScrolled ? 'bg-white shadow-xl' : 'bg-transparent'
        }`}>
          <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
            <div onClick={onLogoClick} className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-xl medical-cross-gradient flex items-center justify-center text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                <Activity size={24} />
              </div>
              <span className="text-2xl md:text-3xl font-display font-bold tracking-tighter text-[#0B5FFF]">Xdoc</span>
            </div>

            <nav className="hidden lg:flex items-center gap-12">
              {['Home', 'Find Hospital', 'About'].map((link) => (
                <a key={link} href="#" className="font-sans font-bold text-slate-600 hover:text-primary transition-colors">{link}</a>
              ))}
            </nav>
            
            <div className="flex items-center gap-4">
              {!userData ? (
                <>
                  <button 
                    onClick={onSignUp}
                    className="hidden sm:block px-6 py-2.5 rounded-xl font-sans font-bold border-2 border-primary/20 text-primary hover:bg-primary/5 transition-all"
                  >
                    Login
                  </button>
                  <button 
                    onClick={onSignUp}
                    className="hidden sm:block px-6 py-3 rounded-xl bg-health-teal text-white font-sans font-bold shadow-lg shadow-health-teal/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    Sign Up
                  </button>
                  <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="lg:hidden p-2 text-slate-600 bg-slate-100 rounded-xl"
                  >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-800">{userData.displayName}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{userData.role}</p>
                  </div>
                  <button 
                    onClick={() => logout()}
                    className="w-10 h-10 rounded-xl border-2 border-slate-100 overflow-hidden group relative"
                  >
                    <img src={userData.photoURL || "https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=200"} alt="Profile" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <LogOut size={16} className="text-white" />
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="fixed inset-0 z-[110] bg-white lg:hidden p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <div onClick={() => { setIsMobileMenuOpen(false); onLogoClick?.(); }} className="flex items-center gap-3">
                  <Activity size={32} className="text-primary" />
                  <span className="text-2xl font-display font-bold text-[#0B5FFF]">Xdoc</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-100 rounded-xl">
                  <X size={24} />
                </button>
              </div>

              <nav className="flex flex-col gap-8 mb-auto">
                {['Home', 'Find Hospital', 'About'].map((link) => (
                  <a 
                    key={link} 
                    href="#" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-3xl font-bold text-slate-900 border-b border-slate-100 pb-4"
                  >
                    {link}
                  </a>
                ))}
              </nav>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); onSignUp?.(); }}
                  className="w-full py-5 rounded-2xl font-sans font-bold border-2 border-primary/20 text-primary"
                >
                  Login
                </button>
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); onSignUp?.(); }}
                  className="w-full py-5 rounded-2xl bg-health-teal text-white font-sans font-bold shadow-xl shadow-health-teal/20"
                >
                  Sign Up Free
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <header className={`flex justify-between items-center w-full px-6 py-4 sticky top-0 z-[60] backdrop-blur-xl border-b transition-all duration-500 ${
      darkMode 
        ? 'bg-bg-dark/90 border-white/10 text-white' 
        : 'bg-white/80 border-slate-100 text-slate-900'
    }`}>
      <div className="flex items-center gap-4">
        <div onClick={onLogoClick} className="flex items-center gap-3 cursor-pointer group">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-110 ${
            darkMode ? 'bg-primary shadow-lg shadow-primary/20' : 'medical-cross-gradient shadow-lg shadow-primary/10'
          }`}>
            <Activity size={22} />
          </div>
          <h1 className="text-2xl font-bold tracking-tighter uppercase whitespace-nowrap">{hospitalName}</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-3 md:gap-5">
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10">
          <div className="w-2 h-2 rounded-full bg-success-green breathing-dot" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Live Status</span>
        </div>
        
        <button className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
          <Bell size={20} className={darkMode ? 'text-slate-400' : 'text-slate-600'} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emergency-red rounded-full ring-2 ring-white dark:ring-bg-dark" />
        </button>

        <div className={`flex items-center gap-3 pl-3 md:pl-5 border-l ${darkMode ? 'border-white/10' : 'border-slate-100'}`}>
          <div className={`hidden sm:block text-right ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            <p className="text-xs font-bold leading-none">{userData?.displayName || 'James Sterling'}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">{userData?.role || 'Hospital Admin'}</p>
          </div>
          <div className={`w-10 h-10 rounded-xl border-2 overflow-hidden shadow-sm group relative cursor-pointer ${
            darkMode ? 'border-primary/30' : 'border-primary'
          }`}>
            <img 
              src={userData?.photoURL || "https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=200"} 
              alt="Profile"
              className="w-full h-full object-cover"
            />
            {userData && (
              <button 
                onClick={() => logout()}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <LogOut size={16} className="text-white" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const Navbar = ({ activeTab, setActiveTab, darkMode = false }: { activeTab: string, setActiveTab: (t: any) => void, darkMode?: boolean }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'hospitals', icon: Activity, label: 'Hospitals' },
    { id: 'bookings', icon: Calendar, label: 'Bookings' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  const adminTabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'tokens', icon: History, label: 'Tokens' },
    { id: 'staff', icon: ShieldCheck, label: 'Staff' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  const displayTabs = darkMode ? adminTabs : tabs;

  return (
    <nav className={`fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-safe border-t backdrop-blur-lg shadow-sm transition-colors duration-300 ${
      darkMode 
        ? 'bg-bg-dark/80 border-white/10' 
        : 'bg-white/90 border-slate-100'
    }`}>
      {displayTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center justify-center transition-all duration-300 ${
            activeTab === tab.id 
              ? (darkMode ? 'text-blue-400 scale-110 font-bold' : 'text-primary scale-110 font-bold')
              : 'text-slate-400 font-medium'
          }`}
        >
          <tab.icon size={22} fill={activeTab === tab.id ? 'currentColor' : 'none'} />
          <span className="text-[10px] mt-1 uppercase tracking-tighter">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};


const StatsRow = () => {
  const stats = [
    { label: "Hospitals", val: "500+" },
    { label: "Doctors", val: "2000+" },
    { label: "Patients", val: "15000+" },
    { label: "Cities", val: "50+" }
  ];

  return (
    <div className="bg-white border-y border-slate-100 py-8 md:py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-4">
        {stats.map((s, i) => (
          <div key={i} className={`text-center ${i % 2 === 0 ? 'border-r last:border-0' : 'md:border-r last:border-0'} border-slate-100`}>
            <h4 className="text-3xl md:text-5xl font-bold text-primary tracking-tighter mb-2">{s.val}</h4>
            <p className="text-[10px] md:text-sm font-bold text-slate-500 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const HeroSection = ({ onSignUp, onLogin }: { onSignUp: () => void, onLogin: () => void }) => {
  const benefits = [
    { icon: Calendar, title: "Online Token Booking", desc: "Book tokens instantly without physical visits", gradient: "from-blue-500 to-primary" },
    { icon: Clock, title: "Real-time Availability", desc: "Check live doctor schedules before leaving home", gradient: "from-health-teal to-emerald-500" },
    { icon: CreditCard, title: "Transparent Fees", desc: "See consultation fees upfront, no surprises", gradient: "from-amber-400 to-orange-500" },
    { icon: Building2, title: "Govt & Private Hospitals", desc: "All major health facilities in one digital hub", gradient: "from-indigo-500 to-indigo-700" },
    { icon: MessageSquare, title: "WhatsApp Alerts", desc: "Get status reminders via WhatsApp & App", gradient: "from-pink-500 to-rose-600" },
    { icon: History, title: "Save Hours of Waiting", desc: "Efficient medical visits start right here", gradient: "from-violet-500 to-purple-600" }
  ];

  return (
    <div className="bg-white min-h-[90vh] relative overflow-x-hidden flex flex-col justify-center">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-5%] right-[-10%] md:top-[-10%] md:right-[-5%] w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-primary/10 rounded-full blur-[80px] md:blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[-10%] md:bottom-[-10%] md:left-[-5%] w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-health-teal/5 rounded-full blur-[80px] md:blur-[120px]" />
      </div>

      <div className="max-w-[800px] mx-auto px-5 pt-[140px] pb-[60px] relative z-10 w-full">
        <div className="text-center mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 bg-blue-50 border border-[#0B5FFF] rounded-full mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-primary breathing-dot" />
            <span className="text-[8px] sm:text-[10px] font-mono font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[#0B5FFF]">Pakistan's #1 Health Network</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[32px] md:text-[42px] lg:text-[56px] font-display font-bold tracking-tight leading-tight mb-5 text-[#04111D] max-w-[700px] mx-auto"
          >
            Apna Doctor Dhundein — <br className="hidden sm:block" />
            Ghar Baithe.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg md:text-xl text-[#6B8FAE] font-normal max-w-[600px] mx-auto mb-8 leading-relaxed"
          >
            Pakistan ke tamam hospitals aur clinics ek jagah. Ghar baithe <br className="hidden md:block" />
            doctor dhundein, token book karein.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <button 
              onClick={onSignUp}
              className="w-full sm:w-auto px-10 md:px-12 py-5 bg-health-teal text-white font-bold text-lg md:text-xl rounded-2xl shadow-2xl shadow-health-teal/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              Sign Up Free <ArrowRight size={24} />
            </button>
            <button 
              onClick={onLogin}
              className="w-full sm:w-auto px-10 md:px-12 py-5 bg-white border-2 border-slate-200 text-slate-900 font-bold text-lg md:text-xl rounded-2xl hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-3"
            >
              Login Now
            </button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto mt-20 px-4 sm:px-0">
          {benefits.map((b, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10, scale: 1.02 }}
              className="p-8 md:p-10 bg-white rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 group cursor-pointer"
            >
              <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-gradient-to-br ${b.gradient} flex items-center justify-center text-white mb-6 md:mb-8 group-hover:rotate-6 transition-transform duration-500 shadow-lg`}>
                <b.icon size={innerWidth < 768 ? 32 : 40} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">{b.title}</h3>
              <p className="text-sm md:text-base text-slate-500 font-bold leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const HowItWorks = () => {
  const steps = [
    { title: "Hospital Search Karein", icon: Search },
    { title: "Doctor Select Karein", icon: Stethoscope },
    { title: "Token Book Karein", icon: Ticket },
    { title: "Visit Karein Apni Baari Par", icon: HospitalIcon }
  ];

  return (
    <div className="bg-white py-20 md:py-32 px-4 md:px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
        
        {/* Left Side: Content (40%) */}
        <div className="lg:w-[40%] w-full">
          <div className="mb-6">
            <span className="text-health-teal text-xs font-bold uppercase tracking-[0.2em] bg-health-teal/5 px-4 py-2 rounded-full">HOW IT WORKS</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-[1.1] mb-8">
            Apni Healthcare Needs Poori Karein — <span className="text-primary">Ek Jagah!</span>
          </h2>
          
          <div className="flex gap-4 mb-10">
            <button className="px-8 py-3 bg-primary text-white rounded-full font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-transform active:scale-95">
              Hospital
            </button>
            <button className="px-8 py-3 border-2 border-slate-100 text-slate-500 rounded-full font-bold text-sm hover:border-primary hover:text-primary transition-all active:scale-95">
              Clinic
            </button>
          </div>

          <div className="space-y-6">
            <p className="text-slate-900 font-bold text-lg">Sirf 4 easy steps!</p>
            <ul className="space-y-5">
              {[
                "Hospital ya clinic search karein",
                "Doctor select karein",
                "Online token book karein",
                "Hospital jayein apni baari par"
              ].map((point, idx) => (
                <li key={idx} className="flex items-center gap-4 text-slate-600 font-medium group">
                  <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-primary font-bold text-xs group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    {idx + 1}
                  </div>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Side: Step Cards (60%) */}
        <div className="lg:w-[60%] w-full relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 relative z-10">
            {steps.map((s, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="bg-white p-8 md:p-10 rounded-[32px] border border-slate-100 shadow-2xl shadow-slate-200/40 flex flex-col items-center text-center group transition-all duration-300"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-slate-50 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <s.icon size={32} />
                </div>
                <div className="w-8 h-8 rounded-full bg-health-teal text-white flex items-center justify-center text-xs font-bold mb-4 shadow-lg shadow-health-teal/30">
                  {i + 1}
                </div>
                <h4 className="text-lg md:text-xl font-bold text-slate-900 leading-tight px-2">{s.title}</h4>
              </motion.div>
            ))}
          </div>

          {/* Connection Lines (Desktop Only) */}
          <div className="hidden lg:block absolute top-[25%] left-[45%] w-[10%] h-[2px] bg-slate-100 border-t-2 border-dashed border-slate-200" />
          <div className="hidden lg:block absolute bottom-[25%] left-[45%] w-[10%] h-[2px] bg-slate-100 border-t-2 border-dashed border-slate-200" />
        </div>

      </div>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="bg-[#04111D] text-white py-12 md:py-20 px-4 md:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <div className="w-10 h-10 rounded-xl medical-cross-gradient flex items-center justify-center text-white">
              <Activity size={24} />
            </div>
            <span className="text-2xl md:text-3xl font-bold tracking-tighter">Xdoc</span>
          </div>
          <p className="text-sm md:text-base text-slate-400 font-bold max-w-sm mb-6 md:mb-8">
            Pakistan's premier digital healthcare network connecting citizens with 
            verified medical facilities and doctors.
          </p>
          <div className="flex gap-4">
            {['Twitter', 'Facebook', 'Instagram', 'LinkedIn'].map((s) => (
              <a key={s} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary transition-colors text-[10px] font-bold uppercase">{s[0]}</a>
            ))}
          </div>
        </div>
        <div className="md:pt-4">
          <h4 className="text-base md:text-lg font-bold mb-4 md:mb-8">Quick Links</h4>
          <ul className="space-y-3 md:space-y-4 text-sm md:text-base text-slate-400 font-bold">
            <li><a href="#" className="hover:text-white transition-colors">Find Hospitals</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Doctor Directory</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Emergency Services</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Join as Provider</a></li>
          </ul>
        </div>
        <div className="md:pt-4">
          <h4 className="text-base md:text-lg font-bold mb-4 md:mb-8">Company</h4>
          <ul className="space-y-3 md:space-y-4 text-sm md:text-base text-slate-400 font-bold">
            <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 md:mt-20 pt-8 border-t border-white/10 text-center text-slate-500 font-bold text-[10px] md:text-sm">
        &copy; 2024 Xdoc Digital Healthcare Platform. All rights reserved. Built with love in Pakistan.
      </div>
    </footer>
  );
};


const SignUpChoice = ({ onSelect }: { onSelect: (type: 'Hospital' | 'Patient') => void }) => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 md:px-6 py-12 md:py-20">
    <div className="max-w-4xl w-full">
      <div className="text-center mb-8 md:mb-16">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4 md:mb-6">Choose Account Type</h2>
        <p className="text-base md:text-xl text-slate-500 font-medium">Join Pakistan's fastest growing digital health marketplace</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <motion.div 
          whileHover={{ y: -10 }}
          onClick={() => onSelect('Hospital')}
          className="bg-white p-8 md:p-10 rounded-[32px] md:rounded-[48px] border-2 border-transparent hover:border-primary shadow-xl cursor-pointer transition-all group"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6 md:mb-8 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
            <Building2 size={innerWidth < 768 ? 32 : 40} />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Hospital or Clinic</h3>
          <p className="text-sm md:text-lg text-slate-500 leading-relaxed mb-6 md:mb-8">Register your facility, manage doctors, and handle live tokens digitally.</p>
          <ul className="space-y-2 md:space-y-3 mb-8 md:mb-10">
            {['Detailed Dashboard', 'Staff Management', 'Revenue Tracking'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm md:text-base text-slate-700 font-bold">
                <CheckCircle2 size={18} className="text-health-teal" fill="currentColor" /> {item}
              </li>
            ))}
          </ul>
          <div className="w-full py-4 md:py-5 bg-slate-100 rounded-2xl flex items-center justify-center gap-3 font-sans font-bold text-slate-900 group-hover:bg-primary group-hover:text-white transition-all text-sm md:text-base">
            Join as Partner <ArrowRight size={20} />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -10 }}
          onClick={() => onSelect('Patient')}
          className="bg-white p-8 md:p-10 rounded-[32px] md:rounded-[48px] border-2 border-transparent hover:border-health-teal shadow-xl cursor-pointer transition-all group"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-health-teal/10 flex items-center justify-center text-health-teal mb-6 md:mb-8 group-hover:scale-110 group-hover:bg-health-teal group-hover:text-white transition-all duration-500">
            <User size={innerWidth < 768 ? 32 : 40} />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">I'm a Patient</h3>
          <p className="text-sm md:text-lg text-slate-500 leading-relaxed mb-6 md:mb-8">Find doctors, book tokens instantly, and get digital care reminders.</p>
          <ul className="space-y-2 md:space-y-3 mb-8 md:mb-10">
            {['Instant Tokens', 'Fee Transparency', 'Secure Records'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm md:text-base text-slate-700 font-bold">
                <CheckCircle2 size={18} className="text-health-teal" fill="currentColor" /> {item}
              </li>
            ))}
          </ul>
          <div className="w-full py-4 md:py-5 bg-slate-100 rounded-2xl flex items-center justify-center gap-3 font-sans font-bold text-slate-900 group-hover:bg-health-teal group-hover:text-white transition-all text-sm md:text-base">
            Find Care <ArrowRight size={20} />
          </div>
        </motion.div>
      </div>
    </div>
  </div>
);

const HospitalRegistration = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 7;

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const sections = [
    "Basic Information",
    "Location & Contact",
    "Timings",
    "Services",
    "Staff",
    "Pricing",
    "Media"
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-20 pb-40">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-slate-900">Facility Registration</h2>
            <p className="text-slate-500 font-medium mt-1">Section {step}: {sections[step-1]}</p>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all duration-500 ${
                  i + 1 === step ? 'w-10 bg-primary' : 
                  i + 1 < step ? 'w-4 bg-health-teal' : 'w-4 bg-slate-200'
                }`} 
              />
            ))}
          </div>
        </div>

        <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-slate-100">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Full Name of Facility</label>
                    <input type="text" placeholder="e.g. City Care Clinic" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Establishment Type</label>
                      <select className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium">
                        <option>Private Hospital</option>
                        <option>Government Hospital</option>
                        <option>Private Clinic</option>
                        <option>Diagnostic Lab</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Medical License Number</label>
                      <input type="text" placeholder="PMDC-XXXXX" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Email Address</label>
                    <input type="email" placeholder="contact@hospital.com" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="password" placeholder="Create Password" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium" />
                    <input type="password" placeholder="Confirm Password" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium" />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Complete Address</label>
                    <textarea placeholder="Plot #, Street, etc." className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium min-h-[100px]" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <select className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium">
                      <option>Select City</option>
                      <option>Karachi</option>
                      <option>Lahore</option>
                      <option>Islamabad</option>
                    </select>
                    <input type="text" placeholder="Area / Neighborhood" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="tel" placeholder="Phone Number" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium" />
                    <input type="tel" placeholder="WhatsApp Number" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium" />
                    <input type="tel" placeholder="Emergency Contact" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium" />
                  </div>
                  <button className="flex items-center gap-3 text-primary font-bold bg-primary/5 px-6 py-3 rounded-xl hover:bg-primary/10 transition-colors">
                    <MapPin size={20} /> Pin Google Maps Location
                  </button>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Opening Time</label>
                      <input type="time" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Closing Time</label>
                      <input type="time" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700">Open Days</label>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-xl border border-transparent hover:border-primary transition-all">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{day}</span>
                          <input type="checkbox" className="w-5 h-5 rounded-md text-primary" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-6 bg-red-50 rounded-3xl border border-red-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emergency-red rounded-2xl flex items-center justify-center text-white">
                        <AlertTriangle />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">24/7 Emergency Service</p>
                        <p className="text-xs text-slate-500">Do you offer round the clock emergency?</p>
                      </div>
                    </div>
                    <div className="w-14 h-8 bg-slate-200 rounded-full relative p-1 cursor-pointer">
                      <div className="w-6 h-6 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700">Specializations</label>
                    <div className="flex flex-wrap gap-2">
                      {['General Physician', 'Cardiology', 'Neurology', 'Orthopedic', 'Gynecology', 'Pediatrics', 'Dentistry'].map(spec => (
                        <button key={spec} className="px-4 py-2 bg-slate-50 rounded-full text-xs font-bold text-slate-600 hover:bg-primary hover:text-white transition-all border border-slate-200">
                          {spec}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700">Available Facilities</label>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      {['ICU', 'Emergency Ward', 'Pathology Lab', 'Pharmacy', 'X-Ray', 'Ambulance'].map(fac => (
                        <div key={fac} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                          <input type="checkbox" className="w-5 h-5 rounded-md text-primary" />
                          <span className="text-xs font-bold text-slate-700">{fac}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step >= 5 && <div className="text-center py-10 text-slate-400">Section details logic continues...</div>}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between mt-12">
          <button 
            onClick={prevStep}
            disabled={step === 1}
            className={`px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all ${
              step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <ArrowLeft size={20} /> Previous
          </button>
          
          {step < totalSteps ? (
            <button 
              onClick={nextStep}
              className="px-12 py-4 bg-primary text-white font-bold text-lg rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              Continue
            </button>
          ) : (
            <button 
              onClick={onComplete}
              className="px-12 py-4 cta-gradient text-white font-bold text-lg rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              Review & Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Pages ---

// --- App View State ---

// --- Hospital List ---

const HospitalListPage = ({ onHospitalClick }: { onHospitalClick: (h: Hospital) => void }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    type: 'All',
    city: 'Karachi',
    rating: 0,
    search: ''
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-32">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12">
        {/* Mobile Filter Toggle */}
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="lg:hidden w-full mb-6 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between font-sans font-bold text-slate-700"
        >
          <div className="flex items-center gap-2">
            <Settings size={20} className="text-primary" />
            Filters & Search
          </div>
          <ChevronDown size={20} className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
        </button>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Filter */}
          <aside className={`lg:w-80 shrink-0 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-slate-100 lg:sticky lg:top-24">
              <h3 className="text-2xl font-bold text-slate-900 mb-8">Filters</h3>
              
              <div className="space-y-8">
                {/* Hospital Type */}
                <div className="space-y-4">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Hospital Type</p>
                  <div className="flex flex-col gap-2">
                    {['All', 'Private', 'Government'].map((t) => (
                      <button 
                        key={t}
                        onClick={() => setActiveFilters({...activeFilters, type: t})}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl font-sans font-bold text-sm transition-all ${
                          activeFilters.type === t ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {t} Hospitals
                        {activeFilters.type === t && <CheckCircle2 size={16} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* City */}
                <div className="space-y-4">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Select City</p>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select 
                      value={activeFilters.city}
                      onChange={(e) => setActiveFilters({...activeFilters, city: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-primary font-sans font-bold text-slate-700 appearance-none"
                    >
                      <option>Karachi</option>
                      <option>Lahore</option>
                      <option>Islamabad</option>
                      <option>Peshawar</option>
                      <option>Quetta</option>
                    </select>
                  </div>
                </div>

                {/* Fee Range Placeholder */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Fee Range</p>
                    <span className="text-xs font-bold text-slate-900">Rs. 0 - 5000</span>
                  </div>
                  <input type="range" className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary" />
                </div>

                {/* Open Now Toggle */}
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <span className="text-sm font-bold text-emerald-800">Open Now Only</span>
                  <div className="w-10 h-6 bg-health-teal rounded-full relative p-1 cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full translate-x-4 shadow-sm transition-all" />
                  </div>
                </div>

                {/* Rating */}
                <div className="space-y-4">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Minimum Rating</p>
                  <div className="flex gap-2">
                    {[3, 4, 5].map((r) => (
                      <button 
                        key={r}
                        onClick={() => setActiveFilters({...activeFilters, rating: r})}
                        className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1 font-mono text-xs font-bold border transition-all ${
                          activeFilters.rating === r ? 'bg-amber-100 border-amber-200 text-amber-700 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-500'
                        }`}
                      >
                        {r} <Star size={12} fill="currentColor" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button className="w-full mt-10 py-4 bg-slate-900 text-white rounded-2xl font-sans font-bold hover:bg-black transition-all">
                Reset All Filters
              </button>
            </div>
          </aside>

          {/* Hospital List Content */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
              <div>
                <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Available Hospitals</h2>
                <p className="text-slate-500 font-bold mt-2">Showing {hospitals.length} facilities in {activeFilters.city}, Pakistan</p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input type="text" placeholder="Search specifically..." className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary font-sans font-bold text-sm" />
                </div>
                <button className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-all">
                  <MapIcon size={22} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {hospitals.map(h => (
                <motion.div 
                  layout
                  key={h.id} 
                  onClick={() => onHospitalClick(h)}
                  className="group bg-white rounded-[40px] overflow-hidden shadow-sm border border-slate-100 hover:shadow-2xl hover:border-primary/20 transition-all cursor-pointer flex flex-col md:flex-row"
                >
                  <div className="md:w-72 lg:w-80 h-72 md:h-auto relative overflow-hidden">
                    <img src={h.imageUrl} alt={h.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-6 left-6 bg-white/95 backdrop-blur px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xl border border-slate-100">
                      <div className="w-2 h-2 bg-health-teal rounded-full breathing-dot" />
                      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#005046]">Open Now</span>
                    </div>
                  </div>
                  <div className="p-10 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-2xl font-bold text-slate-900 leading-tight">{h.name}</h3>
                          {h.verified && <CheckCircle2 size={24} className="text-primary" fill="currentColor" />}
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <MapPin size={16} />
                          <span className="text-sm font-bold">{h.area}, {h.city}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-4 py-2 rounded-2xl border border-amber-100 shadow-sm">
                        <Star size={18} fill="currentColor" />
                        <span className="font-mono text-lg font-bold">{h.rating}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-6 mb-8">
                      <div className="bg-primary/5 text-primary px-4 py-2 rounded-xl flex items-center gap-2 border border-primary/10">
                        <ShieldCheck size={16} />
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest">{h.category} FACILITY</span>
                      </div>
                      {h.specializations.slice(0, 3).map((spec, i) => (
                        <span key={i} className="bg-slate-50 text-slate-500 px-4 py-2 rounded-xl font-mono text-[10px] font-bold uppercase border border-slate-100">{spec}</span>
                      ))}
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-8 border-t border-slate-50">
                      <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Consultation start at</p>
                        <p className="text-3xl font-bold text-slate-900">Rs. {h.startingFee.toLocaleString()} <span className="text-sm font-medium text-slate-400">/visit</span></p>
                      </div>
                      <button className="bg-health-teal text-white font-bold px-10 py-4 rounded-2xl shadow-xl shadow-health-teal/20 hover:scale-105 active:scale-95 transition-all">
                        Book Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const HospitalDetailsPage = ({ hospital, onBook }: { hospital: Hospital, onBook: (d: Doctor) => void }) => {
  return (
    <div className="pb-32">
      <section className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
        <img className="w-full h-full object-cover" src={hospital.imageUrl} alt={hospital.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 border border-white/20">
                <CheckCircle2 size={14} fill="currentColor" /> VERIFIED FACILITY
              </span>
            </div>
            <h1 className="font-sans text-white text-4xl md:text-6xl font-bold flex items-center gap-4">
              {hospital.name}
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shrink-0">
                <CheckCircle2 size={24} fill="currentColor" />
              </div>
            </h1>
            <div className="flex items-center gap-6 mt-6 text-white/90">
              <div className="flex items-center gap-2 font-mono text-sm font-bold">
                <Star size={18} className="text-yellow-400" fill="currentColor" />
                {hospital.rating} <span className="font-normal opacity-70">({hospital.reviewsCount}+ reviews)</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-sm font-bold">
                <MapPin size={18} />
                {hospital.area}, {hospital.city}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-white/20 transition-all">
              <Share2 size={20} /> Share
            </button>
            <button className="bg-white text-primary px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-xl">
              <Heart size={20} fill="currentColor" /> Save
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="text-3xl font-sans font-bold mb-6">About the Hospital</h2>
            <p className="text-lg text-slate-600 leading-relaxed font-medium">
              {hospital.about}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
              {['Emergency', 'ICU', 'Modern Lab', 'Pharmacy'].map((item, i) => (
                <div key={i} className="bg-blue-50/50 p-6 rounded-3xl flex flex-col items-center gap-4 border border-blue-100/50 group hover:bg-white hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    {i === 0 && <AlertTriangle />}
                    {i === 1 && <Activity />}
                    {i === 2 && <Volume2 />}
                    {i === 3 && <Clock />}
                  </div>
                  <span className="font-mono text-sm font-bold text-slate-700 tracking-tight">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex border-b border-slate-200 mb-10 overflow-x-auto no-scrollbar">
              <button className="px-8 py-5 font-sans text-lg font-bold text-primary border-b-4 border-primary whitespace-nowrap">Doctors</button>
              <button className="px-8 py-5 font-sans text-lg font-bold text-slate-400 hover:text-slate-600 whitespace-nowrap">Reviews</button>
              <button className="px-8 py-5 font-sans text-lg font-bold text-slate-400 hover:text-slate-600 whitespace-nowrap">Location</button>
            </div>

            <div className="space-y-6">
              {doctors.map(doc => (
                <div key={doc.id} className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col md:flex-row gap-8 hover:shadow-2xl transition-all group overflow-hidden relative">
                  <div className="relative shrink-0">
                    <div className="w-40 h-40 rounded-3xl overflow-hidden bg-slate-100">
                      <img src={doc.imageUrl} alt={doc.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary border-4 border-white rounded-full flex items-center justify-center text-white shadow-xl">
                      <CheckCircle2 size={20} fill="currentColor" />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-sans font-bold text-slate-900 leading-tight">{doc.name}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg font-mono text-[10px] font-bold uppercase tracking-wider">{doc.title}</span>
                          <div className="flex gap-1">
                            {doc.qualifications.map((q, i) => (
                              <span key={i} className="bg-emerald-50 text-health-teal px-2 py-0.5 rounded-md font-mono text-[10px] font-bold">{q}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-sans font-bold text-primary tracking-tight">Rs. {doc.fee.toLocaleString()}</div>
                        <div className="text-slate-400 font-mono text-[10px] font-bold uppercase">Consultation Fee</div>
                      </div>
                    </div>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-health-teal rounded-full breathing-dot" />
                        <span className="text-health-teal font-bold text-sm uppercase tracking-wide">Available Today</span>
                        <span className="text-slate-400 font-mono text-sm">Next slot: {doc.nextSlot}</span>
                      </div>
                      <button 
                        onClick={() => onBook(doc)}
                        className="bg-primary hover:bg-blue-700 text-white px-10 py-3.5 rounded-2xl font-sans font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                      >
                        Book Appointment
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <div className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-sm">
            <h4 className="text-xl font-sans font-bold mb-6">Facility Status</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-3xl border border-emerald-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-health-teal rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 leading-tight">Govt. Certified</div>
                    <div className="text-[10px] uppercase text-emerald-800/70 font-mono font-bold tracking-widest mt-1">N.H. Board</div>
                  </div>
                </div>
                <CheckCircle2 size={24} className="text-health-teal" />
              </div>
              <div className="flex items-center justify-between p-4 bg-amber-50/50 rounded-3xl border border-amber-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Star size={24} fill="currentColor" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 leading-tight">Private Facility</div>
                    <div className="text-[10px] uppercase text-amber-800/70 font-mono font-bold tracking-widest mt-1">Premier Status</div>
                  </div>
                </div>
                <CheckCircle2 size={24} className="text-amber-500" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-sm">
            <h4 className="text-xl font-sans font-bold mb-6">Location & Contact</h4>
            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shrink-0">
                  <MapPin size={20} />
                </div>
                <span className="text-slate-600 font-medium leading-relaxed">{hospital.address}</span>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shrink-0">
                  <Phone size={20} />
                </div>
                <span className="text-slate-600 font-bold">{hospital.phone}</span>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <span className="font-bold text-health-teal text-lg">Open 24/7</span>
                  <p className="text-slate-500 text-sm mt-1">Emergency Unit always active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConfirmationPage = ({ doctor }: { doctor: Doctor }) => (
  <div className="max-w-lg mx-auto px-6 py-12 pb-32">
    <div className="flex justify-between items-center mb-12 relative">
      <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0" />
      <div className="absolute top-1/2 left-0 w-full h-1 bg-health-teal/30 -translate-y-1/2 z-0" />
      {[1, 2, 3, 4].map(s => (
        <div key={s} className="relative z-10 w-10 h-10 rounded-full bg-emerald-100 text-health-teal flex items-center justify-center border-2 border-health-teal">
          <Check size={20} strokeWidth={3} />
        </div>
      ))}
      <div className="relative z-10 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/40 ring-4 ring-primary/20">
        <span className="font-mono font-bold text-lg">5</span>
      </div>
    </div>

    <div className="text-center mb-10">
      <h2 className="text-4xl font-bold text-slate-900 mb-3 underline decoration-primary/20 decoration-8 underline-offset-8">Booking Confirmed!</h2>
      <p className="text-slate-500 text-lg">Your digital token has been generated.</p>
    </div>

    <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden mb-10">
      <div className="absolute -top-10 -right-10 opacity-[0.03] rotate-12">
        <Activity size={300} strokeWidth={1} />
      </div>

      <div className="flex flex-col items-center">
        <div className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full bg-emerald-50 text-health-teal border border-emerald-100/50">
          <div className="w-2.5 h-2.5 rounded-full bg-health-teal breathing-dot" />
          <span className="font-mono text-xs font-bold tracking-widest uppercase">Live Token</span>
        </div>

        <div className="relative mb-10 group">
          <div className="absolute inset-0 bg-health-teal/10 blur-3xl rounded-full scale-150 animate-pulse" />
          <div className="relative bg-white border-[6px] border-emerald-100 rounded-[32px] p-10 shadow-xl">
            <div className="text-7xl font-bold tracking-tighter text-slate-900 flex items-center justify-center gap-1">
              <span className="text-primary/10">T-</span>
              <span className="font-mono">0047</span>
            </div>
            <p className="mt-4 font-mono text-slate-400 uppercase tracking-[0.2em] text-[10px] font-bold text-center">Your Queue Position</p>
          </div>
        </div>

        <div className="w-full space-y-6 pt-8 border-t border-slate-50">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Doctor</p>
              <p className="font-sans text-xl font-bold text-slate-900 flex items-center gap-2">
                {doctor.name}
                <CheckCircle2 size={18} className="text-primary" fill="currentColor" />
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Date</p>
              <p className="font-mono font-bold text-slate-900">Oct 24, 2023</p>
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Appointment</p>
              <p className="font-mono font-bold text-slate-900">10:30 AM — 11:00 AM</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Type</p>
              <p className="font-mono font-bold text-health-teal uppercase tracking-wider">In-Person</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6 mb-10 flex gap-5">
      <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
        <Share2 className="text-white" />
      </div>
      <div>
        <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-2">WhatsApp Confirmation Sent</p>
        <p className="text-emerald-900/70 font-medium leading-snug">
          "Hello Ahmed! Your token T-0047 for Aga Khan University is confirmed for today at 10:30 AM. Track your position live here: xdoc.pk/t47"
        </p>
      </div>
    </div>

    <div className="space-y-4">
      <button className="w-full py-5 rounded-2xl cta-gradient text-white font-sans font-bold text-lg flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 active:scale-95 transition-all">
        <Calendar size={22} /> Add to Calendar
      </button>
      <button className="w-full py-5 rounded-2xl border-2 border-primary text-primary font-sans font-bold text-lg flex items-center justify-center gap-3 hover:bg-primary/5 transition-colors">
        <Share2 size={22} /> Share Token
      </button>
    </div>
  </div>
);


// --- Admin Section (Dark Mode) ---

const Sidebar = ({ activeTab, setActiveTab, onLogout }: { activeTab: string, setActiveTab: (t: any) => void, onLogout: () => void }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'doctors', icon: Stethoscope, label: 'Doctors' },
    { id: 'staff', icon: Users, label: 'Staff' },
    { id: 'attendance', icon: ShieldCheck, label: 'Attendance' },
    { id: 'tokens', icon: History, label: 'Tokens' },
    { id: 'revenue', icon: CreditCard, label: 'Revenue' },
    { id: 'export', icon: Download, label: 'Export Data' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="w-72 h-screen fixed left-0 top-0 bg-bg-dark border-r border-white/10 pt-24 pb-8 flex flex-col z-[50]">
      <div className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-sans font-bold text-sm transition-all relative group ${
              activeTab === item.id 
                ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.icon size={20} className={activeTab === item.id ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'} />
            {item.label}
            {activeTab === item.id && (
              <motion.div layoutId="active-pill" className="absolute left-0 w-1.5 h-6 bg-white rounded-r-full" />
            )}
          </button>
        ))}
      </div>

      <div className="px-6 pt-6 border-t border-white/5">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-6 py-4 rounded-xl font-sans font-bold text-sm text-emergency-red hover:bg-emergency-red/10 transition-all"
        >
          <LogOut size={20} /> Sign Out
        </button>
      </div>
    </div>
  );
};

const DashboardOverview = () => {
  const stats = [
    { label: "Today's Tokens", val: 124, diff: "+12.4%", icon: History, color: 'text-health-teal' },
    { label: "Waiting Now", val: 18, diff: "Peak Hour", icon: Clock, color: 'text-warning-amber' },
    { label: "Patients Seen", val: 96, diff: "Target: 120", icon: CheckCircle2, color: 'text-success-green' },
    { label: "Revenue", val: "Rs. 14.5k", diff: "+Rs. 2.4k", icon: CreditCard, color: 'text-primary' }
  ];

  return (
    <div className="space-y-12">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -5 }}
            className="glass-card p-8 rounded-[32px] flex flex-col justify-between h-44 relative overflow-hidden group hover:border-white/20 transition-all border-none bg-gradient-to-br from-white/10 to-transparent shadow-xl"
          >
            <div className="flex justify-between items-start relative z-10">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.color.replace('text', 'bg')}/10 ${s.color}`}>
                <s.icon size={24} />
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">{s.diff}</span>
            </div>
            <div className="relative z-10">
              <p className="text-4xl font-bold text-white tracking-tighter">{s.val}</p>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 opacity-70">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="glass-card rounded-[40px] p-8 border-none bg-gradient-to-br from-white/5 to-transparent shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h3 className="text-3xl font-bold text-white tracking-tight">Live Queue</h3>
                <p className="text-slate-500 font-bold text-sm mt-1 uppercase tracking-widest">Cardiology Dept - Room 4</p>
              </div>
              <div className="bg-success-green/10 px-4 py-2 rounded-xl border border-success-green/20 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success-green breathing-dot" />
                <span className="text-[10px] font-bold text-success-green uppercase tracking-widest">Live Sync</span>
              </div>
            </div>

            <div className="flex items-center gap-8 mb-12">
              <div className="bg-primary/20 p-10 rounded-[32px] border-2 border-primary/30 flex flex-col items-center justify-center shadow-2xl shadow-primary/20">
                <span className="text-sm font-mono font-bold text-primary uppercase tracking-[0.3em] mb-2">CURRENT</span>
                <span className="text-7xl font-mono font-bold text-white tracking-tighter">A-42</span>
              </div>
              <div className="flex-1 space-y-4">
                <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.1em]">Patient in Cabin</p>
                <h4 className="text-4xl font-sans font-bold text-white">James Sterling</h4>
                <div className="flex items-center gap-4 py-2">
                  <div className="bg-white/5 px-4 py-2 rounded-xl text-xs font-mono text-slate-300">Started: 10:24 AM</div>
                  <div className="bg-white/5 px-4 py-2 rounded-xl text-xs font-mono text-slate-300">Spent: 12m</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-[32px] p-8">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Upcoming in queue</p>
              <div className="space-y-6">
                {[
                  { id: 'A-43', name: 'David Henderson', status: 'In Waiting Area', time: 'Next' },
                  { id: 'A-44', name: 'Sarah Jenkins', status: 'Near Hospital', time: '04m' },
                  { id: 'A-45', name: 'Michael Chen', status: 'Traveling', time: '09m' }
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-8 text-slate-400 border-b border-white/5 pb-6 last:border-0 hover:text-white transition-colors cursor-pointer group">
                    <span className="font-mono text-xl font-bold text-white/20 group-hover:text-primary transition-colors">{row.id}</span>
                    <div className="flex-1">
                      <p className="font-bold text-lg text-white/90">{row.name}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">{row.status}</p>
                    </div>
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-health-teal bg-health-teal/10 px-3 py-1 rounded-lg">{row.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full py-8 mt-8 rounded-[32px] bg-gradient-to-r from-primary to-health-teal text-white font-bold text-2xl flex items-center justify-center gap-4 hover:shadow-[0_20px_50px_rgba(11,95,255,0.3)] transition-all active:scale-95 group">
              <Volume2 size={32} className="group-hover:scale-110 transition-transform" /> Call Next Patient
            </button>
          </section>
        </div>

        <div className="space-y-8">
          <section className="glass-card p-8 rounded-[40px] border-none shadow-xl">
            <h4 className="text-xl font-sans font-bold text-white mb-8 flex justify-between items-center">
              Today's Staff
              <span className="text-xs text-blue-400 font-bold uppercase tracking-widest cursor-pointer hover:underline">Update</span>
            </h4>
            <div className="space-y-6">
              {[
                { label: 'Present', count: 142, color: 'bg-success-green' },
                { label: 'Absent', count: 12, color: 'bg-emergency-red' },
                { label: 'Late', count: 8, color: 'bg-warning-amber' }
              ].map((s, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-slate-400">{s.label}</span>
                    <span className="text-white">{s.count}</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${s.color}`} style={{ width: `${(s.count / 162) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 flex -space-x-4 items-center">
              {['DR', 'MS', 'AK', 'FZ', 'HN'].map((init, i) => (
                <div key={i} className={`w-12 h-12 rounded-full border-4 border-[#04111D] flex items-center justify-center text-xs text-white font-bold shadow-lg shadow-black/50 ${
                  i === 0 ? 'bg-indigo-600' : i === 1 ? 'bg-rose-600' : i === 2 ? 'bg-amber-600' : i === 3 ? 'bg-emerald-600' : 'bg-blue-600'
                }`}>
                  {init}
                </div>
              ))}
              <button className="w-12 h-12 rounded-full border-2 border-white/10 border-dashed bg-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:border-primary transition-all">
                <Plus size={20} />
              </button>
            </div>
          </section>

          <section className="glass-card p-8 rounded-[40px] border-none shadow-xl">
            <h4 className="text-xl font-sans font-bold text-white mb-8">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: PlusCircle, label: 'New Token' },
                { icon: Stethoscope, label: 'Add Doctor' },
                { icon: ShieldCheck, label: 'Attendance' },
                { icon: Download, label: 'Export Data' }
              ].map((act, i) => (
                <button key={i} className="flex flex-col items-center gap-4 p-6 bg-white/5 rounded-3xl hover:bg-white/10 transition-all border border-white/5 hover:border-primary/30 group">
                  <div className="text-slate-400 group-hover:text-primary transition-colors">
                    <act.icon size={24} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">{act.label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const StaffScreen = () => {
  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-5xl font-bold text-white tracking-tight leading-none">Staff Management</h2>
          <p className="text-slate-500 font-mono text-sm mt-3 uppercase tracking-[0.3em]">Monday, Oct 24 • Real-time Monitoring</p>
        </div>
        <button className="cta-gradient px-8 py-4 rounded-2xl text-white font-sans font-bold text-lg shadow-xl active:scale-95 transition-all flex items-center gap-3">
          <Plus size={24} /> Add New Staff
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Present', val: 142, color: 'text-success-green', icon: CheckCircle2 },
          { label: 'Absent', val: 12, color: 'text-emergency-red', icon: X },
          { label: 'Late', val: 8, color: 'text-warning-amber', icon: Clock },
          { label: 'On Leave', val: 5, color: 'text-blue-400', icon: Calendar }
        ].map((stat, i) => (
          <div key={i} className="glass-card p-8 rounded-[32px] space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stat.label}</span>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className={`text-5xl font-bold ${stat.color}`}>{stat.val < 10 ? `0${stat.val}` : stat.val}</p>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {['All Staff', 'Doctors', 'Nursing', 'Administration', 'Support'].map((tab, i) => (
            <button key={i} className={`flex-shrink-0 px-8 py-3 rounded-xl font-sans font-bold text-sm transition-all ${
              i === 0 ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            }`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {staffMembers.map(s => (
            <div key={s.id} className="glass-card p-6 rounded-[32px] flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border border-white/10">
                    <img src={s.imageUrl} alt={s.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success-green border-4 border-bg-dark flex items-center justify-center text-white">
                    <Check size={12} strokeWidth={4} />
                  </div>
                </div>
                <div>
                  <h4 className="font-sans font-bold text-xl text-white leading-tight">{s.name}</h4>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{s.role}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-700" />
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{s.shift} Shift</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  s.status === 'PRESENT' ? 'bg-success-green/10 text-success-green' : 'bg-warning-amber/10 text-warning-amber'
                }`}>
                  {s.status}
                </div>
                <p className="text-[10px] font-mono text-slate-600 font-bold uppercase">Check-in: 08:45 AM</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const GlobalStatsScreen = () => {
  return (
    <div className="space-y-12 max-w-7xl mx-auto py-12 px-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-6xl font-bold text-white tracking-tighter">Global Monitor</h2>
          <p className="text-slate-500 font-mono text-sm mt-4 uppercase tracking-[0.4em]">Real-time Platform Statistics</p>
        </div>
        <div className="flex gap-4">
          <button className="px-8 py-4 bg-white/5 rounded-2xl text-white font-sans font-bold border border-white/10 hover:bg-white/10 transition-all">Download Report</button>
          <button className="px-8 py-4 cta-gradient rounded-2xl text-white font-sans font-bold shadow-xl active:scale-95 transition-all">Manual Payout</button>
        </div>
      </header>

      <section className="glass-card p-12 rounded-[56px] relative overflow-hidden bg-gradient-to-br from-primary/20 via-bg-dark to-slate-900 border-none shadow-2xl">
        <div className="absolute -right-20 -top-20 opacity-10">
          <Activity size={400} strokeWidth={1} className="text-primary" />
        </div>
        <div className="space-y-4 relative z-10">
          <p className="font-mono text-sm text-blue-400 uppercase tracking-[0.4em] font-bold">PLATFORM REVENUE (NET)</p>
          <h2 className="text-8xl font-bold text-white tracking-tighter leading-none">Rs. 32.4M</h2>
          <div className="flex items-center gap-4 text-success-green text-xl font-bold mt-8">
            <div className="bg-success-green/10 p-2 rounded-xl">
              <ArrowRight size={24} className="-rotate-45" />
            </div>
            <span className="uppercase tracking-widest">+14.2% Growth This Month</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total Hospitals', val: 482, icon: Activity, color: 'text-primary' },
          { label: 'Live Tokens Today', val: '24.2k', icon: History, color: 'text-health-teal' },
          { label: 'Active Patients', val: '185k', icon: Users, color: 'text-indigo-400' },
          { label: 'System Uptime', val: '99.9%', icon: ShieldCheck, color: 'text-success-green' }
        ].map((stat, i) => (
          <div key={i} className="glass-card p-10 rounded-[40px] flex flex-col justify-between aspect-square group hover:bg-white/5 transition-all">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${stat.color.replace('text', 'bg')}/10 ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon size={32} />
            </div>
            <div>
              <h3 className="text-5xl font-bold text-white tracking-tighter leading-tight">{stat.val}</h3>
              <p className="font-mono text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-end px-4">
            <h3 className="text-3xl font-sans font-bold text-white">Facility Verification Queue</h3>
            <span className="text-blue-400 font-mono text-[10px] uppercase tracking-[0.3em] font-bold">4 Pending Approval</span>
          </div>
          
          <div className="space-y-4">
            {hospitals.map((h) => (
              <div key={h.id} className="glass-card p-8 rounded-[40px] space-y-8 group hover:bg-white/5 transition-all border-none shadow-xl">
                <div className="flex justify-between items-start">
                  <div className="flex gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-slate-800 flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-primary transition-all duration-500">
                      <img src={h.imageUrl} alt={h.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-sans font-bold text-2xl text-white tracking-tight">{h.name}</h4>
                        {h.verified && <CheckCircle2 size={24} className="text-blue-400" fill="currentColor" />}
                      </div>
                      <p className="text-slate-500 text-sm font-medium flex items-center gap-2 mt-2">
                        <MapPin size={16} /> {h.city}, Pakistan
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-success-green/10 px-4 py-2 rounded-xl border border-success-green/20">
                    <div className="w-2 h-2 rounded-full bg-success-green breathing-dot" />
                    <span className="text-[10px] font-bold text-success-green uppercase tracking-widest tracking-[0.2em]">Active</span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-6 border-y border-white/5">
                  <div className="text-center flex-1 border-r border-white/5">
                    <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-[0.3em] mb-2">Tokens Today</p>
                    <p className="text-3xl font-mono font-bold text-white">1,240</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-[0.3em] mb-2">Commission (15%)</p>
                    <p className="text-3xl font-mono font-bold text-success-green">Rs. 18,600</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10">Full View</button>
                  <button className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10">Approve</button>
                  <button className="flex-1 py-4 rounded-2xl bg-emergency-red/10 text-emergency-red font-bold text-sm uppercase tracking-widest border border-emergency-red/20 hover:bg-emergency-red/20 transition-all">Suspend</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="glass-card p-10 rounded-[48px] border-none shadow-xl">
            <h3 className="text-xl font-sans font-bold text-white mb-8 opacity-90">System Logs</h3>
            <div className="space-y-8 relative before:absolute before:left-2 before:top-4 before:bottom-4 before:w-[2px] before:bg-white/5">
              {[
                { type: 'Alert', title: 'Token Limit Triggered', desc: 'Gulshan Medical Clinic reached max capacity', time: '2m ago', color: 'bg-primary' },
                { type: 'Finance', title: 'Revenue Payout Sent', desc: 'Rs. 1,240,000 to 14 facilities', time: '15m ago', color: 'bg-success-green' },
                { type: 'Auth', title: 'New Registration', desc: 'Aga Khan Hospital - Branch 4', time: '1h ago', color: 'bg-indigo-400' }
              ].map((log, i) => (
                <div key={i} className="flex gap-6 relative z-10">
                  <div className={`w-4 h-4 rounded-full ${log.color} ring-8 ring-bg-dark shrink-0`} />
                  <div>
                    <p className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest mb-1">{log.type}</p>
                    <p className="text-sm text-white font-bold mb-1 leading-tight">{log.title}</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{log.desc}</p>
                    <p className="text-[10px] text-slate-600 font-mono font-bold mt-2">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-10 py-5 rounded-2xl border-2 border-white/5 text-slate-500 font-sans font-bold text-xs uppercase tracking-widest hover:text-white hover:border-white/20 transition-all">View All Logs</button>
          </div>

          <div className="glass-card p-10 rounded-[48px] border-none shadow-xl bg-gradient-to-br from-emergency-red/10 to-transparent">
             <h3 className="text-xl font-sans font-bold text-white mb-4">Critical Alerts</h3>
             <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">System identified 2 facilities with invalid medical licenses.</p>
             <button className="w-full py-5 rounded-2xl bg-emergency-red text-white font-sans font-bold text-lg shadow-2xl shadow-emergency-red/30 active:scale-95 transition-all">Take Action</button>
          </div>
        </section>
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const { currentUser, userData, logout } = useAuth();
  const [viewState, setViewState] = useState<'hero' | 'auth_choice' | 'hospital_reg' | 'patient_home' | 'admin_dashboard' | 'super_admin'>('hero');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Patient flow states
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isBookingFlow, setIsBookingFlow] = useState(false);

  useEffect(() => {
    if (currentUser && userData) {
      if (userData.role === 'Admin') {
        setViewState('admin_dashboard');
      } else if (userData.role === 'SuperAdmin') {
        setViewState('super_admin');
      } else {
        setViewState('patient_home');
      }
    }
  }, [currentUser, userData]);

  useEffect(() => {
    setIsDarkMode(viewState === 'admin_dashboard' || viewState === 'super_admin');
  }, [viewState]);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const renderCurrentView = () => {
    switch (viewState) {
      case 'hero':
        return (
          <div className="bg-white min-h-screen">
            <Header onLogoClick={() => setViewState('hero')} onSignUp={() => setViewState('auth_choice')} isLanding={true} />
            <HeroSection 
              onSignUp={() => setViewState('auth_choice')} 
              onLogin={() => setViewState('auth_choice')}
            />
            <HowItWorks />
            <Footer />
          </div>
        );
      case 'auth_choice':
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-8">
            <SignUpChoice onSelect={(type) => type === 'Hospital' ? setViewState('hospital_reg') : setViewState('patient_home')} />
            <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-xl flex flex-col items-center gap-6">
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Recommended</p>
              <button 
                onClick={handleGoogleSignIn}
                className="w-full py-4 px-8 border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-4 hover:border-primary transition-all font-sans font-bold text-slate-700"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
                Continue with Google
              </button>
            </div>
          </div>
        );
      case 'hospital_reg':
        return <HospitalRegistration onComplete={() => setViewState('admin_dashboard')} />;
      case 'admin_dashboard':
        return (
          <div className="flex bg-bg-dark text-white min-h-screen">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => setViewState('hero')} />
            <main className={`flex-1 transition-all duration-500 pl-72 pb-20`}>
              <Header 
                darkMode={true} 
                hospitalName="St. Mary's General" 
                showMenu={false} 
                onLogoClick={() => setViewState('hero')}
              />
              <div className="max-w-7xl mx-auto px-8 py-12">
                {activeTab === 'dashboard' && <DashboardOverview />}
                {activeTab === 'staff' && <StaffScreen />}
                {['doctors', 'attendance', 'tokens', 'revenue', 'export', 'notifications', 'settings'].includes(activeTab) && (
                  <div className="py-20 text-center text-slate-500 text-4xl font-bold uppercase tracking-widest opacity-20">
                    {activeTab} <br/>
                    <span className="text-sm font-sans font-medium lowercase tracking-normal">View In Development</span>
                  </div>
                )}
              </div>
            </main>
          </div>
        );
      case 'super_admin':
        return (
          <div className="bg-bg-dark min-h-screen">
             <GlobalStatsScreen />
          </div>
        );
      case 'patient_home':
        if (isBookingFlow && selectedDoctor) {
           return (
             <div className="bg-white min-h-screen">
               <Header darkMode={false} hospitalName="Xdoc" onLogoClick={() => { setIsBookingFlow(false); setViewState('patient_home'); }} />
               <ConfirmationPage doctor={selectedDoctor} />
             </div>
           );
        }
        if (selectedHospital) {
          return (
            <div className="bg-white min-h-screen">
              <Header darkMode={false} hospitalName="Xdoc" onLogoClick={() => setSelectedHospital(null)} />
              <HospitalDetailsPage 
                hospital={selectedHospital} 
                onBook={(doc) => {
                  setSelectedDoctor(doc);
                  setIsBookingFlow(true);
                }} 
              />
            </div>
          );
        }
        return (
          <div className="bg-[#faf8ff] min-h-screen pb-32">
            <Header darkMode={false} hospitalName="Xdoc" onLogoClick={() => setViewState('hero')} />
            <HospitalListPage onHospitalClick={(h) => setSelectedHospital(h)} />

            {/* Patient Bottom Navbar */}
            <nav className="fixed bottom-0 left-0 w-full z-[100] bg-white border-t border-slate-100 flex justify-around py-4">
               {[
                 { icon: Home, id: 'h' },
                 { icon: Search, id: 's' },
                 { icon: Calendar, id: 'c' },
                 { icon: User, id: 'p' }
               ].map(tab => (
                 <button key={tab.id} className="text-slate-400 hover:text-primary transition-colors">
                   <tab.icon size={24} />
                 </button>
               ))}
            </nav>
          </div>
        );
      default:
        return <HeroSection onSignUp={() => setViewState('auth_choice')} onLogin={() => setViewState('auth_choice')} />;
    }
  };

  return (
    <div className={`min-h-screen selection:bg-primary/20 ${isDarkMode ? 'bg-bg-dark' : 'bg-white'}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={viewState}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {renderCurrentView()}
        </motion.div>
      </AnimatePresence>

      {/* Floating Action Button for Testing Roles */}
      <div className="fixed bottom-24 right-10 z-[100] flex flex-col gap-4">
        {viewState !== 'super_admin' && (
          <button 
            onClick={() => setViewState('super_admin')}
            className="w-16 h-16 rounded-3xl bg-slate-900 border border-white/10 text-blue-400 shadow-2xl flex items-center justify-center hover:scale-110 transition-all group"
          >
            <ShieldAlert size={28} className="group-hover:rotate-12 transition-transform" />
          </button>
        )}
        {viewState === 'super_admin' && (
          <button 
            onClick={() => setViewState('hero')}
            className="w-16 h-16 rounded-3xl bg-primary text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-all"
          >
             <Home size={28} />
          </button>
        )}
      </div>
    </div>
  );
}

// ... Rest of the components (ConfirmationPage, HospitalListPage, etc.) would be integrated or refactored into this structure.
