import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  CalendarCheck2, 
  Ticket, 
  Wallet, 
  Settings, 
  LogOut, 
  Bell, 
  Search, 
  Menu, 
  X, 
  ChevronRight, 
  MoreVertical,
  Plus,
  Clock,
  CheckCircle2,
  Globe,
  TrendingUp,
  Stethoscope,
  Trash2,
  Edit,
  Save,
  Phone,
  MapPin,
  Building2,
  Camera,
  Upload,
  UserPlus,
  History,
  MoreHorizontal,
  Activity,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Play,
  Info,
  ArrowLeft,
  Copy,
  Check,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BrandLogo } from './ui/BrandLogo';
import { InvoiceModal } from './ui/InvoiceModal';
import { createOrGetInvoice } from '../lib/invoiceUtils';
import { 
  getKarachiTime, 
  getKarachiDateStr, 
  formatKarachiClock 
} from '../lib/timeUtils';
import { useLanguage } from '../contexts/LanguageContext';
import { db, auth } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  serverTimestamp,
  orderBy,
  getDocs,
  getDocFromServer,
  getDoc,
  limit,
  writeBatch,
  increment
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

import ReceptionMode from './ReceptionMode';
import { ListSkeleton, StatSkeleton, DashboardSkeleton } from './ui/Skeleton';
import EmptyState from './ui/EmptyState';
import LoadingButton from './ui/LoadingButton';
import { useToast } from '../contexts/ToastContext';
import confetti from 'canvas-confetti';

interface HospitalDashboardProps {
  hospitalData: any;
  onSignOut: () => void;
}

const HospitalDashboard = ({ hospitalData: initialHospitalData, onSignOut }: HospitalDashboardProps) => {
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'doctors' | 'search' | 'data' | 'staff' | 'profile' | 'invoices'>('home');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hospitalData, setHospitalData] = useState(initialHospitalData);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [selectedInvoiceToken, setSelectedInvoiceToken] = useState<any>(null);
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  const [invoiceDoctorFilter, setInvoiceDoctorFilter] = useState('All');
  const [invoiceDateFilter, setInvoiceDateFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDataWarning, setShowDataWarning] = useState(false);
  const [newTokenId, setNewTokenId] = useState<string | null>(null);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [showReceptionMode, setShowReceptionMode] = useState(false);

  const openReceptionMode = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('reception', 'true');
    window.history.pushState(null, '', url.pathname + url.search);
    window.dispatchEvent(new Event('popstate'));
  };

  const closeReceptionMode = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('reception');
    window.history.pushState(null, '', url.pathname + url.search);
    window.dispatchEvent(new Event('popstate'));
  };

  useEffect(() => {
    const handleReceptionPopState = () => {
      const searchParams = new URLSearchParams(window.location.search);
      setShowReceptionMode(searchParams.get('reception') === 'true');
    };

    handleReceptionPopState();
    window.addEventListener('popstate', handleReceptionPopState);
    return () => window.removeEventListener('popstate', handleReceptionPopState);
  }, []);
  const [isLive, setIsLive] = useState(true);

  // Doctors & Walk-in systems states
  const [activeDoctorConsoleId, setActiveDoctorConsoleId] = useState<string | null>(null);
  const [selectedDoctorForConsole, setSelectedDoctorForConsole] = useState<any | null>(null);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInLoading, setWalkInLoading] = useState(false);
  const [walkInSuccessToken, setWalkInSuccessToken] = useState<any | null>(null);
  const [walkInForm, setWalkInForm] = useState({
    patientName: '',
    patientPhone: '',
    doctorId: '',
    appointmentSlot: ''
  });

  const [newDoctor, setNewDoctor] = useState({
    name: '',
    phone: '',
    email: '',
    specialization: 'General Physician',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    fee: 1500,
    consultationTime: 12,
    pmdcId: '',
    status: 'Active',
    gender: 'Male'
  });

  // Firestore connection tracking
  useEffect(() => {
    window.addEventListener('online', () => setIsLive(true));
    window.addEventListener('offline', () => setIsLive(false));
    
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'debug_tests', 'connection_test'));
        setIsLive(true);
      } catch (error: any) {
        if (error.message?.includes('offline')) {
          setIsLive(false);
        }
      }
    };
    testConnection();
    
    return () => {
      window.removeEventListener('online', () => setIsLive(true));
      window.removeEventListener('offline', () => setIsLive(false));
    };
  }, []);

  // Filter today's tokens
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  // Stats calculation helper
  const calculateStats = (tokenList: any[]) => {
    const today = new Date().toISOString().split('T')[0];
    const todayTokens = tokenList.filter(t => 
      t.appointmentDate === today || 
      (t.createdAt?.toDate ? t.createdAt.toDate().toISOString().split('T')[0] === today : false)
    );

    return {
      tokensToday: todayTokens.length,
      waiting: todayTokens.filter(t => t.status === 'waiting' || t.status === 'Waiting').length,
      completedToday: todayTokens.filter(t => t.status === 'completed' || t.status === 'Completed').length,
      revenueToday: todayTokens
        .filter(t => t.status === 'completed' || t.status === 'Completed')
        .reduce((sum, t) => sum + (Number(t.consultationFee || t.fee) || 0), 0),
      totalCompleted: tokenList.filter(t => t.status === 'completed' || t.status === 'Completed').length,
      totalNotArrived: tokenList.filter(t => t.status === 'not-arrived').length,
      totalCancelled: tokenList.filter(t => t.status === 'cancelled').length,
      totalRevenue: tokenList
        .filter(t => t.status === 'completed' || t.status === 'Completed')
        .reduce((sum, t) => sum + (Number(t.consultationFee || t.fee) || 0), 0)
    };
  };

  const dashboardStats = calculateStats(tokens);

  const sampleChartData = [
    { day: 'Mon', patients: 45 },
    { day: 'Tue', patients: 52 },
    { day: 'Wed', patients: 38 },
    { day: 'Thu', patients: 65 },
    { day: 'Fri', patients: 48 },
    { day: 'Sat', patients: 70 },
    { day: 'Sun', patients: 40 },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 30-day data check
  useEffect(() => {
    if (hospitalData?.uid || hospitalData?.id) {
      const hId = hospitalData.uid || hospitalData.id;
      const checkOldData = async () => {
        const q = query(
          collection(db, 'tokens'),
          where('hospitalId', '==', hId)
        );
        const snap = await getDocs(q);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const hasOldData = snap.docs.some(doc => {
          const data = doc.data();
          const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || 0);
          return createdAt < thirtyDaysAgo;
        });

        if (hasOldData) {
          setShowDataWarning(true);
        }
      };
      checkOldData();
    }
  }, [hospitalData?.uid, hospitalData?.id]);

  // Listen to hospital data
  useEffect(() => {
    let isMounted = true;
    const hId = initialHospitalData?.uid || initialHospitalData?.id;
    const fetchHospitalData = async () => {
      if (!hId) return;
      try {
        const docRef = doc(db, 'hospitals', hId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
          if (isMounted && docSnap.exists()) {
            setHospitalData({ uid: docSnap.id, id: docSnap.id, ...docSnap.data() });
          }
        });
        return () => unsubscribe();
      } catch (error: any) {
        if (isMounted) console.error("Error fetching hospital data:", error);
      }
    };
    fetchHospitalData();
    return () => { isMounted = false; };
  }, [initialHospitalData?.uid, initialHospitalData?.id]);

  // Listen to doctors
  useEffect(() => {
    let isMounted = true;
    const hId = initialHospitalData?.uid || initialHospitalData?.id;
    const fetchDoctors = async () => {
      if (!hId) return;
      try {
        const q = query(collection(db, `hospitals/${hId}/doctors`));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          if (isMounted) {
            setDoctors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          }
        });
        return () => unsubscribe();
      } catch (error: any) {
        if (isMounted) console.error("Error fetching doctors:", error);
      }
    };
    fetchDoctors();
    return () => { isMounted = false; };
  }, [initialHospitalData?.uid, initialHospitalData?.id]);

  // Listen to staff
  useEffect(() => {
    let isMounted = true;
    const hId = initialHospitalData?.uid || initialHospitalData?.id;
    const fetchStaff = async () => {
      if (!hId) return;
      try {
        const q = query(collection(db, `hospitals/${hId}/staff`));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          if (isMounted) {
            setStaff(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          }
        });
        return () => unsubscribe();
      } catch (error: any) {
        if (isMounted) console.error("Error fetching staff:", error);
      }
    };
    fetchStaff();
    return () => { isMounted = false; };
  }, [initialHospitalData?.uid, initialHospitalData?.id]);

  // Listen to invoices in real-time
  useEffect(() => {
    let isMounted = true;
    const hId = initialHospitalData?.uid || initialHospitalData?.id;
    if (!hId) return;
    try {
      const q = query(collection(db, 'invoices'), where('hospitalId', '==', hId));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (isMounted) {
          setInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      });
      return () => unsubscribe();
    } catch (error: any) {
      console.error("Error fetching invoices:", error);
    }
    return () => { isMounted = false; };
  }, [initialHospitalData?.uid, initialHospitalData?.id]);

  const [lastNotificationTime, setLastNotificationTime] = useState(Date.now());
  const [noShowAlerts, setNoShowAlerts] = useState<string[]>([]);

  const handleClearOldData = async (saveToArchive: boolean) => {
    const hId = hospitalData?.uid || hospitalData?.id;
    if (!hId) return;
    setIsSaving(true);
    try {
      const q = query(
        collection(db, 'tokens'),
        where('hospitalId', '==', hId)
      );
      const snap = await getDocs(q);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const batch = writeBatch(db);
      snap.docs.forEach(tokenDoc => {
        const data = tokenDoc.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || 0);
        if (createdAt < thirtyDaysAgo) {
          batch.delete(tokenDoc.ref);
          batch.delete(doc(db, 'hospitals', hId, 'tokens', tokenDoc.id));
        }
      });
      await batch.commit();
      setShowDataWarning(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto No-Show Detection Timer
  useEffect(() => {
    const hId = hospitalData?.uid || hospitalData?.id;
    if (!hId) return;
    
    const checkNoShows = async () => {
      const settings = hospitalData.settings || {};
      if (settings.autoNoShow === false) return;

      const limitMinutes = Number(settings.noShowLimit) || 15;
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      const expiredTokens = tokens.filter(t => {
        if (t.status !== 'waiting') return false;
        if (t.appointmentDate !== todayStr) return false;
        
        // Parse appointment time (e.g., "10:30 AM")
        try {
          const [time, period] = (t.appointmentTime || '').split(' ');
          let [hours, minutes] = time.split(':').map(Number);
          if (period === 'PM' && hours !== 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;
          
          const apptTime = new Date();
          apptTime.setHours(hours, minutes, 0, 0);
          
          const diffInMinutes = (now.getTime() - apptTime.getTime()) / (1000 * 60);
          return diffInMinutes > limitMinutes;
        } catch (e) {
          return false;
        }
      });

      if (expiredTokens.length > 0) {
        const batch = writeBatch(db);
        for (const token of expiredTokens) {
          if (settings.alertBeforeAutoMark === false) {
            const updateData = { status: 'not-arrived', updatedAt: serverTimestamp() };
            batch.update(doc(db, 'tokens', token.id), updateData);
            batch.update(doc(db, 'hospitals', hId, 'tokens', token.id), updateData);
            if (token.patientId) {
              batch.update(doc(db, 'users', token.patientId, 'bookings', token.id), updateData);
              batch.update(doc(db, 'users', token.patientId), {
                missedBookings: increment(1)
              });
            }
            
            toast.warning(`${token.tokenNumber} ${token.patientName} ko automatically Not Arrived mark kar diya gaya`);
          }
        }
        if (settings.alertBeforeAutoMark === false) {
          await batch.commit();
        }
      }
    };

    checkNoShows();
    const interval = setInterval(checkNoShows, 60000);
    return () => clearInterval(interval);
  }, [hospitalData?.uid, hospitalData?.id, hospitalData?.settings, tokens]);

  // Listen to ALL tokens for this hospital
  useEffect(() => {
    let isMounted = true;
    const hId = initialHospitalData?.uid || initialHospitalData?.id || auth.currentUser?.uid;
    if (!hId) return;
    
    setIsSyncing(true);
    console.log('Fetching tokens for Hospital ID:', hId);

    // FIX: Remove orderBy to avoid index requirement, sort client-side instead
    const qMain = query(
      collection(db, 'tokens'), 
      where('hospitalId', '==', hId)
    );

    const qSub = query(
      collection(db, 'hospitals', hId, 'tokens')
    );

    const handleSnapshot = (snapshot: any, source: string) => {
      if (isMounted) {
        const fetchedTokens = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        console.log(`Tokens from ${source}:`, fetchedTokens.length);
        
        setTokens(prev => {
          // Merge and avoid duplicates
          const combined = [...prev];
          fetchedTokens.forEach((t: any) => {
            const exists = combined.findIndex(ex => ex.id === t.id);
            if (exists === -1) combined.push(t);
            else combined[exists] = t;
          });
          // Client-side sort by createdAt desc
          return combined.sort((a: any, b: any) => {
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
            return timeB - timeA;
          });
        });
        
        // Notification logic
        snapshot.docChanges().forEach((change: any) => {
          if (change.type === 'added' && !snapshot.metadata.hasPendingWrites) {
            if (Date.now() - lastNotificationTime > 2000) {
              setNewTokenId(change.doc.id);
              setTimeout(() => setNewTokenId(null), 8000);
            }
          }
        });

        setIsLoading(false);
        setIsSyncing(false);
      }
    };

    const unsubscribeMain = onSnapshot(qMain, (snap) => handleSnapshot(snap, 'main'), (err) => {
      console.error("Main Collection Error:", err);
      // If index error, it won't crash the whole app if caught
    });

    const unsubscribeSub = onSnapshot(qSub, (snap) => handleSnapshot(snap, 'sub'), (err) => {
      console.error("Sub Collection Error:", err);
    });

    return () => {
      isMounted = false;
      unsubscribeMain();
      unsubscribeSub();
    };
  }, [initialHospitalData?.uid, initialHospitalData?.id]);

  const updateTokenStatus = async (tokenId: string, status: string, patientId?: string) => {
    // Optimistic Update
    const oldTokens = [...tokens];
    const newStatus = status.toLowerCase();
    setTokens(prev => prev.map(t => t.id === tokenId ? { ...t, status: newStatus } : t));

    try {
      if (!initialHospitalData?.uid) return;
      
      const updateData = { 
        status: newStatus, 
        updatedAt: serverTimestamp(),
      };
      
      const batch = writeBatch(db);
      
      // Get current token data to check previous status
      const tokenRef = doc(db, 'tokens', tokenId);
      const tokenSnap = await getDoc(tokenRef);
      const oldStatus = tokenSnap.exists() ? tokenSnap.data().status?.toLowerCase() : '';

      // Update tokens collection
      batch.update(tokenRef, updateData);
      
      // Update hospital's subcollection
      batch.update(doc(db, 'hospitals', initialHospitalData.uid, 'tokens', tokenId), updateData);
      
      // Update patient's history and stats
      if (patientId) {
        batch.update(doc(db, 'users', patientId, 'bookings', tokenId), updateData);
        
        // Stats tracking
        if (newStatus === 'completed' && oldStatus !== 'completed') {
          batch.update(doc(db, 'users', patientId), { 
            completedBookings: increment(1) 
          });
          // Celebration for completion
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#0B5FFF', '#00D1FF', '#10B981']
          });
          toast.success(t.ux.toasts.booking_completed);
        } else if (newStatus === 'not-arrived' && oldStatus !== 'not-arrived') {
          batch.update(doc(db, 'users', patientId), { 
            missedBookings: increment(1) 
          });
          toast.warning(t.ux.toasts.patient_missed);
        }
      }

      // Automatically generate invoice if status marked completed
      if (newStatus === 'completed' && oldStatus !== 'completed') {
        if (tokenSnap.exists()) {
          const tData = { id: tokenSnap.id, ...tokenSnap.data() };
          createOrGetInvoice(tData, hospitalData).catch(err => {
            console.error("Auto invoice generation error:", err);
          });
        }
      }
      
      await batch.commit();
    } catch (err) {
      console.error("Error updating token:", err);
      setTokens(oldTokens); // Revert on failure
      toast.error(t.errors.standard);
    }
  };

  const d = t.dashboard;

  const navItems = [
    { id: 'home', icon: LayoutDashboard, label: t.dashboard.nav.dashboard || 'DASHBOARD' },
    { id: 'doctors', icon: Stethoscope, label: 'DOCTORS • ڈاکٹرز' },
    { id: 'search', icon: Search, label: t.dashboard.search || 'SEARCH' },
    { id: 'data', icon: Activity, label: t.patient.booking.patients || 'PATIENTS' },
    { id: 'staff', icon: Users, label: t.dashboard.nav.staff || 'STAFF' },
    { id: 'invoices', icon: FileText, label: language === 'UR' ? 'انوائسز' : 'Invoices' },
    { id: 'profile', icon: UserSquare2, label: t.patient.booking.editProfile }
  ];

  const renderDashboardHome = () => {
    const todayStr = getKarachiDateStr(new Date());
    const todaysTokens = tokens.filter(t => 
      t.appointmentDate === todayStr || 
      t.bookingDate === todayStr ||
      (t.createdAt?.toDate ? getKarachiDateStr(t.createdAt.toDate()) === todayStr : false)
    );
    
    const inProgressTokens = todaysTokens.filter(tok => (tok.status || '').toLowerCase() === 'in-progress');
    const waitingTokens = todaysTokens.filter(tok => {
      const s = (tok.status || tok.tokenStatus || '').toLowerCase();
      return s === 'waiting' || s === 'active';
    });
    
    if (isLoading) {
      return <DashboardSkeleton />;
    }

    return (
      <div className="p-8 space-y-10">
        {/* Reception Mode Button */}
        <button 
          onClick={openReceptionMode}
          className="w-full bg-slate-950 text-white p-8 rounded-[48px] flex items-center justify-between group hover:scale-[1.01] transition-all shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-primary group-hover:rotate-12 transition-transform">
              <Activity size={32} />
            </div>
            <div className="text-left">
              <h3 className="text-2xl font-black tracking-tight">{t.patient.booking.receptionMode}</h3>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{t.patient.booking.simpleTokenScreen}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all relative z-10">
            <span className="font-extrabold text-xs uppercase tracking-widest">{t.patient.booking.openReceptionMode}</span>
            <ChevronRight size={16} strokeWidth={3} />
          </div>
        </button>

        {/* New Token Alert */}
        <AnimatePresence>
          {newTokenId && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-health-teal text-white p-4 rounded-3xl flex items-center justify-between shadow-lg shadow-health-teal/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                  <Bell size={20} />
                </div>
                <div>
                   <p className="font-black text-sm uppercase tracking-widest">{t.patient.booking.newTokenReceived || 'NEW TOKEN RECEIVED!'}</p>
                   <p className="text-xs font-bold opacity-90">{t.patient.booking.checkLiveQueue || 'Please check the live queue below'}</p>
                </div>
              </div>
              <button onClick={() => setNewTokenId(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No-Show Auto Alerts */}
        <div className="fixed bottom-24 right-8 z-[60] flex flex-col gap-4 pointer-events-none">
          <AnimatePresence>
            {noShowAlerts.map((alert, idx) => (
              <motion.div 
                key={idx}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                onAnimationComplete={() => {
                  setTimeout(() => {
                    setNoShowAlerts(prev => prev.filter((_, i) => i !== idx));
                  }, 5000);
                }}
                className="bg-amber-100 border border-amber-200 text-amber-800 p-4 rounded-2xl shadow-xl flex items-center gap-3 pointer-events-auto w-80"
              >
                <AlertTriangle size={20} className="shrink-0" />
                <p className="text-xs font-bold">{alert}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: d.tokensToday, val: dashboardStats.tokensToday, color: 'text-primary', icon: Ticket, sub: 'Issued' },
            { label: d.waitingNow, val: dashboardStats.waiting, color: 'text-amber-500', icon: Clock, sub: 'In Queue' },
            { label: d.completedToday, val: dashboardStats.completedToday, color: 'text-emerald-500', icon: CheckCircle2, sub: 'Done' },
            { label: d.revenueToday, val: `Rs. ${dashboardStats.revenueToday}`, color: 'text-health-teal', icon: Wallet, sub: 'Collected' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
               <div className="flex items-center justify-between mb-4">
                 <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                    <stat.icon size={24} />
                 </div>
                 <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{stat.sub}</span>
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{stat.label}</p>
               <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.val}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* LIVE QUEUE - 2/3 Width */}
           <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between px-2">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-health-teal rounded-full animate-ping" />
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                      {t.patient.booking.liveQueue || 'LIVE TOKEN QUEUE'}
                    </h3>
                 </div>
                 <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{todaysTokens.length} TOTAL</span>
                 </div>
              </div>

              <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden p-4 space-y-4">
                 {/* Current Serving */}
                 {inProgressTokens.length > 0 && (
                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-4">{t.patient.booking.inProgress}</p>
                      {inProgressTokens.map(token => (
                         <div key={token.id} className="p-8 bg-blue-50/50 rounded-[40px] border-2 border-blue-100 flex items-center justify-between shadow-xl shadow-blue-500/5">
                            <div className="flex items-center gap-6">
                               <div className="w-20 h-20 bg-white rounded-[32px] flex flex-col items-center justify-center border-2 border-blue-200 shadow-sm">
                                  <span className="text-[10px] font-black text-blue-400 uppercase leading-none">Token</span>
                                  <span className="text-3xl font-black text-blue-600" style={{ fontFamily: '"JetBrains Mono", monospace' }}>{token.tokenNumber}</span>
                               </div>
                               <div>
                                  <h4 className="text-xl font-black text-slate-900 leading-tight">{token.patientName}</h4>
                                  <p className="text-sm font-bold text-blue-500 uppercase tracking-widest mt-1">Dr. {token.doctorName}</p>
                                  <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-2">
                                     <Clock size={12} /> {token.appointmentDate} • {token.appointmentTime}
                                  </p>
                               </div>
                            </div>
                            <div className="flex gap-3">
                               <button 
                                 onClick={() => updateTokenStatus(token.id, 'completed', token.patientId)}
                                 className="px-8 py-4 bg-emerald-500 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
                               >
                                 {t.patient.booking.markDone}
                               </button>
                               <button 
                                 onClick={() => updateTokenStatus(token.id, 'not-arrived', token.patientId)}
                                 className="px-6 py-4 bg-slate-200 text-slate-600 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                               >
                                 {t.patient.booking.absent}
                               </button>
                            </div>
                         </div>
                      ))}
                   </div>
                 )}

                 {/* Waiting Queue */}
                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest ml-4">{t.patient.booking.waitingList}</p>
                    {waitingTokens.length === 0 ? (
                      <div className="py-2">
                        <div className="p-12 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] space-y-4">
                          <Ticket size={48} className="mx-auto text-slate-300" />
                          <h4 className="text-lg font-bold text-slate-900">🎫 Aaj koi token nahi aaya.</h4>
                          <p className="text-slate-500 text-sm font-medium">Patients aane ka intezaar hai!</p>
                          <button 
                            onClick={openReceptionMode}
                            className="px-6 py-3 bg-white text-primary border-2 border-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                          >
                            Open Reception Mode
                          </button>
                        </div>
                      </div>
                    ) : (
                      waitingTokens.map(token => (
                         <div 
                           key={token.id} 
                           className={`p-6 bg-slate-50/50 rounded-[32px] border border-slate-100 flex items-center justify-between hover:bg-white transition-all group ${newTokenId === token.id ? 'border-primary ring-4 ring-primary/10 animate-pulse' : ''}`}
                         >
                            <div className="flex items-center gap-6">
                               <div className="w-16 h-16 bg-white rounded-2xl flex flex-col items-center justify-center border border-slate-100 shadow-sm transition-transform group-hover:scale-105">
                                  <span className="text-[8px] font-bold text-slate-400 uppercase leading-none">Token</span>
                                  <span className="text-xl font-black text-slate-900" style={{ fontFamily: '"JetBrains Mono", monospace' }}>{token.tokenNumber}</span>
                               </div>
                               <div>
                                  <h4 className="font-bold text-slate-800 text-lg">{token.patientName}</h4>
                                  <div className="flex items-center gap-3 text-slate-400 mt-1">
                                    <span className="text-xs font-bold text-health-teal uppercase tracking-widest">DR. {token.doctorName}</span>
                                    <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                    <span className="text-xs font-bold">{token.appointmentTime}</span>
                                  </div>
                               </div>
                            </div>

                            <button 
                              onClick={() => updateTokenStatus(token.id, 'in-progress', token.patientId)}
                              className="px-6 py-4 bg-white border-2 border-primary text-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white shadow-xl shadow-primary/5 transition-all flex items-center gap-2"
                            >
                              <Play size={16} fill="currentColor" /> {t.patient.booking.startNow}
                            </button>
                         </div>
                      ))
                    )}
                 </div>
              </div>
           </div>

           {/* Today's Stats & Summary - 1/3 Width */}
           <div className="space-y-8">
              <div className="space-y-4">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{t.patient.booking.performance}</h3>
                 <div className="bg-slate-950 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full -mr-24 -mt-24 blur-3xl opacity-50" />
                    
                    <div className="space-y-8 relative">
                       <div>
                          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] mb-2">{t.patient.booking.revenue}</p>
                          <h2 className="text-5xl font-black tracking-tighter">Rs. {dashboardStats.revenueToday}</h2>
                       </div>
                       
                       <div className="space-y-6 pt-8 border-t border-white/10">
                          <div className="flex items-center justify-between">
                             <div className="flex flex-col">
                               <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{t.patient.booking.completed}</span>
                               <span className="text-white text-[10px] font-bold uppercase tracking-widest opacity-50">Today / Total</span>
                             </div>
                             <span className="text-xl font-black text-health-teal">{dashboardStats.completedToday} / {dashboardStats.totalCompleted}</span>
                          </div>
                          <div className="flex items-center justify-between">
                             <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{t.patient.booking.notArrived} (Total)</span>
                             <span className="text-xl font-black text-red-500">{dashboardStats.totalNotArrived}</span>
                          </div>
                          <div className="flex items-center justify-between">
                             <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{t.patient.booking.cancelled} (Total)</span>
                             <span className="text-xl font-black text-slate-600">{dashboardStats.totalCancelled}</span>
                          </div>
                       </div>

                       <div className="pt-8 border-t border-white/10 flex flex-col gap-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Revenue (All Time)</p>
                          <h3 className="text-2xl font-black text-health-teal">Rs. {dashboardStats.totalRevenue}</h3>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Doctor Availability */}
              <div className="space-y-4">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{language === 'UR' ? 'ڈاکٹرز کی حالت' : 'DOCTOR AVAILABILITY'}</h3>
                 <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-6 space-y-4">
                    {doctors.slice(0, 4).map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary font-bold shadow-sm">
                               {doc.name?.[0]}
                            </div>
                            <div>
                               <p className="text-sm font-bold text-slate-800">Dr. {doc.name}</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{doc.specialization}</p>
                            </div>
                         </div>
                         <div className={`w-2 h-2 rounded-full ${doc.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  };

  const renderSearch = () => {
    const filteredTokens = tokens.filter(t => 
      t.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.patientPhone?.includes(searchQuery) ||
      t.tokenNumber?.includes(searchQuery)
    );

    return (
      <div className="p-6 space-y-8 pb-32">
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
          <input 
            type="text"
            placeholder={d.search || "Search patients by name or phone..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-8 py-6 bg-white border border-slate-100 rounded-[32px] text-lg font-medium shadow-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d.search || 'Search Results'}</h3>
          {filteredTokens.length === 0 ? (
            <div className="py-20 text-center text-slate-400 font-medium">No matches found</div>
          ) : (
            filteredTokens.map((token) => (
              <div key={token.id} className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-all">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                      {token.patientName?.[0]}
                   </div>
                   <div>
                    <h4 className="text-lg font-bold text-slate-900">{token.patientName}</h4>
                    <div className="flex items-center gap-3">
                      <p className="text-xs text-slate-400 font-medium">{token.patientPhone || 'No phone'}</p>
                      {token.status === 'not-arrived' && (
                        <span className="flex items-center gap-1 text-[8px] font-black uppercase text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
                          <AlertTriangle size={8} /> {t.patient.booking.missed}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-3 justify-end mb-2">
                     <p className="text-[10px] items-center gap-1 hidden md:flex font-black text-slate-400 uppercase tracking-widest">
                       <CheckCircle2 size={10} className="text-health-teal" /> 
                       {token.completedBookings || 0}
                     </p>
                     <p className="text-[10px] items-center gap-1 hidden md:flex font-black text-slate-400 uppercase tracking-widest">
                       <X size={10} className="text-red-500" /> 
                       {token.missedBookings || 0}
                     </p>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{token.doctorName}</p>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                      token.status === 'completed' ? 'bg-health-teal/10 text-health-teal' : 
                      token.status === 'not-arrived' ? 'bg-red-50 text-red-500' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {token.status === 'not-arrived' ? t.patient.booking.notArrived : token.status}
                    </span>
                    {token.status === 'completed' && (
                      <button
                        onClick={() => { setSelectedInvoiceToken(token); setIsInvoiceOpen(true); }}
                        className="px-2.5 py-1 bg-[#0B5FFF] hover:scale-105 active:scale-95 text-white rounded-lg text-[9px] font-black tracking-wider uppercase cursor-pointer"
                      >
                        Ledger
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderPatientsData = () => {
    const statsData = [
      { id: 1, label: d.completed, val: dashboardStats.totalCompleted, icon: CheckCircle2, color: 'text-health-teal', bg: 'bg-health-teal/10' },
      { id: 2, label: d.pending, val: dashboardStats.waiting, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-100' },
      { id: 3, label: d.notArrived, val: dashboardStats.totalNotArrived, icon: X, color: 'text-red-500', bg: 'bg-red-50' },
      { id: 4, label: d.totalToday, val: dashboardStats.tokensToday, icon: Users, color: 'text-primary', bg: 'bg-primary/10' }
    ];

    return (
      <div className="p-6 space-y-10 pb-32">
        <div className="grid grid-cols-2 gap-4">
          {statsData.map((stat) => (
            <div key={stat.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
              <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{stat.val}</p>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</h4>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900">{t.patient.booking.noShowsToday}</h3>
                <span className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-black">
                  {tokens.filter(t => t.status === 'not-arrived' && (t.appointmentDate === new Date().toISOString().split('T')[0] || (t.createdAt?.toDate ? t.createdAt.toDate().toISOString().split('T')[0] === new Date().toISOString().split('T')[0] : false))).length}
                </span>
             </div>
             <div className="space-y-3">
               {tokens
                 .filter(t => t.status === 'not-arrived' && (t.appointmentDate === new Date().toISOString().split('T')[0] || (t.createdAt?.toDate ? t.createdAt.toDate().toISOString().split('T')[0] === new Date().toISOString().split('T')[0] : false)))
                 .slice(0, 5)
                 .map(t => (
                 <div key={t.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                   <div>
                     <p className="text-sm font-bold text-slate-800">{t.tokenNumber} {t.patientName}</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.appointmentTime}</p>
                   </div>
                   <X size={16} className="text-red-300" />
                 </div>
               ))}
               {tokens.filter(t => t.status === 'not-arrived' && (t.appointmentDate === new Date().toISOString().split('T')[0] || (t.createdAt?.toDate ? t.createdAt.toDate().toISOString().split('T')[0] === new Date().toISOString().split('T')[0] : false))).length === 0 && (
                 <div className="py-12 text-center text-slate-300 font-bold tracking-widest text-[10px]">NO MISSES YET</div>
               )}
             </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900">Patient Flow</h3>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.patient.booking.noShowRate}</p>
                  <p className="text-lg font-black text-red-500">12%</p>
                </div>
             </div>
             
             <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={sampleChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: '#f8fafc' }}
                      />
                      <Bar dataKey="patients" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const [newStaff, setNewStaff] = useState({
    name: '',
    role: 'Doctor',
    department: '',
    shift: 'Morning',
    phone: '',
    cnic: '',
    joiningDate: new Date().toISOString().split('T')[0]
  });

  // Generate and filter available slots for walk-ins
  const getWalkInAvailableSlots = (docId: string) => {
    const todayStr = getKarachiDateStr(new Date());
    const bookedSlots = tokens
      .filter(t => t.doctorId === docId && t.appointmentDate === todayStr && (t.status !== 'cancelled' && t.status !== 'expired'))
      .map(t => t.appointmentTime || t.bookingTime);
    
    const allSlots = [
      '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
      '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
      '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
      '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM'
    ];
    return allSlots.filter(slot => !bookedSlots.includes(slot));
  };

  // --- DOCTOR MANAGEMENT SYSTEM CORE ---
  const renderDoctorsTab = () => {
    // If a doctor desk is active, render the console workspace instead
    if (activeDoctorConsoleId) {
      const activeDocData = doctors.find(d => d.id === activeDoctorConsoleId);
      if (!activeDocData) {
        setActiveDoctorConsoleId(null);
        return null;
      }

      // Filter today's tokens for this doctor
      const todayStr = getKarachiDateStr(new Date());
      const docTokens = tokens.filter(t => t.doctorId === activeDoctorConsoleId && t.appointmentDate === todayStr);
      
      const currentPatient = docTokens.find(t => t.status === 'In Progress' || t.status === 'in-progress');
      const docQueue = docTokens.filter(t => t.status === 'Waiting' || t.status === 'waiting')
        .sort((a, b) => {
          const numA = parseInt(a.tokenNumber?.replace(/\D/g, '') || '0');
          const numB = parseInt(b.tokenNumber?.replace(/\D/g, '') || '0');
          return numA - numB;
        });
      const servicedToday = docTokens.filter(t => t.status === 'Completed' || t.status === 'completed');

      const updateDoctorLiveStatus = async (newLiveStatus: string) => {
        try {
          await updateDoc(doc(db, `hospitals/${hospitalData.uid}/doctors`, activeDoctorConsoleId), {
            liveStatus: newLiveStatus
          });
          toast.success(`Doctor status changed to: ${newLiveStatus}`);
        } catch (e) {
          console.error(e);
        }
      };

      const handleCallNext = async () => {
        try {
          const batch = writeBatch(db);
          
          // 1. Mark previous active patient (if any) as completed
          if (currentPatient) {
            batch.update(doc(db, 'tokens', currentPatient.id), {
              status: 'completed',
              completedAt: serverTimestamp()
            });
            // Update patient aggregated totals
            if (currentPatient.patientId) {
              batch.update(doc(db, 'users', currentPatient.patientId), {
                completedBookings: increment(1)
              });
            }
          }

          // 2. Take first patient in queue and set to in-progress
          if (docQueue.length > 0) {
            const nextInLine = docQueue[0];
            batch.update(doc(db, 'tokens', nextInLine.id), {
              status: 'in-progress',
              calledAt: serverTimestamp()
            });
            toast.success(`Calling Patient: ${nextInLine.patientName} (${nextInLine.tokenNumber})`);
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.7 }
            });
          } else {
            toast.info("No more patients waiting in queue.");
          }

          await batch.commit();
        } catch (err) {
          console.error(err);
          toast.error("Unable to update doctor queue states");
        }
      };

      const handleMarkNoShow = async () => {
        if (!currentPatient) {
          toast.warning("No active patient is currently called to mark as absent.");
          return;
        }

        try {
          const batch = writeBatch(db);
          
          // Mark current as expired (requirement 4)
          batch.update(doc(db, 'tokens', currentPatient.id), {
            status: 'expired',
            tokenStatus: 'expired',
            expired: true,
            expiredAt: serverTimestamp()
          });

          if (currentPatient.patientId) {
            batch.update(doc(db, 'users', currentPatient.patientId), {
              missedBookings: increment(1)
            });
          }

          toast.warning(`Token ${currentPatient.tokenNumber} marked as expired due to absence`);

          // Automatically call next patient (requirement 4)
          if (docQueue.length > 0) {
            const nextInLine = docQueue[0];
            batch.update(doc(db, 'tokens', nextInLine.id), {
              status: 'in-progress',
              calledAt: serverTimestamp()
            });
            toast.success(`Line advanced. Calling next: ${nextInLine.patientName}`);
          }

          await batch.commit();
        } catch (err) {
          console.error(err);
          toast.error("Failed to mark patient as absent");
        }
      };

      return (
        <div className="p-6 space-y-8 animate-in fade-in duration-300 max-w-7xl pb-32">
          {/* Console Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setActiveDoctorConsoleId(null)}
                className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 transition-colors"
                title="Back to Directory"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">Dr. {activeDocData.name} Desk</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  {activeDocData.specialization} • Practice Desk Console
                </p>
              </div>
            </div>

            {/* Live Status selector */}
            <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm shrink-0">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DR. STATUS:</span>
              <div className="flex gap-2.5">
                {['Active', 'On-break', 'Off-duty'].map((st) => (
                  <button
                    key={st}
                    onClick={() => updateDoctorLiveStatus(st)}
                    className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors ${
                      (activeDocData.liveStatus || 'Active') === st 
                        ? st === 'Active' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                          : st === 'On-break' ? 'bg-amber-400 text-slate-900' 
                          : 'bg-red-500 text-white'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-500'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Workspace: serving area */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* CURRENT ACTIVE PATIENT PANEL */}
              <div className="bg-gradient-to-br from-slate-900 to-[#12223c] rounded-[40px] p-8 sm:p-10 text-white relative overflow-hidden shadow-xl border border-white/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
                
                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                    <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">IN CLINIC RIGHT NOW</span>
                  </div>
                  <span className="text-[9px] font-bold text-white/40 tracking-widest border border-white/10 px-2.5 py-1 rounded-xl">STAGE 01</span>
                </div>

                <div className="flex flex-col items-center justify-center text-center py-6">
                  {currentPatient ? (
                    <div className="space-y-6 w-full">
                      <div className="inline-flex items-center justify-center bg-primary/20 border-2 border-primary/40 px-8 py-5 rounded-3xl mb-2">
                        <span className="text-7xl font-mono font-black text-sky-400 leading-none">
                          {currentPatient.tokenNumber}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">{currentPatient.patientName}</h4>
                        <p className="text-xs text-sky-300 font-bold tracking-widest uppercase">
                          Appt Slot: {currentPatient.appointmentTime}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium font-mono">
                          Tracking ID: {currentPatient.id}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 py-8 text-center text-slate-400">
                      <Activity size={48} className="mx-auto text-slate-600 animate-pulse" />
                      <div>
                        <p className="font-bold text-lg text-slate-200">No Patient is Currently Called</p>
                        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Click Call Next Patient below to start</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Desk controls panel */}
                <div className="grid grid-cols-2 gap-4 mt-10 pt-8 border-t border-white/5">
                  <button
                    onClick={handleCallNext}
                    disabled={docQueue.length === 0 && !currentPatient}
                    className="py-4 px-6 bg-health-teal hover:bg-teal-600 font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-98 transition-all shadow-lg text-xs tracking-wider uppercase"
                  >
                    <Play size={16} /> Call Next Patient
                  </button>
                  <button
                    onClick={handleMarkNoShow}
                    disabled={!currentPatient}
                    className="py-4 px-6 bg-red-600 hover:bg-red-700 disabled:opacity-40 font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-98 transition-all shadow-lg text-xs tracking-wider uppercase text-white"
                  >
                    <AlertTriangle size={16} /> Mark No-Show / Expire
                  </button>
                </div>
              </div>

              {/* SERVICED LIST TODAY */}
              <div className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Serviced Today ({servicedToday.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                  {servicedToday.map(tok => (
                    <div key={tok.id} className="p-4 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                      <div>
                        <p className="text-xs font-black text-slate-700 uppercase">{tok.patientName}</p>
                        <span className="text-[9px] text-slate-400 font-bold uppercase">{tok.appointmentTime}</span>
                      </div>
                      <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-lg uppercase">
                        #{tok.tokenNumber} • DONE
                      </span>
                    </div>
                  ))}
                  {servicedToday.length === 0 && (
                    <div className="col-span-1 md:col-span-2 py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                      No patients processed yet today.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Sidebar: Active Queue */}
            <div className="lg:col-span-4 flex flex-col">
              <div className="bg-white rounded-[36px] border border-slate-100 p-6 flex-1 flex flex-col shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Waiting List ({docQueue.length})</h3>
                  <span className="px-2.5 py-1 bg-sky-50 text-sky-600 rounded-lg text-[9px] font-black uppercase">LIVE QUEUE</span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto max-h-[460px] pr-1">
                  {docQueue.map((tok, index) => (
                    <div key={tok.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center font-mono font-bold text-xs text-slate-600 shadow-sm">
                          {tok.tokenNumber}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-700 uppercase max-w-[140px] truncate">{tok.patientName}</p>
                          <p className="text-[8px] text-slate-400 font-bold uppercase">Time: {tok.appointmentTime}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black text-slate-400">#{index + 1} waiting</span>
                    </div>
                  ))}
                  {docQueue.length === 0 && (
                    <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">
                      Queue is Empty
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6 space-y-10 pb-32 animate-in fade-in duration-500">
        
        {/* Doctors Stats top grid */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Physician Directory</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Manage doctors, schedules & live practice desks</p>
          </div>
          <button 
            onClick={() => {
              setEditingDoctorId(null);
              setNewDoctor({
                name: '', phone: '', email: '', specialization: 'General Physician',
                days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], startTime: '09:00 AM', endTime: '05:00 PM',
                fee: 1500, consultationTime: 12, pmdcId: '', status: 'Active', gender: 'Male'
              });
              setShowAddDoctorModal(true);
            }}
            className="px-6 py-3 bg-health-teal text-white font-bold rounded-2xl flex items-center gap-2 hover:scale-[1.02] transition-transform active:scale-95 shadow-lg shadow-health-teal/15 text-xs tracking-wider uppercase shrink-0"
          >
            <Plus size={18} /> Register New Doctor
          </button>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map(docData => {
            const statusColor = (docData.liveStatus || 'Active') === 'Active' ? 'bg-emerald-500' : (docData.liveStatus === 'On-break' ? 'bg-amber-400' : 'bg-red-500');
            const placeholderAvatar = `https://images.unsplash.com/photo-${docData.gender === 'Female' ? '1559839734-2b71ea197ec2' : '1622253692010-333f2da6031d'}?q=80&w=300&auto=format&fit=crop`;
            
            return (
              <div key={docData.id} className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm flex flex-col justify-between group hover:border-primary/10 transition-all hover:shadow-md relative">
                
                {/* PMDC badge */}
                {docData.pmdcId && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-sky-50 border border-sky-100 px-2.5 py-1 rounded-xl" title={`PMDC ID: ${docData.pmdcId}`}>
                    <ShieldCheck size={12} className="text-sky-500" />
                    <span className="text-[8px] font-black uppercase text-sky-600 tracking-wider">PMDC Verified</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <img 
                      src={placeholderAvatar} 
                      alt={docData.name} 
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 shrink-0"
                    />
                    <div className="truncate">
                      <h4 className="font-black text-slate-800 text-lg truncate leading-snug">Dr. {docData.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{docData.specialization}</p>
                    </div>
                  </div>

                  <div className="space-y-3.5 border-t border-slate-50 pt-4 mb-6">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /> Schedule:</span>
                      <span className="font-bold text-slate-700 truncate max-w-[140px] uppercase text-[10px] bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg">{docData.days?.join(', ')}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /> Clinic Hours:</span>
                      <span className="font-bold text-slate-700 text-[10px] font-mono">{docData.startTime} - {docData.endTime}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1.5"><Users size={14} className="text-slate-400" /> Consultation:</span>
                      <span className="font-bold text-slate-700 text-[10px] uppercase">{docData.consultationTime} min / case</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1.5"><Wallet size={14} className="text-slate-400" /> Clinic Fee:</span>
                      <span className="font-black text-emerald-600 text-xs font-mono">PKR {Number(docData.fee || 1500).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1.5"><Activity size={14} className="text-slate-400" /> Live Status:</span>
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${statusColor}`} />
                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{docData.liveStatus || 'Active'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card actions */}
                <div className="grid grid-cols-1 gap-2 border-t border-slate-100 pt-4">
                  <button
                    onClick={() => {
                      setActiveDoctorConsoleId(docData.id);
                    }}
                    className="w-full py-3 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-600 active:scale-98 transition-all text-[11px] tracking-wider uppercase shadow-sm shadow-primary/10"
                  >
                    <LayoutDashboard size={14} /> Launch Desk Console
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setEditingDoctorId(docData.id);
                        setNewDoctor({
                          name: docData.name || '',
                          phone: docData.phone || '',
                          email: docData.email || '',
                          specialization: docData.specialization || 'General Physician',
                          days: docData.days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                          startTime: docData.startTime || '09:00 AM',
                          endTime: docData.endTime || '05:00 PM',
                          fee: Number(docData.fee || 1500),
                          consultationTime: Number(docData.consultationTime || 12),
                          pmdcId: docData.pmdcId || '',
                          status: docData.status || 'Active',
                          gender: docData.gender || 'Male'
                        });
                        setShowAddDoctorModal(true);
                      }}
                      className="py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold rounded-xl text-[10px] tracking-wider uppercase text-center border border-slate-100 flex items-center justify-center gap-1.5"
                    >
                      <Edit size={12} /> Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Are you sure you want to delete Dr. ${docData.name}?`)) {
                          try {
                            await deleteDoc(doc(db, `hospitals/${hospitalData.uid}/doctors`, docData.id));
                            toast.success("Doctor deleted successfully.");
                          } catch (err) {
                            console.error(err);
                          }
                        }
                      }}
                      className="py-2 bg-red-50 hover:bg-red-100 text-red-500 font-bold rounded-xl text-[10px] tracking-wider uppercase text-center border border-red-100/30 flex items-center justify-center gap-1.5"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
          {doctors.length === 0 && (
            <div className="col-span-1 md:col-span-3 py-24 bg-white border border-slate-100 rounded-[44px] text-center space-y-4">
              <Stethoscope size={56} className="mx-auto text-slate-300" />
              <p className="text-lg font-bold text-slate-600">No Doctors Registered Yet</p>
              <p className="text-xs text-slate-400 uppercase tracking-widest max-w-sm mx-auto">Click "Register New Doctor" above to bootstrap your medical staff roster.</p>
            </div>
          )}
        </div>

      </div>
    );
  };

  const renderStaffList = () => (
    <div className="p-6 space-y-10 pb-32">
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
        <h3 className="text-2xl font-bold text-slate-900">{d.addStaff}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input 
            placeholder="Full Name"
            value={newStaff.name}
            onChange={e => setNewStaff({...newStaff, name: e.target.value})}
            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-medium"
          />
          <select 
            value={newStaff.role}
            onChange={e => setNewStaff({...newStaff, role: e.target.value})}
            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-slate-500"
          >
            {['Doctor', 'Nurse', 'Receptionist', 'Pharmacist', 'Lab Technician', 'Security', 'Cleaner', 'Other'].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <input 
            placeholder="Department"
            value={newStaff.department}
            onChange={e => setNewStaff({...newStaff, department: e.target.value})}
            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-medium"
          />
          <select 
            value={newStaff.shift}
            onChange={e => setNewStaff({...newStaff, shift: e.target.value})}
            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-slate-500"
          >
            {['Morning', 'Evening', 'Night'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input 
            placeholder="Phone Number"
            value={newStaff.phone}
            onChange={e => setNewStaff({...newStaff, phone: e.target.value})}
            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-medium"
          />
          <input 
            placeholder="CNIC"
            value={newStaff.cnic}
            onChange={e => setNewStaff({...newStaff, cnic: e.target.value})}
            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-medium"
          />
        </div>
        <LoadingButton 
          isLoading={isSaving}
          loadingText={editingStaffId ? t.ux.saving : t.ux.adding}
          onClick={async () => {
            if (!newStaff.name) return;
            setIsSaving(true);
            try {
              if (editingStaffId) {
                await updateDoc(doc(db, `hospitals/${hospitalData.uid}/staff`, editingStaffId), {
                  ...newStaff,
                  updatedAt: serverTimestamp()
                });
                setEditingStaffId(null);
              } else {
                await addDoc(collection(db, `hospitals/${hospitalData.uid}/staff`), {
                  ...newStaff,
                  status: 'active',
                  createdAt: serverTimestamp()
                });
              }
              setNewStaff({
                name: '',
                role: 'Doctor',
                department: '',
                shift: 'Morning',
                phone: '',
                cnic: '',
                joiningDate: new Date().toISOString().split('T')[0]
              });
            } catch (err) {
              console.error(err);
            } finally {
              setIsSaving(false);
            }
          }}
          disabled={isSaving}
          className="w-full py-5 bg-primary text-white text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          {editingStaffId ? t.common?.save || 'Update Staff' : d.addStaff}
        </LoadingButton>
        {editingStaffId && (
          <button 
            onClick={() => {
              setEditingStaffId(null);
              setNewStaff({
                name: '', role: 'Doctor', department: '', shift: 'Morning', phone: '', cnic: '', joiningDate: new Date().toISOString().split('T')[0]
              });
            }}
            className="w-full mt-2 py-4 text-slate-400 font-bold text-sm uppercase tracking-widest"
          >
            Cancel Edit
          </button>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Staff Members</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {staff.map(member => (
            <div key={member.id} className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <UserPlus size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 leading-tight">{member.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase tracking-widest">{member.role}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{member.department}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setEditingStaffId(member.id);
                    setNewStaff({
                      name: member.name,
                      role: member.role,
                      department: member.department,
                      shift: member.shift,
                      phone: member.phone,
                      cnic: member.cnic,
                      joiningDate: member.joiningDate
                    });
                  }}
                  className="p-3 text-slate-400 hover:text-primary transition-colors"
                >
                  <Edit size={20} />
                </button>
                <button 
                  onClick={() => deleteDoc(doc(db, `hospitals/${hospitalData.uid}/staff`, member.id))}
                  className="p-3 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTokens = () => (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 font-display">Token Management</h2>
        <button 
          onClick={() => {
            setWalkInSuccessToken(null);
            setWalkInForm({
              patientName: '',
              patientPhone: '',
              doctorId: doctors.length > 0 ? doctors[0].id : '',
              appointmentSlot: ''
            });
            setShowWalkInModal(true);
          }}
          className="px-6 py-3 bg-health-teal text-white font-bold rounded-2xl flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
        >
          <Plus size={20} /> Issue Walk-in Token
        </button>
      </div>
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <tr>
              <th className="px-8 py-4">Token #</th>
              <th className="px-8 py-4">Patient</th>
              <th className="px-8 py-4">Doctor</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tokens.map(token => (
              <tr key={token.id}>
                <td className="px-8 py-4 font-mono font-bold text-slate-900">#{token.tokenNumber}</td>
                <td className="px-8 py-4 font-bold text-slate-900">{token.patientName}</td>
                <td className="px-8 py-4 text-slate-500">{token.doctorName}</td>
                <td className="px-8 py-4">
                  <select 
                    value={token.status}
                    onChange={(e) => updateTokenStatus(token.id, e.target.value, token.patientId)}
                    className="bg-slate-50 border-none rounded-lg text-xs font-bold text-slate-600 focus:ring-primary cursor-pointer"
                  >
                    <option value="Waiting">Waiting</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-8 py-4 flex items-center gap-2">
                  <button onClick={() => deleteDoc(doc(db, 'tokens', token.id))} className="p-2 text-slate-300 hover:text-red-500 cursor-pointer" title="Delete Receipt"><Trash2 size={18} /></button>
                  {token.status?.toLowerCase() === 'completed' && (
                    <button 
                      onClick={() => { setSelectedInvoiceToken(token); setIsInvoiceOpen(true); }}
                      className="px-2.5 py-1.5 bg-gradient-to-r from-[#0B5FFF] to-[#00C9B1] hover:scale-105 active:scale-95 text-white rounded-lg transition-all text-[9px] font-black cursor-pointer uppercase flex items-center gap-1.5"
                      title="View Invoice"
                    >
                      <FileText size={12} />
                      <span>Invoice</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );


  const renderInvoices = () => {
    // Unique list of doctors from invoices for the filter dropdown
    const distinctDoctors = Array.from(new Set(invoices.map(inv => inv.doctorName)));

    const filteredInvoices = invoices.filter(inv => {
      // 1. Search filter: invoiceNumber or patientName
      const matchesSearch = inv.invoiceNumber.toLowerCase().includes(invoiceSearchQuery.toLowerCase()) || 
                            inv.patientName.toLowerCase().includes(invoiceSearchQuery.toLowerCase());
                            
      // 2. Doctor filter
      const matchesDoctor = invoiceDoctorFilter === 'All' || inv.doctorName === invoiceDoctorFilter;
      
      // 3. Date filter (exact or match substrings)
      const matchesDate = !invoiceDateFilter || inv.appointmentDate.includes(invoiceDateFilter);
      
      return matchesSearch && matchesDoctor && matchesDate;
    });

    const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const invoiceCount = filteredInvoices.length;

    return (
      <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {language === 'UR' ? 'انوائسز اور آمدنی' : 'Invoices & Revenue'}
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time ledger and financial accounting summary</p>
          </div>
        </div>

        {/* Financial KPI Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center font-black">
              <Wallet size={28} />
            </div>
            <div>
              <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">
                {language === 'UR' ? 'کل آمدنی' : 'Total Revenue'}
              </h4>
              <p className="text-slate-900 font-black text-3xl leading-none">
                Rs. {totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="w-16 h-16 bg-teal-50 text-[#00C9B1] rounded-3xl flex items-center justify-center font-black">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">
                {language === 'UR' ? 'کل کنسلٹیشنز' : 'Total Appointments'}
              </h4>
              <p className="text-slate-900 font-black text-3xl leading-none">
                {invoiceCount} {language === 'UR' ? 'انوائسز' : 'Invoices'}
              </p>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row gap-4 items-center">
          <div className="w-full md:w-1/3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Search Invoices</label>
            <input 
              type="text"
              placeholder="Search by ID or name..."
              value={invoiceSearchQuery}
              onChange={(e) => setInvoiceSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 text-slate-700/80 rounded-2xl px-4 py-3 text-xs font-bold focus:ring-[#0B5FFF] focus:border-[#0B5FFF]"
            />
          </div>

          <div className="w-full md:w-1/3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Filter by Doctor</label>
            <select
              value={invoiceDoctorFilter}
              onChange={(e) => setInvoiceDoctorFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 text-slate-700/80 rounded-2xl px-4 py-3 text-xs font-bold focus:ring-[#0B5FFF] focus:border-[#0B5FFF]"
            >
              <option value="All">{language === 'UR' ? 'تمام ڈاکٹرز' : 'All Doctors'}</option>
              {distinctDoctors.map((doc, idx) => (
                <option key={idx} value={doc}>Dr. {doc}</option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-1/3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Filter by Date</label>
            <input 
              type="date"
              value={invoiceDateFilter}
              onChange={(e) => setInvoiceDateFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 text-slate-700/80 rounded-2xl px-4 py-3 text-xs font-bold focus:ring-[#0B5FFF] focus:border-[#0B5FFF]"
            />
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          {filteredInvoices.length === 0 ? (
            <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
              No matching invoices found in history
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5">Invoice #</th>
                    <th className="px-8 py-5">Date</th>
                    <th className="px-5 py-5">Patient</th>
                    <th className="px-5 py-5">Doctor</th>
                    <th className="px-5 py-5">Fee</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-750">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5 font-mono font-black text-xs text-[#0B5FFF]">{inv.invoiceNumber}</td>
                      <td className="px-8 py-5 text-xs font-bold text-slate-500">{inv.appointmentDate}</td>
                      <td className="px-5 py-5 text-xs font-bold text-slate-900">{inv.patientName}</td>
                      <td className="px-5 py-5 text-xs font-bold text-slate-600">Dr. {inv.doctorName}</td>
                      <td className="px-5 py-5 text-xs font-black text-teal-600">Rs. {inv.totalAmount?.toLocaleString()}</td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => {
                            // Fetch corresponding token parameters to pass to InvoiceModal
                            const matchedTokenObj = tokens.find(t => t.id === inv.tokenId) || {
                              id: inv.tokenId,
                              tokenNumber: inv.tokenNumber,
                              patientName: inv.patientName,
                              patientPhone: inv.patientPhone,
                              doctorName: inv.doctorName,
                              appointmentDate: inv.appointmentDate,
                              appointmentTime: inv.appointmentTime,
                              fee: inv.consultationFee,
                              paymentMethod: inv.paymentMethod,
                              hospitalId: inv.hospitalId,
                            };
                            setSelectedInvoiceToken(matchedTokenObj);
                            setIsInvoiceOpen(true);
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-[#0B5FFF] to-[#00C9B1] hover:bg-gradient-to-r hover:from-blue-600 hover:to-teal-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                          title="View Invoice"
                        >
                          Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };


  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home': return renderDashboardHome();
      case 'doctors': return renderDoctorsTab();
      case 'search': return renderSearch();
      case 'data': return renderPatientsData();
      case 'staff': return renderStaffList();
      case 'profile': return renderProfile();
      case 'invoices': return renderInvoices();
      default: return renderDashboardHome();
    }
  };

  const [editProfileData, setEditProfileData] = useState<any>(null);
  
  useEffect(() => {
    if (hospitalData) {
      setEditProfileData({
        hospitalName: hospitalData.hospitalName,
        phone: hospitalData.phone || '',
        address: hospitalData.address || '',
        openingTime: hospitalData.openingTime || '',
        closingTime: hospitalData.closingTime || '',
        specializations: hospitalData.specializations || [],
        facilities: hospitalData.facilities || [],
        opdFee: hospitalData.opdFee || hospitalData.startingFee || ''
      });
    }
  }, [hospitalData]);

  const renderProfile = () => (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t.patient.booking.editProfile}</h2>
        <LoadingButton 
          isLoading={isSaving}
          loadingText={t.ux.saving}
          onClick={async () => {
            setIsSaving(true);
            try {
              await updateDoc(doc(db, 'hospitals', hospitalData.uid), editProfileData);
              toast.success(t.ux.toasts.profile_updated);
            } catch (err) {
              console.error(err);
              toast.error(t.errors.standard);
            } finally {
              setIsSaving(false);
            }
          }}
          className="px-8 py-3 bg-health-teal text-white rounded-2xl font-black text-sm shadow-xl shadow-health-teal/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
        >
          <Save size={18} /> {t.dashboard.saveChanges}
        </LoadingButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Basic Information</h4>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2 block">Hospital Name</label>
                <input 
                  type="text" 
                  value={editProfileData?.hospitalName || ''}
                  onChange={(e) => setEditProfileData({...editProfileData, hospitalName: e.target.value})}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-slate-700 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2 block">Phone Number</label>
                <input 
                  type="text" 
                  value={editProfileData?.phone || ''}
                  onChange={(e) => setEditProfileData({...editProfileData, phone: e.target.value})}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-slate-700 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2 block">Address</label>
                <textarea 
                  rows={2}
                  value={editProfileData?.address || ''}
                  onChange={(e) => setEditProfileData({...editProfileData, address: e.target.value})}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-slate-700 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">OPD Pricing</h4>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2 block">Consultation Fee (Rs.)</label>
              <input 
                type="number" 
                value={editProfileData?.opdFee || ''}
                onChange={(e) => setEditProfileData({...editProfileData, opdFee: e.target.value})}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-slate-700 transition-all"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                  <Settings size={20} />
               </div>
               <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">{t.patient.booking.tokenSettings}</h4>
            </div>

            <div className="space-y-6">
               <div>
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2 block">{t.patient.booking.noShowLimit} ({t.patient.booking.minutes})</label>
                 <input 
                   type="number" 
                   value={editProfileData?.settings?.noShowLimit || 15}
                   onChange={(e) => setEditProfileData({
                     ...editProfileData, 
                     settings: { ...editProfileData.settings, noShowLimit: Number(e.target.value) }
                   })}
                   className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-slate-700 transition-all"
                 />
               </div>

               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">{t.patient.booking.autoDetection}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Auto mark Not Arrived</p>
                  </div>
                  <button 
                    onClick={() => setEditProfileData({
                      ...editProfileData,
                      settings: { ...editProfileData?.settings, autoNoShow: !editProfileData?.settings?.autoNoShow }
                    })}
                    className={`w-12 h-6 rounded-full relative transition-all duration-300 ${editProfileData?.settings?.autoNoShow ? 'bg-health-teal' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${editProfileData?.settings?.autoNoShow ? 'right-1' : 'left-1'}`} />
                  </button>
               </div>

               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">{t.patient.booking.alertBeforeAutoMark}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Show alert in Reception Mode</p>
                  </div>
                  <button 
                    onClick={() => setEditProfileData({
                      ...editProfileData,
                      settings: { ...editProfileData?.settings, alertBeforeAutoMark: !editProfileData?.settings?.alertBeforeAutoMark }
                    })}
                    className={`w-12 h-6 rounded-full relative transition-all duration-300 ${editProfileData?.settings?.alertBeforeAutoMark ? 'bg-health-teal' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${editProfileData?.settings?.alertBeforeAutoMark ? 'right-1' : 'left-1'}`} />
                  </button>
               </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Operational Hours</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2 block">Opening Time</label>
                <input 
                  type="time" 
                  value={editProfileData?.openingTime || ''}
                  onChange={(e) => setEditProfileData({...editProfileData, openingTime: e.target.value})}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-slate-700 transition-all font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2 block">Closing Time</label>
                <input 
                  type="time" 
                  value={editProfileData?.closingTime || ''}
                  onChange={(e) => setEditProfileData({...editProfileData, closingTime: e.target.value})}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-slate-700 transition-all font-mono"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Specializations & Facilities</h4>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2 block">Specializations (comma separated)</label>
              <textarea 
                rows={3}
                value={editProfileData?.specializations?.join(', ') || ''}
                onChange={(e) => setEditProfileData({...editProfileData, specializations: e.target.value.split(',').map(s => s.trim())})}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-slate-700 transition-all resize-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2 block">Facilities (comma separated)</label>
              <textarea 
                rows={3}
                value={editProfileData?.facilities?.join(', ') || ''}
                onChange={(e) => setEditProfileData({...editProfileData, facilities: e.target.value.split(',').map(s => s.trim())})}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-slate-700 transition-all resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-[#F8FAFC] flex ${language === 'UR' ? 'font-urdu' : 'font-sans'} `} dir={language === 'UR' ? 'rtl' : 'ltr'}>
      {/* Sidebar - Hidden on mobile if bottom nav requested, but usually good to keep for tablet/desktop */}
      <aside 
        className={`hidden lg:flex fixed inset-y-0 z-50 bg-[#0F2236] text-white transition-all duration-300 w-64 translate-x-0 ${language === 'UR' ? 'right-0' : 'left-0'}`}
      >
        <div className="flex flex-col h-full w-full">
          <div className="p-8 flex items-center gap-3">
            <BrandLogo size={32} />
            <span className="text-xl font-bold tracking-tight">Xdoc Hospital</span>
          </div>

          <nav className="flex-1 px-4 py-10 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${
                  activeTab === item.id 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={22} />
                <span className="font-semibold">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-white/5 space-y-4">
             <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center font-bold">{hospitalData?.hospitalName?.[0]}</div>
                <div>
                   <p className="text-sm font-bold truncate max-w-[120px]">{hospitalData?.ownerName || 'Admin User'}</p>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{d.nav.signOut}</p>
                </div>
             </div>
             <button onClick={onSignOut} className="w-full py-4 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-all flex items-center justify-center gap-2">
                <LogOut size={16} /> Sign Out
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 lg:ml-64 ${language === 'UR' ? 'lg:mr-64 lg:ml-0' : 'lg:ml-64'}`}>
        {/* Header */}
        <header className="h-24 bg-gradient-to-r from-white/60 via-sky-50/40 to-white/60 backdrop-blur-2xl border-b border-indigo-100/30 flex items-center justify-between px-8 sticky top-0 z-40 shadow-[0_8px_30px_rgba(11,95,255,0.02)]">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
               <h1 className="text-xl font-black text-slate-900 tracking-tight truncate max-w-[300px]">
                 {hospitalData?.hospitalName || 'HOSPITAL DASHBOARD'}
               </h1>
               
               <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full">
                 <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-success-green breathing-dot' : 'bg-red-400'}`} />
                 <span className={`text-[10px] font-black uppercase tracking-widest ${isLive ? 'text-success-green' : 'text-red-400'}`}>
                    {isLive ? t.ux.live : t.ux.offline}
                 </span>
               </div>

               {isSyncing && (
                 <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/10 rounded-full animate-pulse">
                   <div className="w-2 h-2 rounded-full bg-primary animate-spin" />
                   <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                     Syncing
                   </span>
                 </div>
               )}

               <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${hospitalData?.status === 'open' ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {hospitalData?.status === 'open' ? t.patient.booking.status + ': OPEN' : t.patient.booking.status + ': CLOSED'}
                  </span>
                  <button 
                    onClick={async (e) => {
                      e.stopPropagation();
                      const newStatus = hospitalData?.status === 'open' ? 'closed' : 'open';
                      await updateDoc(doc(db, 'hospitals', hospitalData.uid), { status: newStatus });
                    }}
                    className={`w-12 h-6 rounded-full relative transition-all duration-300 shadow-inner ${hospitalData?.status === 'open' ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-md ${hospitalData?.status === 'open' ? 'right-1' : 'left-1'}`} />
                  </button>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden lg:flex items-center gap-3 px-6 border-r border-slate-100">
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentTime.toLocaleDateString()}</p>
                </div>
             </div>

             <button onClick={() => setLanguage(language === 'UR' ? 'EN' : 'UR')} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 hover:text-primary transition-colors">
                <Globe size={20} />
             </button>
             
             <button 
               onClick={onSignOut}
               className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all group"
             >
               <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
             </button>
          </div>
        </header>

        {/* View Content */}
        {renderActiveTab()}

        {/* Bottom Navigation (Mobile) */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-between lg:hidden z-50">
           {navItems.map((item) => (
             <button
               key={item.id}
               onClick={() => setActiveTab(item.id)}
               className={`flex flex-col items-center gap-1.5 transition-all ${
                 activeTab === item.id ? 'text-primary' : 'text-slate-300'
               }`}
             >
               <item.icon size={24} />
               <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
             </button>
           ))}
        </nav>

        <AnimatePresence>
          {showDataWarning && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl space-y-8"
              >
                <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-500 mx-auto">
                   <AlertTriangle size={40} />
                </div>
                <div className="text-center space-y-4">
                   <h3 className="text-2xl font-bold text-slate-900 leading-tight">Last 30 Days Data Detected</h3>
                   <p className="text-slate-500 font-medium">Platform rules require archiving or clearing data older than 30 days for optimal performance.</p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                   <button 
                    onClick={() => handleClearOldData(true)}
                    className="w-full py-5 bg-health-teal text-white font-bold rounded-2xl shadow-xl shadow-health-teal/20 active:scale-95 transition-all"
                   >
                     Archive & Clear
                   </button>
                   <button 
                    onClick={() => handleClearOldData(false)}
                    className="w-full py-5 bg-slate-50 text-slate-400 font-bold rounded-2xl active:scale-95 transition-all"
                   >
                     Delete Permanently
                   </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showReceptionMode && (
            <ReceptionMode 
              hospitalData={hospitalData}
              onClose={closeReceptionMode}
              tokens={tokens}
              updateTokenStatus={updateTokenStatus}
              doctors={doctors}
            />
          )}
        </AnimatePresence>

        {/* --- REGISTER / EDIT DOCTOR MODAL --- */}
        <AnimatePresence>
          {showAddDoctorModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className="bg-white rounded-[36px] border border-slate-100 p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{editingDoctorId ? 'Modify Doctor Credentials' : 'Register New Medical Specialist'}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Credentials verified in real-time under PMDC registries</p>
                  </div>
                  <button 
                    onClick={() => setShowAddDoctorModal(false)}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2 block">Doctor's Full Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Dr. Muhammad Asif"
                      value={newDoctor.name}
                      onChange={e => setNewDoctor({ ...newDoctor, name: e.target.value })}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-slate-700 text-sm transition-all"
                    />
                  </div>

                  {/* Specialization */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2 block">Clinic Department / Speciality</label>
                    <select 
                      value={newDoctor.specialization}
                      onChange={e => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-slate-700 text-sm transition-all"
                    >
                      {['General Physician', 'Cardiologist', 'Pediatrician', 'Gynecologist', 'Dermatologist', 'Orthopedic Surgeon', 'Neurologist', 'ENT Specialist', 'Dentist', 'Psychiatrist', 'Urologist', 'Other'].map(sp => (
                        <option key={sp} value={sp}>{sp}</option>
                      ))}
                    </select>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2 block">Contact Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="e.g. 03001234567"
                      value={newDoctor.phone}
                      onChange={e => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-slate-700 text-sm transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2 block">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="e.g. asif@xdoc.com"
                      value={newDoctor.email}
                      onChange={e => setNewDoctor({ ...newDoctor, email: e.target.value })}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-slate-700 text-sm transition-all"
                    />
                  </div>

                  {/* PMDC ID */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2 block">PMDC Registry Number (*)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 94819-P"
                      value={newDoctor.pmdcId}
                      onChange={e => setNewDoctor({ ...newDoctor, pmdcId: e.target.value })}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-slate-700 text-sm transition-all font-mono"
                    />
                  </div>

                  {/* Gender selection */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2 block">Gender (for avatar generation)</label>
                    <select 
                      value={newDoctor.gender}
                      onChange={e => setNewDoctor({ ...newDoctor, gender: e.target.value })}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-slate-700 text-sm transition-all animate-none"
                    >
                      <option value="Male">Male Specialist</option>
                      <option value="Female">Female Specialist</option>
                    </select>
                  </div>

                  {/* Clinic Timings */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2 block">OPD Start Time</label>
                    <select 
                      value={newDoctor.startTime}
                      onChange={e => setNewDoctor({ ...newDoctor, startTime: e.target.value })}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-slate-700 text-sm transition-all"
                    >
                      {['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'].map(tStr => (
                        <option key={tStr} value={tStr}>{tStr}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2 block">OPD Closing Time</label>
                    <select 
                      value={newDoctor.endTime}
                      onChange={e => setNewDoctor({ ...newDoctor, endTime: e.target.value })}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-slate-700 text-sm transition-all"
                    >
                      {['12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM'].map(tStr => (
                        <option key={tStr} value={tStr}>{tStr}</option>
                      ))}
                    </select>
                  </div>

                  {/* OPD Fee */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2 block">Consultation Fee (Rs.)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 1500"
                      value={newDoctor.fee}
                      onChange={e => setNewDoctor({ ...newDoctor, fee: Number(e.target.value) })}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-slate-700 text-sm transition-all"
                    />
                  </div>

                  {/* consultationTime limit */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2 block">Avg. Appt Booking Interval</label>
                    <select 
                      value={newDoctor.consultationTime}
                      onChange={e => setNewDoctor({ ...newDoctor, consultationTime: Number(e.target.value) })}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-slate-700 text-sm transition-all"
                    >
                      {[5, 10, 12, 15, 20, 30].map(mins => (
                        <option key={mins} value={mins}>{mins} Minutes</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Days checkboxes */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2 block">OPD Active Days of Practice</label>
                  <div className="flex flex-wrap gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                      const isActive = newDoctor.days.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const updatedDays = isActive 
                              ? newDoctor.days.filter(d => d !== day) 
                              : [...newDoctor.days, day];
                            setNewDoctor({ ...newDoctor, days: updatedDays });
                          }}
                          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                            isActive 
                              ? 'bg-primary text-white border-primary shadow-md' 
                              : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-4 border-t border-slate-100 pt-6">
                  <button
                    onClick={() => setShowAddDoctorModal(false)}
                    className="flex-1 py-4 bg-slate-50 text-slate-400 hover:bg-slate-100 font-bold rounded-2xl text-xs tracking-wider uppercase transition-all"
                  >
                    Discard Changes
                  </button>
                  <LoadingButton
                    isLoading={isSaving}
                    loadingText="Archiving..."
                    onClick={async () => {
                      if (!newDoctor.name || !newDoctor.pmdcId) {
                        toast.error("Doctor's PMDC number & Full Name cannot be empty.");
                        return;
                      }
                      setIsSaving(true);
                      try {
                        if (editingDoctorId) {
                          await updateDoc(doc(db, `hospitals/${hospitalData.uid}/doctors`, editingDoctorId), {
                            ...newDoctor,
                            updatedAt: serverTimestamp()
                          });
                          toast.success("Physician credentials updated successfully!");
                        } else {
                          await addDoc(collection(db, `hospitals/${hospitalData.uid}/doctors`), {
                            ...newDoctor,
                            liveStatus: 'Active',
                            createdAt: serverTimestamp()
                          });
                          toast.success("Medical specialist registered in live database!");
                        }
                        setShowAddDoctorModal(false);
                      } catch (err) {
                        console.error(err);
                        toast.error("Error committing physician states");
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    className="flex-1 py-4 bg-primary text-white hover:bg-indigo-600 font-bold rounded-2xl text-xs tracking-wider uppercase transition-all shadow-lg"
                  >
                    {editingDoctorId ? 'Apply Changes' : 'Confirm Registration'}
                  </LoadingButton>
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- SMART WALK-IN RESERVATION WIZARD MODAL --- */}
        <AnimatePresence>
          {showWalkInModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className="bg-white rounded-[36px] border border-slate-100 p-8 max-w-xl w-full shadow-2xl space-y-6 my-8"
              >
                {!walkInSuccessToken ? (
                  // STEP 1 & 2: Booking Form Layout
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-xl font-black text-slate-900">Issue Walk-In Reservation</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Reserve a validated appointment slot dynamically</p>
                      </div>
                      <button 
                        onClick={() => setShowWalkInModal(false)}
                        className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Patient Name */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2 block">Patient full name</label>
                        <input 
                          type="text" 
                          placeholder="Enter patient name..."
                          value={walkInForm.patientName}
                          onChange={e => setWalkInForm({ ...walkInForm, patientName: e.target.value })}
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-slate-700 text-sm transition-all"
                        />
                      </div>

                      {/* Patient Phone */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2 block">Patient WhatsApp phone (Optional)</label>
                        <input 
                          type="tel" 
                          placeholder="e.g. 03001234567"
                          value={walkInForm.patientPhone}
                          onChange={e => setWalkInForm({ ...walkInForm, patientPhone: e.target.value })}
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-slate-700 text-sm transition-all font-mono"
                        />
                      </div>

                      {/* Doctor Select */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2 block">Select doctor roster</label>
                        <select 
                          value={walkInForm.doctorId}
                          onChange={e => setWalkInForm({ ...walkInForm, doctorId: e.target.value, appointmentSlot: '' })}
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-slate-700 text-sm transition-all"
                        >
                          <option value="">-- Choose practicing doctor --</option>
                          {doctors.map(docData => (
                            <option key={docData.id} value={docData.id}>Dr. {docData.name} ({docData.specialization})</option>
                          ))}
                        </select>
                      </div>

                      {/* Smart Available Time Slots */}
                      {walkInForm.doctorId && (
                        <div className="space-y-3.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2 block">Smart available time slots</label>
                          <div className="grid grid-cols-3 gap-2 max-h-[160px] overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-100">
                            {getWalkInAvailableSlots(walkInForm.doctorId).map(slot => {
                              const isSelected = walkInForm.appointmentSlot === slot;
                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() => setWalkInForm({ ...walkInForm, appointmentSlot: slot })}
                                  className={`py-2 px-3 rounded-xl text-[10px] font-bold transition-all border text-center ${
                                    isSelected 
                                      ? 'bg-primary text-white border-primary shadow-sm font-black' 
                                      : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                                  }`}
                                >
                                  {slot}
                                </button>
                              );
                            })}
                            {getWalkInAvailableSlots(walkInForm.doctorId).length === 0 && (
                              <div className="col-span-3 py-6 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                Clinic fully booked today!
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Form actions */}
                    <div className="flex gap-4 border-t border-slate-100 pt-6">
                      <button
                        onClick={() => setShowWalkInModal(false)}
                        className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-400 font-bold rounded-2xl text-xs tracking-wider uppercase transition-all"
                      >
                        Cancel
                      </button>
                      <LoadingButton
                        isLoading={walkInLoading}
                        onClick={async () => {
                          if (!walkInForm.patientName || !walkInForm.doctorId || !walkInForm.appointmentSlot) {
                            toast.error("Please fill patient name, doctor, and chosen available time slot.");
                            return;
                          }
                          setWalkInLoading(true);
                          try {
                            const todayStr = getKarachiDateStr(new Date());
                            const selectedDocObj = doctors.find(d => d.id === walkInForm.doctorId);
                            const docName = selectedDocObj ? selectedDocObj.name : 'General Physician';
                            
                            // Generate customized sequential code count
                            const docTokensToday = tokens.filter(t => t.doctorId === walkInForm.doctorId && t.appointmentDate === todayStr);
                            const tokenSequential = docTokensToday.length + 1;
                            const docCode = selectedDocObj?.name?.split(' ').pop()?.substring(0,3)?.toUpperCase() || 'GEN';
                            const finalTokenCode = `${docCode}-${tokenSequential.toString().padStart(3, '0')}`;

                            const payload = {
                              hospitalId: hospitalData.uid,
                              hospitalOwnerUid: hospitalData.uid,
                              hospitalName: hospitalData.hospitalName,
                              patientName: walkInForm.patientName,
                              patientPhone: walkInForm.patientPhone || '',
                              doctorId: walkInForm.doctorId,
                              doctorName: docName,
                              doctorSpecialization: selectedDocObj?.specialization || 'General Practice',
                              tokenNumber: finalTokenCode,
                              status: 'Waiting',
                              fee: selectedDocObj?.fee || 1500,
                              appointmentDate: todayStr,
                              appointmentTime: walkInForm.appointmentSlot,
                              createdAt: serverTimestamp()
                            };

                            const docRef = await addDoc(collection(db, 'tokens'), payload);
                            
                            setWalkInSuccessToken({
                              id: docRef.id,
                              ...payload
                            });

                            toast.success("Walk-in token booking finalized!");
                            confetti({
                              particleCount: 100,
                              spread: 70,
                              origin: { y: 0.6 }
                            });
                          } catch (err) {
                            console.error(err);
                            toast.error(t.errors.standard);
                          } finally {
                            setWalkInLoading(false);
                          }
                        }}
                        className="flex-1 py-4 bg-health-teal text-white font-bold rounded-2xl text-xs tracking-wider uppercase transition-all shadow-lg"
                      >
                        Issue Token
                      </LoadingButton>
                    </div>
                  </div>
                ) : (
                  // SUCCESS & WHATSAPP SHARING SCREEN
                  <div className="space-y-6 text-center py-4">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto border border-emerald-100">
                      <CheckCircle2 size={36} className="animate-bounce" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-slate-900 leading-tight">Token Issued Successfully!</h3>
                      <p className="text-xs text-slate-500 font-medium">Reservations details and live tracker URL registered</p>
                    </div>

                    {/* Receipt breakdown */}
                    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4 text-left max-w-sm mx-auto">
                      <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TICKET ID / ٹوکن نمبر</span>
                        <span className="font-mono font-black text-primary text-lg">{walkInSuccessToken.tokenNumber}</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-bold">Patient:</span>
                          <span className="font-bold text-slate-800 uppercase">{walkInSuccessToken.patientName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-bold">Specialist:</span>
                          <span className="font-bold text-slate-700">Dr. {walkInSuccessToken.doctorName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-bold">Timings Slot:</span>
                          <span className="font-bold text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded text-[10px] uppercase">{walkInSuccessToken.appointmentTime}</span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-800 border-t border-slate-200/60 pt-2.5">
                          <span>OPD Fee Paid:</span>
                          <span className="font-mono text-emerald-600">PKR {Number(walkInSuccessToken.fee).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Sharing links buttons */}
                    <div className="space-y-3.5">
                      {/* WhatsApp branded link generator */}
                      <button
                        onClick={() => {
                          const rawPhone = walkInSuccessToken.patientPhone || '';
                          const trackerUrl = `https://xdoc.pages.dev/token/${walkInSuccessToken.id}`;
                          
                          // Elegant pre-packaged template with Karachi localized contexts
                          const msg = `*Xdoc Appointment Confirmed!* 🏥\n\nAssalam-o-Alaikum, *${walkInSuccessToken.patientName}*! Your appointment at *${hospitalData.hospitalName}* has been confirmed.\n\n*Details:*\n🔹 *Token #:* ${walkInSuccessToken.tokenNumber}\n🔹 *Physician:* Dr. ${walkInSuccessToken.doctorName}\n🔹 *Timing:* ${walkInSuccessToken.appointmentTime}\n🔹 *Consultation Fee:* Rs. ${walkInSuccessToken.fee}\n\n📲 *Live Token tracking dashboard/link:*\n${trackerUrl}\n\n*معزز مریض، آپ کا اپوائنٹمنٹ ٹوکن جاری کر دیا گیا ہے۔ لائیو وزٹ اسٹیٹس مانیٹر کرنے کے لیے اوپر دیے گئے لنک پر کلک کریں۔*`;
                          const encodedMsg = encodeURIComponent(msg);
                          
                          let waUrl = `https://api.whatsapp.com/send?text=${encodedMsg}`;
                          if (rawPhone) {
                            // Clean up international prefixes if Pakistani number format (e.g. convert 03 -> 923)
                            let cleanPhone = rawPhone.replace(/\D/g, '');
                            if (cleanPhone.startsWith('03')) {
                              cleanPhone = '92' + cleanPhone.substring(1);
                            }
                            waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`;
                          }
                          window.open(waUrl, '_blank');
                        }}
                        className="w-full max-w-sm py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 text-xs tracking-wider uppercase transition-transform active:scale-95 mx-auto shadow-lg shadow-emerald-500/15"
                      >
                        Send WhatsApp Alert • واٹس ایپ بھیجیں
                      </button>

                      {/* Copy Tracking URL button */}
                      <button
                        onClick={() => {
                          const trackerUrl = `https://xdoc.pages.dev/token/${walkInSuccessToken.id}`;
                          navigator.clipboard.writeText(trackerUrl);
                          toast.success("Tracking link copied to clipboard!");
                        }}
                        className="w-full max-w-sm py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl flex items-center justify-center gap-2 text-xs tracking-wider uppercase transition-all mx-auto"
                      >
                        <Copy size={14} /> Copy Tracker Url Link
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-4 max-w-sm mx-auto">
                      <button
                        onClick={() => {
                          setShowWalkInModal(false);
                          setWalkInSuccessToken(null);
                        }}
                        className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold rounded-2xl text-xs tracking-wider uppercase transition-all"
                      >
                        Exit Wizard
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Invoice Viewer Modal */}
      <InvoiceModal 
        isOpen={isInvoiceOpen} 
        onClose={() => { setIsInvoiceOpen(false); setSelectedInvoiceToken(null); }} 
        token={selectedInvoiceToken} 
        hospitalData={hospitalData} 
      />
    </div>
  );
};

export default HospitalDashboard;
