import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, MapPin, Clock, Stethoscope, Users, 
  DollarSign, Camera, CheckCircle2, ArrowRight,
  ArrowLeft, Check, AlertTriangle, Upload, X,
  Plus, Trash2, UserPlus, MessageSquare, ShieldCheck,
  ChevronDown, ChevronUp, Save, Heart, Phone, Mail,
  Activity, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

interface HospitalRegistrationProps {
  onComplete: () => void;
}

const HospitalRegistration: React.FC<HospitalRegistrationProps> = ({ onComplete }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
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
    emergencyFee: '',
    isFree: false,
    about: ''
  });

  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  const [isEmergency, setIsEmergency] = useState(false);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [staffCounts, setStaffCounts] = useState({ doctors: 0, nurses: 0, receptionists: 0, support: 0 });
  const [individualStaff, setIndividualStaff] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>(['Cash']);
  const [media, setMedia] = useState({ logo: null, photos: [] as any[] });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeSection, setActiveSection] = useState(1);
  const [completedSections, setCompletedSections] = useState<number[]>([]);

  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);

  const allSpecs = [
    'General Physician', 'Cardiology', 'Neurology', 'Orthopedic', 'Gynecology', 
    'Pediatrics', 'Dentistry', 'Dermatology (Skin)', 'Ophthalmology (Eye)', 
    'ENT Specialist', 'Psychiatry', 'Urology', 'Gastroenterology', 'Pulmonology', 
    'Endocrinology', 'Nephrology', 'Oncology', 'Rheumatology', 'Hematology', 
    'Physiotherapy', 'Nutritionist', 'Emergency Medicine'
  ];

  const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad'];

  const facilityGroups = {
    "Medical Facilities": ["Emergency Ward", "ICU", "Operation Theater (OT)", "Labour Room"],
    "Diagnostic Facilities": ["Pathology Lab", "X-Ray", "Ultrasound"],
    "Support Facilities": ["Pharmacy", "Ambulance Service"],
    "Patient Comfort": ["Private Rooms", "General Ward", "Waiting Area"],
    "Digital Services": ["Online Appointment", "Telemedicine"]
  };

  const validateSection = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.name) newErrors.name = t.signup.errors.required;
      if (!formData.ownerName) newErrors.ownerName = t.signup.errors.required;
      if (!formData.email) newErrors.email = t.signup.errors.required;
      if (!formData.password) newErrors.password = t.signup.errors.required;
      else if (formData.password.length < 6) newErrors.password = t.signup.errors.passwordTooShort;
    }
    if (step === 2) {
      if (!formData.city) newErrors.city = t.signup.errors.required;
      if (!formData.address) newErrors.address = t.signup.errors.required;
      if (!formData.area) newErrors.area = t.signup.errors.required;
      if (!formData.phone) newErrors.phone = t.signup.errors.required;
    }
    if (step === 4) {
      if (selectedSpecs.length === 0) newErrors.specs = t.signup.errors.atLeastOneSpec;
    }
    if (step === 6) {
      if (!formData.opdFee) newErrors.opdFee = t.signup.errors.required;
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (currentStep: number) => {
    if (validateSection(currentStep)) {
      if (!completedSections.includes(currentStep)) {
        setCompletedSections([...completedSections, currentStep]);
      }
      setActiveSection(currentStep + 1);
      setTimeout(() => {
        sectionsRef.current[currentStep]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleSubmit = async () => {
    if (!validateSection(1) || !validateSection(2) || !validateSection(4) || !validateSection(6)) {
        toast.error("Please fill all required fields");
        return;
    }
    
    setIsSubmitting(true);
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
        facilities: selectedFacilities,
        opdFee: formData.opdFee,
        emergencyFee: formData.emergencyFee,
        isFree: formData.isFree,
        status: "active",
        createdAt: serverTimestamp(),
        approved: true,
        uid: user.uid,
        about: formData.about,
        isEmergency: isEmergency,
        openDays: selectedDays,
        staffStats: staffCounts,
        paymentMethods: paymentMethods
      };

      await setDoc(doc(db, 'hospitals', user.uid), hospitalData);
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: formData.email,
        role: 'hospital_admin',
        createdAt: serverTimestamp()
      });
      
      toast.success("Registration Successful!");
      setIsSubmitted(true);
      setTimeout(() => onComplete(), 2000);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setErrors(prev => ({ ...prev, email: t.auth.emailAlreadyInUse }));
        toast.error(t.auth.emailAlreadyInUse);
        setActiveSection(1);
      } else {
        toast.error(err.message || "Registration failed");
        setErrors({ general: err.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (completedSections.length / 8) * 100;

  const SectionWrapper = ({ id, title, icon: Icon, children, isLast = false }: any) => {
    const isActive = activeSection === id;
    const isCompleted = completedSections.includes(id);

    return (
      <div 
        ref={el => sectionsRef.current[id-1] = el}
        className={`relative transition-all duration-500 ${isActive ? 'opacity-100 scale-100 mb-12' : 'opacity-60 scale-[0.98] mb-6'}`}
      >
        {/* Connector Line */}
        {!isLast && (
           <div className="absolute left-[27px] top-[60px] bottom-[-24px] w-[2px] bg-slate-200 z-0 overflow-hidden">
             <motion.div 
               initial={{ height: 0 }}
               animate={{ height: isCompleted ? '100%' : '0%' }}
               className="w-full bg-[#0B5FFF] transition-all duration-700"
             />
           </div>
        )}

        <div className={`p-8 bg-white rounded-[32px] border-2 transition-all duration-300 relative z-10 ${isActive ? 'border-[#0B5FFF] shadow-2xl shadow-blue-500/5' : 'border-slate-100 shadow-sm'}`}>
          <div 
             className="flex items-center justify-between cursor-pointer"
             onClick={() => setActiveSection(id)}
          >
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${isCompleted ? 'bg-[#00C9B1] text-white' : isActive ? 'bg-[#0B5FFF] text-white' : 'bg-slate-100 text-slate-400'}`}>
                {isCompleted ? <Check size={28} strokeWidth={3} /> : <Icon size={28} strokeWidth={2.5} />}
              </div>
              <div>
                <h3 className={`text-xl font-bold tracking-tight ${isActive ? 'text-[#0B1D35]' : 'text-slate-500'}`}>{title}</h3>
                {isCompleted && !isActive && <p className="text-xs font-bold text-[#00C9B1] uppercase tracking-widest mt-0.5">Section Completed</p>}
              </div>
            </div>
            {!isActive && (
              <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#0B5FFF]/5 hover:text-[#0B5FFF] transition-all">
                <ChevronDown size={20} />
              </button>
            )}
          </div>

          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-10 space-y-8">
                  {children}
                  {!isLast && (
                    <div className="flex justify-end pt-6">
                      <button 
                        onClick={() => handleNext(id)}
                        className="px-10 py-4 bg-[#0B5FFF] text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                      >
                        Continue <ArrowRight size={20} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#00C9B1]" />
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-emerald-50 rounded-[40px] flex items-center justify-center text-[#00C9B1] mb-8"
        >
          <CheckCircle2 size={56} strokeWidth={1.5} />
        </motion.div>
        <h2 className="text-4xl font-black text-[#0B1D35] mb-4 tracking-tighter">Registration Complete!</h2>
        <p className="text-slate-500 text-lg max-w-md mx-auto font-medium">Your hospital profile is being initialized. Welcome to Pakistan's largest digital health network.</p>
        <div className="mt-12 w-full max-w-md bg-slate-50 p-6 rounded-3xl border border-slate-100">
           <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-black rounded-full uppercase">Active</span>
           </div>
           <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dashboard</span>
              <span className="text-sm font-bold text-[#0B1D35]">Opening in 2s...</span>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-40">
      {/* Header Sticky Progress */}
      <header className="sticky top-0 z-[110] bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#0B5FFF] rounded-xl flex items-center justify-center text-white">
                <Activity size={22} />
             </div>
             <div>
                <h4 className="font-black text-[#0B1D35] tracking-tight">Xdoc Partner</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hospital Registration</p>
             </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
             <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overall Progress</span>
                <span className="text-lg font-black text-[#0B5FFF]">{Math.round(progress)}%</span>
             </div>
             <div className="w-40 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${progress}%` }}
                   className="h-full bg-[#0B5FFF] shadow-[0_0_10px_rgba(11,95,255,0.4)]"
                />
             </div>
          </div>
          <button 
             onClick={onComplete}
             className="px-4 py-2 text-slate-400 hover:text-slate-900 transition-colors"
          >
             <X size={24} />
          </button>
        </div>
        {/* Visual Progress Bar for Mobile */}
        <div className="md:hidden w-full h-[3px] bg-slate-100 overflow-hidden">
           <motion.div 
              animate={{ width: `${progress}%` }}
              className="h-full bg-[#0B5FFF]"
           />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-16">
        <div className="mb-16 text-center">
            <h1 className="text-5xl font-black text-[#0B1D35] tracking-tighter mb-4">Register your Hospital</h1>
            <p className="text-lg text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">Pakistan's most advanced hospital management suite. Setup your profile in just a few clicks.</p>
        </div>

        {/* SECTION 1: BASIC INFO */}
        <SectionWrapper id={1} title="Basic Information" icon={Building2}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Hospital / Clinic Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. City General Hospital"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className={`w-full px-6 py-4.5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#0B5FFF] font-bold text-[#0B1D35] ${errors.name ? 'ring-2 ring-red-500' : ''}`}
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Type of Facility</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full px-6 py-4.5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#0B5FFF] font-bold text-[#0B1D35]"
                >
                  <option>Private Hospital</option>
                  <option>Private Clinic</option>
                  <option>Government Hospital</option>
                  <option>Government Clinic</option>
                </select>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Owner Full Name</label>
                <input 
                  type="text" 
                  placeholder="Official Name for verification"
                  value={formData.ownerName}
                  onChange={e => setFormData({...formData, ownerName: e.target.value})}
                  className="w-full px-6 py-4.5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#0B5FFF] font-bold text-[#0B1D35]"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Official Email</label>
                <input 
                  type="email" 
                  placeholder="contact@hospital.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-6 py-4.5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#0B5FFF] font-bold text-[#0B1D35]"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Portal Password</label>
                <input 
                  type="password" 
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full px-6 py-4.5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#0B5FFF] font-bold text-[#0B1D35]"
                />
             </div>
          </div>
        </SectionWrapper>

        {/* SECTION 2: LOCATION */}
        <SectionWrapper id={2} title="Location & Contact" icon={MapPin}>
           <div className="space-y-8">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Street Address</label>
                 <input 
                   type="text" 
                   placeholder="Building #, Street, Block..."
                   value={formData.address}
                   onChange={e => setFormData({...formData, address: e.target.value})}
                   className="w-full px-6 py-4.5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#0B5FFF] font-bold text-[#0B1D35]"
                 />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Area / Sector</label>
                    <input 
                      type="text" 
                      placeholder="e.g. DHA Phase 2"
                      value={formData.area}
                      onChange={e => setFormData({...formData, area: e.target.value})}
                      className="w-full px-6 py-4.5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#0B5FFF] font-bold text-[#0B1D35]"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">City</label>
                    <select 
                      value={formData.city}
                      onChange={e => setFormData({...formData, city: e.target.value})}
                      className="w-full px-6 py-4.5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#0B5FFF] font-bold text-[#0B1D35]"
                    >
                      <option value="">Select City</option>
                      {cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Official Mobile / Landline</label>
                 <div className="relative">
                    <Phone className="absolute left-6 top-1/2 -track-y-1/2 text-slate-400 mt-[2px]" size={20} />
                    <input 
                      type="tel" 
                      placeholder="03XX-XXXXXXX"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full pl-15 pr-6 py-4.5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#0B5FFF] font-bold text-[#0B1D35]"
                    />
                 </div>
              </div>
           </div>
        </SectionWrapper>

        {/* SECTION 3: TIMINGS */}
        <SectionWrapper id={3} title="Operation Timings" icon={Clock}>
           <div className="space-y-10">
              <div className="grid grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Opening Time</label>
                    <input type="time" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#0B5FFF] font-bold" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Closing Time</label>
                    <input type="time" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#0B5FFF] font-bold" />
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Working Days</label>
                 <div className="grid grid-cols-7 gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                       const isSel = selectedDays.includes(day);
                       return (
                          <div 
                             key={day}
                             onClick={() => setSelectedDays(prev => isSel ? prev.filter(d => d !== day) : [...prev, day])}
                             className={`flex flex-col items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${isSel ? 'border-[#0B5FFF] bg-[#0B5FFF]/5' : 'border-transparent bg-slate-100'}`}
                          >
                             <span className={`text-[10px] font-black uppercase tracking-widest ${isSel ? 'text-[#0B5FFF]' : 'text-slate-400'}`}>{day}</span>
                             <div className={`w-5 h-5 rounded-md flex items-center justify-center ${isSel ? 'bg-[#0B5FFF]' : 'bg-white border-2 border-slate-200'}`}>
                                {isSel && <Check size={14} className="text-white" strokeWidth={4} />}
                             </div>
                          </div>
                       )
                    })}
                 </div>
              </div>

              <div className={`flex items-center justify-between p-8 rounded-[32px] border-2 transition-all ${isEmergency ? 'border-[#00C9B1] bg-[#00C9B1]/5 shadow-lg shadow-emerald-500/10' : 'border-slate-100 bg-slate-50'}`}>
                <div className="flex items-center gap-6">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isEmergency ? 'bg-[#00C9B1] text-white' : 'bg-slate-200 text-slate-400'}`}>
                      <AlertTriangle size={32} />
                   </div>
                   <div>
                      <p className="text-xl font-bold text-[#0B1D35] leading-tight">24/7 Emergency Service</p>
                      <p className="text-slate-500 font-medium">List your hospital for round-the-clock care</p>
                   </div>
                </div>
                <div 
                   onClick={() => setIsEmergency(!isEmergency)}
                   className={`w-16 h-9 rounded-full relative p-1 cursor-pointer transition-all ${isEmergency ? 'bg-[#00C9B1]' : 'bg-slate-300'}`}
                >
                   <motion.div 
                     animate={{ x: isEmergency ? 28 : 0 }}
                     className="w-7 h-7 bg-white rounded-full shadow-lg"
                   />
                </div>
              </div>
           </div>
        </SectionWrapper>

        {/* SECTION 4: SERVICES */}
        <SectionWrapper id={4} title="Services & Facilities" icon={Stethoscope}>
           <div className="space-y-12">
              <div className="space-y-6">
                 <div className="flex justify-between items-center px-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medical Specializations</label>
                    <span className="text-xs font-bold text-[#0B5FFF]">{selectedSpecs.length} selected</span>
                 </div>
                 <div className="flex flex-wrap gap-2.5">
                    {allSpecs.map(s => {
                       const isSel = selectedSpecs.includes(s);
                       return (
                          <button 
                            key={s}
                            onClick={() => setSelectedSpecs(p => isSel ? p.filter(x => x !== s) : [...p, s])}
                            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border ${isSel ? 'bg-[#0B5FFF] border-[#0B5FFF] text-white shadow-lg shadow-blue-500/20' : 'bg-white border-slate-200 text-slate-600 hover:border-[#0B5FFF]'}`}
                          >
                            {s}
                          </button>
                       )
                    })}
                 </div>
              </div>

              <div className="space-y-8">
                 {Object.entries(facilityGroups).map(([cat, facs]) => (
                    <div key={cat} className="space-y-4">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{cat}</h4>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {facs.map(f => {
                             const isSel = selectedFacilities.includes(f);
                             return (
                                <div 
                                   key={f}
                                   onClick={() => setSelectedFacilities(p => isSel ? p.filter(x => x !== f) : [...p, f])}
                                   className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${isSel ? 'border-[#0B5FFF] bg-[#0B5FFF]/5' : 'border-slate-100 bg-slate-50'}`}
                                >
                                   <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${isSel ? 'bg-[#0B5FFF]' : 'bg-white border-2 border-slate-200'}`}>
                                      {isSel && <Check size={16} className="text-white" strokeWidth={4} />}
                                   </div>
                                   <span className={`text-[13px] font-bold ${isSel ? 'text-[#0B1D35]' : 'text-slate-500'}`}>{f}</span>
                                </div>
                             )
                          })}
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </SectionWrapper>

        {/* SECTION 5: STAFF */}
        <SectionWrapper id={5} title="Staff Details" icon={Users}>
           <div className="space-y-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[
                   { id: 'doctors', label: 'Doctors', icon: UserPlus },
                   { id: 'nurses', label: 'Nurses', icon: Heart },
                   { id: 'receptionists', label: 'Reception', icon: MessageSquare },
                   { id: 'support', label: 'Support', icon: Users }
                 ].map(t => (
                    <div key={t.id} className="bg-slate-50 p-5 rounded-[28px] border border-slate-100 flex flex-col items-center text-center">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t.label}</p>
                       <div className="relative w-full">
                          <input 
                            type="number" 
                            value={staffCounts[t.id as keyof typeof staffCounts]}
                            onChange={e => setStaffCounts({...staffCounts, [t.id]: parseInt(e.target.value) || 0})}
                            className="w-full bg-transparent border-none focus:ring-0 text-center font-black text-2xl text-[#0B1D35]"
                          />
                       </div>
                    </div>
                 ))}
              </div>

              <div className="pt-10 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-8 px-2">
                     <h4 className="text-xl font-bold text-[#0B1D35]">Key Staff Members</h4>
                     <button 
                       onClick={() => setIndividualStaff([...individualStaff, { id: Date.now(), name: '', role: 'Doctor' }])}
                       className="p-2 bg-[#0B5FFF] text-white rounded-xl shadow-lg shadow-blue-500/20 hover:scale-110 transition-all"
                     >
                        <Plus size={24} />
                     </button>
                  </div>
                  <div className="space-y-4">
                     {individualStaff.map((s, i) => (
                        <div key={s.id} className="p-6 bg-slate-50 rounded-3xl flex flex-col md:flex-row gap-4 relative group">
                           <button 
                              onClick={() => setIndividualStaff(individualStaff.filter(x => x.id !== s.id))}
                              className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                           >
                              <Trash2 size={18} />
                           </button>
                           <input 
                             placeholder="Full Name" 
                             className="flex-1 px-5 py-3 rounded-xl border-none bg-white font-bold"
                             value={s.name}
                             onChange={e => {
                                const st = [...individualStaff];
                                st[i].name = e.target.value;
                                setIndividualStaff(st);
                             }}
                           />
                           <select 
                             className="md:w-48 px-5 py-3 rounded-xl border-none bg-white font-bold"
                             value={s.role}
                             onChange={e => {
                                const st = [...individualStaff];
                                st[i].role = e.target.value;
                                setIndividualStaff(st);
                             }}
                           >
                              <option>Doctor</option>
                              <option>Nurse</option>
                              <option>Admin</option>
                           </select>
                        </div>
                     ))}
                  </div>
              </div>
           </div>
        </SectionWrapper>

        {/* SECTION 6: PRICING */}
        <SectionWrapper id={6} title="Pricing & Payments" icon={DollarSign}>
           <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">General OPD Fee (Rs)</label>
                    <div className="relative">
                       <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rs.</span>
                       <input 
                        type="number" 
                        placeholder="1500"
                        value={formData.opdFee}
                        onChange={e => setFormData({...formData, opdFee: e.target.value})}
                        className="w-full pl-15 pr-6 py-4.5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#0B5FFF] font-black text-2xl"
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Emergency Fee (Optional)</label>
                    <div className="relative">
                       <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rs.</span>
                       <input 
                        type="number" 
                        placeholder="2500"
                        value={formData.emergencyFee}
                        onChange={e => setFormData({...formData, emergencyFee: e.target.value})}
                        className="w-full pl-15 pr-6 py-4.5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#0B5FFF] font-black text-2xl"
                       />
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Accepted Payment Methods</label>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['Cash', 'JazzCash', 'EasyPaisa', 'Visa/Mastercard', 'Sehat Card'].map(m => {
                       const isSel = paymentMethods.includes(m);
                       return (
                          <div 
                             key={m}
                             onClick={() => setPaymentMethods(prev => isSel ? prev.filter(x => x !== m) : [...prev, m])}
                             className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${isSel ? 'border-[#0B5FFF] bg-[#0B5FFF]/5' : 'border-slate-100 bg-slate-50'}`}
                          >
                             <div className={`w-5 h-5 rounded-md flex items-center justify-center ${isSel ? 'bg-[#0B5FFF]' : 'bg-white border-2 border-slate-200'}`}>
                                {isSel && <Check size={14} className="text-white" strokeWidth={4} />}
                             </div>
                             <span className="text-sm font-bold text-slate-700">{m}</span>
                          </div>
                       )
                    })}
                 </div>
              </div>
           </div>
        </SectionWrapper>

        {/* SECTION 7: MEDIA */}
        <SectionWrapper id={7} title="Media & Branding" icon={Camera}>
           <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Hospital Logo</label>
                    <div className="w-full aspect-square bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-[#0B5FFF] transition-all">
                       <Upload className="text-slate-400 group-hover:text-[#0B5FFF] transition-all" size={32} />
                       <span className="text-[10px] font-bold text-slate-400 uppercase mt-4">Upload PNG</span>
                       <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                 </div>
                 <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Hospital Gallery (Up to 10)</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       <div className="aspect-square bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-[#0B5FFF] transition-all">
                          <Plus size={24} className="text-slate-400" />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-100">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Brief About Hospital</label>
                 <textarea 
                   placeholder="Describe your facilities, mission and achievements..."
                   value={formData.about}
                   onChange={e => setFormData({...formData, about: e.target.value})}
                   className="w-full px-6 py-5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#0B5FFF] font-medium min-h-[160px] text-lg leading-relaxed"
                 />
              </div>
           </div>
        </SectionWrapper>

        {/* SECTION 8: REVIEW */}
        <SectionWrapper id={8} title="Review & Finalize" icon={ShieldCheck} isLast>
           <div className="space-y-8">
              <div className="p-8 bg-[#0B5FFF]/5 rounded-[40px] border border-[#0B5FFF]/10">
                 <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1 space-y-6">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#0B5FFF] shadow-sm">
                             <Building2 size={24} />
                          </div>
                          <div>
                             <h4 className="font-black text-lg text-[#0B1D35] leading-tight">{formData.name || 'Hospital Name'}</h4>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{formData.type}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3 text-slate-500">
                          <MapPin size={18} />
                          <span className="text-sm font-bold">{formData.city}, {formData.area}</span>
                       </div>
                    </div>
                    <div className="w-[1px] bg-slate-200 hidden md:block" />
                    <div className="flex-1 space-y-6">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consultation Fee</span>
                          <span className="text-xl font-black text-[#0B1D35]">Rs. {formData.opdFee || '0'}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Specializations</span>
                          <span className="text-sm font-black text-[#0B5FFF]">{selectedSpecs.length} Active</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-4 p-6 bg-slate-100 rounded-3xl border border-slate-200">
                  <ShieldCheck className="text-[#0B1D35]" size={24} />
                  <p className="text-sm font-bold text-slate-600">By clicking register, you agree to Xdoc Partner Terms and Data Privacy Policy.</p>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-6 bg-[#0B5FFF] text-white font-black text-xl rounded-[32px] shadow-2xl shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-70 disabled:scale-100"
              >
                {isSubmitting ? (
                   <>
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                   </>
                ) : (
                   <>Complete Registration <ArrowRight size={24} /></>
                )}
              </button>
           </div>
        </SectionWrapper>
      </main>

      {/* Floating Action Button (Mobile) */}
      <div className="md:hidden fixed bottom-6 right-6 z-[120]">
         <div className="relative">
            <svg className="w-16 h-16 transform -rotate-90">
               <circle cx="32" cy="32" r="30" fill="none" stroke="white" strokeWidth="4" className="shadow-lg" />
               <circle 
                  cx="32" cy="32" r="30" fill="none" stroke="#0B5FFF" strokeWidth="4" 
                  strokeDasharray={`${2 * Math.PI * 30}`}
                  strokeDashoffset={`${2 * Math.PI * 30 * (1 - progress/100)}`}
                  className="transition-all duration-500"
               />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
               <span className="text-xs font-black text-[#0B5FFF]">{Math.round(progress)}%</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default HospitalRegistration;
