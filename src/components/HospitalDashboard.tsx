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
  ArrowRight
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
  const [activeTab, setActiveTab] = useState('home');
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
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const q = query(
          collection(db, 'tokens'),
          where('hospitalId', '==', hospitalData.uid),
          where('createdAt', '<', thirtyDaysAgo),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
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
      where('hospitalId', '==', initialHospitalData.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isMounted) {
        const newTokens = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Check for new tokens to highlight
        const lastChange = snapshot.docChanges().find(change => change.type === 'added');
        if (lastChange && !snapshot.metadata.hasPendingWrites) {
          setNewTokenId(lastChange.doc.id);
          setTimeout(() => setNewTokenId(null), 5000);
        }

        setTokens(newTokens);
      }
    }, (error) => {
      if (isMounted) console.error("Error fetching tokens:", error);
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

  const d = t.dashboard;

  const navItems = [
    { id: 'home', icon: LayoutDashboard, label: d.nav.home || 'HOME' },
    { id: 'search', icon: Search, label: d.search || 'SEARCH' },
    { id: 'data', icon: Activity, label: language === 'UR' ? 'مریض' : 'PATIENTS' },
    { id: 'staff', icon: Users, label: d.nav.staff || 'STAFF' }
  ];

  const renderDashboardHome = () => {
    const servingToken = tokens.find(t => t.status === 'In Progress');
    const waitingTokens = tokens.filter(t => t.status === 'Waiting').slice(0, 3);

    return (
      <div className="p-6 space-y-10 pb-32">
        {/* Live Queue Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d.liveQueue.title}</h3>
            <div className="bg-primary/5 px-2 py-1 rounded text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5 border border-primary/10">
              <Activity size={12} className="animate-pulse" /> Live Now
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Currently Serving */}
            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-health-teal/5 rounded-full blur-3xl group-hover:bg-health-teal/10 transition-colors" />
              <div className="flex flex-col h-full justify-between gap-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{d.liveQueue.serving}</p>
                  {servingToken ? (
                    <div className="flex items-center gap-4">
                      <div className="text-4xl font-bold text-slate-900 tracking-tighter">#{servingToken.tokenNumber}</div>
                      <div className="px-3 py-1 bg-health-teal/10 text-health-teal rounded-lg text-[10px] font-bold uppercase tracking-wider">Active</div>
                    </div>
                  ) : (
                    <div className="text-xl font-bold text-slate-300">No active session</div>
                  )}
                </div>
                {servingToken && (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary border border-slate-100">
                      <UserPlus size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 leading-tight">{servingToken.patientName}</h4>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">{servingToken.doctorName}</p>
                    </div>
                  </div>
                )}
                <button 
                  onClick={async () => {
                    const firstWaiting = tokens.find(t => t.status === 'Waiting');
                    if (firstWaiting) {
                      // Mark current serving as completed if exists
                      if (servingToken) {
                        await updateDoc(doc(db, 'tokens', servingToken.id), { status: 'Completed' });
                      }
                      // Mark next as in-progress
                      await updateDoc(doc(db, 'tokens', firstWaiting.id), { status: 'In Progress' });
                    }
                  }}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {d.liveQueue.callNext}
                </button>
              </div>
            </div>

            {/* Next in Line */}
            <div className="bg-slate-50/50 rounded-[40px] p-8 border border-slate-200/60 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{d.liveQueue.nextTokens}</p>
                <div className="space-y-3">
                  {waitingTokens.length > 0 ? (
                    waitingTokens.map(t => (
                      <div key={t.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-mono font-bold text-slate-400">#{t.tokenNumber}</span>
                          <span className="font-bold text-slate-800 text-sm">{t.patientName}</span>
                        </div>
                        <ArrowRight size={16} className="text-slate-300" />
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center text-slate-400 text-sm font-bold opacity-50 italic">No one waiting</div>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('data')} 
                className="w-full mt-6 py-4 bg-white text-slate-600 rounded-2xl font-bold text-sm border border-slate-200 hover:bg-slate-100 transition-all"
              >
                View Full Queue
              </button>
            </div>
          </div>
        </section>

        {/* Existing Recent Tokens Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-2">
             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d.recentTokens.title}</h3>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-health-teal rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-health-teal uppercase tracking-widest">Real-time</span>
             </div>
          </div>
          
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {tokens.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-200">
                    <Ticket size={32} />
                  </div>
                  <p className="text-slate-400 font-bold">{d.setup.welcome}</p>
                </div>
              ) : (
                tokens.slice(0, 5).map((token) => (
                  <motion.div
                    key={token.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      backgroundColor: newTokenId === token.id ? 'rgba(56, 189, 248, 0.1)' : '#fff'
                    }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                    className={`p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all ${newTokenId === token.id ? 'border-primary ring-2 ring-primary/20' : ''}`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                        <span className="text-[10px] font-bold text-slate-400 leading-none mb-1">#</span>
                        <span className="text-xl font-bold text-slate-900 leading-none">{token.tokenNumber}</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 leading-none mb-2">{token.patientName}</h4>
                        <div className="flex items-center gap-3 text-slate-400">
                           <div className="flex items-center gap-1">
                              <Stethoscope size={12} />
                              <span className="text-[10px] font-bold uppercase tracking-wider">{token.doctorName}</span>
                           </div>
                           <div className="w-1 h-1 bg-slate-200 rounded-full" />
                           <span className="text-[10px] font-bold uppercase tracking-wider">{token.createdAt?.toDate?.() ? token.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                       <span className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${
                         token.status === 'Completed' ? 'bg-health-teal/10 text-health-teal border-health-teal/20' :
                         token.status === 'Waiting' ? 'bg-amber-100 text-amber-600 border-amber-200' :
                         token.status === 'In Progress' ? 'bg-primary/10 text-primary border-primary/20' :
                         'bg-red-100 text-red-600 border-red-200'
                       }`}>
                         {token.status === 'Waiting' ? d.pending : 
                          token.status === 'Completed' ? d.completed : 
                          token.status === 'In Progress' ? d.liveQueue.inProgress : 
                          token.status === 'Not Arrived' ? d.notArrived : token.status}
                       </span>
                       <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-slate-100 transition-colors">
                          <MoreVertical size={20} />
                       </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </section>
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

  const [editProfileData, setEditProfileData] = useState(hospitalData);
  useEffect(() => { setEditProfileData(hospitalData); }, [hospitalData]);

  const renderSettings = () => (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-slate-900 mb-8">Hospital Settings</h2>
      <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Hospital Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  value={editProfileData?.hospitalName || ''}
                  onChange={(e) => setEditProfileData({...editProfileData, hospitalName: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary font-bold text-slate-700" 
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">OPD Starting Fee (Rs.)</label>
              <div className="relative">
                <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                   type="number" 
                   value={editProfileData?.startingFee || '1000'}
                   onChange={(e) => setEditProfileData({...editProfileData, startingFee: e.target.value})}
                   className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary font-bold text-slate-700" 
                />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Opening Timings</label>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input 
                    type="time" 
                    value={editProfileData?.openingTime || '09:00'}
                    onChange={(e) => setEditProfileData({...editProfileData, openingTime: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-700" 
                  />
                </div>
                <div className="relative flex-1">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input 
                    type="time" 
                    value={editProfileData?.closingTime || '21:00'}
                    onChange={(e) => setEditProfileData({...editProfileData, closingTime: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-700" 
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Emergency 24/7</label>
              <div className="flex gap-4">
                 <button 
                  onClick={() => setEditProfileData({...editProfileData, emergency247: true})}
                  className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${editProfileData?.emergency247 ? 'bg-red-50 border-red-500 text-red-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                 >
                   Yes
                 </button>
                 <button 
                  onClick={() => setEditProfileData({...editProfileData, emergency247: false})}
                  className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${!editProfileData?.emergency247 ? 'bg-slate-50 border-slate-500 text-slate-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                 >
                   No
                 </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-10 border-t border-slate-100 flex justify-end">
          <button 
            disabled={isSaving}
            onClick={async () => {
              setIsSaving(true);
              try {
                await updateDoc(doc(db, 'hospitals', hospitalData.uid), editProfileData);
                alert("Profile updated successfully!");
              } catch (err) {
                console.error(err);
              } finally {
                setIsSaving(false);
              }
            }}
            className="px-10 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            {isSaving ? 'Saving...' : <><Save size={20} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home': return renderDashboardHome();
      case 'search': return renderSearch();
      case 'data': return renderPatientsData();
      case 'staff': return renderStaffList();
      default: return renderDashboardHome();
    }
  };

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
               <h1 className="text-xl font-bold text-slate-900 truncate max-w-[200px]">{hospitalData?.hospitalName || 'Clinic'}</h1>
               <div 
                onClick={toggleStatus}
                className={`flex items-center gap-2 px-3 py-1 rounded-full border cursor-pointer hover:scale-105 transition-all ${
                 hospitalData?.status === 'Open' ? 'bg-health-teal/10 text-health-teal border-health-teal/20' : 'bg-red-100 text-red-600 border-red-200'
               }`}>
                  <div className={`w-2 h-2 rounded-full ${hospitalData?.status === 'Open' ? 'bg-health-teal shadow-[0_0_8px_rgba(45,212,191,0.6)]' : 'bg-red-500'}`} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{hospitalData?.status === 'Open' ? d.open : d.closedStatus}</span>
               </div>
            </div>
            <p className="text-slate-400 text-xs font-medium">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {currentTime.toLocaleDateString([], { day: 'numeric', month: 'short' })}</p>
          </div>

          <div className="flex items-center gap-4">
             <button onClick={() => setLanguage(language === 'UR' ? 'EN' : 'UR')} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 hover:text-primary transition-colors">
                <Globe size={20} />
             </button>
             <button className="relative w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 hover:text-primary transition-colors">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
             </button>
             <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-100">
                <div className="text-right">
                   <p className="text-sm font-bold text-slate-900">{hospitalData?.ownerName || 'Admin'}</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Administrator</p>
                </div>
                <button 
                  onClick={onSignOut}
                  className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-emergency-red transition-all group"
                >
                  <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                </button>
             </div>
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
