import React, { useState } from 'react';
import { 
  Building2, MapPin, Clock, Stethoscope, Users, 
  CheckCircle2, X, Plus, Check, AlertTriangle, Activity, 
  Eye, EyeOff, LayoutDashboard, User, Mail, Phone, Lock, ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { PLAN_FEATURES } from '../config/planConfig';

interface HospitalRegistrationProps {
  onComplete: () => void;
}

const HospitalRegistration: React.FC<HospitalRegistrationProps> = ({ onComplete }) => {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const isUrdu = language === 'UR';

  const [formData, setFormData] = useState({
    hospitalName: '',
    facilityType: 'Private Hospital',
    ownerName: '',
    email: '',
    password: '',
    phone: '',
    city: 'Karachi',
    address: '',
    specializations: [] as string[],
    opdFee: '',
    openDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    openTime: '09:00',
    closeTime: '17:00',
    emergency: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const allSpecs = [
    'General Physician', 'Cardiology', 'Neurology', 'Orthopedic', 'Gynecology', 
    'Pediatrics', 'Dentistry', 'Dermatology (Skin)', 'Ophthalmology (Eye)', 
    'ENT Specialist', 'Psychiatry', 'Urology', 'Gastroenterology', 'Pulmonology', 
    'Endocrinology', 'Nephrology', 'Oncology', 'Rheumatology', 'Hematology', 
    'Physiotherapy', 'Nutritionist', 'Emergency Medicine'
  ];

  const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Quetta', 'Multan', 'Faisalabad', 'Hyderabad', 'Other'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hospitalName || !formData.email || !formData.password || !formData.phone || !formData.city || !formData.address) {
      toast.error(isUrdu ? "برائے مہربانی تمام ضروری فیلڈز پُر کریں۔" : "Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      const hospitalData = {
        hospitalName: formData.hospitalName,
        type: formData.facilityType,
        facilityType: formData.facilityType,
        ownerName: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        area: formData.address.split(',')[0], // Extract area if possible
        specializations: formData.specializations,
        opdFee: formData.opdFee || "0",
        openDays: formData.openDays,
        openTime: formData.openTime,
        closeTime: formData.closeTime,
        emergency: formData.emergency ? 'Yes' : 'No',
        facilities: ['Emergency Ward', 'Pharmacy', 'Lab'], // Default set
        rating: 0,
        totalReviews: 0,
        isBlocked: false,
        isActive: true,
        blockedAt: null,
        status: "active",
        currentPlan: "trial",
        planStatus: "active",
        planStartDate: serverTimestamp(),
        planEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        enabledFeatures: PLAN_FEATURES.trial.features,
        createdAt: serverTimestamp(),
        imageUrl: `https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800&h=400&sig=${user.uid}`,
        approved: true,
        uid: user.uid,
        id: user.uid
      };

      await setDoc(doc(db, 'hospitals', user.uid), hospitalData);
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: formData.email,
        role: 'hospital_admin',
        createdAt: serverTimestamp()
      });
      
      toast.success(isUrdu ? "رجسٹریشن کامیاب!" : "Registration Successful!");
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
                onComplete(); // This goes back to login usually in this context
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

  const SectionLabel = ({ title }: { title: string }) => (
    <div className="mb-6 border-b border-[#E2E8F0] pb-2">
      <h3 className="font-sans font-semibold text-[12px] text-[#64748B] uppercase tracking-[1px]">
        {title}
      </h3>
    </div>
  );

  const InputLabel = ({ label }: { label: string }) => (
    <label className="block font-sans font-medium text-[13px] text-[#374151] mb-1.5">
      {label}
    </label>
  );

  const toggleSpec = (spec: string) => {
    const specs = [...formData.specializations];
    if (specs.includes(spec)) {
      handleChange('specializations', specs.filter(s => s !== spec));
    } else {
      handleChange('specializations', [...specs, spec]);
    }
  };

  const toggleDay = (day: string) => {
    const openDays = [...formData.openDays];
    if (openDays.includes(day)) {
      handleChange('openDays', openDays.filter(d => d !== day));
    } else {
      handleChange('openDays', [...openDays, day]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-6 font-sans">
      <div className="max-w-[680px] mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#0B1D35] mb-2 tracking-tight">
            {isUrdu ? 'اپنا ہسپتال رجسٹر کریں' : 'Register Your Hospital'}
          </h1>
          <p className="text-[#64748B] font-medium">
            {isUrdu ? 'Xdoc پلیٹ فارم میں شامل ہوں' : 'Join Xdoc platform'}
          </p>
        </div>

        <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-8">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* SECTION: Basic Info */}
            <section>
              <SectionLabel title={isUrdu ? 'بنیادی معلومات' : 'Basic Info'} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <InputLabel label={isUrdu ? 'ہسپتال / کلینک کا نام' : 'Hospital / Clinic Name'} />
                  <input 
                    type="text" 
                    placeholder="e.g. City Clinic"
                    required
                    value={formData.hospitalName}
                    onChange={e => handleChange('hospitalName', e.target.value)}
                    className="w-full h-12 border-[1.5px] border-[#E2E8F0] rounded-lg px-4 font-sans text-sm text-[#0B1D35] focus:outline-none focus:border-[#0B5FFF] transition-colors"
                  />
                </div>
                <div>
                  <InputLabel label={isUrdu ? 'ہسپتال کی قسم' : 'Type of Facility'} />
                  <select 
                    value={formData.facilityType}
                    onChange={e => handleChange('facilityType', e.target.value)}
                    className="w-full h-12 border-[1.5px] border-[#E2E8F0] rounded-lg px-4 font-sans text-sm text-[#0B1D35] focus:outline-none focus:border-[#0B5FFF] transition-colors bg-white appearance-none cursor-pointer"
                  >
                    <option>Private Hospital</option>
                    <option>Private Clinic</option>
                    <option>Government Hospital</option>
                    <option>Government Clinic</option>
                  </select>
                </div>
              </div>
              <div className="mt-6">
                <InputLabel label={isUrdu ? 'مالک کا پورا نام' : 'Owner Full Name'} />
                <input 
                  type="text" 
                  placeholder={isUrdu ? 'مالک کا نام' : "Full name"}
                  required
                  value={formData.ownerName}
                  onChange={e => handleChange('ownerName', e.target.value)}
                  className="w-full h-12 border-[1.5px] border-[#E2E8F0] rounded-lg px-4 font-sans text-sm text-[#0B1D35] focus:outline-none focus:border-[#0B5FFF] transition-colors"
                />
              </div>
            </section>

            {/* SECTION: Contact */}
            <section>
              <SectionLabel title={isUrdu ? 'رابطہ' : 'Contact'} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <InputLabel label={isUrdu ? 'ای میل' : 'Email Address'} />
                  <input 
                    type="email" 
                    placeholder="email@example.com"
                    required
                    value={formData.email}
                    onChange={e => handleChange('email', e.target.value)}
                    className="w-full h-12 border-[1.5px] border-[#E2E8F0] rounded-lg px-4 font-sans text-sm text-[#0B1D35] focus:outline-none focus:border-[#0B5FFF] transition-colors"
                  />
                </div>
                <div>
                  <InputLabel label={isUrdu ? 'پاس ورڈ' : 'Password'} />
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 6 characters"
                      required
                      value={formData.password}
                      onChange={e => handleChange('password', e.target.value)}
                      className="w-full h-12 border-[1.5px] border-[#E2E8F0] rounded-lg px-4 font-sans text-sm text-[#0B1D35] focus:outline-none focus:border-[#0B5FFF] transition-colors"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 p-1"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <InputLabel label={isUrdu ? 'فون نمبر' : "Phone Number"} />
                <input 
                  type="tel" 
                  placeholder="03XX-XXXXXXX"
                  required
                  value={formData.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                  className="w-full h-12 border-[1.5px] border-[#E2E8F0] rounded-lg px-4 font-sans text-sm text-[#0B1D35] focus:outline-none focus:border-[#0B5FFF] transition-colors"
                />
              </div>
            </section>

            {/* SECTION: Location */}
            <section>
              <SectionLabel title={isUrdu ? 'مقام' : 'Location'} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <InputLabel label={isUrdu ? 'شہر' : 'City'} />
                  <select 
                    value={formData.city}
                    onChange={e => handleChange('city', e.target.value)}
                    className="w-full h-12 border-[1.5px] border-[#E2E8F0] rounded-lg px-4 font-sans text-sm text-[#0B1D35] focus:outline-none focus:border-[#0B5FFF] transition-colors bg-white appearance-none cursor-pointer"
                  >
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <InputLabel label={isUrdu ? 'علاقہ / پتہ' : 'Area / Address'} />
                  <input 
                    type="text" 
                    placeholder="Street, Area"
                    required
                    value={formData.address}
                    onChange={e => handleChange('address', e.target.value)}
                    className="w-full h-12 border-[1.5px] border-[#E2E8F0] rounded-lg px-4 font-sans text-sm text-[#0B1D35] focus:outline-none focus:border-[#0B5FFF] transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* SECTION: Services */}
            <section>
              <SectionLabel title={isUrdu ? 'خدمات' : 'Services'} />
              <div className="space-y-6">
                <div>
                  <InputLabel label={isUrdu ? 'خصوصیات' : 'Specializations'} />
                  <div className="flex flex-wrap gap-2 mt-3">
                    {allSpecs.map(spec => {
                      const isSelected = formData.specializations.includes(spec);
                      return (
                        <button
                          key={spec}
                          type="button"
                          onClick={() => toggleSpec(spec)}
                          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                            isSelected 
                              ? 'bg-[#0B5FFF] border-[#0B5FFF] text-white shadow-md' 
                              : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#0B5FFF]'
                          }`}
                        >
                          {spec}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <InputLabel label={isUrdu ? 'او پی ڈی فیس' : 'OPD Consultation Fee'} />
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] text-sm">Rs.</span>
                    <input 
                      type="number" 
                      placeholder="0 for free"
                      required
                      value={formData.opdFee}
                      onChange={e => handleChange('opdFee', e.target.value)}
                      className="w-full h-12 border-[1.5px] border-[#E2E8F0] rounded-lg pl-12 pr-4 font-sans text-sm text-[#0B1D35] focus:outline-none focus:border-[#0B5FFF] transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-1.5 font-medium italic">
                    {isUrdu ? 'مفت او پی ڈی کے لیے 0 درج کریں' : 'Enter 0 for free OPD'}
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION: Schedule */}
            <section>
              <SectionLabel title={isUrdu ? 'شیڈول' : 'Schedule'} />
              <div className="space-y-6">
                <div>
                  <InputLabel label={isUrdu ? 'کھلے دن' : 'Open Days'} />
                  <div className="flex flex-wrap gap-2 mt-3 mb-4">
                    {days.map(day => {
                      const isSelected = formData.openDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`w-[44px] h-[44px] rounded-lg text-xs font-black transition-all border-2 ${
                            isSelected 
                              ? 'bg-[#0B5FFF]/5 border-[#0B5FFF] text-[#0B5FFF]' 
                              : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#0B5FFF]'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => handleChange('openDays', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])}
                      className="text-[11px] font-bold text-[#0B5FFF] px-3 py-1.5 bg-[#0B5FFF]/5 rounded-md hover:bg-[#0B5FFF]/10 transition-all border border-transparent hover:border-[#0B5FFF]/20"
                    >
                      Mon-Fri
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleChange('openDays', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])}
                      className="text-[11px] font-bold text-[#0B5FFF] px-3 py-1.5 bg-[#0B5FFF]/5 rounded-md hover:bg-[#0B5FFF]/10 transition-all border border-transparent hover:border-[#0B5FFF]/20"
                    >
                      Mon-Sat
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleChange('openDays', days)}
                      className="text-[11px] font-bold text-[#0B5FFF] px-3 py-1.5 bg-[#0B5FFF]/5 rounded-md hover:bg-[#0B5FFF]/10 transition-all border border-transparent hover:border-[#0B5FFF]/20"
                    >
                      All Week
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <InputLabel label={isUrdu ? 'کھلنے کا وقت' : 'Opening Time'} />
                    <input 
                      type="time" 
                      value={formData.openTime}
                      onChange={e => handleChange('openTime', e.target.value)}
                      className="w-full h-12 border-[1.5px] border-[#E2E8F0] rounded-lg px-4 font-sans text-sm text-[#0B1D35] focus:outline-none focus:border-[#0B5FFF] transition-colors"
                    />
                  </div>
                  <div>
                    <InputLabel label={isUrdu ? 'بند ہونے کا وقت' : 'Closing Time'} />
                    <input 
                      type="time" 
                      value={formData.closeTime}
                      onChange={e => handleChange('closeTime', e.target.value)}
                      className="w-full h-12 border-[1.5px] border-[#E2E8F0] rounded-lg px-4 font-sans text-sm text-[#0B1D35] focus:outline-none focus:border-[#0B5FFF] transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <div>
                    <p className="text-sm font-semibold text-[#0B1D35]">{isUrdu ? 'ایمرجنسی' : '24/7 Emergency'}</p>
                    <p className="text-[11px] text-[#64748B] font-medium">Emergency available round the clock</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleChange('emergency', !formData.emergency)}
                    className={`w-12 h-6 rounded-full relative transition-colors ${formData.emergency ? 'bg-[#0B5FFF]' : 'bg-slate-300'}`}
                  >
                    <motion.div 
                      animate={{ x: formData.emergency ? 24 : 0 }}
                      className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* SUBMIT */}
            <div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-[52px] bg-[#0B5FFF] text-white font-bold text-base rounded-[10px] shadow-lg shadow-blue-500/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:scale-100"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isUrdu ? 'میرا ہسپتال رجسٹر کریں' : 'Register My Hospital'}
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              <div className="text-center mt-6">
                <p className="text-sm text-[#64748B] font-medium">
                  {isUrdu ? 'پہلے سے رجسٹرڈ ہیں؟ ' : 'Already registered? '} 
                  <span onClick={onComplete} className="text-[#0B5FFF] font-bold cursor-pointer hover:underline">
                    {isUrdu ? 'یہاں لاگ ان کریں' : 'Login here'}
                  </span>
                </p>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default HospitalRegistration;
