import React, { useState, useEffect } from 'react';
import { 
  Users, Activity, Building2, Ticket, TrendingUp, 
  Search, ShieldAlert, Trash2, Eye, CheckCircle2,
  Bell, List, Clock, Filter, ShieldCheck, Database,
  ArrowRight, MapPin, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';
import { 
  collection, query, onSnapshot, doc, 
  updateDoc, deleteDoc, getDocs, orderBy, limit, where 
} from 'firebase/firestore';
import { seedHospitals } from '../lib/seedData';
import { Hospital as HospitalIcon, LayoutDashboard as LayoutIcon } from 'lucide-react';
import { ListSkeleton, StatSkeleton } from './ui/Skeleton';
import EmptyState from './ui/EmptyState';
import { useToast } from '../contexts/ToastContext';
import { BrandLogo } from './ui/BrandLogo';

interface SuperAdminDashboardProps {
  onSignOut: () => void;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ onSignOut }) => {
  const { toast } = useToast();
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'hospitals' | 'monitor' | 'approvals'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
    toast.success("Data updated from source.");
  };

  useEffect(() => {
    // Hospitals listener
    const hospUnsub = onSnapshot(collection(db, 'hospitals'), (snapshot) => {
      setHospitals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'hospitals');
    });

    // Tokens listener (Live Monitor)
    const tokensQuery = query(collection(db, 'tokens'), orderBy('createdAt', 'desc'), limit(50));
    const tokensUnsub = onSnapshot(tokensQuery, (snapshot) => {
      setTokens(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'tokens');
    });

    // Patients (Mock stats for now or actually fetch from users collection where role='patient')
    const patientsQuery = query(collection(db, 'users'), where('role', '==', 'patient'));
    const patientsUnsub = onSnapshot(patientsQuery, (snapshot) => {
       setPatients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
       setIsLoading(false);
    }, (err) => {
       handleFirestoreError(err, OperationType.LIST, 'users');
       setIsLoading(false);
    });

    return () => {
      hospUnsub();
      tokensUnsub();
      patientsUnsub();
    };
  }, []);

  const handleSeed = async () => {
    if (!confirm("Are you sure you want to seed demo hospitals? This will create multiple entries.")) return;
    setSeeding(true);
    try {
      await seedHospitals();
      toast.success("Demo hospitals seeded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Seeding failed.");
    } finally {
      setSeeding(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'hospitals', id), { status });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHosp = async (id: string) => {
    if (!confirm("Delete this hospital permanently?")) return;
    try {
      await deleteDoc(doc(db, 'hospitals', id));
    } catch (err) {
      console.error(err);
    }
  };

  const stats = [
    { label: "Total Hospitals", val: hospitals.length, icon: Building2, color: "text-primary", bg: "bg-primary/10" },
    { label: "Registered Patients", val: patients.length, icon: Users, color: "text-health-teal", bg: "bg-health-teal/10" },
    { label: "Tokens Today", val: tokens.filter(t => {
      const today = new Date().toDateString();
      const tDate = t.createdAt?.toDate ? t.createdAt.toDate().toDateString() : '';
      return tDate === today;
    }).length, icon: Ticket, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Active Revenue", val: hospitals.filter(h => h.approved).length, icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  const renderOverview = () => {
    if (isLoading) {
      return (
        <div className="space-y-8">
          <StatSkeleton count={4} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-[400px] bg-slate-100 rounded-[40px] animate-pulse" />
            <div className="h-[400px] bg-slate-100 rounded-[40px] animate-pulse" />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Refresh Indicator */}
        <AnimatePresence>
          {isRefreshing && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 40, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex justify-center"
            >
              <div className="bg-white px-4 py-1.5 rounded-full shadow-sm text-xs font-bold text-primary flex items-center gap-2 border border-slate-100">
                <Activity size={14} className="animate-spin" />
                Refreshing Platform Statistics...
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
              <h3 className="text-3xl font-bold text-slate-900 leading-none">{s.val}</h3>
            </div>
            <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center ${s.color}`}>
              <s.icon size={28} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Hospital Registrations */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900">New Registrations</h3>
            <button className="text-sm font-bold text-primary hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {hospitals.filter(h => h.status === 'Under Review' || !h.approved).length === 0 ? (
              <EmptyState 
                type="no_hospitals" 
                onAction={() => setActiveTab('hospitals')} 
              />
            ) : (
              hospitals.filter(h => h.status === 'Under Review' || !h.approved).slice(0, 5).map(h => (
                <div key={h.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm leading-tight">{h.hospitalName}</h4>
                      <p className="text-xs text-slate-400">{h.city}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleUpdateStatus(h.id, 'active')}
                    className="px-4 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-emerald-500/20"
                  >
                    Approve
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Token Monitor Preview */}
        <div className="bg-[#04111D] rounded-[40px] shadow-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[80px] rounded-full" />
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-health-teal rounded-full breathing-dot" />
              <h3 className="text-xl font-bold">Platform Wide Live Feed</h3>
            </div>
            <Ticket className="text-white/20" size={24} />
          </div>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {tokens.map((t, idx) => (
              <div key={t.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm">{t.patientName || 'T-User'}</h4>
                  <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">{t.hospitalName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-health-teal">#{t.tokenNumber}</p>
                  <p className="text-[10px] text-white/40">{t.doctorName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

  const renderHospitals = () => {
    if (isLoading) {
      return (
        <div className="bg-white rounded-[40px] p-8 space-y-6">
          <div className="flex justify-between items-center mb-8">
            <div className="h-10 w-48 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-10 w-64 bg-slate-100 rounded-xl animate-pulse" />
          </div>
          <ListSkeleton count={6} />
        </div>
      );
    }

    return (
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-slate-900">Hospital Management</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Filter by name..." 
              className="pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary w-[250px]"
            />
          </div>
          <button 
            onClick={handleSeed}
            disabled={seeding}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
          >
            <Database size={16} /> {seeding ? 'Seeding...' : 'Seed Demo Data'}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="px-8 py-5">Hospital Name</th>
              <th className="px-8 py-5">City / Area</th>
              <th className="px-8 py-5">Type</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {hospitals.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <EmptyState type="no_hospitals" onAction={handleSeed} />
                </td>
              </tr>
            ) : (
              hospitals.map(h => (
                <tr key={h.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <HospitalIcon size={20} />
                      </div>
                      <span className="font-bold text-slate-800">{h.hospitalName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700 text-sm">{h.city}</span>
                      <span className="text-[10px] text-slate-400">{h.area}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${h.type?.toLowerCase().includes('government') ? 'bg-emerald-50 text-emerald-600' : 'bg-primary/5 text-primary'}`}>
                      {h.type}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${h.status === 'active' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                      <span className="text-xs font-bold text-slate-600 capitalize">{h.status || 'Active'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleUpdateStatus(h.id, h.status === 'active' ? 'suspended' : 'active')} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all">
                        <ShieldAlert size={18} />
                      </button>
                      <button onClick={() => handleDeleteHosp(h.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

  const renderLiveMonitor = () => (
    <div className="bg-[#04111D] rounded-[40px] shadow-2xl overflow-hidden min-h-[600px] flex flex-col animate-in fade-in zoom-in-95 duration-500">
       <div className="p-10 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-4">
              <div className="w-3 h-3 bg-health-teal rounded-full breathing-dot" />
              Live Platform Pulse
            </h3>
            <p className="text-white/40 text-sm font-medium">Real-time token activity mapping across Pakistan</p>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
             <Ticket className="text-health-teal" size={20} />
             <span className="text-white font-bold">{tokens.length} Active Today</span>
          </div>
       </div>

       <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar">
          {tokens.map((t, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              key={t.id} 
              className="group bg-white/5 border border-white/10 rounded-[32px] p-6 hover:bg-white/10 hover:border-primary/50 transition-all flex flex-col md:flex-row items-center justify-between gap-6"
            >
               <div className="flex items-center gap-6">
                 <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                   <Users size={30} />
                 </div>
                 <div>
                   <h4 className="text-lg font-bold text-white mb-1">{t.patientName}</h4>
                   <div className="flex items-center gap-3">
                      <MapPin size={12} className="text-white/30" />
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t.hospitalName}</span>
                   </div>
                 </div>
               </div>
               
               <div className="flex items-center gap-10">
                  <div className="text-center md:text-right">
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">Assigned Doctor</p>
                    <p className="text-sm font-bold text-health-teal">{t.doctorName}</p>
                  </div>
                  <div className="h-12 w-[1px] bg-white/10 hidden md:block" />
                  <div className="flex flex-col items-center">
                     <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">Token</span>
                     <span className="text-2xl font-mono font-bold text-white tracking-tighter">#{t.tokenNumber}</span>
                  </div>
                  <div className="flex flex-col items-end">
                     <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">Time</span>
                     <span className="text-xs font-mono font-bold text-white/60">{new Date(t.createdAt?.toDate?.() || Date.now()).toLocaleTimeString()}</span>
                  </div>
               </div>
            </motion.div>
          ))}
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar / Top Nav */}
      <div className="bg-white border-b border-slate-100 flex items-center justify-between px-8 py-5 sticky top-0 z-50">
        <div className="flex items-center gap-5">
           <BrandLogo size={40} className="filter drop-shadow-md" />
           <div>
             <h1 className="text-xl font-bold tracking-tighter text-slate-900 leading-none mb-1">Xdoc Admin Panel</h1>
             <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em]">Super User Mode</p>
           </div>
        </div>

        <nav className="hidden lg:flex items-center gap-1">
          {[
            { id: 'overview', icon: LayoutIcon, label: 'Overview' },
            { id: 'hospitals', icon: Building2, label: 'Hospitals' },
            { id: 'monitor', icon: Activity, label: 'Live Monitor' },
            { id: 'approvals', icon: CheckCircle2, label: 'Approvals' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
           <button onClick={() => onSignOut()} className="p-3 text-slate-400 hover:text-emergency-red transition-colors bg-slate-50 rounded-xl">
              <LogOut size={20} />
           </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-6 md:p-10 mb-20">
         {activeTab === 'overview' && renderOverview()}
         {activeTab === 'hospitals' && renderHospitals()}
         {activeTab === 'monitor' && renderLiveMonitor()}
         {activeTab === 'approvals' && (
           <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="p-8 border-b border-slate-100">
               <h3 className="text-xl font-bold text-slate-900">Hospital Approvals Review Board</h3>
               <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Approve or Reject newly registered healthcare facilities</p>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                   <tr>
                     <th className="px-8 py-5">Hospital Name</th>
                     <th className="px-8 py-5">City / Area</th>
                     <th className="px-8 py-5">Type</th>
                     <th className="px-8 py-5">Submission Status</th>
                     <th className="px-8 py-5 text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {hospitals.filter(h => h.status === 'Under Review' || !h.approved).length === 0 ? (
                     <tr>
                       <td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                         All submission reviews completed! No pending hospital approvals.
                       </td>
                     </tr>
                   ) : (
                     hospitals.filter(h => h.status === 'Under Review' || !h.approved).map(h => (
                       <tr key={h.id} className="hover:bg-slate-50/50 transition-colors group">
                         <td className="px-8 py-5">
                           <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                               <Building2 size={20} />
                             </div>
                             <span className="font-bold text-slate-800">{h.hospitalName}</span>
                           </div>
                         </td>
                         <td className="px-8 py-5 font-bold text-slate-700 text-sm">
                           {h.city} <span className="text-slate-400 text-xs block font-medium">{h.area}</span>
                         </td>
                         <td className="px-8 py-5">
                           <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-primary/5 text-primary">
                             {h.type || 'Clinic'}
                           </span>
                         </td>
                         <td className="px-8 py-5">
                           <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100">
                             {h.status || 'Under Review'}
                           </span>
                         </td>
                         <td className="px-8 py-5 text-right">
                           <div className="flex items-center justify-end gap-2">
                             <button 
                               onClick={async () => {
                                 try {
                                   await updateDoc(doc(db, 'hospitals', h.id), {
                                     approved: true,
                                     status: 'active'
                                   });
                                   toast.success(`${h.hospitalName} approved & authorized successfully!`);
                                 } catch (err) {
                                   toast.error("Failed to approve hospital.");
                                 }
                               }}
                               className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/10 active:scale-95 transition-all uppercase tracking-wider"
                             >
                               Approve
                             </button>
                             <button 
                               onClick={async () => {
                                 try {
                                   await updateDoc(doc(db, 'hospitals', h.id), {
                                     approved: false,
                                     status: 'rejected'
                                   });
                                   toast.warning(`${h.hospitalName} registration rejected.`);
                                 } catch (err) {
                                   toast.error("Error setting rejection status.");
                                 }
                               }}
                               className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl text-xs font-bold active:scale-95 transition-all uppercase tracking-wider"
                             >
                               Reject
                             </button>
                           </div>
                         </td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
             </div>
           </div>
         )}
      </main>
    </div>
  );
};

const LayoutDashboard = ({ size }: { size: number }) => <LayoutIcon size={size} />;

export default SuperAdminDashboard;
