import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, ArrowRight, ShieldCheck, HelpCircle, Loader2 } from 'lucide-react';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { PLANS } from '../config/planConfig';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';

interface PlanPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string | null;
  hospitalIdProp?: string;
  hospitalNameProp?: string;
  onSuccess?: () => void;
}

export default function PlanPurchaseModal({
  isOpen,
  onClose,
  planId,
  hospitalIdProp,
  hospitalNameProp,
  onSuccess
}: PlanPurchaseModalProps) {
  const { toast } = useToast();
  const { language } = useLanguage();
  const isUrdu = language === 'UR';

  const [loading, setLoading] = useState(false);
  const [fetchingHospital, setFetchingHospital] = useState(false);
  const [hospitalInfo, setHospitalInfo] = useState<{ id: string; name: string } | null>(null);

  // If we have prop values, use them, otherwise fetch current user's hospital data
  useEffect(() => {
    if (!isOpen) return;

    if (hospitalIdProp && hospitalNameProp) {
      setHospitalInfo({
        id: hospitalIdProp,
        name: hospitalNameProp
      });
      return;
    }

    const fetchHospital = async () => {
      const user = auth.currentUser;
      if (!user) {
        setHospitalInfo(null);
        return;
      }

      setFetchingHospital(true);
      try {
        const docRef = doc(db, 'hospitals', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setHospitalInfo({
            id: user.uid,
            name: docSnap.data().name || 'Your Hospital'
          });
        } else {
          // Fallback if not registered as hospital yet
          setHospitalInfo(null);
        }
      } catch (error) {
        console.error("Error fetching hospital info for subscription modal:", error);
      } finally {
        setFetchingHospital(false);
      }
    };

    fetchHospital();
  }, [isOpen, hospitalIdProp, hospitalNameProp]);

  if (!isOpen) return null;

  const plan = planId ? PLANS[planId] : null;

  if (!plan) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center">
          <p className="text-slate-500 font-bold mb-4">{isUrdu ? "پلان دستیاب نہیں ہے" : "Plan not found"}</p>
          <button onClick={onClose} className="px-4 py-2 bg-[#0B5FFF] text-white rounded-xl">
            {isUrdu ? "بند کریں" : "Close"}
          </button>
        </div>
      </div>
    );
  }

  const listFeatures = [
    { key: "tokenSystem", label: isUrdu ? "ٹوکن لائیو کیو سسٹم" : "Token Live Queue System" },
    { key: "doctorManagement", label: isUrdu ? "ڈاکٹر کی رجسٹریشن اور مینجمنٹ" : "Doctor Registration & Management" },
    { key: "patientManagement", label: isUrdu ? "مریض اور لائیو کیو مینجمنٹ" : "Patient & Queue Management" },
    { key: "appointments", label: isUrdu ? "آن لائن اپوائنٹمنٹس ماڈیول" : "Online Appointments Module" },
    { key: "prescriptions", label: isUrdu ? "ڈیجیٹل نسخہ جات (Prescriptions)" : "Digital Prescriptions" },
    { key: "medicalRecords", label: isUrdu ? "طبی ریکارڈز (EHR Storage)" : "Electronic Medical Records (EHR)" },
    { key: "advancedAnalytics", label: isUrdu ? "تجزیاتی رپورٹ اور آمدنی کا ڈیش بورڈ" : "Advanced Revenue Analytics" },
    { key: "customBranding", label: isUrdu ? "اپنی کسٹم ہسپتال برانڈنگ" : "Custom Hospital Branding" },
    { key: "prioritySupport", label: isUrdu ? "ترجیحی کسٹمر سپورٹ" : "24/7 Priority Support" },
  ];

  const handleSubmit = async () => {
    if (!hospitalInfo) {
      toast.error(
        isUrdu
          ? "براہ کرم منصوبہ درخواست جمع کرنے کے لئے ہسپتال ایڈمن کے طور پر لاگ ان کریں۔"
          : "Please log in as a Hospital Admin to submit a plan request."
      );
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'subscriptionRequests'), {
        hospitalId: hospitalInfo.id,
        hospitalName: hospitalInfo.name,
        planName: planId,
        planPrice: plan.price,
        requestStatus: "pending",
        requestedAt: serverTimestamp()
      });

      toast.success(
        isUrdu
          ? "منصوبے کی درخواست جمع کر دی گئی ہے! ایڈمن 24 گھنٹوں کے اندر آپ کا پلان فعال کر دے گا۔"
          : "Plan request submitted! Admin will activate your plan within 24 hours."
      );
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error creating subscription request:", error);
      toast.error(isUrdu ? "درخواست جمع کرنے میں ناکامی" : "Failed to submit plan request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-[36px] shadow-2xl border border-slate-100 max-w-2xl w-full p-6 md:p-8 relative overflow-hidden text-slate-800"
        dir={isUrdu ? 'rtl' : 'ltr'}
      >
        {/* Background Blur */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#0B5FFF]/5 blur-3xl rounded-full" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-2xl transition-all cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-[10px] font-black uppercase tracking-wider text-primary">
            <ShieldCheck size={12} />
            <span>{isUrdu ? "محفوظ سبسکرپشن پلان" : "SECURE UPGRADE SYSTEM"}</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {isUrdu ? `${plan.name} پلان کی درخواست` : `Request ${plan.name} Plan`}
          </h2>
          <p className="text-slate-500 text-xs md:text-sm font-medium">
            {isUrdu
              ? "اپنے ورچوئل ہسپتال کی صلاحیتوں کو بڑھائیں اور پریمیم فیچرز تک رسائی حاصل کریں۔"
              : "Expand your hospital metrics and unlock productivity tools seamlessly."}
          </p>
        </div>

        {/* Plan Summary Section */}
        <div className="bg-slate-50/70 border border-slate-100 rounded-3xl p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              {isUrdu ? "منتخب شدہ پلان" : "Selected Plan"}
            </div>
            <div className="text-xl font-black text-slate-900">{plan.name}</div>
          </div>
          <div className="flex items-baseline gap-1 bg-white border border-slate-200/50 px-5 py-3 rounded-2xl shadow-sm">
            <span className="text-2xl font-black text-slate-900">
              Rs. {plan.price.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400">
              {isUrdu ? "/مہینہ" : "/month"}
            </span>
          </div>
        </div>

        {/* Feature List */}
        <div className="space-y-3 mb-8">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {isUrdu ? "اس پلان میں شامل خصوصیات:" : "What's Included in This Plan:"}
          </div>
          
          {fetchingHospital ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="animate-spin text-primary mr-2" size={20} />
              <span className="text-sm font-medium text-slate-400">
                {isUrdu ? "ہسپتال کی معلومات اپ لوڈ ہو رہی ہے..." : "Loading hospital credentials..."}
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
              {listFeatures.map((feat) => {
                const hasFeature = plan.features[feat.key as keyof typeof plan.features];
                return (
                  <div
                    key={feat.key}
                    className={`flex items-center gap-2.5 p-2 rounded-xl transition-all ${
                      hasFeature ? 'opacity-100' : 'opacity-40 line-through text-slate-400'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${
                        hasFeature ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {hasFeature ? (
                        <Check size={12} strokeWidth={3} />
                      ) : (
                        <X size={12} strokeWidth={3} />
                      )}
                    </div>
                    <span className="text-xs font-bold leading-tight">{feat.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Limits Info */}
          <div className="bg-blue-50/40 border border-blue-100/50 rounded-2xl p-4 mt-2 text-xs text-primary font-bold flex items-center gap-2">
            <HelpCircle size={16} className="shrink-0" />
            <span>
              {isUrdu
                ? `پلان کی حد: ڈاکٹرز: ${plan.limits.doctors === Infinity ? 'لامحدود' : plan.limits.doctors} | مریض: ${plan.limits.patients === Infinity ? 'لامحدود' : plan.limits.patients}`
                : `Plan limits: Up to ${plan.limits.doctors === Infinity ? 'Unlimited' : plan.limits.doctors} Doctors and ${plan.limits.patients === Infinity ? 'Unlimited' : plan.limits.patients} Patients per month.`}
            </span>
          </div>
        </div>

        {/* Buttons / Actions */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer"
          >
            {isUrdu ? "منسوخ کریں" : "Cancel"}
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={loading || fetchingHospital}
            className="flex-1 py-4 bg-[#0B5FFF] hover:bg-[#0B5FFF]/90 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-[#0B5FFF]/15 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{isUrdu ? "براہ کرم انتظار کریں..." : "Submitting..."}</span>
              </>
            ) : (
              <>
                <span>{isUrdu ? "منصوبہ کی درخواست بھیجیں" : "Submit Plan Request"}</span>
                <ArrowRight size={16} className={isUrdu ? "rotate-180" : ""} />
              </>
            )}
          </button>
        </div>

        {/* Hospital credentials mismatch context */}
        {!hospitalInfo && !fetchingHospital && (
          <p className="text-[10px] text-center font-bold text-red-500 mt-4 uppercase">
            {isUrdu
              ? "براہ کرم نوٹ کریں: درخواست جمع کرانے کے لئے آپ کو ہسپتال اکاؤنٹ سے لاگ ان ہونا ضروری ہے۔"
              : "Note: You must be signed in with a Hospital Admin account to send request."}
          </p>
        )}
      </motion.div>
    </div>
  );
}
