import React, { useState, useEffect, useRef } from 'react';
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
  sendPasswordResetEmail
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
        animate={{ scale: [1, 1.1, 1] }} 
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="w-24 h-24 rounded-3xl medical-cross-gradient flex items-center justify-center text-white shadow-2xl shadow-primary/30 mb-6"
      >
        <Activity size={48} />
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
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  if (isLanding) {
    return (
      <>
        <header className={`fixed top-0 left-0 w-full z-[100] transition-all duration-200 h-16 flex items-center border-b ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md border-slate-200 shadow-sm' 
            : 'bg-white border-transparent'
        }`}>
          <div className="max-w-7xl mx-auto w-full px-4 md:px-6 flex justify-between items-center">
            {/* Left: Logo */}
            <div onClick={onLogoClick} className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 rounded-lg bg-[#0B5FFF] flex items-center justify-center text-white shadow-md shadow-primary/20 transition-transform group-hover:scale-110">
                <Activity size={18} />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#0B1D35]">Xdoc</span>
            </div>

            {/* Center: Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => { setViewState('hero'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">{t.nav?.home}</button>
              <button 
                onClick={() => {
                  if (viewState !== 'hero') {
                    setViewState('hero');
                    setTimeout(() => setViewState('auth_choice'), 100);
                  } else {
                    setViewState('auth_choice');
                  }
                }} 
                className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
              >
                {t.nav?.findHospital}
              </button>
              <button onClick={() => {
                if (viewState !== 'hero') setViewState('hero');
                setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 100);
              }} className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">{t.nav?.about}</button>
            </nav>
            
            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setLanguage(language === 'EN' ? 'UR' : 'EN')}
                className="hidden sm:flex px-3 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors uppercase tracking-wider"
              >
                {language === 'EN' ? 'اردو' : 'English'}
              </button>

              {!userData ? (
                <>
                  <button 
                    onClick={onLogin}
                    className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    {t.nav?.login}
                  </button>
                  <button 
                    onClick={onSignUp}
                    className="hidden sm:block px-5 py-2.5 rounded-lg bg-[#0B5FFF] text-white text-sm font-semibold shadow-sm hover:bg-blue-600 active:scale-95 transition-all"
                  >
                    {t.nav?.signUpFree}
                  </button>
                  <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-xs font-semibold text-slate-900">{userData.displayName}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{userData.role.replace('_', ' ')}</p>
                  </div>
                  <button 
                    onClick={() => logout()}
                    className="w-9 h-9 rounded-full border border-slate-200 overflow-hidden relative group"
                  >
                    <img src={userData.photoURL || "https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=200"} alt="Profile" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <LogOut size={14} className="text-white" />
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-16 left-0 w-full z-[90] bg-white border-b border-slate-200 p-6 md:hidden shadow-xl"
            >
              <nav className="flex flex-col gap-1">
                <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-medium">{t.nav?.home}</a>
                <a href="#" onClick={() => { setIsMobileMenuOpen(false); onLogoClick?.(); }} className="px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-medium">{t.nav?.findHospital}</a>
                <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-medium">{t.nav?.about}</a>
                <div className="h-px bg-slate-100 my-4" />
                <button 
                   onClick={() => { setLanguage(language === 'EN' ? 'UR' : 'EN'); setIsMobileMenuOpen(false); }}
                   className="w-full text-left px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-medium"
                >
                  {language === 'EN' ? 'Urdu Language' : 'انگریزی زبان'}
                </button>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); onLogin?.(); }}
                    className="py-3 rounded-xl font-semibold text-slate-900 bg-slate-100"
                  >
                    {t.nav?.login}
                  </button>
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); onSignUp?.(); }}
                    className="py-3 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/20"
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


// --- Auth & Onboarding Components ---

const LoginPage = ({ onLoginSuccess, onSignUpClick, onForgotPasswordClick }: { onLoginSuccess: (role: string) => void, onSignUpClick: (type: 'Hospital' | 'Patient') => void, onForgotPasswordClick: () => void }) => {
  const { t } = useLanguage();
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
        if (role === 'Admin' || role === 'hospital_admin') role = 'hospital_admin';
        else if (role === 'SuperAdmin' || role === 'super_admin') role = 'super_admin';
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
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-email' || err.code === 'auth/invalid-credential') {
        setError({ general: t.auth.invalidCredential });
      } else if (err.code === 'auth/wrong-password') {
        setError({ password: t.auth.incorrectPassword });
      } else if (err.code === 'auth/network-request-failed') {
        setError({ general: t.auth.networkError });
      } else if (err.code === 'auth/too-many-requests') {
        setError({ general: t.auth.tooManyRequests });
      } else {
        setError({ general: err.message || 'Login failed. Please check your credentials.' });
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
        if (role === 'Admin' || role === 'hospital_admin') role = 'hospital_admin';
        else if (role === 'SuperAdmin' || role === 'super_admin') role = 'super_admin';
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
            <div className="w-20 h-20 rounded-[28px] medical-cross-gradient flex items-center justify-center text-white shadow-2xl shadow-primary/30 mb-6 group cursor-pointer">
              <Activity size={40} className="group-hover:scale-110 transition-transform" />
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

const PatientRegistration = ({ onComplete }: { onComplete: () => void }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    gender: 'Male',
    city: 'Karachi'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad'];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = t.signup.errors.required;
    if (!formData.phone) newErrors.phone = t.signup.errors.required;
    if (!formData.email) newErrors.email = t.signup.errors.required;
    if (!formData.password) newErrors.password = t.signup.errors.required;
    else if (formData.password.length < 6) newErrors.password = t.signup.errors.passwordTooShort;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
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
      setIsSubmitted(true);
      setTimeout(() => onComplete(), 1500);
    } catch (err: any) {
      console.error(err);
      setErrors({ general: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-12 rounded-[40px] shadow-xl text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} />
          </div>
          <h2 className="text-3xl font-bold mb-4">Welcome to Xdoc!</h2>
          <p className="text-slate-500">Your account is ready. Redirecting...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-2">{t.signup.patientTitle}</h2>
          <p className="text-slate-500 font-medium">Join Pakistan's largest healthcare network</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-[40px] shadow-xl border border-slate-100 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">{t.signup.labels.fullName} *</label>
            <input 
              type="text" 
              placeholder="Full Name" 
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium" 
            />
            {errors.fullName && <p className="text-red-500 text-xs font-bold pl-2">{errors.fullName}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">{t.signup.labels.phone} *</label>
              <input 
                type="tel" 
                placeholder="Phone Number" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium" 
              />
              {errors.phone && <p className="text-red-500 text-xs font-bold pl-2">{errors.phone}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">{t.signup.labels.city} *</label>
              <select 
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-bold appearance-none"
              >
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">{t.signup.labels.email} *</label>
            <input 
              type="email" 
              placeholder="Email Address" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium" 
            />
            {errors.email && <p className="text-red-500 text-xs font-bold pl-2">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">{t.signup.labels.password} *</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium" 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs font-bold pl-2">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">{t.signup.labels.gender} *</label>
            <div className="flex gap-4">
              {['Male', 'Female'].map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setFormData({...formData, gender: g})}
                  className={`flex-1 py-4 rounded-2xl font-bold transition-all border-2 ${
                    formData.gender === g ? 'bg-primary/5 border-primary text-primary' : 'bg-slate-50 border-transparent text-slate-500'
                  }`}
                >
                  {g === 'Male' ? 'Male' : 'Female'}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-5 bg-[#0B5FFF] text-white font-bold text-xl rounded-2xl shadow-xl hover:bg-blue-600 transition-all disabled:opacity-70 mt-4"
          >
            {isSubmitting ? 'Creating Account...' : t.signup.createAccount}
          </button>

          {errors.general && <p className="text-red-500 text-center text-sm font-bold">{errors.general}</p>}

          <p className="text-center text-slate-500 font-medium pt-4">
            {t.signup.alreadyHaveAccount.split('?')[0]}? <span className="text-primary font-bold cursor-pointer transition-all" onClick={() => onComplete()}>{t.signup.alreadyHaveAccount.split('?')[1] || 'Login'}</span>
          </p>
        </form>
      </div>
    </div>
  );
};

const HospitalRegistration = ({ onComplete }: { onComplete: () => void }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '', 
    type: 'Private Hospital', 
    ownerName: '', 
    email: '', 
    password: '',
    city: '', 
    address: '', 
    area: '', 
    phone: '',
    opdFee: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const totalSteps = 8;
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  const [isEmergency, setIsEmergency] = useState(false);
  const [quickSelect, setQuickSelect] = useState<'Mon-Fri' | 'Mon-Sat' | 'All' | null>('Mon-Sat');
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [staffCounts, setStaffCounts] = useState({ doctors: 0, nurses: 0, receptionists: 0, support: 0 });
  const [individualStaff, setIndividualStaff] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [media, setMedia] = useState({ logo: null, photos: [] as any[], about: '' });

  const facilityGroups = {
    "Medical Facilities": ["Emergency Ward", "ICU", "Operation Theater (OT)", "Labour Room"],
    "Diagnostic Facilities": ["Pathology Lab", "X-Ray", "Ultrasound"],
    "Support Facilities": ["Pharmacy", "Ambulance Service"],
    "Patient Comfort": ["Private Rooms", "General Ward", "Waiting Area"],
    "Digital Services": ["Online Appointment", "Telemedicine"]
  };
  const allFacilities = Object.values(facilityGroups).flat();

  const handleQuickSelect = (type: 'Mon-Fri' | 'Mon-Sat' | 'All') => {
    setQuickSelect(type);
    if (type === 'Mon-Fri') setSelectedDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    else if (type === 'Mon-Sat') setSelectedDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    else if (type === 'All') setSelectedDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  };

  const toggleDay = (day: string) => {
    setQuickSelect(null);
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const allSpecs = [
    'General Physician', 'Cardiology', 'Neurology', 'Orthopedic', 'Gynecology', 
    'Pediatrics', 'Dentistry', 'Dermatology (Skin)', 'Ophthalmology (Eye)', 
    'ENT Specialist', 'Psychiatry', 'Urology', 'Gastroenterology', 'Pulmonology', 
    'Endocrinology', 'Nephrology', 'Oncology', 'Rheumatology', 'Hematology', 
    'Physiotherapy', 'Nutritionist', 'Emergency Medicine'
  ];

  const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad'];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = t.signup.errors.required;
    if (!formData.ownerName) newErrors.ownerName = t.signup.errors.required;
    if (!formData.email) newErrors.email = t.signup.errors.required;
    if (!formData.password) newErrors.password = t.signup.errors.required;
    else if (formData.password.length < 6) newErrors.password = t.signup.errors.passwordTooShort;
    if (!formData.city) newErrors.city = t.signup.errors.required;
    if (!formData.address) newErrors.address = t.signup.errors.required;
    if (!formData.area) newErrors.area = t.signup.errors.required;
    if (!formData.phone) newErrors.phone = t.signup.errors.required;
    if (!formData.opdFee) newErrors.opdFee = t.signup.errors.required;
    if (selectedSpecs.length === 0) newErrors.specs = t.signup.errors.atLeastOneSpec;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleSpec = (spec: string) => {
    setSelectedSpecs(prev => 
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    setErrors({});
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      const hospitalData = {
        hospitalName: formData.name,
        ownerName: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        area: formData.area,
        type: formData.type,
        specializations: selectedSpecs,
        opdFee: formData.opdFee,
        status: "active",
        createdAt: serverTimestamp(),
        approved: true,
        uid: user.uid
      };

      await setDoc(doc(db, 'hospitals', user.uid), hospitalData);
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: formData.email,
        role: 'hospital_admin',
        createdAt: serverTimestamp()
      });
      
      setIsSubmitted(true);
      setTimeout(() => onComplete(), 2000);
    } catch (err: any) {
      console.error(err);
      let errorMsg = err.message || 'Failed to register hospital.';
      if (err.code === 'auth/email-already-in-use') errorMsg = t.auth.emailAlreadyInUse;
      setErrors({ general: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-12 rounded-[40px] shadow-xl text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} />
          </div>
          <h2 className="text-3xl font-bold mb-4">Registration Successful!</h2>
          <p className="text-slate-500 font-medium">Your hospital is now live on Xdoc. Redirecting to your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  const sections = [
    t.signup.hospitalTitle,
    t.signup.sections.location,
    t.signup.sections.timings,
    t.signup.sections.services,
    t.signup.sections.staff,
    t.signup.sections.pricing,
    t.signup.sections.media,
    t.signup.sections.review
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-20 pb-40">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-slate-900">{t.signup.hospitalTitle}</h2>
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
                    <label className="text-sm font-bold text-slate-700">{t.signup.labels.name} *</label>
                    <input 
                      type="text" 
                      name="name"
                      placeholder="e.g. City Care Clinic" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className={`w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium ${errors.name ? 'ring-2 ring-red-500' : ''}`} 
                    />
                    {errors.name && <p className="text-red-500 text-xs font-bold pl-2">{errors.name}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">{t.signup.labels.type} *</label>
                      <select 
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium"
                      >
                        <option>Private Hospital</option>
                        <option>Private Clinic</option>
                        <option>Government Hospital</option>
                        <option>Government Clinic</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">{t.signup.labels.ownerName} *</label>
                      <input 
                        type="text" 
                        name="ownerName"
                        placeholder="Owner Full Name" 
                        value={formData.ownerName}
                        onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                        className={`w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium ${errors.ownerName ? 'ring-2 ring-red-500' : ''}`} 
                      />
                      {errors.ownerName && <p className="text-red-500 text-xs font-bold pl-2">{errors.ownerName}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">{t.signup.labels.email} *</label>
                    <input 
                      type="email" 
                      name="email"
                      placeholder="contact@hospital.com" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className={`w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium ${errors.email ? 'ring-2 ring-red-500' : ''}`} 
                    />
                    {errors.email && <p className="text-red-500 text-xs font-bold pl-2">{errors.email}</p>}
                  </div>
                  <div className="space-y-4">
                    <input 
                      type="password" 
                      name="password"
                      placeholder={t.signup.labels.password + " *"} 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className={`w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium ${errors.password ? 'ring-2 ring-red-500' : ''}`} 
                    />
                    {errors.password && <p className="text-red-500 text-xs font-bold pl-2">{errors.password}</p>}
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.signup.labels.address} *</label>
                      <input 
                        type="text" 
                        placeholder="Complete Street Address" 
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className={`w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium ${errors.address ? 'ring-2 ring-red-500' : ''}`} 
                      />
                      {errors.address && <p className="text-red-500 text-xs font-bold pl-2">{errors.address}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.signup.labels.area} *</label>
                      <input 
                        type="text" 
                        placeholder="Town / Area / Sector" 
                        value={formData.area}
                        onChange={(e) => setFormData({...formData, area: e.target.value})}
                        className={`w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium ${errors.area ? 'ring-2 ring-red-500' : ''}`} 
                      />
                      {errors.area && <p className="text-red-500 text-xs font-bold pl-2">{errors.area}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.signup.labels.city} *</label>
                        <select 
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          className={`w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium ${errors.city ? 'ring-2 ring-red-500' : ''}`}
                        >
                          <option value="">Select City</option>
                          <option>Karachi</option>
                          <option>Lahore</option>
                          <option>Islamabad</option>
                          <option>Faisalabad</option>
                          <option>Rawalpindi</option>
                          <option>Multan</option>
                          <option>Peshawar</option>
                          <option>Quetta</option>
                        </select>
                        {errors.city && <p className="text-red-500 text-xs font-bold pl-2">{errors.city}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.signup.labels.phone} *</label>
                        <input 
                          type="tel" 
                          name="phone"
                          placeholder="03XX-XXXXXXX" 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className={`w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium ${errors.phone ? 'ring-2 ring-red-500' : ''}`} 
                        />
                        {errors.phone && <p className="text-red-500 text-xs font-bold pl-2">{errors.phone}</p>}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Opening Time *</label>
                      <input 
                        type="time" 
                        value={formData.openingTime}
                        onChange={(e) => setFormData({...formData, openingTime: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Closing Time *</label>
                      <input 
                        type="time" 
                        value={formData.closingTime}
                        onChange={(e) => setFormData({...formData, closingTime: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium" 
                      />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <label className="text-sm font-bold text-slate-700">Open Days *</label>
                      <div className="flex gap-2">
                        {[
                          { id: 'Mon-Fri', label: 'Mon - Fri' },
                          { id: 'Mon-Sat', label: 'Mon - Sat' },
                          { id: 'All', label: 'All 7 Days' }
                        ].map(btn => (
                          <button
                            key={btn.id}
                            type="button"
                            onClick={() => handleQuickSelect(btn.id as any)}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                              quickSelect === btn.id 
                                ? 'bg-primary border-primary text-white shadow-md shadow-primary/20' 
                                : 'bg-transparent border-slate-200 text-slate-500 hover:border-primary'
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                        const isSelected = selectedDays.includes(day);
                        return (
                          <div 
                            key={day} 
                            onClick={() => toggleDay(day)}
                            className={`flex flex-col items-center gap-3 p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                              isSelected 
                                ? 'bg-primary/5 border-primary shadow-sm' 
                                : 'bg-slate-50 border-transparent hover:border-slate-200'
                            }`}
                          >
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${
                              isSelected ? 'text-primary' : 'text-slate-400'
                            }`}>{day}</span>
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                              isSelected ? 'bg-primary scale-110' : 'bg-white border-2 border-slate-200'
                            }`}>
                              {isSelected && <Check size={14} className="text-white" strokeWidth={4} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {errors.days && <p className="text-red-500 text-xs font-bold pl-2">{errors.days}</p>}
                  </div>

                  <div className="space-y-4">
                    <div className={`flex items-center justify-between p-6 rounded-[32px] border-2 transition-all duration-500 ${
                      isEmergency 
                        ? 'bg-[#00C9B1]/5 border-[#00C9B1] shadow-lg shadow-[#00C9B1]/10' 
                        : 'bg-slate-50 border-transparent'
                    }`}>
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                          isEmergency ? 'bg-[#00C9B1] text-white rotate-6' : 'bg-slate-200 text-slate-400'
                        }`}>
                          <AlertTriangle size={32} />
                        </div>
                        <div>
                          <p className={`font-bold text-lg leading-tight transition-colors ${
                            isEmergency ? 'text-[#00C9B1]' : 'text-slate-900'
                          }`}>24/7 Emergency Service</p>
                          <p className="text-sm text-slate-500 font-medium">Do you offer round the clock emergency?</p>
                        </div>
                      </div>
                      <div 
                        onClick={() => setIsEmergency(!isEmergency)}
                        className={`w-14 h-8 rounded-full relative p-1 cursor-pointer transition-colors duration-500 ${
                          isEmergency ? 'bg-[#00C9B1]' : 'bg-slate-200'
                        }`}
                      >
                        <motion.div 
                          animate={{ x: isEmergency ? 24 : 0 }}
                          className="w-6 h-6 bg-white rounded-full shadow-sm" 
                        />
                      </div>
                    </div>
                    {isEmergency && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 px-6 py-4 bg-[#00C9B1]/10 rounded-2xl text-[#005046] border border-[#00C9B1]/20"
                      >
                        <CheckCircle2 size={18} />
                        <p className="text-xs font-bold uppercase tracking-widest">Your hospital will be listed as 24/7 Emergency Available</p>
                      </motion.div>
                    )}
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <label className="text-sm font-bold text-slate-700">Specializations *</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedSpecs(allSpecs)}
                          className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border border-slate-200 text-slate-500 hover:border-primary hover:text-primary"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedSpecs([])}
                          className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border border-slate-200 text-slate-500 hover:border-emergency-red hover:text-emergency-red"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {allSpecs.map(spec => {
                        const isSelected = selectedSpecs.includes(spec);
                        return (
                          <button 
                            key={spec} 
                            type="button"
                            onClick={() => setSelectedSpecs(prev => isSelected ? prev.filter(s => s !== spec) : [...prev, spec])}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border shadow-sm ${
                              isSelected 
                                ? 'bg-primary border-primary text-white shadow-md shadow-primary/20 scale-105' 
                                : 'bg-white border-[#0B5FFF] text-[#0B5FFF] hover:bg-primary/5 active:scale-95'
                            }`}
                          >
                            {spec}
                          </button>
                        );
                      })}
                    </div>
                    {errors.specs && <p className="text-red-500 text-xs font-bold pl-2">{errors.specs}</p>}
                  </div>

                  <div className="space-y-8 pt-8 border-t border-slate-100">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <label className="text-sm font-bold text-slate-700">Available Facilities</label>
                      <button
                        type="button"
                        onClick={() => setSelectedFacilities(allFacilities)}
                        className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border border-slate-200 text-slate-500 hover:border-primary hover:text-primary"
                      >
                        Select All
                      </button>
                    </div>

                    <div className="space-y-8">
                      {Object.entries(facilityGroups).map(([category, facilities]) => (
                        <div key={category} className="space-y-4">
                          <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">{category}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {facilities.map(fac => {
                              const isSelected = selectedFacilities.includes(fac);
                              return (
                                <div 
                                  key={fac} 
                                  onClick={() => setSelectedFacilities(prev => isSelected ? prev.filter(f => f !== fac) : [...prev, fac])}
                                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                    isSelected 
                                      ? 'bg-primary/5 border-primary' 
                                      : 'bg-slate-50 border-transparent hover:border-slate-200'
                                  }`}
                                >
                                  <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                                    isSelected ? 'bg-primary' : 'bg-white border-2 border-slate-200'
                                  }`}>
                                    {isSelected && <Check size={14} className="text-white" strokeWidth={4} />}
                                  </div>
                                  <span className={`text-[11px] font-bold ${
                                    isSelected ? 'text-slate-900' : 'text-slate-500'
                                  }`}>{fac}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 5 && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { id: 'doctors', label: 'Doctors', icon: UserPlus },
                      { id: 'nurses', label: 'Nurses', icon: Users },
                      { id: 'receptionists', label: 'Receptionists', icon: MessageSquare },
                      { id: 'support', label: 'Support Staff', icon: Building2 }
                    ].map(type => (
                      <div key={type.id} className="space-y-2">
                        <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">{type.label}</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={staffCounts[type.id as keyof typeof staffCounts]}
                            onChange={(e) => setStaffCounts({...staffCounts, [type.id]: parseInt(e.target.value) || 0})}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-bold" 
                          />
                          <type.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-8 border-t border-slate-100">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                      <h4 className="text-lg font-bold text-slate-900">Individual Staff Members</h4>
                      <button 
                        type="button"
                        onClick={() => setIndividualStaff([...individualStaff, { id: Date.now(), name: '', role: 'Doctor', dept: '', shift: 'Morning', phone: '' }])}
                        className="flex items-center gap-2 text-primary font-bold hover:bg-primary/5 px-4 py-2 rounded-xl transition-all"
                      >
                        <Plus size={20} /> Add Staff Member
                      </button>
                    </div>

                    <div className="space-y-4">
                      {individualStaff.map((staff, index) => (
                        <div key={staff.id} className="p-6 bg-slate-50 rounded-3xl border border-transparent hover:border-slate-200 transition-all space-y-4 relative group">
                          <button 
                            type="button"
                            onClick={() => setIndividualStaff(individualStaff.filter(s => s.id !== staff.id))}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-emergency-red transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={18} />
                          </button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input 
                              placeholder="Full Name" 
                              value={staff.name}
                              onChange={(e) => {
                                const newStaff = [...individualStaff];
                                newStaff[index].name = e.target.value;
                                setIndividualStaff(newStaff);
                              }}
                              className="w-full px-6 py-3 rounded-xl bg-white border-transparent focus:ring-2 focus:ring-primary font-medium shadow-sm" 
                            />
                            <select 
                              value={staff.role}
                              onChange={(e) => {
                                const newStaff = [...individualStaff];
                                newStaff[index].role = e.target.value;
                                setIndividualStaff(newStaff);
                              }}
                              className="w-full px-6 py-3 rounded-xl bg-white border-transparent focus:ring-2 focus:ring-primary font-medium shadow-sm"
                            >
                              <option>Doctor</option>
                              <option>Nurse</option>
                              <option>Receptionist</option>
                              <option>Admin</option>
                            </select>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input 
                              placeholder="Department" 
                              value={staff.dept}
                              onChange={(e) => {
                                const newStaff = [...individualStaff];
                                newStaff[index].dept = e.target.value;
                                setIndividualStaff(newStaff);
                              }}
                              className="w-full px-6 py-3 rounded-xl bg-white border-transparent focus:ring-2 focus:ring-primary font-medium shadow-sm" 
                            />
                            <select 
                              value={staff.shift}
                              onChange={(e) => {
                                const newStaff = [...individualStaff];
                                newStaff[index].shift = e.target.value;
                                setIndividualStaff(newStaff);
                              }}
                              className="w-full px-6 py-3 rounded-xl bg-white border-transparent focus:ring-2 focus:ring-primary font-medium shadow-sm"
                            >
                              <option>Morning</option>
                              <option>Evening</option>
                              <option>Night</option>
                            </select>
                            <input 
                              placeholder="Phone" 
                              value={staff.phone}
                              onChange={(e) => {
                                const newStaff = [...individualStaff];
                                newStaff[index].phone = e.target.value;
                                setIndividualStaff(newStaff);
                              }}
                              className="w-full px-6 py-3 rounded-xl bg-white border-transparent focus:ring-2 focus:ring-primary font-medium shadow-sm" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 6 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">{t.signup.labels.opdFee || "General OPD Fee"}</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          placeholder="Rs. 1,000" 
                          value={formData.opd}
                          onChange={(e) => setFormData({...formData, opd: e.target.value})}
                          className={`w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-bold ${errors.opd ? 'ring-2 ring-red-500' : ''}`} 
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rs.</span>
                      </div>
                      {errors.opd && <p className="text-red-500 text-xs font-bold pl-2">{errors.opd}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">{t.signup.labels.emergencyFee || "Emergency Consultation Fee"}</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          placeholder="Rs. 2,000" 
                          value={formData.emergency}
                          onChange={(e) => setFormData({...formData, emergency: e.target.value})}
                          className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-bold" 
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rs.</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <Star />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">Free Service Option</p>
                        <p className="text-xs text-slate-500">Do you offer any services for free?</p>
                      </div>
                    </div>
                    <div 
                      onClick={() => setFormData({...formData, isFree: !formData.isFree})}
                      className={`w-14 h-8 rounded-full relative p-1 cursor-pointer transition-colors duration-500 ${formData.isFree ? 'bg-health-teal' : 'bg-slate-200'}`}
                    >
                      <motion.div 
                        animate={{ x: formData.isFree ? 24 : 0 }}
                        className="w-6 h-6 bg-white rounded-full shadow-sm" 
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-8 border-t border-slate-100">
                    <label className="text-sm font-bold text-slate-700">Accepted Payment Methods *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {['Cash', 'JazzCash', 'EasyPaisa', 'Bank Card', 'Sehat Card', 'Insurance'].map(method => {
                        const isSelected = paymentMethods.includes(method);
                        return (
                          <div 
                            key={method} 
                            onClick={() => setPaymentMethods(prev => isSelected ? prev.filter(m => m !== method) : [...prev, method])}
                            className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                              isSelected ? 'bg-primary/5 border-primary shadow-sm' : 'bg-slate-50 border-transparent hover:border-slate-200'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${isSelected ? 'bg-primary' : 'bg-white border-2 border-slate-200'}`}>
                              {isSelected && <Check size={14} className="text-white" strokeWidth={4} />}
                            </div>
                            <span className="text-sm font-bold text-slate-700">{method}</span>
                          </div>
                        );
                      })}
                    </div>
                    {errors.paymentMethods && <p className="text-red-500 text-xs font-bold pl-2">{errors.paymentMethods}</p>}
                  </div>
                </>
              )}

              {step === 7 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-slate-700">Hospital Logo</label>
                      <div className="w-full aspect-square md:aspect-video rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 relative overflow-hidden group hover:border-primary transition-colors cursor-pointer">
                        {media.logo ? (
                          <img src={URL.createObjectURL(media.logo as any)} className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                              <Upload size={24} />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-bold text-slate-900">Upload Logo</p>
                              <p className="text-[10px] text-slate-500 font-medium">PNG, JPG up to 2MB</p>
                            </div>
                          </>
                        )}
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setMedia({...media, logo: e.target.files[0] as any});
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-bold text-slate-700">Hospital Photos</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="aspect-square rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 relative group hover:border-primary transition-colors cursor-pointer">
                          <Plus size={24} className="text-slate-400" />
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Add Photo</p>
                          <input 
                            type="file" 
                            multiple 
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => {
                              if (e.target.files) {
                                const files = Array.from(e.target.files);
                                setMedia({...media, photos: [...media.photos, ...files].slice(0, 10)});
                              }
                            }}
                          />
                        </div>
                        {media.photos.map((file, i) => (
                          <div key={i} className="aspect-square rounded-3xl bg-slate-50 relative overflow-hidden group">
                            <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                            <button 
                              type="button"
                              onClick={() => setMedia({...media, photos: media.photos.filter((_, idx) => idx !== i)})}
                              className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">Up to 10 photos, max 5MB each</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-8 border-t border-slate-100">
                    <label className="text-sm font-bold text-slate-700">About Hospital</label>
                    <textarea 
                      placeholder="Apne hospital ke baare mein likhen..." 
                      value={media.about}
                      onChange={(e) => setMedia({...media, about: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary font-medium min-h-[150px]" 
                    />
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <span>Minimum 50 characters</span>
                      <span className={media.about.length >= 50 ? 'text-health-teal' : 'text-slate-400'}>{media.about.length} / 50</span>
                    </div>
                  </div>
                </>
              )}

              {step === 8 && !isSubmitted && (
                <div className="space-y-8">
                  <div className="p-8 bg-primary/5 rounded-[40px] border border-primary/10">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 bg-primary text-white rounded-3xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <ShieldCheck size={32} />
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-slate-900">Review Information</h4>
                        <p className="text-slate-500">Please verify all details before submitting</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400">Services & Staff</h5>
                        <ul className="space-y-2">
                          <li className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium text-sm">Specializations</span>
                            <span className="text-slate-900 font-bold text-sm">{selectedSpecs.length} Selected</span>
                          </li>
                          <li className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium text-sm">Staff Members</span>
                            <span className="text-slate-900 font-bold text-sm">{staffCounts.doctors + staffCounts.nurses + staffCounts.receptionists + staffCounts.support} Total</span>
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400">Fees & Policies</h5>
                        <ul className="space-y-2">
                          <li className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium text-sm">OPD Fee</span>
                            <span className="text-slate-900 font-bold text-sm">Rs. {formData.opd || '0'}</span>
                          </li>
                          <li className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium text-sm">Emergency</span>
                            <span className="text-slate-900 font-bold text-sm">{isEmergency ? 'Available' : 'No'}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    {errors.general && <p className="text-red-500 text-xs font-bold text-center mt-4">{errors.general}</p>}
                  </div>

                  <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-200">
                    <button 
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleSubmit}
                      className="w-full py-6 bg-health-teal text-white font-display font-bold text-xl rounded-3xl shadow-2xl shadow-health-teal/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-70 disabled:scale-100"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Account bana raha hai...</span>
                        </div>
                      ) : (
                        <>Register Hospital <ArrowRight size={24} /></>
                      )}
                    </button>
                    {errors.general && (
                      <div className="mt-4 p-4 bg-red-50 rounded-2xl border border-red-100 flex flex-col items-center gap-2">
                        <p className="text-red-500 text-xs font-bold">{errors.general}</p>
                        <button 
                          onClick={handleSubmit}
                          className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
                        >
                          Retry Again
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isSubmitted && (
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-success-green/10 text-success-green rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                    <CheckCircle2 size={56} />
                  </div>
                  <h3 className="text-4xl font-display font-bold text-slate-900 mb-6 font-primary tracking-tight">Hospital Registered!</h3>
                  <div className="max-w-md mx-auto space-y-6">
                    <p className="text-slate-500 text-lg leading-relaxed font-medium">
                      Hospital registered! Dashboard khul raha hai...
                    </p>
                    <div className="p-6 bg-white rounded-3xl border-2 border-slate-100 shadow-sm">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">Registration Status</p>
                      <p className="text-2xl font-mono font-bold text-primary italic uppercase">Active Now</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {!isSubmitted && (
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
            
            {step < totalSteps && (
              <button 
                onClick={nextStep}
                className="px-12 py-4 bg-primary text-white font-bold text-lg rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                {step === 7 ? 'Review & Submit' : 'Continue'}
              </button>
            )}
          </div>
        )}
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
                    <div className="p-10 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-bold text-slate-900 leading-tight">{h.hospitalName || h.name}</h3>
                            {h.verified && <CheckCircle2 size={24} className="text-primary" fill="currentColor" />}
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <MapPin size={16} />
                            <span className="text-sm font-bold">{h.area || h.address}, {h.city}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-4 py-2 rounded-2xl border border-amber-100 shadow-sm">
                          <Star size={18} fill="currentColor" />
                          <span className="font-mono text-lg font-bold">{h.rating || 0}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-6 mb-8">
                        <div className="bg-primary/5 text-primary px-4 py-2 rounded-xl flex items-center gap-2 border border-primary/10">
                          <ShieldCheck size={16} />
                          <span className="font-mono text-[10px] font-bold uppercase tracking-widest">{h.type || h.hospitalType || h.category || 'PRIVATE'}</span>
                        </div>
                        {(h.specializations || h.specs || []).slice(0, 3).map((spec: string, i: number) => (
                          <span key={i} className="bg-slate-50 text-slate-500 px-4 py-2 rounded-xl font-mono text-[10px] font-bold uppercase border border-slate-100">{spec}</span>
                        ))}
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-8 border-t border-slate-50">
                        <div>
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Consultation start at</p>
                          <p className="text-3xl font-bold text-slate-900">Rs. {(parseInt(h.opdFee || h.startingFee) || 1000).toLocaleString()} <span className="text-sm font-medium text-slate-400">/visit</span></p>
                        </div>
                        <button className="bg-health-teal text-white font-bold px-10 py-4 rounded-2xl shadow-xl shadow-health-teal/20 hover:scale-105 active:scale-95 transition-all">
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
  const { t } = useLanguage();
  const { toast } = useToast();
  const { currentUser, userData, logout } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [viewState, setViewState] = useState<'hero' | 'login' | 'auth_choice' | 'hospital_reg' | 'patient_reg' | 'patient_home' | 'admin_dashboard' | 'super_admin'>('hero');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Patient flow states
  const [selectedHospital, setSelectedHospital] = useState<Hospital | any | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | any | null>(null);
  const [isBookingFlow, setIsBookingFlow] = useState(false);
  const [fetchedHospitals, setFetchedHospitals] = useState<any[]>([]);

  const [lastCreatedToken, setLastCreatedToken] = useState<any>(null);

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
      else if (role === 'super_admin' || role === 'SuperAdmin') setViewState('super_admin');
      else if (role === 'patient') setViewState('patient_home');
      return;
    }

    // Role-based protection: Prevent accessing wrong dashboards
    if (viewState === 'admin_dashboard' && role === 'patient') {
      setViewState('patient_home');
    } else if (viewState === 'patient_home' && (role === 'hospital_admin' || role === 'Admin')) {
      setViewState('admin_dashboard');
    } else if (viewState === 'super_admin' && role !== 'super_admin' && role !== 'SuperAdmin') {
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

      if (userData?.role === 'Admin' || userData?.role === 'hospital_admin') {
        setViewState('admin_dashboard');
      } else if (userData?.role === 'SuperAdmin' || userData?.role === 'super_admin') {
        setViewState('super_admin');
      } else {
        setViewState('patient_home');
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
                // Future: add search logic here or set view to patient results
                console.log("Search query:", q);
              }}
            />
          </div>
        );
      case 'login':
        return (
          <>
            <LoginPage 
              onLoginSuccess={(role) => {
                if (role === 'hospital_admin') setViewState('admin_dashboard');
                else if (role === 'super_admin') setViewState('super_admin');
                else setViewState('patient_home');
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
        return <HospitalRegistration onComplete={() => setViewState('admin_dashboard')} />;
      case 'patient_reg':
        return <PatientRegistration onComplete={() => setViewState('patient_home')} />;
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
                setViewState('patient_home');
              }}
            />
          );
        }
        if (selectedDoctor) {
           return (
            <BookingFlow 
              hospital={selectedHospital}
              doctor={selectedDoctor}
              onClose={() => setSelectedDoctor(null)}
              onSuccess={(token) => {
                setLastCreatedToken(token);
                setSelectedDoctor(null);
              }}
            />
          );
        }
        if (selectedHospital) {
          return (
            <HospitalDetailPage 
              hospital={selectedHospital} 
              onBack={() => setSelectedHospital(null)}
              onBook={(docData) => setSelectedDoctor(docData)}
            />
          );
        }
        return (
          <PatientDashboard 
            userData={userData}
            hospitals={fetchedHospitals}
            onSignOut={() => handleLogoutAction()} 
            onHospitalClick={(h) => setSelectedHospital(h)}
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
            role={userData?.role || 'patient'} 
            onClose={() => {
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
