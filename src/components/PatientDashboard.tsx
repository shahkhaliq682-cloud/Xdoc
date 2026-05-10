import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Star, CheckCircle2, ShieldCheck, 
  Clock, Calendar, Home, User, Bell, ChevronRight, 
  Map as MapIcon, Hospital as HospitalIcon, 
  ArrowRight, History, Info, AlertTriangle, Save, Trash2, LogOut, Mail, Phone, X, UserSquare2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  collection, query, where, getDocs, orderBy, 
  onSnapshot, doc, getDoc, serverTimestamp, 
  updateDoc, deleteDoc, writeBatch 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';

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
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'hospitals' | 'history' | 'profile'>('hospitals');
  const [hospitalType, setHospitalType] = useState<'All' | 'Private Hospital' | 'Private Clinic' | 'Govt. Hospital'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [patientTokens, setPatientTokens] = useState<any[]>([]);
  const [allTodayTokens, setAllTodayTokens] = useState<any[]>([]);
  const [showDataWarning, setShowDataWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userData && !editProfileForm) {
      setEditProfileForm({
        name: userData.name || '',
        phone: userData.profile?.phone || '',
        city: userData.profile?.city || 'Karachi'
      });
    }
  }, [userData]);

  const handleUpdateProfile = async () => {
    if (!userData?.uid) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', userData.uid), {
        name: editProfileForm.name,
        'profile.phone': editProfileForm.phone,
        'profile.city': editProfileForm.city
      });
      setIsEditingProfile(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  };

  useEffect(() => {
    // Fetch all today's tokens to calculate "Active Today" stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const allTokensQuery = query(
      collection(db, 'tokens'),
      where('appointmentDate', '==', todayStr)
    );

    const unsubscribeAll = onSnapshot(allTokensQuery, (snapshot) => {
      setAllTodayTokens(snapshot.docs.map(doc => doc.data()));
    });

    if (!userData?.uid) {
      return () => unsubscribeAll();
    }

    const tokensQuery = query(
      collection(db, 'tokens'),
      where('patientId', '==', userData.uid)
    );

    const unsubscribe = onSnapshot(tokensQuery, (snapshot) => {
      const tokenList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      // Sort client-side to avoid needing a composite index
      tokenList.sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });

      setPatientTokens(tokenList);
      setIsLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'tokens');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userData?.uid]);

  const cancelToken = async (token: any) => {
    if (token.status !== 'waiting' && token.status !== 'Waiting') return;
    
    if (!confirm(language === 'UR' ? 'کیا آپ واقعی یہ ٹوکن منسوخ کرنا چاہتے ہیں؟' : 'Are you sure you want to cancel this token?')) return;

    try {
      const tokenId = token.id;
      const patientId = userData.uid;
      const hospitalId = token.hospitalId;
      
      const updateData = {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      };
      
      const batch = writeBatch(db);
      batch.update(doc(db, 'tokens', tokenId), updateData);
      batch.update(doc(db, 'hospitals', hospitalId, 'tokens', tokenId), updateData);
      batch.update(doc(db, 'users', patientId, 'history', tokenId), updateData);
      
      await batch.commit();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter out test/demo hospitals
  const realHospitals = hospitals.filter(h => {
    const name = (h.hospitalName || h.name || '').toLowerCase();
    return !name.includes('test') && !name.includes('demo') && !name.includes('care with');
  });

  const getActiveHospitals = () => {
    const activeIds = new Set(allTodayTokens.map(t => t.hospitalId));
    return realHospitals.filter(h => h.status === 'open' && activeIds.has(h.id));
  };

  const filteredHospitals = realHospitals.filter(h => {
    const matchesType = hospitalType === 'All' || 
      (hospitalType === 'Private Hospital' && h.type === 'Private Hospital') ||
      (hospitalType === 'Private Clinic' && h.type === 'Private Clinic') ||
      (hospitalType === 'Govt. Hospital' && h.type === 'Government Hospital') ||
      (hospitalType === 'Govt. Clinic' && h.type === 'Government Clinic');
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = (h.hospitalName || h.name)?.toLowerCase().includes(searchLower) ||
      (h.area || '').toLowerCase().includes(searchLower) ||
      (h.city || '').toLowerCase().includes(searchLower) ||
      (h.specializations || []).some((s: string) => s.toLowerCase().includes(searchLower));

    return matchesType && matchesSearch;
  });

  const getStats = () => {
    return {
      totalHospitals: realHospitals.filter(h => h.type?.includes('Hospital')).length,
      totalClinics: realHospitals.filter(h => h.type?.includes('Clinic')).length,
      activeToday: getActiveHospitals().length,
      openNow: realHospitals.filter(h => h.status === 'open').length
    };
  };

  const renderHospitalsView = () => {
    const stats = getStats();
    return (
      <div className="p-6 space-y-8">
        {/* Row 1 - Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {[
            { label: t.patient.booking.totalHospitals, count: stats.totalHospitals, color: 'text-primary', icon: HospitalIcon },
            { label: t.patient.booking.totalClinics, count: stats.totalClinics, color: 'text-blue-600', icon: MapIcon },
            { label: t.patient.booking.activeToday, count: stats.activeToday, color: 'text-health-teal', icon: CheckCircle2 },
            { label: t.patient.booking.openNow, count: stats.openNow, color: 'text-emerald-500', icon: Clock },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:shadow-md transition-all">
              <div className={`w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center ${item.color} mb-3 group-hover:scale-110 transition-transform`}>
                <item.icon size={20} />
              </div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
              <p className="text-2xl font-black text-slate-900">{item.count}</p>
            </div>
          ))}
        </div>

        {/* Row 2 - Filtering Tabs */}
        <div className="flex bg-white p-2 rounded-[24px] gap-1 border border-slate-100 overflow-x-auto no-scrollbar shadow-sm">
          {([
            { id: 'All', label: t.patient.booking.all },
            { id: 'Private Hospital', label: t.patient.booking.privateHospital },
            { id: 'Private Clinic', label: t.patient.booking.privateClinic },
            { id: 'Govt. Hospital', label: t.patient.booking.govtHospital },
            { id: 'Govt. Clinic', label: t.patient.booking.govtClinic }
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setHospitalType(tab.id as any)}
              className={`flex-none px-5 py-3 rounded-2xl font-extrabold text-xs transition-all whitespace-nowrap ${
                hospitalType === tab.id 
                  ? 'bg-health-teal text-white shadow-lg shadow-health-teal/20' 
                  : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder={language === 'UR' ? "نام، علاقہ یا شہر سے تلاش کریں..." : "Search by name, area or city..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary font-medium"
        />
      </div>

      {/* Hospital List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{language === 'UR' ? "دستیاب ہسپتال" : t.dashboard.availableHospitals}</h2>
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">{filteredHospitals.length} {language === 'UR' ? "ملے" : "Found"}</span>
        </div>

        {filteredHospitals.length === 0 ? (
          <div className="bg-white p-20 rounded-[40px] text-center border-2 border-dashed border-slate-200">
            <HospitalIcon size={64} className="mx-auto text-slate-200 mb-6" />
            <p className="text-xl font-bold text-slate-400">{t.dashboard.noHospitals}</p>
          </div>
        ) : (
          filteredHospitals.map((h) => {
            const type = h.type || 'Private Hospital';
            const isGovt = type.toLowerCase().includes('government');
            const fee = isGovt ? t.patient.hospitalCard.free : h.opdFee ? `Rs. ${h.opdFee}` : `Rs. ${h.startingFee || 800}`;
            
            let badgeColor = 'bg-primary/10 text-primary';
            if (type === 'Private Hospital') badgeColor = 'bg-blue-600/10 text-blue-600';
            if (type === 'Private Clinic') badgeColor = 'bg-purple-600/10 text-purple-600';
            if (type === 'Government Hospital') badgeColor = 'bg-success-green/10 text-success-green';
            if (type === 'Government Clinic') badgeColor = 'bg-teal-600/10 text-teal-600';

            const displayTypeName = type === 'Private Hospital' ? t.patient.categories.privateHospital :
                                  type === 'Private Clinic' ? t.patient.categories.privateClinic :
                                  type === 'Government Hospital' ? t.patient.categories.govtHospital :
                                  type === 'Government Clinic' ? (language === 'UR' ? 'سرکاری کلینک' : 'Govt. Clinic') : type;
            
            const status = h.status || 'open';
            const isOpen = status === 'open';
            
            // Check if active today (has tokens today)
            const isActiveToday = isOpen && allTodayTokens.some(t => t.hospitalId === h.id);

            return (
              <motion.div 
                layout
                key={h.id}
                onClick={() => onHospitalClick(h)}
                className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="h-48 relative overflow-hidden">
                  <img 
                    src={h.imageUrl || h.photo || `https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800&h=400&sig=${h.id}`} 
                    alt={h.hospitalName} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <div className={`bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg border border-slate-100`}>
                      <div className={`w-2 h-2 ${isOpen ? 'bg-emerald-500 breathing-dot' : 'bg-emergency-red'} rounded-full`} />
                      <span className={`font-mono text-[10px] font-bold uppercase tracking-widest ${isOpen ? 'text-emerald-600' : 'text-emergency-red'}`}>
                        {isOpen ? t.patient.booking.openNow : t.patient.booking.closed}
                      </span>
                    </div>

                    {isActiveToday && (
                      <div className="bg-health-teal text-white px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg border border-health-teal/20 animate-pulse">
                        <CheckCircle2 size={12} />
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest">
                          {t.patient.booking.activeToday}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-2 py-1.5 rounded-xl flex items-center gap-1 shadow-lg border border-slate-100">
                    <Star size={12} className="text-amber-500" fill="currentColor" />
                    <span className="font-mono text-xs font-bold text-slate-800">{h.rating || '4.5'}</span>
                  </div>
                  
                  {/* Fee Badge Overlay */}
                  <div className="absolute bottom-4 left-4">
                    <div className={`px-4 py-1.5 rounded-full font-bold text-xs shadow-lg backdrop-blur ${isGovt ? 'bg-success-green/90 text-white' : 'bg-primary/90 text-white'}`}>
                      {language === 'UR' ? 'مشاورتی فیس' : 'OPD Fee'}: {fee}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-slate-800 leading-tight group-hover:text-primary transition-colors">{h.hospitalName || h.name}</h3>
                    <span className={`px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest ${badgeColor}`}>
                      {displayTypeName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 mb-4">
                    <MapPin size={14} />
                    <span className="text-sm font-medium">{h.area}, {h.city}</span>
                  </div>
                  
                  {/* Top Specializations */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {(h.specializations || []).slice(0, 3).map((spec: string, idx: number) => (
                      <span key={idx} className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                        {spec}
                      </span>
                    ))}
                    {(h.specializations || []).length > 3 && (
                      <span className="text-[10px] font-bold text-slate-400 px-2.5 py-1">
                        +{(h.specializations || []).length - 3} More
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {h.openingTime} - {h.closingTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-primary">
                      <span className="text-sm font-bold">{t.patient.hospitalCard.bookToken}</span>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

  const handleClearOldData = async (shouldSave: boolean) => {
    if (!userData?.uid) return;
    
    if (shouldSave) {
      alert("Saving data to your local device... (Mock functionality)");
    } else {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const oldTokens = patientTokens.filter(t => {
          const createdAt = t.createdAt?.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
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

  const renderProfileView = () => (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      <div className="text-center py-8">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary text-3xl font-bold shadow-xl shadow-primary/10 mb-4 mx-auto">
            {userData?.name?.charAt(0) || 'P'}
          </div>
          <div className="absolute bottom-4 right-0 w-8 h-8 bg-white rounded-xl shadow-lg flex items-center justify-center text-primary border border-slate-100">
             <ShieldCheck size={16} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">{userData?.name || 'Patient'}</h2>
        <p className="text-slate-400 font-medium text-sm">{userData?.email || 'patient@xdoc.pk'}</p>
      </div>

      {isEditingProfile ? (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2 block">Full Name</label>
              <input 
                type="text" 
                value={editProfileForm?.name || ''}
                onChange={(e) => setEditProfileForm({...editProfileForm, name: e.target.value})}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-slate-700"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2 block">Phone Number</label>
              <input 
                type="text" 
                value={editProfileForm?.phone || ''}
                onChange={(e) => setEditProfileForm({...editProfileForm, phone: e.target.value})}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-slate-700"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2 block">City</label>
              <input 
                type="text" 
                value={editProfileForm?.city || ''}
                onChange={(e) => setEditProfileForm({...editProfileForm, city: e.target.value})}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-slate-700"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <button 
               onClick={() => setIsEditingProfile(false)}
               className="py-4 bg-slate-50 text-slate-400 rounded-2xl font-bold"
             >
               Cancel
             </button>
             <button 
               onClick={handleUpdateProfile}
               disabled={isSaving}
               className="py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20"
             >
               {isSaving ? 'Saving...' : 'Save Profile'}
             </button>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                <Info size={20} />
              </div>
              <div className="flex-1 border-b border-slate-50 pb-4">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email address</p>
                 <p className="font-bold text-slate-800">{userData?.email || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                <Phone size={20} />
              </div>
              <div className="flex-1 border-b border-slate-50 pb-4">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                 <p className="font-bold text-slate-800">{userData?.profile?.phone || '0300-1234567'}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                <MapPin size={20} />
              </div>
              <div className="flex-1">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">City / Location</p>
                 <p className="font-bold text-slate-800">{userData?.profile?.city || 'Karachi'}, Pakistan</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => setIsEditingProfile(true)}
              className="w-full py-4 bg-white border border-slate-100 rounded-2xl font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-3 text-sm"
            >
              <UserSquare2 size={20} /> Edit Profile
            </button>
            <button 
              onClick={onSignOut}
              className="w-full py-4 bg-emergency-red/10 text-emergency-red rounded-2xl font-bold hover:bg-emergency-red hover:text-white transition-all flex items-center justify-center gap-3 text-sm"
            >
              <LogOut size={20} /> {t.patient.logout.signOut}
            </button>
          </div>
        </>
      )}
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
                  token.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                  token.status === 'In Progress' ? 'bg-blue-50 text-blue-600' :
                  token.status === 'cancelled' || token.status === 'Not Arrived' ? 'bg-red-50 text-red-600' :
                  'bg-amber-50 text-amber-600'
                }`}>
                  {token.status === 'waiting' || token.status === 'Waiting' ? t.patient.booking.waiting : 
                   token.status === 'Completed' ? t.patient.booking.completed :
                   token.status === 'Not Arrived' ? t.patient.booking.notArrived :
                   token.status}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />
                    <span className="text-xs font-mono font-bold text-slate-600">
                      {formatDate(token.createdAt)}
                    </span>
                  </div>
                  {(token.status === 'waiting' || token.status === 'Waiting') && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelToken(token);
                      }}
                      className="text-[10px] font-bold text-emergency-red bg-emergency-red/5 px-3 py-1 rounded-lg hover:bg-emergency-red hover:text-white transition-all flex items-center gap-1 border border-emergency-red/10"
                    >
                      <X size={10} /> {t.patient.hospitalCard.cancelToken}
                    </button>
                  )}
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
          {activeTab === 'profile' && renderProfileView()}
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
          { icon: Home, id: 'hospitals', label: t.nav.home },
          { icon: History, id: 'history', label: language === 'UR' ? 'تاریخ' : 'History' },
          { icon: User, id: 'profile', label: t.nav.profile }
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
