import React, { useState, useEffect, useRef } from 'react';
import { BrandLogo } from './components/ui/BrandLogo';
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
  MessageCircle,
  Eye,
  EyeOff,
  Building2,
  Lock,
  Mail,
  Camera,
  Layers,
  ArrowLeft,
  UserPlus,
  Ticket,
  Trash2,
  Upload,
  Hospital as HospitalIcon,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { hospitals, doctors, staffMembers, queueTokens } from './mockData';
import { Hospital, Doctor, Staff, Token, HospitalType, PaymentMethod, StaffStatus } from './types';
import { useAuth } from './contexts/AuthContext';
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, addDoc, getDoc, serverTimestamp, getDocFromServer, collection, query, where, onSnapshot, getDocs, limit } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/firebaseUtils';
import { useLanguage } from './contexts/LanguageContext';
import { useToast } from './contexts/ToastContext';
import HospitalDashboard from './components/HospitalDashboard';
import PatientDashboard from './components/PatientDashboard';
import HospitalDetailPage from './components/HospitalDetailPage';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import BookingFlow from './components/BookingFlow';
import BookingSuccess from './components/BookingSuccess';
import OnboardingTour from './components/OnboardingTour';
import LoadingButton from './components/ui/LoadingButton';

import HomeRedesign from './components/HomeRedesign';
import HospitalRegistration from './components/HospitalRegistration';
import TokenTrackingPage from './components/TokenTrackingPage';
import HospitalLiveQueuePage from './components/HospitalLiveQueuePage';
import FooterPages from './components/FooterPages';
import PricingPage from './components/PricingPage';
import { SmartImage } from './components/ui/SmartImage';

// --- Splash Screen ---
const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center"
    >
      <motion.div 
        animate={{ scale: [1, 1.05, 1] }} 
        transition={{ repeat: Infinity, duration: 2 }}
        className="mb-8 filter drop-shadow-xl"
      >
        <BrandLogo size={96} />
      </motion.div>
      <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tighter mb-2">Xdoc</h2>
      <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Apna Doctor Dhundein</p>
      
      <div className="flex gap-2 mt-8">
        {[0, 1, 2].map(i => (
          <motion.div 
            key={i}
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
            className="w-2 h-2 rounded-full bg-primary"
          />
        ))}
      </div>
    </motion.div>
  );
};

// --- Page Progress Bar ---
const PageProgressBar = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div 
          initial={{ width: 0, opacity: 1 }}
          animate={{ width: isLoading ? '70%' : '100%' }}
          exit={{ width: '100%', opacity: 0 }}
          transition={{ 
            width: { duration: isLoading ? 0.8 : 0.2, ease: "easeInOut" },
            opacity: { duration: 0.2, delay: 0.2 }
          }}
          className="fixed top-0 left-0 h-[3px] bg-primary z-[2000] shadow-[0_0_10px_#00C9B1]"
        />
      )}
    </AnimatePresence>
  );
};

// --- Header Component ---

const Header = ({ darkMode = false, hospitalName = "Xdoc", onLogoClick, onSignUp, onLogin, isLanding = false, viewState, setViewState }: { darkMode?: boolean, hospitalName?: string, onToggleSidebar?: () => void, onLogoClick?: () => void, showMenu?: boolean, onSignUp?: () => void, onLogin?: () => void, isLanding?: boolean, viewState?: string, setViewState?: (v: any) => void }) => {
  const { userData, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  if (isLanding) {
    return (
      <>
        <header className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 h-20 flex items-center border-b ${
          isScrolled 
            ? 'bg-gradient-to-r from-white/50 via-sky-50/30 to-white/50 backdrop-blur-2xl border-slate-200/25 shadow-[0_12px_40px_rgba(11,95,255,0.04),_0_1px_2px_rgba(11,95,255,0.02)] h-[72px]' 
            : 'bg-transparent border-transparent'
        }`}>
          <div className="max-w-7xl mx-auto w-full px-4 md:px-6 flex justify-between items-center gap-4">
            {/* Left: Logo */}
            <div onClick={onLogoClick} className="flex items-center gap-2.5 cursor-pointer group shrink-0">
              <BrandLogo size={34} className="transition-transform group-hover:scale-105" />
              <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 bg-clip-text text-transparent">Xdoc</span>
            </div>

            {/* Center: Desktop Nav - Premium floating pill */}
            <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-100/40 backdrop-blur-md rounded-full border border-slate-200/30">
              <button 
                onClick={() => { setViewState('hero'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                className={`px-4 py-2 text-[11px] font-black uppercase tracking-wider transition-all duration-200 rounded-full ${
                  viewState === 'hero' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-slate-600 hover:text-primary'
                }`}
              >
                {t.nav?.home}
              </button>
              <button 
                onClick={() => {
                  if (viewState !== 'hero') {
                    setViewState('hero');
                    setTimeout(() => setViewState('auth_choice'), 100);
                  } else {
                    setViewState('auth_choice');
                  }
                }} 
                className={`px-4 py-2 text-[11px] font-black uppercase tracking-wider transition-all duration-200 rounded-full ${
                  viewState === 'auth_choice' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-slate-600 hover:text-primary'
                }`}
              >
                {t.nav?.findHospital}
              </button>
              <button 
                onClick={() => {
                  if (viewState !== 'hero') setViewState('hero');
                  setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 100);
                }} 
                className="px-4 py-2 text-[11px] font-black uppercase tracking-wider text-slate-600 hover:text-primary transition-all duration-200 rounded-full"
              >
                {t.nav?.about}
              </button>
              <button 
                onClick={() => {
                  setViewState?.('pricing');
                }} 
                className={`px-4 py-2 text-[11px] font-black uppercase tracking-wider transition-all duration-200 rounded-full ${
                  viewState === 'pricing' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-slate-600 hover:text-primary'
                }`}
              >
                {language === 'EN' ? 'Pricing' : 'قیمت'}
              </button>
            </nav>
            
            {/* Right: Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={() => setLanguage(language === 'EN' ? 'UR' : 'EN')}
                className="hidden sm:flex px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 transition-all duration-200"
              >
                {language === 'EN' ? 'اردو' : 'English'}
              </button>

              {!userData ? (
                <>
                  <button 
                    onClick={onLogin}
                    className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 hover:text-slate-900 active:scale-95 transition-all duration-200"
                  >
                    {t.nav?.login}
                  </button>
                  <button 
                    onClick={onSignUp}
                    className="hidden sm:block px-5 py-2.5 rounded-2xl bg-[#0B5FFF] hover:bg-[#0B5FFF]/90 text-white text-[11px] font-black uppercase tracking-wider shadow-lg shadow-[#0B5FFF]/20 active:scale-95 transition-all duration-300"
                  >
                    {t.nav?.signUpFree}
                  </button>
                  <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="hidden p-2 text-slate-600 hover:bg-slate-100/50 rounded-xl transition-colors"
                  >
                    {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-xs font-bold text-slate-900">{userData.displayName}</p>
                    <p className="text-[10px] text-slate-400 capitalize font-medium mt-0.5">{userData.role.replace('_', ' ')}</p>
                  </div>
                  <button 
                    onClick={() => logout()}
                    className="w-10 h-10 rounded-2xl border border-slate-200 overflow-hidden relative group"
                  >
                    <img src={userData.photoURL || "https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=200"} alt="Profile" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                      <LogOut size={14} className="text-white" />
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Floating Glassmobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-20 left-4 right-4 z-[90] bg-white/75 backdrop-blur-2xl border border-slate-200/40 p-6 md:hidden rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.12)]"
            >
              <nav className="flex flex-col gap-1">
                <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-bold text-sm uppercase tracking-wider">{t.nav?.home}</a>
                <a href="#" onClick={() => { setIsMobileMenuOpen(false); onLogoClick?.(); }} className="px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-bold text-sm uppercase tracking-wider">{t.nav?.findHospital}</a>
                <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-bold text-sm uppercase tracking-wider">{t.nav?.about}</a>
                <a href="#pricing" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); setViewState?.('pricing'); }} className="px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-bold text-sm uppercase tracking-wider">{language === 'EN' ? 'Pricing' : 'قیمت'}</a>
                <div className="h-px bg-slate-200/40 my-3" />
                <button 
                   onClick={() => { setLanguage(language === 'EN' ? 'UR' : 'EN'); setIsMobileMenuOpen(false); }}
                   className="w-full text-left px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-bold text-sm uppercase tracking-wider"
                >
                  {language === 'EN' ? 'Urdu Language' : 'انگریزی زبان'}
                </button>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); onLogin?.(); }}
                    className="py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider text-slate-700 bg-slate-100 hover:bg-slate-200/60 active:scale-95 transition-all"
                  >
                    {t.nav?.login}
                  </button>
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); onSignUp?.(); }}
                    className="py-3.5 rounded-2xl bg-[#0B5FFF] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#0B5FFF]/20 active:scale-95 transition-all"
                  >
                    {t.nav?.signUpFree}
                  </button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <header className={`flex justify-between items-center w-full px-6 py-4 sticky top-0 z-[60] backdrop-blur-2xl border-b transition-all duration-300 ${
      darkMode 
        ? 'bg-[#0B1D35]/70 border-white/10 text-white' 
        : 'bg-gradient-to-r from-white/50 via-sky-50/30 to-white/50 border-slate-200/25 text-slate-900 shadow-[0_8px_30px_rgba(11,95,255,0.03)]'
    }`}>
      <div className="flex items-center gap-4">
        <div onClick={onLogoClick} className="flex items-center gap-3 cursor-pointer group">
          <BrandLogo size={34} className="transition-transform group-hover:scale-105" />
          <h1 className="text-xl font-bold tracking-tight uppercase whitespace-nowrap">{hospitalName}</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-3 md:gap-5">
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100/60 dark:bg-white/5 rounded-full border border-slate-200/30 dark:border-white/10">
          <div className="w-2 h-2 rounded-full bg-success-green breathing-dot" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Live Status</span>
        </div>
        
        <button className="relative p-2.5 rounded-xl hover:bg-slate-100/60 dark:hover:bg-white/5 transition-colors">
          <Bell size={20} className={darkMode ? 'text-slate-400' : 'text-slate-600'} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emergency-red rounded-full ring-2 ring-white dark:ring-slate-900" />
        </button>

        <div className={`flex items-center gap-3 pl-3 md:pl-5 border-l ${darkMode ? 'border-white/10' : 'border-slate-200/40'}`}>
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


// --- Auth & Onboarding Components ---

const LoginPage = ({ onLoginSuccess, onSignUpClick, onForgotPasswordClick }: { onLoginSuccess: (role: string) => void, onSignUpClick: (type: 'Hospital' | 'Patient') => void, onForgotPasswordClick: () => void }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ email?: string; password?: string; general?: string }>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({});
    
    if (!email || !password) {
      setError({ general: t.auth.emptyFields });
      return;
    }

    setLoading(true);
    try {
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (signInErr: any) {
        // Special case: Auto-create demo accounts if they don't exist
        // Handles both legacy (user-not-found) and modern (invalid-credential) error codes
        const isDemoAdmin = email === 'admin@xdoc.pk' && password === 'Admin@123';
        const isDemoPatient = email === 'patient@xdoc.pk' && password === 'Patient@123';

        if ((signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') && 
            (isDemoAdmin || isDemoPatient)) {
          try {
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Create the Firestore document if it's a new demo user
            if (isDemoPatient) {
              await setDoc(doc(db, 'users', userCredential.user.uid), {
                uid: userCredential.user.uid,
                name: 'Demo Patient',
                email: 'patient@xdoc.pk',
                role: 'patient',
                status: 'Active',
                createdAt: serverTimestamp(),
                profile: {
                  name: 'Demo Patient',
                  phone: '03001234567',
                  city: 'Karachi',
                  area: 'Gulshan-e-Iqbal'
                }
              });
            }
          } catch (createErr: any) {
            // If creation fails (e.g. email exists but password was wrong), throw the original sign-in error
            throw signInErr;
          }
        } else {
          throw signInErr;
        }
      }
      
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.status === 'Under Review' && (userData.role === 'Admin' || userData.role === 'hospital_admin')) {
           setError({ general: t.auth.underReview });
           setLoading(false);
           return;
        }
        
        let role = userData.role;
        if (role === 'Admin' || role === 'hospital_admin') {
          // Fetch hospitals/{uid} to check isBlocked field
          const hospDoc = await getDoc(doc(db, 'hospitals', user.uid));
          if (hospDoc.exists() && hospDoc.data().isBlocked === true) {
            await signOut(auth);
            setError({ general: "Your account has been blocked. Please contact Xdoc support." });
            setLoading(false);
            return;
          }
          role = 'hospital_admin';
        }
        else if (role === 'SuperAdmin' || role === 'super_admin' || role === 'superadmin') role = 'super_admin';
        else role = 'patient';

        onLoginSuccess(role);
      } else {
        // Fallback for demo users if doc doesn't exist but auth succeeded
        if (email === 'admin@xdoc.pk') {
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            name: 'Super Admin',
            email: 'admin@xdoc.pk',
            role: 'super_admin',
            status: 'active',
            approved: true,
            createdAt: serverTimestamp()
          });
          onLoginSuccess('super_admin');
        } else if (email === 'patient@xdoc.pk') {
          const patientData = {
            uid: user.uid,
            email: 'patient@xdoc.pk',
            role: 'patient',
            status: 'Active',
            createdAt: serverTimestamp(),
            profile: {
              name: 'Demo Patient',
              phone: '03001234567',
              city: 'Karachi',
              area: 'Gulshan-e-Iqbal'
            }
          };
          await setDoc(doc(db, 'users', user.uid), patientData);
          onLoginSuccess('patient');
        } else {
          setError({ general: 'User profile not found.' });
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const code = err.code || '';
      const message = err.message || '';
      
      if (code === 'auth/user-not-found' || code === 'auth/invalid-email' || code === 'auth/invalid-credential' || message.includes('invalid-credential')) {
        setError({ general: t.auth.invalidCredential });
      } else if (code === 'auth/email-already-in-use' || message.includes('email-already-in-use')) {
        setError({ general: t.auth.emailAlreadyInUse });
      } else if (code === 'auth/wrong-password' || message.includes('wrong-password')) {
        setError({ password: t.auth.incorrectPassword });
      } else if (code === 'auth/network-request-failed' || message.includes('network-request-failed')) {
        setError({ general: t.auth.networkError });
      } else if (code === 'auth/too-many-requests' || message.includes('too-many-requests')) {
        setError({ general: t.auth.tooManyRequests });
      } else {
        setError({ general: message || 'Login failed. Please check your credentials.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        let role = userData.role;
        if (role === 'Admin' || role === 'hospital_admin') {
          // Fetch hospitals/{uid} to check isBlocked field
          const hospDoc = await getDoc(doc(db, 'hospitals', user.uid));
          if (hospDoc.exists() && hospDoc.data().isBlocked === true) {
            await signOut(auth);
            toast.error("Your account has been blocked. Please contact Xdoc support.");
            return;
          }
          role = 'hospital_admin';
        }
        else if (role === 'SuperAdmin' || role === 'super_admin' || role === 'superadmin') role = 'super_admin';
        else role = 'patient';
        onLoginSuccess(role);
      } else {
        onSignUpClick('Patient');
      }
    } catch (error: any) {
      handleFirestoreError(error, OperationType.GET, `users/${auth.currentUser?.uid}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
       <motion.div 
         initial={{ opacity: 0, y: 30 }}
         animate={{ opacity: 1, y: 0 }}
         className="w-full max-w-[480px] bg-white rounded-[48px] shadow-2xl shadow-slate-200/60 p-8 md:p-12 relative overflow-hidden border border-slate-100"
       >
         <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#0B5FFF] to-[#00C9B1]" />
         
         <div className="flex flex-col items-center mb-10 text-center">
            <div className="mb-6 filter drop-shadow-xl cursor-pointer group">
              <BrandLogo size={80} className="transition-transform group-hover:scale-105" />
            </div>
           <h2 className="text-4xl font-display font-bold text-slate-900 tracking-tight">{t.auth.loginTitle}</h2>
           <p className="text-slate-500 font-medium mt-3">{t.auth.loginSubTitle}</p>
         </div>

         <form onSubmit={handleLogin} className="space-y-6">
           <div className="space-y-2">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] pl-2">{t.signup.labels.email}</label>
             <div className="relative group">
               <input 
                 type="email" 
                 placeholder="yourname@example.com" 
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className={`w-full pl-14 pr-6 py-4.5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium transition-all group-hover:bg-slate-100/50 ${error.email ? 'ring-2 ring-[#FF3B5C] bg-red-50/30' : ''}`}
               />
               <Mail className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${error.email ? 'text-[#FF3B5C]' : 'text-slate-400 group-focus-within:text-primary'}`} size={22} />
             </div>
             {error.email && <p className="text-[#FF3B5C] text-xs font-bold pl-2 mt-1">{error.email}</p>}
           </div>

           <div className="space-y-2">
             <div className="flex justify-between items-center px-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{t.signup.labels.password}</label>
               <button 
                 type="button" 
                 onClick={onForgotPasswordClick}
                 className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest"
               >
                 {t.auth.forgotPassword}
               </button>
             </div>
             <div className="relative group">
               <input 
                 type={showPassword ? "text" : "password"} 
                 placeholder="••••••••" 
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className={`w-full pl-14 pr-14 py-4.5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium transition-all group-hover:bg-slate-100/50 ${error.password ? 'ring-2 ring-[#FF3B5C] bg-red-50/30' : ''}`}
               />
               <Lock className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${error.password ? 'text-[#FF3B5C]' : 'text-slate-400 group-focus-within:text-primary'}`} size={22} />
               <button 
                 type="button"
                 onClick={() => setShowPassword(!showPassword)}
                 className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
               >
                 {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
               </button>
             </div>
             {error.password && <p className="text-[#FF3B5C] text-xs font-bold pl-2 mt-1">{error.password}</p>}
           </div>

           <div className="flex items-center gap-3 px-2">
             <input 
               type="checkbox" 
               id="remember"
               checked={rememberMe}
               onChange={(e) => setRememberMe(e.target.checked)}
               className="w-5 h-5 rounded-lg text-primary focus:ring-primary cursor-pointer border-slate-300" 
             />
             <label htmlFor="remember" className="text-sm font-bold text-slate-600 cursor-pointer select-none">{t.auth.rememberMe}</label>
           </div>

           {error.general && (
             <motion.div 
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-[#FF3B5C]"
             >
               <AlertTriangle size={18} />
               <p className="text-xs font-bold">{error.general}</p>
             </motion.div>
           )}

           <button 
             type="submit"
             disabled={loading}
             className="w-full py-5 bg-gradient-to-r from-[#0B5FFF] to-[#00C9B1] text-white font-display font-bold text-xl rounded-[24px] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:scale-100"
           >
             {loading ? (
               <div className="flex items-center gap-3">
                 <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                 <span>{t.auth.loggingIn}</span>
               </div>
             ) : (
               <>{t.auth.loginBtn} <ArrowRight size={22} /></>
             )}
           </button>
         </form>

         <div className="my-10 flex items-center gap-4">
           <div className="flex-1 h-[1px] bg-slate-100" />
           <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">OR</span>
           <div className="flex-1 h-[1px] bg-slate-100" />
         </div>

         <button 
           onClick={handleGoogleLogin}
           className="w-full py-4.5 px-8 border-2 border-slate-100 rounded-[24px] flex items-center justify-center gap-4 hover:border-primary/30 hover:bg-slate-50 transition-all font-sans font-bold text-slate-700 bg-white group"
         >
           <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6 group-hover:scale-110 transition-transform" />
           {t.auth.googleBtn}
         </button>

         <div className="mt-12 text-center space-y-6">
           <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t.auth.noAccount}</p>
           <div className="flex flex-col gap-4 max-w-[320px] mx-auto">
             <button 
               onClick={() => onSignUpClick('Hospital')}
               className="w-full py-4 rounded-2xl bg-primary/5 text-primary font-bold text-sm hover:bg-primary hover:text-white transition-all shadow-sm border border-primary/10"
             >
               {t.auth.signUpHospital}
             </button>
             <button 
               onClick={() => onSignUpClick('Patient')}
               className="text-full py-4 rounded-2xl bg-health-teal/5 text-health-teal font-bold text-sm hover:bg-health-teal hover:text-white transition-all shadow-sm border border-health-teal/10"
             >
               {t.auth.signUpPatient}
             </button>
           </div>
         </div>
       </motion.div>
    </div>
  );
};

const ForgotPasswordModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(t.signup.errors.required);
      return;
    }
    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      setError(t.auth.emailNotFound || 'Failed to send reset link. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-8 md:p-12 relative border border-slate-100"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-3 text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 rounded-2xl"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-inner shadow-primary/5">
            <Lock size={36} />
          </div>
          <h3 className="text-3xl font-display font-bold text-slate-900 tracking-tight">{t.auth.forgotPassword}</h3>
          <p className="text-slate-500 font-medium mt-3">Enter your email and we'll send you instructions to reset your password.</p>
        </div>

        {success ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            <div className="p-8 bg-success-green/5 rounded-[32px] border-2 border-success-green/10">
              <CheckCircle2 className="mx-auto text-success-green mb-4" size={48} />
              <p className="text-lg font-bold text-success-green leading-tight">Password reset link sent to your email</p>
              <p className="text-xs text-slate-500 mt-2">Please check your inbox (and spam folder).</p>
            </div>
            <button 
              onClick={onClose}
              className="w-full py-5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl"
            >
              Back to Login
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Email Address</label>
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-6 py-4.5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium transition-all group-hover:bg-slate-100/50 shadow-sm" 
                />
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={22} />
              </div>
              {error && <p className="text-[#FF3B5C] text-xs font-bold pl-2 mt-1">{error}</p>}
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-primary text-white font-display font-bold text-xl rounded-[24px] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center disabled:opacity-70 disabled:scale-100"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t.auth.loggingIn}</span>
                </div>
              ) : (
                <>Send Reset Link <ArrowRight size={22} className="ml-2" /></>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
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

const PatientRegistration = ({ onComplete, onLoginClick }: { onComplete: () => void, onLoginClick: () => void }) => {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const isUrdu = language === 'UR';

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    gender: 'Male',
    city: 'Karachi'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Quetta', 'Multan', 'Faisalabad', 'Hyderabad', 'Other'];

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.email || !formData.password) {
      toast.error(isUrdu ? "برائے مہربانی تمام فیلڈز پُر کریں۔" : "Please fill all fields");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      const patientData = {
        uid: user.uid,
        email: formData.email,
        role: 'patient',
        status: 'Active',
        createdAt: serverTimestamp(),
        profile: {
          name: formData.fullName,
          phone: formData.phone,
          gender: formData.gender,
          city: formData.city,
          whatsappNotifications: true,
          emailNotifications: true,
        }
      };

      await setDoc(doc(db, 'users', user.uid), patientData);
      toast.success(isUrdu ? "میرا اکاؤنٹ بنایا گیا!" : "Account Created Successfully!");
      setTimeout(() => onComplete(), 1500);
    } catch (err: any) {
      console.error(err);
      const code = err.code || '';
      const message = err.message || '';
      
      // Default generic message
      let errorMsg = isUrdu ? "رجسٹریشن میں غلطی ہوئی۔ دوبارہ کوشش کریں۔" : "Registration failed. Please try again.";

      if (code === 'auth/email-already-in-use' || message.includes('email-already-in-use')) {
        errorMsg = (
          <span>
            {t.auth.emailAlreadyInUse}. {' '}
            <button 
              onClick={() => {
                onLoginClick();
                toast.dismiss();
              }}
              className="underline font-bold"
            >
              {isUrdu ? "لاگ ان کریں" : "Login instead"}
            </button>
          </span>
        );
      } else if (code === 'auth/weak-password' || message.includes('weak-password')) {
        errorMsg = t.errors.weakPassword || (isUrdu ? "پاس ورڈ کم از کم 6 حروف کا ہونا چاہیے۔" : "Password should be at least 6 characters.");
      } else if (code === 'auth/invalid-email' || message.includes('invalid-email')) {
        errorMsg = t.auth.invalidEmail;
      } else if (code === 'auth/network-request-failed' || message.includes('network-request-failed')) {
        errorMsg = t.auth.networkError;
      } else if (message) {
        // Fallback to raw message if it's not a known auth error but exists
        errorMsg = message;
      }
      
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-6 font-sans">
      <div className="max-w-[500px] mx-auto text-center">
        <h1 className="text-3xl font-bold text-[#0B1D35] mb-2 tracking-tight">
          {isUrdu ? 'نیا اکاؤنٹ بنائیں' : 'Create My Account'}
        </h1>
        <p className="text-[#64748B] font-medium mb-10">
          {isUrdu ? 'ہیلتھ کیئر آپ کی انگلیوں پر' : 'Healthcare at your fingertips'}
        </p>

        <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-8 text-left">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-medium text-[13px] text-[#374151] mb-1.5">{isUrdu ? 'پورا نام' : 'Full Name'}</label>
              <input 
                type="text" 
                placeholder="John Doe"
                required
                value={formData.fullName}
                onChange={e => handleChange('fullName', e.target.value)}
                className="w-full h-12 border-[1.5px] border-[#E2E8F0] rounded-lg px-4 text-sm focus:outline-none focus:border-[#0B5FFF]" 
              />
            </div>

            <div>
              <label className="block font-medium text-[13px] text-[#374151] mb-1.5">{isUrdu ? 'فون نمبر' : 'Phone Number'}</label>
              <input 
                type="tel" 
                placeholder="03XX-XXXXXXX"
                required
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
                className="w-full h-12 border-[1.5px] border-[#E2E8F0] rounded-lg px-4 text-sm focus:outline-none focus:border-[#0B5FFF]" 
              />
            </div>

            <div>
              <label className="block font-medium text-[13px] text-[#374151] mb-1.5">{isUrdu ? 'ای میل' : 'Email Address'}</label>
              <input 
                type="email" 
                placeholder="email@example.com"
                required
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                className="w-full h-12 border-[1.5px] border-[#E2E8F0] rounded-lg px-4 text-sm focus:outline-none focus:border-[#0B5FFF]" 
              />
            </div>

            <div>
              <label className="block font-medium text-[13px] text-[#374151] mb-1.5">{isUrdu ? 'پاس ورڈ' : 'Password'}</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 6 characters"
                  required
                  value={formData.password}
                  onChange={e => handleChange('password', e.target.value)}
                  className="w-full h-12 border-[1.5px] border-[#E2E8F0] rounded-lg px-4 text-sm focus:outline-none focus:border-[#0B5FFF]" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -track-y-1/2 text-slate-400 p-1 mt-[-10px]">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-medium text-[13px] text-[#374151] mb-1.5">{isUrdu ? 'صنف' : 'Gender'}</label>
              <div className="flex gap-4">
                {['Male', 'Female'].map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleChange('gender', g)}
                    className={`flex-1 h-12 rounded-lg font-bold transition-all border-2 ${
                      formData.gender === g ? 'bg-[#0B5FFF]/5 border-[#0B5FFF] text-[#0B5FFF]' : 'bg-white border-[#E2E8F0] text-slate-500'
                    }`}
                  >
                    {isUrdu ? (g === 'Male' ? 'مرد' : 'عورت') : g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-medium text-[13px] text-[#374151] mb-1.5">{isUrdu ? 'شہر' : 'City'}</label>
              <select 
                value={formData.city}
                onChange={e => handleChange('city', e.target.value)}
                className="w-full h-12 border-[1.5px] border-[#E2E8F0] rounded-lg px-4 text-sm focus:outline-none focus:border-[#0B5FFF] bg-white appearance-none cursor-pointer"
              >
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-[52px] bg-[#0B5FFF] text-white font-bold text-base rounded-[10px] shadow-lg shadow-blue-500/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:scale-100"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                isUrdu ? 'میرا اکاؤنٹ بنائیں' : 'Create My Account'
              )}
            </button>

            <p className="text-center text-sm text-[#64748B] font-medium">
              {isUrdu ? 'پہلے سے اکاؤنٹ ہے؟ ' : 'Already have an account? '} 
              <span onClick={onComplete} className="text-[#0B5FFF] font-bold cursor-pointer hover:underline">
                {isUrdu ? 'لاگ ان کریں' : 'Login here'}
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};


// --- Pages ---

// --- App View State ---

// --- Hospital List ---

const HospitalListPage = ({ hospitals, onHospitalClick }: { hospitals: any[], onHospitalClick: (h: any) => void }) => {
  const { t } = useLanguage();
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
              {hospitals.length === 0 ? (
                <div className="bg-white p-20 rounded-[40px] text-center border-2 border-dashed border-slate-200">
                  <HospitalIcon size={64} className="mx-auto text-slate-200 mb-6" />
                  <p className="text-2xl font-bold text-slate-400 font-urdu">{t.dashboard.noHospitals}</p>
                </div>
              ) : (
                hospitals.map(h => (
                  <motion.div 
                    layout
                    key={h.id} 
                    onClick={() => onHospitalClick(h)}
                    className="group bg-white rounded-[40px] overflow-hidden shadow-sm border border-slate-100 hover:shadow-2xl hover:border-primary/20 transition-all cursor-pointer flex flex-col md:flex-row"
                  >
                    <div className="md:w-72 lg:w-80 h-72 md:h-auto relative overflow-hidden">
                      <img src={h.photo || h.imageUrl || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80"} alt={h.hospitalName || h.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-6 left-6 bg-white/95 backdrop-blur px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xl border border-slate-100">
                        <div className="w-2 h-2 bg-health-teal rounded-full breathing-dot" />
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#005046]">Open Now</span>
                      </div>
                    </div>
                    <div className="p-8 md:p-12 flex-1 flex flex-col">
                      <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight leading-none">{h.hospitalName || h.name}</h3>
                            {h.verified && <CheckCircle2 size={20} className="text-[#0B5FFF]" fill="currentColor" />}
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <MapPin size={16} />
                            <span className="text-sm font-bold">{h.area || h.address}, {h.city}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-2xl border border-amber-100/50 shadow-sm self-start md:self-auto">
                          <Star size={18} fill="currentColor" />
                          <span className="font-bold text-lg leading-none">{h.rating || 4.8}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-10">
                        <div className="bg-[#0B5FFF]/5 text-[#0B5FFF] px-4 py-2 rounded-xl flex items-center gap-2 border border-[#0B5FFF]/10">
                          <Building2 size={16} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{h.type || h.hospitalType || h.category || 'PRIVATE'}</span>
                        </div>
                        {(h.specializations || h.specs || []).slice(0, 3).map((spec: string, i: number) => (
                          <span key={i} className="bg-slate-50 text-slate-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100">{spec}</span>
                        ))}
                      </div>

                      <div className="mt-auto flex flex-col sm:flex-row items-center justify-between pt-10 border-t border-slate-50 gap-6">
                        <div className="text-center sm:text-left">
                          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Consultation start at</p>
                          <p className="text-3xl font-black text-slate-900">Rs. {(parseInt(h.opdFee || h.startingFee) || 1500).toLocaleString()} <span className="text-sm font-medium text-slate-400">/visit</span></p>
                        </div>
                        <button className="w-full sm:w-auto bg-[#0B5FFF] text-white font-bold px-12 py-5 rounded-[22px] shadow-xl shadow-blue-500/20 hover:bg-blue-600 active:scale-95 transition-all text-base uppercase tracking-widest">
                          Book Now
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
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

const ConfirmationPage = ({ doctor, token }: { doctor: Doctor, token?: any }) => (
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
        <BrandLogo size={300} />
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
              <span className="font-mono">{token?.tokenNumber || '0047'}</span>
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
              <p className="font-mono font-bold text-slate-900">
                {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date())}
              </p>
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Appointment</p>
              <p className="font-mono font-bold text-slate-900">10:30 AM — 11:00 AM</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Fee</p>
              <p className="font-mono font-bold text-health-teal uppercase tracking-wider">Rs. {token?.fee || doctor.fee}</p>
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
          <BrandLogo size={400} />
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
          { label: 'Total Hospitals', val: 482, icon: Building2, color: 'text-primary' },
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
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { currentUser, userData, logout } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);
  // Real State hook definitions (Raw inputs)
  const [viewState, setViewStateRaw] = useState<'hero' | 'login' | 'auth_choice' | 'hospital_reg' | 'patient_reg' | 'patient_home' | 'admin_dashboard' | 'super_admin' | 'privacy' | 'terms' | 'contact' | 'about' | 'content_policy' | 'category' | 'doctor_profile' | 'pricing'>('hero');
  const [activeTab, setActiveTab ] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen ] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen ] = useState(false);
  const [showOnboarding, setShowOnboarding ] = useState(false);
  
  const [deepLinkTokenId, setDeepLinkTokenId] = useState<string | null>(null);
  const [deepLinkLiveHospitalId, setDeepLinkLiveHospitalId] = useState<string | null>(null);
  const [patientPreferredTab, setPatientPreferredTabRaw] = useState<'hospitals' | 'history' | 'profile'>('hospitals');
  const [landingSearchQuery, setLandingSearchQuery] = useState('');

  // Suffix state declarations for category and doctor
  const [categoryType, setCategoryType] = useState<string | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  // Patient flow states
  const [selectedHospital, setSelectedHospitalRaw] = useState<Hospital | any | null>(null);
  const [selectedDoctor, setSelectedDoctorRaw] = useState<Doctor | any | null>(null);
  const [isBookingFlow, setIsBookingFlowRaw] = useState(false);
  const [fetchedHospitals, setFetchedHospitals] = useState<any[]>([]);
  const [loginPrompt, setLoginPrompt ] = useState(false);
  const [lastCreatedToken, setLastCreatedTokenRaw] = useState<any>(null);

  // Unified Navigation Stack Helper (mimicking react-router-dom navigate)
  const navigate = (path: string, replace = false) => {
    if (replace) {
      window.history.replaceState(null, '', path);
    } else {
      window.history.pushState(null, '', path);
    }
    // Dispatch popstate event to let our listener update state instantly
    window.dispatchEvent(new Event('popstate'));
  };

  // Wrapped triggers that automatically map changes in React state directly to browser history / URL
  const setViewState = (state: typeof viewState) => {
    let targetPath = `?view=${state}`;
    if (state === 'hero') targetPath = '?view=home';
    else if (state === 'pricing') {
      targetPath = '/pricing';
    }
    else if (state === 'login') {
      const searchParam = landingSearchQuery ? `&search=${encodeURIComponent(landingSearchQuery)}` : '';
      targetPath = `?view=login${searchParam}`;
    }
    else if (state === 'patient_home') {
      const tabVal = patientPreferredTab === 'history' ? 'tokens' : patientPreferredTab;
      targetPath = `?view=patient_home&tab=${tabVal}`;
    }
    
    navigate(targetPath);
  };

  const setPatientPreferredTab = (tab: typeof patientPreferredTab) => {
    const tabVal = tab === 'history' ? 'tokens' : tab;
    navigate(`?view=patient_home&tab=${tabVal}`);
  };

  const setSelectedHospital = (h: Hospital | any | null) => {
    if (h) {
      navigate(`?view=hospital&id=${h.id}`);
    } else {
      const tabVal = patientPreferredTab === 'history' ? 'tokens' : patientPreferredTab;
      navigate(`?view=patient_home&tab=${tabVal}`);
    }
  };

  const setSelectedDoctor = (d: Doctor | any | null) => {
    if (d) {
      const hospParam = selectedHospital ? `&hosp=${selectedHospital.id}` : '';
      navigate(`?view=doctor&id=${d.id}${hospParam}`);
    } else if (selectedHospital) {
      navigate(`?view=hospital&id=${selectedHospital.id}`);
    } else {
      const tabVal = patientPreferredTab === 'history' ? 'tokens' : patientPreferredTab;
      navigate(`?view=patient_home&tab=${tabVal}`);
    }
  };

  const setIsBookingFlow = (val: boolean) => {
    if (val && selectedHospital && selectedDoctor) {
      navigate(`?view=doctor&id=${selectedDoctor.id}&hosp=${selectedHospital.id}&book=true`);
    } else if (!val && selectedHospital && selectedDoctor) {
      navigate(`?view=doctor&id=${selectedDoctor.id}&hosp=${selectedHospital.id}`);
    } else if (selectedHospital) {
      navigate(`?view=hospital&id=${selectedHospital.id}`);
    } else {
      const tabVal = patientPreferredTab === 'history' ? 'tokens' : patientPreferredTab;
      navigate(`?view=patient_home&tab=${tabVal}`);
    }
  };

  const setLastCreatedToken = (token: any) => {
    if (token) {
      navigate(`?view=booking_success&id=${token.id || token}`);
    } else {
      navigate('?view=patient_home&tab=tokens');
    }
  };

  // Universal URL & popstate Sync Logic
  const handleUrlRouting = () => {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    
    // Sync search parameter
    const urlSearch = searchParams.get('search');
    if (urlSearch !== null) {
      setLandingSearchQuery(urlSearch);
    }

    // 1. Check legacy deep links and paths first, and translate them to synchronous query parameters
    let viewQuery = searchParams.get('view');
    let tabQuery = searchParams.get('tab');
    let typeQuery = searchParams.get('type');
    let idQuery = searchParams.get('id');
    let bHospQuery = searchParams.get('hosp');

    if (path !== '/' && path !== '/index.html') {
      const tokenMatch = path.match(/^\/token\/([^/]+)$/);
      const liveMatch = path.match(/^\/hospital\/([^/]+)\/live$/);
      const hospMatch = path.match(/^\/hospital\/([^/]+)$/);
      const bookingMatch = path.match(/^\/hospital\/([^/]+)\/book\/([^/]+)$/);
      const successMatch = path.match(/^\/token\/([^/]+)\/success$/);

      if (tokenMatch) {
        setDeepLinkTokenId(tokenMatch[1]);
        setDeepLinkLiveHospitalId(null);
        return;
      } else if (liveMatch) {
         setDeepLinkLiveHospitalId(liveMatch[1]);
         setDeepLinkTokenId(null);
         return;
      } else if (hospMatch) {
        const hospId = hospMatch[1];
        const newUrl = `?view=hospital&id=${hospId}`;
        window.history.replaceState(null, '', newUrl);
        viewQuery = 'hospital';
        idQuery = hospId;
      } else if (bookingMatch) {
        const hospId = bookingMatch[1];
        const docId = bookingMatch[2];
        const newUrl = `?view=doctor&id=${docId}&hosp=${hospId}&book=true`;
        window.history.replaceState(null, '', newUrl);
        viewQuery = 'doctor';
        idQuery = docId;
        bHospQuery = hospId;
      } else if (successMatch) {
        const tokId = successMatch[1];
        const newUrl = `?view=booking_success&id=${tokId}`;
        window.history.replaceState(null, '', newUrl);
        viewQuery = 'booking_success';
        idQuery = tokId;
      } else if (path === '/pricing') {
        window.history.replaceState(null, '', '?view=pricing');
        viewQuery = 'pricing';
      } else if (path === '/privacy-policy') {
        window.history.replaceState(null, '', '?view=privacy');
        viewQuery = 'privacy';
      } else if (path === '/terms') {
        window.history.replaceState(null, '', '?view=terms');
        viewQuery = 'terms';
      } else if (path === '/contact') {
        window.history.replaceState(null, '', '?view=contact');
        viewQuery = 'contact';
      } else if (path === '/about') {
        window.history.replaceState(null, '', '?view=about');
        viewQuery = 'about';
      } else if (path === '/content-policy') {
        window.history.replaceState(null, '', '?view=content_policy');
        viewQuery = 'content_policy';
      } else if (path === '/login') {
        window.history.replaceState(null, '', '?view=login');
        viewQuery = 'login';
      } else if (path === '/auth-choice') {
        window.history.replaceState(null, '', '?view=auth_choice');
        viewQuery = 'auth_choice';
      } else if (path === '/hospital-registration') {
        window.history.replaceState(null, '', '?view=hospital_reg');
        viewQuery = 'hospital_reg';
      } else if (path === '/patient-registration') {
        window.history.replaceState(null, '', '?view=patient_reg');
        viewQuery = 'patient_reg';
      } else if (path === '/admin-dashboard') {
        window.history.replaceState(null, '', '?view=admin_dashboard');
        viewQuery = 'admin_dashboard';
      } else if (path === '/super-admin') {
        window.history.replaceState(null, '', '?view=super_admin');
        viewQuery = 'super_admin';
      } else if (path.startsWith('/patient-dashboard/')) {
        const pTab = path.split('/').pop() || 'hospitals';
        const tabVal = pTab === 'history' ? 'tokens' : pTab;
        window.history.replaceState(null, '', `?view=patient_home&tab=${tabVal}`);
        viewQuery = 'patient_home';
        tabQuery = tabVal;
      } else if (path === '/patient-dashboard') {
        window.history.replaceState(null, '', `?view=patient_home`);
        viewQuery = 'patient_home';
      }
    }

    setDeepLinkTokenId(null);
    setDeepLinkLiveHospitalId(null);

    // 2. Main query-parameter resolution
    if (!viewQuery || viewQuery === 'home') {
      setViewStateRaw('hero');
      setSelectedHospitalRaw(null);
      setSelectedDoctorRaw(null);
      setIsBookingFlowRaw(false);
      setLastCreatedTokenRaw(null);
      setCategoryType(null);
    } 
    else if (viewQuery === 'category') {
      setViewStateRaw('category');
      setCategoryType(typeQuery);
      setSelectedHospitalRaw(null);
      setSelectedDoctorRaw(null);
      setIsBookingFlowRaw(false);
      setLastCreatedTokenRaw(null);
    } 
    else if (viewQuery === 'doctor') {
      setViewStateRaw('doctor_profile');
      setSelectedDoctorId(idQuery);
      setCategoryType(null);
      
      const isBookingActive = searchParams.get('book') === 'true';
      setIsBookingFlowRaw(isBookingActive);
      setLastCreatedTokenRaw(null);

      // Lazy resolve Doctor and Hospital raw objects for legacy compatibility in child views
      if (idQuery && fetchedHospitals.length > 0) {
        let foundDoc = null;
        let foundHosp = null;
        for (const h of fetchedHospitals) {
          const docs = h.doctors || h.specialists || [];
          const doc = docs.find((d: any) => d.id === idQuery);
          if (doc) {
            foundDoc = doc;
            foundHosp = h;
            break;
          }
        }
        if (foundDoc && foundHosp) {
          setSelectedDoctorRaw(foundDoc);
          setSelectedHospitalRaw(foundHosp);
        } else {
          setSelectedDoctorRaw({ id: idQuery, _isPlaceholder: true });
          if (bHospQuery) {
            const h = fetchedHospitals.find(hosp => hosp.id === bHospQuery);
            setSelectedHospitalRaw(h || { id: bHospQuery, _isPlaceholder: true });
          }
        }
      } else if (idQuery) {
        setSelectedDoctorRaw({ id: idQuery, _isPlaceholder: true });
        if (bHospQuery) {
          setSelectedHospitalRaw({ id: bHospQuery, _isPlaceholder: true });
        }
      }
    } 
    else if (viewQuery === 'hospital') {
      setViewStateRaw('patient_home');
      setIsBookingFlowRaw(false);
      setLastCreatedTokenRaw(null);
      setCategoryType(null);

      const hId = idQuery;
      if (hId) {
        const found = fetchedHospitals.find(h => h.id === hId);
        if (found) {
          setSelectedHospitalRaw(found);
        } else {
          setSelectedHospitalRaw({ id: hId, _isPlaceholder: true });
        }
      }
    }
    else if (viewQuery === 'booking_success') {
      setViewStateRaw('patient_home');
      setIsBookingFlowRaw(false);
      setCategoryType(null);
      setSelectedHospitalRaw(null);
      setSelectedDoctorRaw(null);

      if (idQuery) {
        if (!lastCreatedToken || lastCreatedToken.id !== idQuery) {
          setLastCreatedTokenRaw({ id: idQuery, _isPlaceholder: true });
        }
      }
    }
    else if (viewQuery === 'patient_home') {
      setViewStateRaw('patient_home');
      setSelectedHospitalRaw(null);
      setSelectedDoctorRaw(null);
      setIsBookingFlowRaw(false);
      setLastCreatedTokenRaw(null);
      setCategoryType(null);

      // Tab mapping
      if (tabQuery === 'history' || tabQuery === 'tokens' || tabQuery === 'my_tokens') {
        setPatientPreferredTabRaw('history');
      } else if (tabQuery === 'profile') {
        setPatientPreferredTabRaw('profile');
      } else {
        setPatientPreferredTabRaw('hospitals');
      }
    }
    else if (viewQuery === 'pricing') {
      setViewStateRaw('pricing');
    }
    else if (viewQuery === 'privacy') {
      setViewStateRaw('privacy');
    } else if (viewQuery === 'terms') {
      setViewStateRaw('terms');
    } else if (viewQuery === 'contact') {
      setViewStateRaw('contact');
    } else if (viewQuery === 'about') {
      setViewStateRaw('about');
    } else if (viewQuery === 'content_policy') {
      setViewStateRaw('content_policy');
    } else if (viewQuery === 'login') {
      setViewStateRaw('login');
    } else if (viewQuery === 'auth_choice') {
      setViewStateRaw('auth_choice');
    } else if (viewQuery === 'hospital_reg') {
      setViewStateRaw('hospital_reg');
    } else if (viewQuery === 'patient_reg') {
      setViewStateRaw('patient_reg');
    } else if (viewQuery === 'admin_dashboard') {
      setViewStateRaw('admin_dashboard');
    } else if (viewQuery === 'super_admin') {
      setViewStateRaw('super_admin');
    }
  };

  // Run onmount and URL changes
  useEffect(() => {
    handleUrlRouting();
    window.addEventListener('popstate', handleUrlRouting);
    return () => window.removeEventListener('popstate', handleUrlRouting);
  }, [fetchedHospitals]);

  // Handle lazy placeholder transitions once Firestore fetchedHospitals array completes
  useEffect(() => {
    if (fetchedHospitals.length === 0) return;
    
    if (selectedHospital && selectedHospital._isPlaceholder) {
      const realHosp = fetchedHospitals.find(h => h.id === selectedHospital.id);
      if (realHosp) {
        setSelectedHospitalRaw(realHosp);
        if (selectedDoctor && selectedDoctor._isPlaceholder) {
          const doctorsList = realHosp.doctors || realHosp.specialists || [];
          const realDoc = doctorsList.find((d: any) => d.id === selectedDoctor.id);
          if (realDoc) {
            setSelectedDoctorRaw(realDoc);
          }
        }
      }
    }
  }, [fetchedHospitals, selectedHospital, selectedDoctor]);

  // Handle book click
  const handleBookToken = (doctorData: any) => {
    if (!currentUser) {
      setSelectedDoctor(doctorData); // Save intent
      setLoginPrompt(true);
      return;
    }
    setSelectedDoctor(doctorData);
    setIsBookingFlow(true);
  };

  const handleLoginSuccess = () => {
    setLoginPrompt(false);
    if (selectedHospital) {
      setIsBookingFlow(true);
    }
  };

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSignOutInProgress, setIsSignOutInProgress] = useState(false);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);

  // Inactivity tracking
  useEffect(() => {
    if (!userData) return;

    let warningTimer: any;
    let logoutTimer: any;

    const resetTimers = () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      setShowInactivityWarning(false);

      // Warning at 25 minutes
      warningTimer = setTimeout(() => {
        setShowInactivityWarning(true);
      }, 25 * 60 * 1000);

      // Logout at 30 minutes
      logoutTimer = setTimeout(() => {
        handleLogoutAction(true);
      }, 30 * 60 * 1000);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimers));

    resetTimers();

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimers));
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
    };
  }, [userData]);

  const handleLogoutAction = async (force = false) => {
    if (force) {
      await logout();
      setViewState('hero');
      setShowLogoutConfirm(false);
      setShowInactivityWarning(false);
      return;
    }
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    setIsSignOutInProgress(true);
    try {
      await logout();
      setViewState('hero');
      toast.success(t.ux.toasts.logout_success);
    } catch (err) {
      console.error(err);
      toast.error(t.errors.standard);
    } finally {
      setIsSignOutInProgress(false);
      setShowLogoutConfirm(false);
    }
  };

  // Role Protection & Auto-routing
  useEffect(() => {
    if (!userData) return;
    
    const role = userData.role;
    
    // Auto-redirect from auth pages to dashboards
    if (['hero', 'login', 'auth_choice', 'hospital_reg', 'patient_reg'].includes(viewState)) {
      if (role === 'hospital_admin' || role === 'Admin') setViewState('admin_dashboard');
      else if (role === 'super_admin' || role === 'SuperAdmin' || role === 'superadmin') setViewState('super_admin');
      else if (role === 'patient') setViewState('patient_home');
      return;
    }

    // Role-based protection: Prevent accessing wrong dashboards
    if (viewState === 'admin_dashboard' && role === 'patient') {
      setViewState('patient_home');
    } else if (viewState === 'patient_home' && (role === 'hospital_admin' || role === 'Admin')) {
      setViewState('admin_dashboard');
    } else if (viewState === 'super_admin' && role !== 'super_admin' && role !== 'SuperAdmin' && role !== 'superadmin') {
      setViewState(role === 'hospital_admin' || role === 'Admin' ? 'admin_dashboard' : 'patient_home');
    }
  }, [userData, viewState]);

  useEffect(() => {
    let isMounted = true;

    const testFirestore = async () => {
      try {
        console.log("FIRESTORE TEST - Start");
        const testRef = doc(db, 'debug_tests', 'connection_test');
        await setDoc(testRef, { 
          lastTested: serverTimestamp(),
          message: "Hello world"
        });
        if (!isMounted) return;
        console.log("FIRESTORE TEST - Write success");
        const snap = await getDoc(testRef);
        if (isMounted) console.log("FIRESTORE TEST - Read success:", snap?.data());
      } catch (e: any) {
        console.error("FIRESTORE TEST - Error:", e);
      }
    };
    
    testFirestore();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'hospitals'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      setFetchedHospitals(list);
    }, (error) => {
      console.error("Hospitals onSnapshot error:", error);
      try {
        handleFirestoreError(error, OperationType.LIST, 'hospitals');
      } catch (err) {
        console.error("Firestore error handled:", err);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser && userData) {
      // Check for onboarding
      const hasSeenTour = localStorage.getItem(`xdoc_tour_${currentUser.uid}`);
      if (!hasSeenTour) {
        setShowOnboarding(true);
      }

      if (['hero', 'login', 'auth_choice', 'hospital_reg', 'patient_reg'].includes(viewState)) {
        if (userData?.role === 'Admin' || userData?.role === 'hospital_admin') {
          setViewState('admin_dashboard');
        } else if (userData?.role === 'SuperAdmin' || userData?.role === 'super_admin') {
          setViewState('super_admin');
        } else {
          setViewState('patient_home');
        }
      }
    } else if (!currentUser) {
      // Redirect to hero if logged out, but only if they were in a protected view
      if (['admin_dashboard', 'super_admin', 'patient_home'].includes(viewState)) {
        setViewState('hero');
      }
    }
  }, [currentUser, userData, viewState]);

  useEffect(() => {
    setIsDarkMode(viewState === 'admin_dashboard' || viewState === 'super_admin');
  }, [viewState]);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success(t.ux.toasts.login_success);
    } catch (error) {
      console.error("Login failed", error);
      toast.error(t.errors.login_failed);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const renderCurrentView = () => {
    if (deepLinkTokenId) {
      return (
        <TokenTrackingPage 
          tokenId={deepLinkTokenId} 
          onBack={() => {
            setDeepLinkTokenId(null);
            navigate('/');
          }} 
        />
      );
    }
    if (deepLinkLiveHospitalId) {
      return (
        <HospitalLiveQueuePage 
          hospitalId={deepLinkLiveHospitalId} 
          onBack={() => {
            setDeepLinkLiveHospitalId(null);
            navigate('/');
          }} 
        />
      );
    }

    if (loginPrompt) {
      return (
        <div className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[40px] p-10 max-w-lg w-full text-center shadow-2xl"
          >
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-8">
              <Lock size={48} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">Login Required</h2>
            <p className="text-slate-500 font-medium mb-8">Token book karne ke liye login karna zaroori hai. Kia aap login karna chahte hain?</p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setLoginPrompt(false)}
                className="py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setLoginPrompt(false);
                  setViewState('login');
                }}
                className="py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all uppercase tracking-widest text-xs"
              >
                Login / Signup
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    switch (viewState) {
      case 'hero':
        return (
          <div className="bg-white min-h-screen">
            <Header 
              onLogoClick={() => setViewState('hero')} 
              onSignUp={() => setViewState('auth_choice')} 
              onLogin={() => setViewState('login')}
              isLanding={true}
              viewState={viewState}
              setViewState={setViewState}
            />
            <HomeRedesign 
              onSignUp={() => setViewState('auth_choice')} 
              onLogin={() => setViewState('login')}
              onSearch={(q) => {
                const isCat = ['Dentist', 'dentist', 'General Physician', 'Specialist', 'Dentistry', 'Cardiology', 'Pediatrics', 'Dermatology'].some(c => c.toLowerCase() === q.toLowerCase() || q.toLowerCase().includes(c.toLowerCase()));
                if (isCat) {
                  navigate(`?view=category&type=${encodeURIComponent(q)}`);
                } else {
                  setLandingSearchQuery(q);
                  if (userData) {
                    navigate(`?view=patient_home&tab=hospitals&search=${encodeURIComponent(q)}`);
                  } else {
                    navigate(`?view=login&search=${encodeURIComponent(q)}`);
                  }
                }
              }}
              onHospitalClick={(h) => setSelectedHospital(h)}
              onNavigate={(view, path) => {
                window.history.pushState(null, '', path);
                setViewState(view);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        );
      case 'category': {
        const typeLower = (categoryType || '').toLowerCase().trim();
        
        // Find matching hospitals
        const categoryHospitals = fetchedHospitals.filter(h => {
          const name = (h.hospitalName || h.name || '').toLowerCase();
          const isTest = name.includes('test') || name.includes('demo') || name.includes('care with');
          if (isTest) return false;
          
          if (!categoryType) return true;
          const catLower = categoryType.toLowerCase();
          const hasSpec = (h.specializations || []).some((s: string) => s.toLowerCase().includes(catLower));
          if (hasSpec) return true;
          
          if (catLower === 'dentist' || catLower === 'dentistry') {
            return (h.specializations || []).some((s: string) => s.toLowerCase().includes('dentist') || s.toLowerCase().includes('dentistry'));
          }
          if (catLower === 'specialist') {
            return (h.specializations || []).some((s: string) => !s.toLowerCase().includes('general'));
          }
          return false;
        });

        // Find matching doctors
        const categoryDoctors: any[] = [];
        categoryHospitals.forEach(h => {
          const list = h.doctors || h.specialists || [];
          list.forEach((d: any) => {
            if (!categoryDoctors.some(existing => existing.id === d.id)) {
              categoryDoctors.push({ ...d, hospital: h });
            }
          });
        });

        return (
          <div className="bg-slate-50 min-h-screen pb-16">
            <Header 
              onLogoClick={() => setViewState('hero')} 
              onSignUp={() => setViewState('auth_choice')} 
              onLogin={() => setViewState('login')}
              isLanding={false}
              viewState={viewState}
              setViewState={setViewState}
            />

            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
              {/* Back button */}
              <button 
                onClick={() => setViewState('hero')}
                className="mb-8 flex items-center gap-2 text-slate-500 font-sans font-bold text-xs hover:text-primary transition-all uppercase tracking-widest bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100"
              >
                <ArrowLeft size={16} />
                {language === 'UR' ? 'پیچھے جائیں' : 'Go Back'}
              </button>

              {/* Title Header Section */}
              <div className="mb-12">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">{language === 'UR' ? 'کیٹیگری' : 'Selected Category'}</span>
                <h1 className="text-4xl font-extrabold text-slate-950 tracking-tight flex items-center gap-3">
                  <Stethoscope className="text-primary" size={32} />
                  {categoryType || 'Specialists'}
                </h1>
                <p className="text-slate-500 font-medium mt-2 max-w-2xl">
                  {language === 'UR' 
                    ? `دستیاب ہسپتال اور ڈاکٹروں کی فہرست برائے ${categoryType}` 
                    : `Verified list of hospitals, clinics and specialist doctors offering ${categoryType} care.`}
                </p>
              </div>

              {/* Grid of Results */}
              <div className="space-y-12">
                
                {/* 1. Hospitals / Clinics */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <HospitalIcon className="text-primary" size={20} />
                      {language === 'UR' ? 'دستیاب کلینکس اور ہسپتال' : 'Hospitals & Clinics'}
                    </h2>
                    <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {categoryHospitals.length} {language === 'UR' ? 'ملے' : 'Found'}
                    </span>
                  </div>

                  {categoryHospitals.length === 0 ? (
                    <div className="bg-white rounded-[32px] p-12 text-center border border-slate-100 shadow-sm max-w-md mx-auto">
                      <HospitalIcon className="mx-auto text-slate-300 mb-4" size={48} />
                      <p className="font-sans font-bold text-slate-700">{language === 'UR' ? 'کوئی ہسپتال نہیں ملا' : 'No Clinics/Hospitals Found'}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {categoryHospitals.map((h) => {
                        const type = h.type || 'Private Hospital';
                        const isGovt = type.toLowerCase().includes('government');
                        const fee = isGovt ? (language === 'UR' ? 'مفت' : 'Free') : h.opdFee ? `Rs. ${h.opdFee}` : `Rs. ${h.startingFee || 800}`;
                        const isOpen = h.status === 'open' || h.status === 'active' || true;
                        
                        return (
                          <motion.div 
                            key={h.id}
                            onClick={() => setSelectedHospital(h)}
                            className="bg-white rounded-[32px] border border-slate-100 hover:border-primary/20 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between overflow-hidden relative"
                          >
                            <div className="p-6 space-y-4">
                              <div className="h-36 rounded-2xl overflow-hidden relative bg-slate-100 border border-slate-100">
                                <SmartImage 
                                  src={h.imageUrl || h.photo || `https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800&h=400&sig=${h.id}`} 
                                  alt={h.hospitalName} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  fallbackInitials={h.hospitalName?.[0] || h.name?.[0]}
                                />
                                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-md">
                                  <div className={`w-2 h-2 ${isOpen ? 'bg-emerald-500 breathing-dot' : 'bg-red-500'} rounded-full`} />
                                  <span className="font-mono text-[9px] font-extrabold uppercase tracking-widest text-slate-800">
                                    {isOpen ? 'Open' : 'Closed'}
                                  </span>
                                </div>
                              </div>

                              <div>
                                <h3 className="text-xl font-extrabold text-slate-900 leading-tight group-hover:text-primary transition-colors">
                                  {h.hospitalName || h.name}
                                </h3>
                                <div className="flex items-center gap-1.5 text-slate-400 mt-2 text-xs font-semibold">
                                  <MapPin size={12} />
                                  <span>{h.area}, {h.city}</span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                              <div className="text-slate-600 text-xs font-bold">
                                {language === 'UR' ? 'فیس' : 'Fee'}: <span className="text-slate-900 font-extrabold">{fee}</span>
                              </div>
                              <span className="text-primary text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
                                {language === 'UR' ? 'ہسپتال دیکھیں' : 'View'}
                                <ArrowRight size={14} />
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Specialists Available */}
                <div className="space-y-6 pt-6">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <Stethoscope size={20} className="text-primary" />
                      {language === 'UR' ? 'دستیاب اسپیشلسٹ ڈاکٹرز' : 'Available Specialists'}
                    </h2>
                    <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {categoryDoctors.length} {language === 'UR' ? 'ملے' : 'Found'}
                    </span>
                  </div>

                  {categoryDoctors.length === 0 ? (
                    <div className="bg-white rounded-[32px] p-12 text-center border border-slate-100 shadow-sm max-w-md mx-auto">
                      <User className="mx-auto text-slate-300 mb-4" size={48} />
                      <p className="font-sans font-bold text-slate-700">{language === 'UR' ? 'کوئی ڈاکٹر نہیں ملا' : 'No Specialist Doctors Found'}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {categoryDoctors.map((doc) => {
                        const dName = doc.name || doc.doctorName || 'Doctor';
                        const dSpec = doc.specialization || categoryType || 'Specialist';
                        const dFee = doc.fee || doc.opdFee || doc.hospital?.startingFee || '800';
                        const dTimings = doc.timings || doc.timing || '5:00 PM - 9:00 PM';
                        
                        return (
                          <motion.div 
                            key={doc.id}
                            onClick={() => setSelectedDoctor(doc)}
                            className="bg-white rounded-[32px] border border-slate-100 hover:border-primary/20 hover:shadow-xl transition-all cursor-pointer p-6 flex gap-5 items-start group"
                          >
                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0 relative">
                              <SmartImage 
                                src={doc.imageUrl || doc.photo || `https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300`} 
                                alt={dName}
                                className="w-full h-full object-cover"
                                fallbackInitials={dName?.[0]}
                              />
                            </div>

                            <div className="flex-1 min-w-0 space-y-2">
                              <div>
                                <h3 className="font-extrabold text-slate-950 text-lg group-hover:text-primary transition-colors leading-tight">
                                  Dr. {dName}
                                </h3>
                                <p className="text-xs font-bold text-primary font-mono uppercase tracking-wide">{dSpec}</p>
                              </div>

                              <div className="flex flex-col gap-1 text-slate-500 font-medium text-xs">
                                <div className="flex items-center gap-1">
                                  <HospitalIcon size={12} />
                                  <span className="truncate">{doc.hospital?.hospitalName || doc.hospital?.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock size={12} />
                                  <span>{dTimings}</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                                <span className="text-slate-800 font-extrabold text-xs">Rs. {dFee}</span>
                                <span className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white px-3 py-1.5 rounded-xl font-sans font-black text-[9px] uppercase tracking-widest transition-all">
                                  {language === 'UR' ? 'پروفائل دیکھیں' : 'Profile'}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                </div>

              </div>
            </div>
          </div>
        );
      }
      case 'doctor_profile': {
        const dId = selectedDoctorId;
        const searchParams = new URLSearchParams(window.location.search);
        const bookMode = searchParams.get('book') === 'true';
        
        let foundDoc = selectedDoctor;
        let foundHosp = selectedHospital;
        
        // Resolve doctor and hospital securely if placeholders or null
        if ((!foundDoc || foundDoc._isPlaceholder || !foundHosp || foundHosp._isPlaceholder) && dId && fetchedHospitals.length > 0) {
          for (const h of fetchedHospitals) {
            const list = h.doctors || h.specialists || [];
            const d = list.find((item: any) => item.id === dId);
            if (d) {
              foundDoc = d;
              foundHosp = h;
              break;
            }
          }
        }

        // If booking flow is active (book=true is appended)
        if (bookMode && foundHosp && foundDoc) {
          return (
            <BookingFlow 
              hospital={foundHosp}
              doctor={foundDoc}
              onClose={() => setIsBookingFlow(false)}
              onSuccess={(token) => {
                setLastCreatedToken(token);
              }}
            />
          );
        }

        // Render the premium doctor profile page
        const name = foundDoc?.name || foundDoc?.doctorName || 'Specialist Doctor';
        const spec = foundDoc?.specialization || foundDoc?.speciality || categoryType || 'healthcare';
        const fee = foundDoc?.fee || foundDoc?.opdFee || foundHosp?.startingFee || '800';
        const rating = foundDoc?.rating || '4.8';
        const reviews = foundDoc?.reviews || '80+ Reviews';
        const timings = foundDoc?.timings || foundDoc?.timing || (foundHosp ? foundHosp.openingTime + ' - ' + foundHosp.closingTime : '5:00 PM - 9:00 PM');
        const days = foundDoc?.days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        return (
          <div className="bg-slate-50 min-h-screen pb-16">
            <Header 
              onLogoClick={() => setViewState('hero')} 
              onSignUp={() => setViewState('auth_choice')} 
              onLogin={() => setViewState('login')}
              isLanding={false}
              viewState={viewState}
              setViewState={setViewState}
            />
            
            <div className="max-w-4xl mx-auto px-4 pt-8">
              {/* Back button */}
              <button 
                onClick={() => {
                  if (categoryType) {
                    navigate(`?view=category&type=${encodeURIComponent(categoryType)}`);
                  } else if (foundHosp) {
                    setSelectedHospital(foundHosp);
                  } else {
                    setViewState('hero');
                  }
                }}
                className="mb-8 flex items-center gap-2 text-slate-500 font-sans font-bold text-xs hover:text-primary transition-all uppercase tracking-widest bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100"
              >
                <ArrowLeft size={16} />
                {language === 'UR' ? 'پیچھے جائیں' : 'Go Back'}
              </button>

              {/* Doctor Details Card */}
              <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden md:flex p-6 md:p-10 gap-10">
                
                {/* Visual block */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left gap-6 md:w-1/3">
                  <div className="w-40 h-40 rounded-full border-4 border-slate-100 shadow-inner overflow-hidden flex items-center justify-center bg-slate-50 text-slate-400 relative">
                    <SmartImage 
                      src={foundDoc?.imageUrl || foundDoc?.photo || `https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300`} 
                      alt={name}
                      className="w-full h-full object-cover"
                      fallbackInitials={name?.[0]}
                    />
                    <div className="absolute right-1 bottom-1 bg-teal-500 text-white rounded-full p-2 border-4 border-white">
                      <Stethoscope size={16} />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-amber-500/10 text-amber-600 px-4 py-1.5 rounded-full font-bold text-xs tracking-wide">
                    <Star size={14} fill="currentColor" />
                    <span>{rating} ({reviews})</span>
                  </div>
                </div>

                {/* Info block */}
                <div className="flex-1 space-y-6 mt-6 md:mt-0">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">{language === 'UR' ? 'عام ڈاکٹر' : 'Doctor Details'}</span>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
                      Dr. {name}
                    </h1>
                    <p className="text-primary font-bold text-lg mt-2 font-mono uppercase tracking-wide">{spec}</p>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Timings, Fee Bento Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Consultation Fee */}
                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex items-start gap-4">
                      <div className="bg-primary/10 text-primary p-3 rounded-2xl">
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{language === 'UR' ? 'مشاورتی فیس' : 'Consult Fee'}</p>
                        <p className="text-lg font-black text-slate-800">Rs. {fee}</p>
                      </div>
                    </div>

                    {/* Operational Timings */}
                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex items-start gap-4">
                      <div className="bg-emerald-500/10 text-emerald-600 p-3 rounded-2xl">
                        <Clock size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{language === 'UR' ? 'وقت' : 'Timings'}</p>
                        <p className="text-sm font-bold text-slate-800">{timings}</p>
                      </div>
                    </div>
                  </div>

                  {/* Practicing Hospital details */}
                  {foundHosp && (
                    <div 
                      onClick={() => setSelectedHospital(foundHosp)}
                      className="bg-sky-500/10 hover:bg-sky-500/20 border border-sky-400/20 p-6 rounded-3xl cursor-pointer flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-sky-500 text-white p-3 rounded-2xl">
                          <HospitalIcon size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">{language === 'UR' ? 'ہسپتال / کلینک' : 'Practice Hospital'}</p>
                          <p className="text-base font-black text-slate-800 group-hover:text-primary transition-colors">{foundHosp.hospitalName || foundHosp.name}</p>
                          <p className="text-xs font-semibold text-slate-500">{foundHosp.area}, {foundHosp.city}</p>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-sky-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}

                  {/* Days */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{language === 'UR' ? 'دستیاب دن' : 'Available Days'}</p>
                    <div className="flex flex-wrap gap-2">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dIdx) => {
                        const isAvailable = days.includes(day);
                        return (
                          <span 
                            key={dIdx} 
                            className={`px-3 py-1.5 rounded-xl text-xs font-sans font-bold uppercase tracking-wider border transition-all ${
                              isAvailable 
                                ? 'bg-primary/10 text-primary border-primary/20' 
                                : 'bg-slate-50 text-slate-300 border-slate-100 line-through'
                            }`}
                          >
                            {day}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Giant Book Token Action */}
                  <div className="pt-4">
                    <button
                      onClick={() => {
                        if (!currentUser) {
                          setLoginPrompt(true);
                          return;
                        }
                        setIsBookingFlow(true);
                      }}
                      className="w-full py-4 tracking-widest text-xs uppercase font-sans font-black bg-primary text-white rounded-3xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all text-center flex items-center justify-center gap-3"
                    >
                      <Ticket size={18} />
                      {language === 'UR' ? 'ٹوکن بک کریں' : 'Book Appointment / Grab Token'}
                    </button>
                  </div>

                </div>

              </div>
            </div>
          </div>
        );
      }
      case 'login':
        return (
          <>
            <LoginPage 
              onLoginSuccess={(role) => {
                if (selectedHospital) {
                  handleLoginSuccess();
                } else if (role === 'hospital_admin') {
                  setViewState('admin_dashboard');
                } else if (role === 'super_admin') {
                  setViewState('super_admin');
                } else {
                  setViewState('patient_home');
                }
              }}
              onSignUpClick={(type) => type === 'Hospital' ? setViewState('hospital_reg') : setViewState('patient_reg')}
              onForgotPasswordClick={() => setIsForgotPasswordOpen(true)}
            />
            <ForgotPasswordModal isOpen={isForgotPasswordOpen} onClose={() => setIsForgotPasswordOpen(false)} />
          </>
        );
      case 'auth_choice':
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-8">
            <SignUpChoice onSelect={(type) => type === 'Hospital' ? setViewState('hospital_reg') : setViewState('patient_reg')} />
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
        return (
          <HospitalRegistration 
            onComplete={() => setViewState('admin_dashboard')} 
          />
        );
      case 'patient_reg':
        return (
          <PatientRegistration 
            onComplete={() => setViewState('patient_home')} 
            onLoginClick={() => setViewState('login')}
          />
        );
      case 'admin_dashboard':
        return (
          <HospitalDashboard 
            hospitalData={userData} 
            onSignOut={() => handleLogoutAction()} 
          />
        );
      case 'super_admin':
        return (
          <SuperAdminDashboard 
            onSignOut={() => handleLogoutAction()} 
          />
        );
      case 'patient_home':
        if (lastCreatedToken) {
          return (
            <BookingSuccess 
              tokenData={lastCreatedToken}
              onHome={() => {
                setLastCreatedToken(null);
                setSelectedHospital(null);
                setSelectedDoctor(null);
                setIsBookingFlow(false);
                setViewState('patient_home');
              }}
            />
          );
        }
        if (isBookingFlow) {
           return (
            <BookingFlow 
              hospital={selectedHospital}
              doctor={selectedDoctor}
              onClose={() => setIsBookingFlow(false)}
              onSuccess={(token) => {
                setLastCreatedToken(token);
                setIsBookingFlow(false);
              }}
            />
          );
        }
        if (selectedHospital) {
          return (
            <HospitalDetailPage 
              hospital={selectedHospital} 
              onBack={() => setSelectedHospital(null)}
              onBook={handleBookToken}
            />
          );
        }
        return (
          <PatientDashboard 
            userData={userData}
            hospitals={fetchedHospitals}
            onSignOut={() => handleLogoutAction()} 
            onHospitalClick={(h) => setSelectedHospital(h)}
            preferredTab={patientPreferredTab}
            onTabChange={setPatientPreferredTab}
            initialSearchQuery={landingSearchQuery}
          />
        );
      case 'pricing':
        return (
          <PricingPage 
            onBack={() => {
              navigate('/');
            }}
            onSignUp={() => setViewState('auth_choice')}
            onLogin={() => setViewState('login')}
            language={language}
          />
        );
      case 'privacy':
      case 'terms':
      case 'contact':
      case 'about':
      case 'content_policy':
        return (
          <FooterPages 
            activePage={viewState} 
            onBack={() => {
              navigate('/');
            }} 
          />
        );
      default:
        return (
          <div className="flex items-center justify-center min-h-screen">
             <div className="text-center">
                <h2 className="text-4xl font-bold text-slate-900 mb-4">404</h2>
                <p className="text-slate-500 mb-8">Page Not Found</p>
                <button onClick={() => setViewState('hero')} className="px-8 py-3 bg-primary text-white rounded-2xl font-bold">Back to Hero</button>
             </div>
          </div>
        );
    }
  };

  // Page navigation loader effect
  useEffect(() => {
    if (showSplash) return;
    setIsPageLoading(true);
    const timer = setTimeout(() => setIsPageLoading(false), 800);
    return () => clearTimeout(timer);
  }, [viewState, activeTab, selectedHospital, selectedDoctor, showSplash]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className={`min-h-screen selection:bg-primary/20 ${isDarkMode ? 'bg-bg-dark' : 'bg-white'}`}>
      <PageProgressBar isLoading={isPageLoading} />
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

      <AnimatePresence>
        {showOnboarding && currentUser && (
          <OnboardingTour 
            type={userData?.role === 'hospital_admin' || userData?.role === 'Admin' ? 'hospital' : 'patient'} 
            onComplete={() => {
              localStorage.setItem(`xdoc_tour_${currentUser.uid}`, 'true');
              setShowOnboarding(false);
            }} 
          />
        )}

        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] shadow-2xl p-10 max-w-sm w-full relative z-10 text-center"
            >
              <div className="w-20 h-20 bg-emergency-red/10 rounded-full flex items-center justify-center text-emergency-red mx-auto mb-6">
                <LogOut size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">{t.patient.logout.confirmTitle}</h2>
              <p className="text-slate-500 font-medium mb-8">
                {t.patient.logout.confirmMessage}
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={confirmLogout}
                  disabled={isSignOutInProgress}
                  className="w-full py-4 bg-emergency-red text-white rounded-2xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                >
                  {isSignOutInProgress ? '...' : t.patient.logout.yesLogout}
                </button>
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                >
                  {t.patient.logout.cancel}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showInactivityWarning && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000] bg-amber-50 border border-amber-200 p-6 rounded-[32px] shadow-2xl flex items-center gap-4 max-w-md w-[90%]"
          >
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-amber-900 font-bold text-sm">{t.patient.booking.sessionWarning}</p>
              <p className="text-amber-700 text-xs font-medium">{t.patient.booking.inactivityLogout}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp Floating Support Button */}
      <div 
        className="fixed bottom-[104px] md:bottom-[24px] right-4 z-[100] flex flex-col items-center justify-center transition-all duration-300 pb-safe"
      >
        <div className="relative group flex flex-col items-center justify-center">
          {/* Tooltip on Hover */}
          <div className="absolute bottom-[115%] mb-2.5 hidden group-hover:flex flex-col items-center transition-all duration-300 pointer-events-none whitespace-nowrap z-[10000]">
            <div className="bg-slate-900/95 text-white text-[11px] font-bold px-3 py-2 rounded-xl shadow-xl flex items-center justify-center font-sans tracking-wide">
              {language === 'UR' ? 'مدد چاہیے؟ واٹس ایپ کریں!' : 'Madad chahiye? WhatsApp karein!'}
            </div>
            <div className="w-2 h-2 bg-slate-900/95 rotate-45 -mt-1" />
          </div>

          {/* Branded Pulsing WhatsApp Button */}
          <button 
            onClick={() => {
              window.open(
                "https://wa.me/923152328605?text=Assalam%20o%20Alaikum!%20%F0%9F%8F%A5%0A%0AMain%20Xdoc%20app%20use%20kar%20raha%20hun%20aur%20mujhe%20madad%20chahiye.%0A%0AApp%20URL%3A%20https%3A%2F%2Fxdoc.pages.dev%2F",
                "_blank",
                "noopener,noreferrer"
              );
            }}
            title={language === 'UR' ? 'مدد چاہیے؟ واٹس ایپ کریں!' : 'Madad chahiye? WhatsApp karein!'}
            aria-label="Contact support on WhatsApp"
            className="whatsapp-pulse-button w-[52px] h-[52px] md:w-[56px] md:h-[56px] rounded-full bg-[#25D366] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer outline-none select-none"
          >
            <MessageCircle className="w-6 h-6 md:w-[26px] md:h-[26px]" fill="currentColor" />
          </button>
        </div>

        {/* Small White Label Below Button */}
        <span className="text-[10px] text-white font-extrabold select-none text-center pointer-events-none mt-1 uppercase tracking-widest font-sans drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.8)]">
          {language === 'UR' ? 'سپورٹ' : 'Support'}
        </span>
      </div>

      {/* Permanent Mobile Bottom Navigation Bar */}
      {((userData && userData.role === 'patient') || (!userData && ['hero', 'login', 'auth_choice', 'privacy', 'terms', 'contact', 'about', 'content_policy', 'pricing'].includes(viewState))) && (
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 z-40 py-3 pb-safe-area flex justify-around items-center shadow-[0_-4px_24px_rgba(15,23,42,0.06)]">
          {[
            {
              id: 'home',
              label: language === 'UR' ? 'ہوم' : 'Home',
              icon: Home,
              active: viewState === 'hero' && !selectedHospital,
              onClick: () => {
                setViewState('hero');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            },
            {
              id: 'tokens',
              label: language === 'UR' ? 'میرے ٹوکن' : 'My Tokens',
              icon: Ticket,
              active: viewState === 'patient_home' && patientPreferredTab === 'history',
              onClick: () => {
                if (userData) {
                  setViewState('patient_home');
                  setPatientPreferredTab('history');
                } else {
                  setViewState('login');
                }
              }
            },
            {
              id: 'hospitals',
              label: language === 'UR' ? 'ہسبتال' : 'Hospitals',
              icon: Building2,
              active: (viewState === 'patient_home' && patientPreferredTab === 'hospitals') && !selectedHospital,
              onClick: () => {
                if (userData) {
                  setViewState('patient_home');
                  setPatientPreferredTab('hospitals');
                  setSelectedHospital(null);
                } else {
                  setViewState('login');
                }
              }
            },
            {
              id: 'profile',
              label: language === 'UR' ? 'پروفائل' : 'Profile',
              icon: User,
              active: viewState === 'patient_home' && patientPreferredTab === 'profile',
              onClick: () => {
                if (userData) {
                  setViewState('patient_home');
                  setPatientPreferredTab('profile');
                } else {
                  setViewState('login');
                }
              }
            }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={tab.onClick}
                className="flex flex-col items-center justify-center py-1 px-3.5 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95"
              >
                <IconComponent 
                  size={20} 
                  strokeWidth={tab.active ? 2.5 : 1.75} 
                  className={`transition-colors duration-200 ${tab.active ? 'text-[#0B5FFF]' : 'text-slate-400'}`} 
                />
                <span className={`text-[10px] font-bold mt-1 tracking-wide transition-colors duration-200 ${tab.active ? 'text-[#0B5FFF]' : 'text-slate-500'}`}>
                  {tab.label}
                </span>
                {tab.active && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="w-1.5 h-1.5 rounded-full bg-[#0B5FFF] mt-0.5" 
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const NotFound = ({ onBack }: { onBack: () => void }) => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md"
      >
        <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-8">
          <ShieldAlert size={48} />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">404 - Page Not Found</h1>
        <p className="text-slate-500 font-medium mb-10 leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>
        <button 
          onClick={onBack}
          className="px-10 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 mx-auto"
        >
          <ArrowLeft size={20} />
          Go Back Home
        </button>
      </motion.div>
    </div>
  );
};
