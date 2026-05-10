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
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  limit
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

interface HospitalDashboardProps {
  hospitalData: any;
  onSignOut: () => void;
}

const HospitalDashboard = ({ hospitalData: initialHospitalData, onSignOut }: HospitalDashboardProps) => {
  const { t, language, setLanguage } = useLanguage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'data' | 'staff' | 'profile'>('home');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hospitalData, setHospitalData] = useState(initialHospitalData);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDataWarning, setShowDataWarning] = useState(false);
  const [newTokenId, setNewTokenId] = useState<string | null>(null);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  // Filter today's tokens
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  const todayTokens = tokens.filter(t => t.appointmentDate === todayStr);

  const stats = {
    tokensToday: todayTokens.length,
    waiting: todayTokens.filter(t => t.status === 'Waiting' || t.status === 'waiting').length,
    completed: todayTokens.filter(t => t.status === 'Completed').length,
    revenueToday: todayTokens.reduce((sum, t) => sum + (t.status === 'Completed' ? (Number(t.fee) || 0) : 0), 0)
  };

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
    if (hospitalData?.uid) {
      const checkOldData = async () => {
        const q = query(
          collection(db, 'tokens'),
          where('hospitalId', '==', hospitalData.uid)
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
  }, [hospitalData?.uid]);

  // Listen to hospital data
  useEffect(() => {
    let isMounted = true;
    const fetchHospitalData = async () => {
      if (!initialHospitalData?.uid) return;
      try {
        const docRef = doc(db, 'hospitals', initialHospitalData.uid);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
          if (isMounted && docSnap.exists()) {
            setHospitalData({ uid: docSnap.id, ...docSnap.data() });
          }
        });
        return () => unsubscribe();
      } catch (error: any) {
        if (isMounted) console.error("Error fetching hospital data:", error);
      }
    };
    fetchHospitalData();
    return () => { isMounted = false; };
  }, [initialHospitalData?.uid]);

  // Listen to doctors
  useEffect(() => {
    let isMounted = true;
    const fetchDoctors = async () => {
      if (!initialHospitalData?.uid) return;
      try {
        const q = query(collection(db, `hospitals/${initialHospitalData.uid}/doctors`));
        const snapshot = await getDocs(q);
        if (isMounted) {
          setDoctors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      } catch (error: any) {
        if (isMounted) console.error("Error fetching doctors:", error);
      }
    };
    fetchDoctors();
    return () => { isMounted = false; };
  }, [initialHospitalData?.uid]);

  // Listen to staff
  useEffect(() => {
    let isMounted = true;
    const fetchStaff = async () => {
      if (!initialHospitalData?.uid) return;
      try {
        const q = query(collection(db, `hospitals/${initialHospitalData.uid}/staff`));
        const snapshot = await getDocs(q);
        if (isMounted) {
          setStaff(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      } catch (error: any) {
        if (isMounted) console.error("Error fetching staff:", error);
      }
    };
    fetchStaff();
    return () => { isMounted = false; };
  }, [initialHospitalData?.uid]);

  // Listen to tokens
  useEffect(() => {
    let isMounted = true;
    if (!initialHospitalData?.uid) return;
    
    const q = query(
      collection(db, 'tokens'), 
      where('hospitalId', '==', initialHospitalData.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isMounted) {
        const newTokens = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Sort client-side to avoid index requirement
        newTokens.sort((a: any, b: any) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        });

        // Check for new tokens to highlight
        const lastChange = snapshot.docChanges().find(change => change.type === 'added');
        if (lastChange && !snapshot.metadata.hasPendingWrites) {
          setNewTokenId(lastChange.doc.id);
          setTimeout(() => setNewTokenId(null), 5000);
        }

        setTokens(newTokens);
      }
    }, (error) => {
      if (isMounted) handleFirestoreError(error, OperationType.LIST, 'tokens');
    });

    return () => { 
      isMounted = false;
      unsubscribe();
    };
  }, [initialHospitalData?.uid]);

  const toggleStatus = async () => {
    if (!hospitalData?.uid) return;
    const newStatus = hospitalData.status === 'Open' ? 'Closed' : 'Open';
    try {
      await updateDoc(doc(db, 'hospitals', hospitalData.uid), { status: newStatus });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `hospitals/${hospitalData.uid}`);
    }
  };

  const handleClearOldData = async (shouldSave: boolean) => {
    if (!shouldSave) {
      // In a real app we'd delete documents older than 30 days
      // For now we just close the popup
      setShowDataWarning(false);
    } else {
      setShowDataWarning(false);
    }
  };

  const updateTokenStatus = async (tokenId: string, status: string, patientId?: string) => {
    try {
      if (!initialHospitalData?.uid) return;
      
      const tokenRef = doc(db, 'tokens', tokenId);
      const hospitalTokenRef = doc(db, 'hospitals', initialHospitalData.uid, 'tokens', tokenId);
      
      const updateData = { 
        status, 
        updatedAt: serverTimestamp(),
        // If status is completed/not arrived, mark it as processed
        processedAt: (status === 'Completed' || status === 'Not Arrived') ? serverTimestamp() : null
      };
      
      // Update tokens collection
      await updateDoc(tokenRef, updateData).catch(e => console.log("Main tokens update failed:", e));
      // Update hospital's subcollection
      await updateDoc(hospitalTokenRef, updateData).catch(e => console.log("Hospital tokens update failed:", e));
      
      // Update patient's history in users collection
      if (patientId) {
        const patientHistoryRef = doc(db, 'users', patientId, 'history', tokenId);
        await updateDoc(patientHistoryRef, updateData).catch(e => console.log("Patient history update failed:", e));
      }
    } catch (err) {
      console.error("Error updating token:", err);
    }
  };

  const d = t.dashboard;

  const navItems = [
    { id: 'home', icon: LayoutDashboard, label: d.nav.home || 'HOME' },
    { id: 'search', icon: Search, label: d.search || 'SEARCH' },
    { id: 'data', icon: Activity, label: language === 'UR' ? 'مریض' : 'PATIENTS' },
    { id: 'staff', icon: Users, label: d.nav.staff || 'STAFF' },
    { id: 'profile', icon: UserSquare2, label: t.patient.booking.editProfile }
  ];

  const renderDashboardHome = () => {
    const doctorsPresent = doctors.filter(d => d.status === 'Active' || d.status === 'Present').length;
    const staffPresent = staff.filter(s => s.status === 'Active' || s.status === 'Present').length;

    // Get busiest doctor
    const doctorCounts = todayTokens.reduce((acc: any, t) => {
      acc[t.doctorName] = (acc[t.doctorName] || 0) + 1;
      return acc;
    }, {});
    const busiestDocName = Object.entries(doctorCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'N/A';

    return (
      <div className="p-6 space-y-10 pb-32">
        {/* Top Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: t.patient.booking.tokensToday, count: stats.tokensToday, color: 'from-blue-500 to-blue-600', icon: Ticket },
            { label: t.patient.booking.waiting, count: stats.waiting, color: 'from-amber-400 to-amber-500', icon: Clock },
            { label: t.patient.booking.completed, count: stats.completed, color: 'from-emerald-500 to-emerald-600', icon: CheckCircle2 },
            { label: t.patient.booking.revenueToday, count: `Rs. ${stats.revenueToday}`, color: 'from-primary to-primary-dark', icon: Wallet },
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.color} opacity-[0.03] rounded-bl-[64px]`} />
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center mb-6 shadow-lg shadow-blue-500/10`}>
                <item.icon size={24} />
              </div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-1">{item.label}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{item.count}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Recent Tokens */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.dashboard.recentTokens.title}</h3>
              <button 
                onClick={() => setActiveTab('data')}
                className="text-xs font-bold text-primary hover:underline"
              >View All</button>
            </div>
            
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 space-y-3">
                {todayTokens.length === 0 ? (
                  <div className="py-20 text-center text-slate-300 font-bold italic">No tokens issued today</div>
                ) : (
                  todayTokens.slice(0, 8).map((token) => (
                    <div key={token.id} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-3xl border border-slate-100 hover:bg-white transition-all group">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white rounded-2xl flex flex-col items-center justify-center border border-slate-100 shadow-sm">
                           <span className="text-[8px] font-black text-slate-400 uppercase leading-none">Token</span>
                           <span className="text-lg font-black text-slate-900">{token.tokenNumber}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-base">{token.patientName}</h4>
                          <div className="flex items-center gap-3 text-slate-400 mt-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider">{token.doctorName}</span>
                            <div className="w-1 h-1 bg-slate-300 rounded-full" />
                            <span className="text-[10px] font-bold">{token.createdAt?.toDate?.() ? token.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${
                           token.status === 'Completed' ? 'bg-emerald-500 text-white border-emerald-600' :
                           token.status === 'Waiting' || token.status === 'waiting' ? 'bg-amber-400 text-white border-amber-500' :
                           token.status === 'Not Arrived' ? 'bg-red-500 text-white border-red-600' :
                           token.status === 'In Progress' ? 'bg-blue-500 text-white border-blue-600' :
                           'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                           {token.status === 'waiting' || token.status === 'Waiting' ? t.patient.booking.waiting : 
                            token.status === 'Completed' ? t.patient.booking.completed : 
                            token.status === 'Not Arrived' ? t.patient.booking.notArrived :
                            token.status === 'In Progress' ? 'In Progress' : token.status}
                        </span>

                        {(token.status === 'Waiting' || token.status === 'waiting' || token.status === 'In Progress') && (
                          <div className="flex gap-2">
                             <button 
                               onClick={() => updateTokenStatus(token.id, 'Completed', token.patientId)}
                               className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-emerald-600 hover:text-white transition-all"
                             >
                               {t.patient.booking.markDone}
                             </button>
                             <button 
                               onClick={() => updateTokenStatus(token.id, 'Not Arrived', token.patientId)}
                               className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-red-600 hover:text-white transition-all"
                             >
                               {t.patient.booking.notArrived}
                             </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Quick Stats</h3>
              <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 space-y-6">
                {[
                  { label: t.patient.booking.doctors, registered: doctors.length, present: doctorsPresent, icon: Stethoscope, color: 'text-blue-600' },
                  { label: t.patient.booking.staff, registered: staff.length, present: staffPresent, icon: Users, color: 'text-purple-600' },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${item.color}`}>
                          <item.icon size={20} />
                        </div>
                        <span className="font-bold text-slate-800">{item.label}</span>
                      </div>
                      <div className="text-right">
                         <p className="text-sm font-black text-slate-900">{item.present} <span className="text-slate-300">/ {item.registered}</span></p>
                         <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{t.patient.booking.present}</p>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                       <div 
                         className={`h-full ${item.color.replace('text', 'bg')} transition-all duration-1000`} 
                         style={{ width: `${item.registered > 0 ? (item.present / item.registered) * 100 : 0}%` }} 
                       />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Summary */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{t.patient.booking.summary}</h3>
              <div className="bg-slate-900 rounded-[40px] p-8 text-white space-y-6 shadow-2xl shadow-slate-900/20">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{t.patient.booking.tokensToday}</span>
                  <span className="text-2xl font-black">{stats.tokensToday}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{t.patient.booking.revenueToday}</span>
                  <span className="text-2xl font-black text-health-teal">Rs. {stats.revenueToday}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{t.patient.booking.busiestDoctor}</span>
                  <span className="text-sm font-bold text-right">{busiestDocName}</span>
                </div>
                <div className="flex items-center justify-between cursor-help" title="Peak hours around 11:00 AM - 2:00 PM">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{t.patient.booking.peakHours}</span>
                  <span className="text-sm font-bold">11AM - 2PM</span>
                </div>
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
              <div key={token.id} className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{token.patientName}</h4>
                  <p className="text-sm text-slate-400 font-medium">{token.patientPhone || 'No phone'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{token.doctorName}</p>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                    token.status === 'Completed' ? 'bg-health-teal/10 text-health-teal' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {token.status}
                  </span>
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
      { id: 1, label: d.completed, val: tokens.filter(t => t.status === 'Completed').length, icon: CheckCircle2, color: 'text-health-teal', bg: 'bg-health-teal/10' },
      { id: 2, label: d.pending, val: tokens.filter(t => t.status === 'Waiting' || t.status === 'In Progress').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-100' },
      { id: 3, label: d.notArrived, val: tokens.filter(t => t.status === 'Not Arrived').length, icon: X, color: 'text-red-500', bg: 'bg-red-50' },
      { id: 4, label: d.totalToday, val: tokens.length, icon: Users, color: 'text-primary', bg: 'bg-primary/10' }
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

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
           <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Patient Flow</h3>
              <select className="bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-500 p-3">
                 <option>Last 7 Days</option>
                 <option>Last 30 Days</option>
              </select>
           </div>
           
           <div className="h-[250px] w-full">
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
        <button 
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
          {isSaving ? (editingStaffId ? 'Saving...' : 'Adding...') : (editingStaffId ? t.common?.save || 'Update Staff' : d.addStaff)}
        </button>
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
        <h2 className="text-3xl font-bold text-slate-900">Token Management</h2>
        <button 
          onClick={async () => {
            const name = prompt("Patient Name:");
            const docName = doctors.length > 0 ? doctors[0].name : "General Physician";
            if (name) {
              const tokenNum = tokens.length + 1;
              await addDoc(collection(db, 'tokens'), {
                hospitalId: hospitalData.uid,
                hospitalName: hospitalData.hospitalName,
                hospitalOwnerUid: hospitalData.uid, // Explicitly add owner UID for security rules
                patientName: name,
                doctorName: docName,
                tokenNumber: tokenNum.toString().padStart(3, '0'),
                status: 'Waiting',
                fee: '1500',
                createdAt: serverTimestamp()
              });
            }
          }}
          className="px-6 py-3 bg-health-teal text-white font-bold rounded-2xl flex items-center gap-2"
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
                    onChange={(e) => updateDoc(doc(db, 'tokens', token.id), { status: e.target.value })}
                    className="bg-slate-50 border-none rounded-lg text-xs font-bold text-slate-600 focus:ring-primary"
                  >
                    <option>Waiting</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                </td>
                <td className="px-8 py-4">
                  <button onClick={() => deleteDoc(doc(db, 'tokens', token.id))} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );


  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home': return renderDashboardHome();
      case 'search': return renderSearch();
      case 'data': return renderPatientsData();
      case 'staff': return renderStaffList();
      case 'profile': return renderProfile();
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
        <button 
          onClick={async () => {
            setIsSaving(true);
            try {
              await updateDoc(doc(db, 'hospitals', hospitalData.uid), editProfileData);
              alert("Profile saved successfully!");
            } catch (err) {
              console.error(err);
            } finally {
              setIsSaving(false);
            }
          }}
          className="px-8 py-3 bg-health-teal text-white rounded-2xl font-black text-sm shadow-xl shadow-health-teal/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
        >
          {isSaving ? 'Saving...' : <><Save size={18} /> {t.dashboard.saveChanges}</>}
        </button>
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
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-2xl font-bold text-white">X</span>
            </div>
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
        <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
               <h1 className="text-xl font-black text-slate-900 tracking-tight truncate max-w-[300px]">
                 {hospitalData?.hospitalName || 'HOSPITAL DASHBOARD'}
               </h1>
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

        {/* 30 Day Data Warning Popup */}
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
                   <h3 className="text-2xl font-bold text-slate-900 leading-tight">{d.dataWarning}</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                   <button 
                    onClick={() => handleClearOldData(true)}
                    className="w-full py-5 bg-health-teal text-white font-bold rounded-2xl shadow-xl shadow-health-teal/20 active:scale-95 transition-all"
                   >
                     {d.saveData}
                   </button>
                   <button 
                    onClick={() => handleClearOldData(false)}
                    className="w-full py-5 bg-slate-50 text-slate-400 font-bold rounded-2xl active:scale-95 transition-all"
                   >
                     {d.deleteData}
                   </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default HospitalDashboard;
