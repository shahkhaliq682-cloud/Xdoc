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
  AlertTriangle
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
  getDoc
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hospitalData, setHospitalData] = useState(initialHospitalData);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen to hospital data
  useEffect(() => {
    const fetchHospitalData = async () => {
      if (!initialHospitalData?.uid) return;
      try {
        const docRef = doc(db, 'hospitals', initialHospitalData.uid);
        // Using getDocFromServer to ensure we bypass any broken local cache
        const docSnap = await getDocFromServer(docRef);
        if (docSnap.exists()) {
          setHospitalData({ uid: docSnap.id, ...docSnap.data() });
        }
      } catch (error: any) {
        handleFirestoreError(error, OperationType.GET, `hospitals/${initialHospitalData.uid}`);
      }
    };
    fetchHospitalData();
  }, [initialHospitalData?.uid]);

  // Listen to doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!initialHospitalData?.uid) return;
      try {
        const q = query(collection(db, `hospitals/${initialHospitalData.uid}/doctors`));
        const snapshot = await getDocs(q);
        setDoctors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error: any) {
        handleFirestoreError(error, OperationType.LIST, `hospitals/${initialHospitalData.uid}/doctors`);
      }
    };
    fetchDoctors();
  }, [initialHospitalData?.uid]);

  // Listen to staff
  useEffect(() => {
    if (!initialHospitalData?.uid) return;
    const q = query(collection(db, `hospitals/${initialHospitalData.uid}/staff`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStaff(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `hospitals/${initialHospitalData.uid}/staff`));
    return () => unsubscribe();
  }, [initialHospitalData?.uid]);

  // Listen to tokens
  useEffect(() => {
    const fetchTokens = async () => {
      if (!initialHospitalData?.uid) return;
      try {
        const q = query(
          collection(db, 'tokens'), 
          where('hospitalId', '==', initialHospitalData.uid)
        );
        const snapshot = await getDocs(q);
        setTokens(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err: any) {
        handleFirestoreError(err, OperationType.LIST, 'tokens');
      }
    };
    fetchTokens();
  }, [initialHospitalData?.uid]);

  const toggleStatus = async () => {
    if (!hospitalData?.uid) return;
    const newStatus = hospitalData.status === 'active' ? 'inactive' : 'active';
    try {
      await updateDoc(doc(db, 'hospitals', hospitalData.uid), { status: newStatus });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `hospitals/${hospitalData.uid}`);
    }
  };

  const d = t.dashboard;

  const sidebarNavItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: d.nav.dashboard },
    { id: 'doctors', icon: Stethoscope, label: d.nav.doctors },
    { id: 'staff', icon: Users, label: d.nav.staff },
    { id: 'tokens', icon: Ticket, label: d.nav.tokens },
    { id: 'settings', icon: Settings, label: d.nav.settings }
  ];

  const renderDashboardHome = () => (
    <div className="p-8 space-y-12">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: d.stats.todayTokens, val: tokens.length, icon: Ticket, color: 'text-primary' },
          { label: d.stats.patientsWaiting, val: tokens.filter(t => t.status === 'Waiting').length, icon: Clock, color: 'text-amber-500' },
          { label: d.stats.completedToday, val: tokens.filter(t => t.status === 'Completed').length, icon: CheckCircle2, color: 'text-health-teal' },
          { label: d.stats.todayRevenue, val: `Rs. ${tokens.filter(t => t.status === 'Completed').reduce((acc, t) => acc + (parseInt(t.fee) || 0), 0).toLocaleString()}`, icon: Wallet, color: 'text-emerald-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-between aspect-square group hover:shadow-xl transition-all">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.color.replace('text', 'bg')}/10 ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-4xl font-bold text-slate-900 tracking-tighter">{stat.val}</p>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">{stat.label}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
         {/* Live Clinic Queue */}
         <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-center mb-10">
               <h3 className="text-2xl font-bold text-slate-900">{d.liveQueue.title}</h3>
               <div className="px-4 py-2 bg-health-teal/10 text-health-teal rounded-full text-[10px] font-bold uppercase tracking-widest border border-health-teal/20">Live Sync</div>
            </div>
            {tokens.length === 0 ? (
               <div className="py-20 text-center space-y-6">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-200">
                    <History size={40} />
                  </div>
                  <p className="text-slate-400 font-bold">{d.setup.welcome}</p>
               </div>
            ) : (
               <div className="space-y-6">
                  <div className="p-8 bg-slate-900 rounded-[32px] text-white">
                     <p className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mb-4">{d.liveQueue.serving}</p>
                     <div className="flex items-center justify-between">
                        <div>
                           <h4 className="text-4xl font-bold mb-1">{tokens.find(t => t.status === 'In Progress')?.patientName || 'No one serving'}</h4>
                           <p className="text-slate-400 font-medium">#{tokens.find(t => t.status === 'In Progress')?.tokenNumber || '--'}</p>
                        </div>
                        <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                           <Activity size={40} />
                        </div>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <h5 className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-widest underline decoration-primary underline-offset-4 decoration-2">{d.liveQueue.nextTokens}</h5>
                     {tokens.filter(tok => tok.status === 'Waiting').slice(0, 3).map((token, i) => (
                        <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                           <div className="flex items-center gap-4">
                              <span className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-mono font-bold text-xs text-slate-400">#{token.tokenNumber}</span>
                              <span className="font-bold text-slate-700">{token.patientName}</span>
                           </div>
                           <button 
                             onClick={() => updateDoc(doc(db, 'tokens', token.id), { status: 'In Progress' })}
                             className="px-4 py-2 bg-primary/5 text-primary text-[10px] font-bold rounded-lg hover:bg-primary hover:text-white transition-all uppercase tracking-widest"
                           >
                              {d.liveQueue.callNext}
                           </button>
                        </div>
                     ))}
                  </div>
               </div>
            )}
         </div>

         {/* Chart Placeholder */}
         <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-10">
               <h3 className="text-2xl font-bold text-slate-900">Weekly Patient Flow</h3>
               <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-primary transition-colors"><MoreHorizontal size={24} /></button>
            </div>
            <div className="h-[300px] w-full flex items-end justify-between gap-2 px-4">
                {sampleChartData.map((data, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-4">
                     <div className="w-full bg-primary/5 rounded-t-xl relative group transition-all" style={{ height: `${(data.patients / 70) * 100}%` }}>
                        <div className="absolute inset-x-0 bottom-0 bg-primary h-full rounded-t-xl origin-bottom transition-all" style={{ transform: `scaleY(0.4)` }} />
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {data.patients} Patients
                        </div>
                     </div>
                     <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">{data.day}</span>
                  </div>
                ))}
            </div>
         </div>
      </div>
    </div>
  );

  const sampleChartData = [
    { day: 'Mon', patients: 45, revenue: 12000 },
    { day: 'Tue', patients: 52, revenue: 15400 },
    { day: 'Wed', patients: 38, revenue: 9800 },
    { day: 'Thu', patients: 65, revenue: 21000 },
    { day: 'Fri', patients: 48, revenue: 13500 },
    { day: 'Sat', patients: 70, revenue: 24000 },
    { day: 'Sun', patients: 30, revenue: 8500 },
  ];

  const renderDoctorsList = () => (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Manage Doctors</h2>
        <button 
          onClick={async () => {
            const name = prompt("Doctor Name:");
            const specialization = prompt("Specialization:");
            if (name && specialization) {
              await addDoc(collection(db, `hospitals/${hospitalData.uid}/doctors`), {
                name,
                specialization,
                status: 'present',
                createdAt: serverTimestamp()
              });
            }
          }}
          className="px-6 py-3 bg-primary text-white font-bold rounded-2xl flex items-center gap-2"
        >
          <Plus size={20} /> Add Doctor
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map(docItem => (
          <div key={docItem.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative group">
            <button 
              onClick={() => deleteDoc(doc(db, `hospitals/${hospitalData.uid}/doctors`, docItem.id))}
              className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={18} />
            </button>
            <div className="flex items-center gap-4 mb-4">
              <img src={docItem.photo || `https://ui-avatars.com/api/?name=${docItem.name}`} className="w-16 h-16 rounded-2xl object-cover" />
              <div>
                <h4 className="font-bold text-slate-900">{docItem.name}</h4>
                <p className="text-sm text-slate-500">{docItem.specialization}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2 text-xs font-bold bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100">Edit Profile</button>
              <button 
                onClick={() => updateDoc(doc(db, `hospitals/${hospitalData.uid}/doctors`, docItem.id), { status: docItem.status === 'present' ? 'absent' : 'present' })}
                className={`flex-1 py-2 text-xs font-bold rounded-xl ${docItem.status === 'present' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
              >
                {docItem.status === 'present' ? 'Present' : 'Absent'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStaffList = () => (
    <div className="p-8">
       <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Hospital Staff</h2>
        <button 
          onClick={async () => {
            const name = prompt("Staff Name:");
            const role = prompt("Role (e.g. Nurse, Admin):");
            if (name && role) {
              await addDoc(collection(db, `hospitals/${hospitalData.uid}/staff`), {
                name,
                role,
                status: 'active',
                createdAt: serverTimestamp()
              });
            }
          }}
          className="px-6 py-3 bg-primary text-white font-bold rounded-2xl flex items-center gap-2"
        >
          <UserPlus size={20} /> Add Staff
        </button>
      </div>
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <tr>
              <th className="px-8 py-4">Name</th>
              <th className="px-8 py-4">Role</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staff.map(member => (
              <tr key={member.id}>
                <td className="px-8 py-4 font-bold text-slate-900">{member.name}</td>
                <td className="px-8 py-4 text-slate-500">{member.role}</td>
                <td className="px-8 py-4">
                  <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-widest">{member.status}</span>
                </td>
                <td className="px-8 py-4">
                  <button onClick={() => deleteDoc(doc(db, `hospitals/${hospitalData.uid}/staff`, member.id))} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
      case 'dashboard': return renderDashboardHome();
      case 'doctors': return renderDoctorsList();
      case 'staff': return renderStaffList();
      case 'tokens': return renderTokens();
      case 'settings': return renderSettings();
      default: return renderDashboardHome();
    }
  };

  return (
    <div className={`min-h-screen bg-[#F8FAFC] flex ${language === 'UR' ? 'flex-row-reverse font-urdu' : 'font-sans'} `} dir={language === 'UR' ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 z-50 bg-[#0F2236] text-white transition-all duration-300 transform 
          ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-20 lg:translate-x-0 -translate-x-full'}
          ${language === 'UR' ? (isSidebarOpen ? 'right-0' : '-right-full lg:right-0') : (isSidebarOpen ? 'left-0' : '-left-full lg:left-0')}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
              <span className="text-2xl font-bold text-white">X</span>
            </div>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-xl font-bold tracking-tight"
              >
                Xdoc Hospital
              </motion.span>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {sidebarNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all group ${
                  activeTab === item.id 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={22} className={activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
                {isSidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-white/5 space-y-2">
            <button
              onClick={() => setLanguage(language === 'UR' ? 'EN' : 'UR')}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all text-slate-400 hover:bg-white/5 hover:text-white"
            >
              <Globe size={22} />
              {isSidebarOpen && <span className="font-medium">{language === 'UR' ? 'English' : 'اردو'}</span>}
            </button>
            <button
              onClick={onSignOut}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut size={22} />
              {isSidebarOpen && <span className="font-medium">{d.nav.signOut}</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? (language === 'UR' ? 'mr-64' : 'ml-64') : (language === 'UR' ? 'mr-0 lg:mr-20' : 'ml-0 lg:ml-20')}`}>
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl lg:hidden">
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold font-primary text-slate-900">{hospitalData?.hospitalName || 'Xdoc General Hospital'}</h1>
          </div>

          <div className="hidden md:flex flex-col items-center">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{currentTime.toLocaleDateString(language === 'UR' ? 'ur-PK' : 'en-US', { weekday: 'long' })}</span>
            <span className="text-lg font-bold text-primary">{currentTime.toLocaleDateString(language === 'UR' ? 'ur-PK' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2.5 text-slate-500 hover:bg-slate-50 rounded-2xl transition-all">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="w-10 h-10 rounded-2xl bg-slate-100 border-2 border-white overflow-hidden shadow-sm">
              <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white font-bold">{hospitalData?.hospitalName?.[0]}</div>
            </div>
          </div>
        </header>

        {/* Dashboard View */}
        {renderActiveTab()}
      </main>
    </div>
  );
};

export default HospitalDashboard;
