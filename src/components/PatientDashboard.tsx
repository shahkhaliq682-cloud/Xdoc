import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Star, CheckCircle2, ShieldCheck, 
  Clock, Calendar, Home, User, Bell, ChevronRight, 
  Map as MapIcon, Hospital as HospitalIcon, 
  ArrowRight, History, Info, AlertTriangle, Save, Trash2, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  collection, query, where, getDocs, orderBy, 
  onSnapshot, doc, getDoc, serverTimestamp, 
  updateDoc, deleteDoc, writeBatch 
} from 'firebase/firestore';
import { db, auth } from '../firebase';

interface PatientDashboardProps {
  userData: any;
  hospitals: any[];
  onHospitalClick: (h: any) => void;
  onSignOut: () => void;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ 
  userData, 
  hospitals, 
  onHospitalClick,
  onSignOut
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'hospitals' | 'history' | 'profile'>('hospitals');
  const [hospitalType, setHospitalType] = useState<'All' | 'Private' | 'Government'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [patientTokens, setPatientTokens] = useState<any[]>([]);
  const [showDataWarning, setShowDataWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  };

  useEffect(() => {
    if (!userData?.uid) return;

    const tokensQuery = query(
      collection(db, 'tokens'),
      where('patientUid', '==', userData.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(tokensQuery, (snapshot) => {
      const tokenList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      setPatientTokens(tokenList);
      setIsLoading(false);

      // Check for 30-day old data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const hasOldData = tokenList.some(t => {
        const createdAt = t.createdAt?.toDate ? t.createdAt.toDate() : null;
        return createdAt && createdAt < thirtyDaysAgo;
      });
      if (hasOldData) setShowDataWarning(true);
    });

    return () => unsubscribe();
  }, [userData?.uid]);

  const filteredHospitals = hospitals.filter(h => {
    const matchesType = hospitalType === 'All' || 
      (hospitalType === 'Private' && h.type?.toLowerCase().includes('private')) ||
      (hospitalType === 'Government' && h.type?.toLowerCase().includes('government'));
    
    const matchesSearch = h.hospitalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.area?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.city?.toLowerCase().includes(searchQuery.toLowerCase());

    const isOpen = h.isOpen !== false; // Default to true if not specified

    return matchesType && matchesSearch && isOpen;
  });

  const handleClearOldData = async (shouldSave: boolean) => {
    if (!userData?.uid) return;
    
    if (shouldSave) {
      alert("Saving data to your local device... (Mock functionality)");
    } else {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const oldTokens = patientTokens.filter(t => {
          const createdAt = t.createdAt?.toDate();
          return createdAt && createdAt < thirtyDaysAgo;
        });

        const batch = writeBatch(db);
        oldTokens.forEach(token => {
          batch.delete(doc(db, 'tokens', token.id));
        });
        await batch.commit();
      } catch (error) {
        console.error("Error deleting old tokens:", error);
      }
    }
    setShowDataWarning(false);
  };

  const renderHeader = () => (
    <header className="bg-white px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-[100]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
          {userData?.name?.charAt(0) || 'P'}
        </div>
        <div>
          <h1 className="font-bold text-slate-800 leading-tight">{userData?.name || 'Patient'}</h1>
          <div className="flex items-center gap-1.5 opacity-60">
            <span className="text-xs font-bold">🇵🇰 Pakistan</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-primary transition-colors">
          <Bell size={24} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-emergency-red rounded-full border-2 border-white" />
        </button>
        <button 
          onClick={onSignOut}
          className="p-2 text-slate-400 hover:text-emergency-red transition-colors"
        >
          <LogOut size={24} />
        </button>
      </div>
    </header>
  );

  const renderHospitalsView = () => (
    <div className="p-6 space-y-8">
      {/* Category Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-2">
        {(['All', 'Government', 'Private'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setHospitalType(type)}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
              hospitalType === type 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-slate-500 hover:bg-white/50'
            }`}
          >
            {type === 'All' ? 'All' : type === 'Government' ? 'Govt. Hospital' : 'Private Clinic'}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by name, area or city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary font-medium"
        />
      </div>

      {/* Hospital List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Available Facilities</h2>
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">{filteredHospitals.length} Found</span>
        </div>

        {filteredHospitals.length === 0 ? (
          <div className="bg-white p-20 rounded-[40px] text-center border-2 border-dashed border-slate-200">
            <HospitalIcon size={64} className="mx-auto text-slate-200 mb-6" />
            <p className="text-xl font-bold text-slate-400">No active hospitals found</p>
          </div>
        ) : (
          filteredHospitals.map((h) => (
            <motion.div 
              layout
              key={h.id}
              onClick={() => onHospitalClick(h)}
              className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="h-48 relative overflow-hidden">
                <img 
                  src={h.photo || h.imageUrl || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80"} 
                  alt={h.hospitalName} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg border border-slate-100">
                  <div className="w-2 h-2 bg-health-teal rounded-full breathing-dot" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#005046]">Open Now</span>
                </div>
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-2 py-1.5 rounded-xl flex items-center gap-1 shadow-lg border border-slate-100">
                  <Star size={12} className="text-amber-500" fill="currentColor" />
                  <span className="font-mono text-xs font-bold text-slate-800">{h.rating || '4.5'}</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-1">{h.hospitalName || h.name}</h3>
                <div className="flex items-center gap-2 text-slate-400 mb-4">
                  <MapPin size={14} />
                  <span className="text-sm font-medium">{h.area}, {h.city}</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/5 text-primary px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border border-primary/10">
                      {h.type || 'HOSPITAL'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-primary">
                    <span className="text-sm font-bold">Book Now</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );

  const renderHistoryView = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Visit History</h2>
        <History className="text-primary" />
      </div>

      {patientTokens.length === 0 ? (
        <div className="bg-white p-20 rounded-[40px] text-center border-2 border-dashed border-slate-200">
          <Calendar size={64} className="mx-auto text-slate-200 mb-6" />
          <p className="text-xl font-bold text-slate-400">No visits found yet</p>
          <button 
            onClick={() => setActiveTab('hospitals')}
            className="mt-6 px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:scale-105 transition-all"
          >
            Book First Appointment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {patientTokens.map((token) => (
            <div key={token.id} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <HospitalIcon size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 leading-tight">{token.hospitalName}</h4>
                    <p className="text-xs text-slate-400 font-medium">{token.doctorName}</p>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                  token.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                  token.status === 'in-progress' ? 'bg-blue-50 text-blue-600' :
                  token.status === 'cancelled' || token.status === 'not-arrived' ? 'bg-red-50 text-red-600' :
                  'bg-amber-50 text-amber-600'
                }`}>
                  {token.status}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  <span className="text-xs font-mono font-bold text-slate-600">
                    {formatDate(token.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Token</span>
                  <span className="text-sm font-mono font-bold text-slate-900">#{token.tokenNumber}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-[#faf8ff] min-h-screen pb-32">
      {renderHeader()}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'hospitals' && renderHospitalsView()}
          {activeTab === 'history' && renderHistoryView()}
          {activeTab === 'profile' && (
            <div className="p-6 text-center text-slate-400 font-bold py-20">Profile Under Development</div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* 30-Day Warning Popup */}
      <AnimatePresence>
        {showDataWarning && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-warning-amber" />
              <div className="w-20 h-20 bg-warning-amber/10 rounded-3xl flex items-center justify-center text-warning-amber mb-8 mx-auto">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4 text-center leading-tight">Data Privacy Alert</h3>
              <p className="text-slate-600 text-center mb-10 leading-relaxed font-medium">
                Your appointment history older than 30 days is about to be cleared to ensure security and app performance. Would you like to save it first?
              </p>
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => handleClearOldData(true)}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                >
                  <Save size={20} /> Save & Export History
                </button>
                <button 
                  onClick={() => handleClearOldData(false)}
                  className="w-full py-4 bg-slate-50 text-emergency-red rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-emergency-red/5 transition-all"
                >
                  <Trash2 size={20} /> Delete Old Data
                </button>
                <button 
                  onClick={() => setShowDataWarning(false)}
                  className="w-full pt-2 text-slate-400 font-bold text-sm tracking-widest uppercase hover:text-slate-600"
                >
                  Remind Me Later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-[100] bg-white/80 backdrop-blur-xl border-t border-slate-100 flex justify-around py-4 pb-8">
        {[
          { icon: Home, id: 'hospitals', label: 'Home' },
          { icon: History, id: 'history', label: 'History' },
          { icon: User, id: 'profile', label: 'Profile' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === tab.id ? 'text-primary scale-110' : 'text-slate-400'
            }`}
          >
            <tab.icon size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default PatientDashboard;
