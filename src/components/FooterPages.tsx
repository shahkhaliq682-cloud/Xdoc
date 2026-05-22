import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ArrowLeft, 
  Mail, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  Send, 
  Loader2, 
  Clock, 
  CheckCircle,
  HelpCircle,
  Heart,
  Globe,
  Award,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import emailjs from '@emailjs/browser';

interface FooterPagesProps {
  activePage: 'privacy' | 'terms' | 'contact' | 'about' | 'content_policy';
  onBack: () => void;
}

export default function FooterPages({ activePage, onBack }: FooterPagesProps) {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  
  // Update document title dynamically for SEO friendliness
  useEffect(() => {
    let titleStr = "Xdoc";
    if (activePage === 'privacy') {
      titleStr = language === 'UR' ? "پرائیویسی پالیسی | Xdoc" : "Privacy Policy | Xdoc - Pakistan's Digital Healthcare";
    } else if (activePage === 'terms') {
      titleStr = language === 'UR' ? "شرائط و ضوابط | Xdoc" : "Terms of Service | Xdoc - Pakistan's Digital Healthcare";
    } else if (activePage === 'contact') {
      titleStr = language === 'UR' ? "رابطہ کریں | Xdoc" : "Contact Us | Xdoc - Pakistan's Digital Healthcare";
    } else if (activePage === 'about') {
      titleStr = language === 'UR' ? "ہمارے بارے میں | Xdoc" : "About Us | Xdoc - Pakistan's Digital Healthcare";
    } else if (activePage === 'content_policy') {
      titleStr = language === 'UR' ? "مواد کی پالیسی | Xdoc" : "Content Policy | Xdoc - Pakistan's Digital Healthcare";
    }
    document.title = titleStr;
  }, [activePage, language]);

  return (
    <div className="bg-slate-50 min-h-screen font-sans flex flex-col justify-between">
      {/* HEADER SECTION */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-2xl transition-all cursor-pointer flex items-center gap-2 text-xs font-bold"
              id="back-home-header-btn"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">{language === 'UR' ? 'ہوم پیج' : 'Home'}</span>
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
              <div className="w-9 h-9 bg-[#0B5FFF] rounded-xl flex items-center justify-center text-white">
                <Activity size={20} />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">Xdoc</span>
            </div>
          </div>
          <div className="text-slate-400 text-xs font-bold uppercase tracking-widest hidden md:block">
            {language === 'UR' ? 'ڈیجیٹل ہیلتھ کیئر مارکیٹ پلیس' : "Pakistan's digital health gateway"}
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="flex-grow py-12 px-4 sm:px-6 md:px-8 max-w-7xl w-full mx-auto">
        <motion.div
          key={activePage}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full"
        >
          {activePage === 'privacy' && <PrivacyPolicyView language={language} />}
          {activePage === 'terms' && <TermsOfServiceView language={language} />}
          {activePage === 'contact' && <ContactUsView language={language} toast={toast} />}
          {activePage === 'about' && <AboutUsView language={language} />}
          {activePage === 'content_policy' && <ContentPolicyView language={language} />}
        </motion.div>
      </main>

      {/* COMPACT FOOTER FOR DETAILED PAGES */}
      <footer className="bg-slate-900 text-white py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0B5FFF] rounded-lg flex items-center justify-center text-white">
              <Activity size={16} />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Xdoc</span>
          </div>
          <p className="text-xs text-slate-400 font-medium font-sans">
            © 2026 Xdoc. {language === 'UR' ? 'جملہ حقوق محفوظ ہیں۔ پاکستان میں محبت کے ساتھ تیار کیا گیا۔' : 'All rights reserved. Built with ❤️ in Pakistan.'}
          </p>
        </div>
      </footer>
    </div>
  );
}

// ======================================
// A. PRIVACY POLICY COMPONENT
// ======================================
function PrivacyPolicyView({ language }: { language: 'EN' | 'UR' }) {
  if (language === 'UR') {
    return (
      <div className="bg-white rounded-[40px] border border-slate-100 p-8 md:p-12 shadow-sm space-y-8 font-sans leading-relaxed text-right" dir="rtl">
        <div className="border-b border-slate-100 pb-6">
          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold uppercase tracking-widest">پرائیویسی اور تحفظ</span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mt-2">پرائیویسی پالیسی (Privacy Policy)</h1>
          <p className="text-xs text-slate-400 mt-2 font-mono">آخری ترمیم: 20 مئی 2026</p>
        </div>

        <div className="space-y-6 text-slate-600">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="text-blue-600 shrink-0 ml-2" size={22} />
              1۔ معلومات جو ہم جمع کرتے ہیں
            </h2>
            <p className="text-sm">
              Xdoc پر، آپ کی پرائیویسی کا تحفظ ہماری ترجیح ہے۔ جب آپ ہماری سروسز استعمال کرتے ہیں تو ہم درج ذیل معلومات جمع کر سکتے ہیں:
            </p>
            <ul className="list-disc list-inside mr-4 text-xs space-y-2">
              <li><strong>مریض کا ڈیٹا:</strong> نام، موبائل نمبر (برائے واٹس ایپ نوٹیفکیشنز)، ای میل ایڈریس، اور ہسٹری۔</li>
              <li><strong>ہسپتال کا ڈیٹا:</strong> ہسپتال کا نام، پتہ، پی ایم ڈی سی نمبر، ڈاکٹرز کی فہرست، فیس اور ڈیوٹی ٹائم۔</li>
              <li><strong>لاگ ان معلومات:</strong> گوگل کریڈنشل یا ای میل/پاس ورڈ جو فائر بیس (Firebase) کے ذریعے محفوظ کیا جاتا ہے۔</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="text-blue-600 shrink-0 ml-2" size={22} />
              2۔ فائر بیس (Firebase Auth & Firestore) کا استعمال
            </h2>
            <p className="text-sm">
              ہم مریضوں اور ہسپتالوں کے اکاؤنٹس کو محفوظ رکھنے کے لیے گوگل فائر بیس سروس کا استعمال کرتے ہیں۔ تمام پاس ورڈز محفوظ انکرپشن کے ساتھ ریئل ٹائم ڈیٹا بیس میں سٹور ہوتے ہیں۔ Xdoc کا کوئی بھی ملازم آپ کا پاس ورڈ دیکھنے کی رسائی نہیں رکھتا۔
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className="text-blue-600 shrink-0 ml-2" size={22} />
              3۔ کوکیز اور لوکل اسٹوریج (LocalStorage)
            </h2>
            <p className="text-sm">
              ہم آپ کے کمپیوٹر یا موبائل پر لوکل اسٹوریج استعمال کرتے ہیں تاکہ آپ کے لاگ ان سیشن، زبان کے انتخاب (اردو یا انگریزی)، اور آن بورڈنگ گائیڈ کی معلومات کو مستقل رکھا جا سکے۔ آپ اپنے براؤزر کی سیٹنگز سے ان کو صاف کر سکتے ہیں۔
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="text-blue-600 shrink-0 ml-2" size={22} />
              4۔ ڈیٹا کی سیکیورٹی اور شیئرنگ
            </h2>
            <p className="text-sm">
              ہم آپ کا ذاتی ہیلتھ ڈیٹا یا فون نمبر کسی بھی مارکیٹنگ ایجنسی کے ساتھ فروخت یا شیئر نہیں کرتے۔ آپ کا واٹس ایپ نمبر صرف متعلقہ ہسپتال کو اپوائنٹمنٹ کی تصدیق اور واٹس ایپ نوٹیفکیشنز بھیجنے کے لیے شیئر کیا جاتا ہے۔
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-6">
            <p className="text-xs text-slate-400">
              اگر آپ کے پاس ہماری پرائیویسی پالیسی کے بارے میں کوئی سوال ہے، تو آپ بلا جھجھک ہم سے مینیجر ای میل <a href="mailto:privacy@xdoc.pk" className="text-blue-600 underline font-semibold">privacy@xdoc.pk</a> پر رابطہ کر سکتے ہیں۔
            </p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[40px] border border-slate-100 p-8 md:p-12 shadow-sm space-y-8 font-sans leading-relaxed text-left">
      <div className="border-b border-slate-100 pb-6">
        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold uppercase tracking-widest">Privacy & Compliance</span>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mt-2">Privacy Policy</h1>
        <p className="text-xs text-slate-400 mt-2 font-mono">Last modified: May 20, 2026</p>
      </div>

      <div className="space-y-6 text-slate-600">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="text-blue-600 shrink-0" size={22} />
            1. Information We Collect
          </h2>
          <p className="text-sm">
            At Xdoc, we are deeply committed to protecting your privacy. We collect minimal information essential to operate our real-time clinic queuing platform:
          </p>
          <ul className="list-disc list-inside pl-4 text-xs space-y-2">
            <li><strong>Patient Data:</strong> Full name, dynamic WhatsApp phone numbers (for real-time queuing notifications), and local booking logs.</li>
            <li><strong>Hospital/Clinic Data:</strong> Registered clinic names, PMDC license certifications, area locations, specialized operational schedules, and digital OPD ticket fees.</li>
            <li><strong>Auth Credentials:</strong> Google sign-in credentials, email configurations, and token trackers securely verified via Firebase Services.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="text-blue-600 shrink-0" size={22} />
            2. Firebase Architecture Usage
          </h2>
          <p className="text-sm">
            Our cloud architecture is fully backed by Google Firebase Firestore and Firebase Authentication. All user authentications, medical profiles, and active patient queues are isolated and protected by server-side Firestore Security Rules. No medical personnel or third-party administrators can access your credential records.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="text-blue-600 shrink-0" size={22} />
            3. Local Storage & Dynamic Cookie Usage
          </h2>
          <p className="text-sm">
            To provide a seamless, non-flickering client-side medical dashboard, Xdoc utilizes browser LocalStorage. This is strictly to persist your localized language settings (English/Urdu translation preference), user interface state, active session auth cache, and dynamic workspace onboarding states. No persistent tracking beacons are deployed.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="text-blue-600 shrink-0" size={22} />
            4. Data Distribution Restrictions
          </h2>
          <p className="text-sm">
            Xdoc operates as a community healthcare gateway and **never** rents, sells, or monetizes patient contact details or clinic profiles to advertising networks. Patient WhatsApp numbers are solely shared with the clinic in which the OPD token was reserved, to facilitate appointment processing.
          </p>
        </section>

        <section className="space-y-2 border-t border-slate-100 pt-6">
          <p className="text-xs text-slate-400">
            For specialized deletion requests, dynamic identity audits, or other privacy-related issues, please contact our core engineering and compliance desk directly at <a href="mailto:privacy@xdoc.pk" className="text-blue-600 underline font-semibold">privacy@xdoc.pk</a>.
          </p>
        </section>
      </div>
    </div>
  );
}

// ======================================
// B. TERMS OF SERVICE COMPONENT
// ======================================
function TermsOfServiceView({ language }: { language: 'EN' | 'UR' }) {
  if (language === 'UR') {
    return (
      <div className="bg-white rounded-[40px] border border-slate-100 p-8 md:p-12 shadow-sm space-y-8 font-sans leading-relaxed text-right" dir="rtl">
        <div className="border-b border-slate-100 pb-6">
          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold uppercase tracking-widest">قواعد و ضوابط</span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mt-2">شرائط و ضوابط (Terms of Service)</h1>
          <p className="text-xs text-slate-400 mt-2 font-mono">آخری ترمیم: 20 مئی 2026</p>
        </div>

        <div className="space-y-6 text-slate-600">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="text-emerald-500 shrink-0 ml-2" size={22} />
              1۔ پلیٹ فارم کے اصول
            </h2>
            <p className="text-sm">
              Xdoc ایک ڈیجیٹل مارکیٹ پلیس اور قطار مینجمنٹ سسٹم ہے جو مریضوں کو براہ راست ہسپتالوں اور ڈاکٹروں سے جوڑتا ہے۔ تمام صارفین کے لیے لازمی ہے کہ وہ حقیقی نام اور موبائل نمبرز کے ساتھ رجسٹر ہوں تاکہ اپوائنٹمنٹ کے حصول میں شفافیت قائم رہے۔
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className="text-blue-600 shrink-0 ml-2" size={22} />
              2۔ ٹوکن بکنگ اور فیس کے معاملات
            </h2>
            <p className="text-sm">
              بک کیا گیا ٹوکن صرف مخصوص وقت اور منتخب ڈاکٹر کے لیے کارآمد ہوتا ہے۔ ہسپتال کے پاس یہ حق محفوظ ہے کہ اگر مریض دی گئی ٹائم لائن پر نہ پہنچے، تو اس کا ٹوکن کینسل یا موخر کر دیا جائے۔ فیس کے تمام معاملات ہسپتال اور مریض کے مابین براہ راست طے پاتے ہیں۔
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="text-amber-500 shrink-0 ml-2" size={22} />
              3۔ ہسپتالوں اور ڈاکٹرز کی ذمہ داری
            </h2>
            <p className="text-sm">
              Xdoc پر رجسٹرڈ تمام ہسپتالوں کے انتظامیہ کے پاس پی ایم ڈی سی (PMDC) کی تصدیق شدہ دستاویزات ہونا لازمی ہیں۔ فرضی یا بغیر لائسنس کے کلینکس کا اکاؤنٹ فوری طور پر بلاک کر دیا جائے گا۔ ہسپتال کلینک ٹائمنگ اور ڈاکٹر کی دستیابی کو درست اپ ڈیٹ رکھنے کا ذمہ دار ہے۔
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="text-blue-600 shrink-0 ml-2" size={22} />
              4۔ ہنگامی طبی حالات کی وارننگ
            </h2>
            <p className="text-sm">
              <strong>اہم طبی انتباہ:</strong> Xdoc کسی بھی ہنگامی حادثہ یا ایمرجنسی حالات (Emergency) کے لیے نہیں ہے۔ اگر آپ کو جان لیوا طبی مسئلہ درپیش ہے، تو براہِ مہربانی فوری طور پر قریبی ایمرجنسی وارڈ یا سرکاری ریسکیو سروس (جیسے 1122 یا 15) سے رابطہ کریں۔
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-6">
            <p className="text-xs text-slate-400">
              اگر آپ کو کسی قسم کا اعتراض ہے تو آپ ہماری ایڈمنسٹریشن ٹیم سے ای میل <a href="mailto:admin@xdoc.pk" className="text-blue-600 underline font-semibold">admin@xdoc.pk</a> پر بات کر سکتے ہیں۔
            </p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[40px] border border-slate-100 p-8 md:p-12 shadow-sm space-y-8 font-sans leading-relaxed text-left">
      <div className="border-b border-slate-100 pb-6">
        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold uppercase tracking-widest">Platform Rules</span>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mt-2">Terms of Service</h1>
        <p className="text-xs text-slate-400 mt-2 font-mono">Last modified: May 20, 2026</p>
      </div>

      <div className="space-y-6 text-slate-600">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle className="text-emerald-500 shrink-0" size={22} />
            1. Platform Regulations & Integrity
          </h2>
          <p className="text-sm">
            Xdoc acts as an open, cloud-hosted patient routing catalog bridging independent healthcare clinics, government hospitals, and local patients. Users must supply legitimate identifiers. Fabricating multiple patient identities or reservation spamming is strictly forbidden and results in instantaneous device/cookie-level suspensions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="text-blue-600 shrink-0" size={22} />
            2. Real-Time Token Scheduling Limits
          </h2>
          <p className="text-sm">
            Opd and consultation tokens booked through Xdoc provide estimated scheduling timeframes. Clinics hold complete operational autonomy: should a patient fail to report during their allotted live status sequence, clinics may flag the patient as 'Not Arrived', expiring the token immediately.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="text-amber-500 shrink-0" size={22} />
            3. Hospital Registration & Compliance
          </h2>
          <p className="text-sm">
            Hospitals registering as providers on Xdoc must upload valid regional licenses. Practicing physicians mapped under the clinic must hold valid, active registrations with the Pakistan Medical and Dental Council (PMDC). Submitting fraudulent credentials leads to instant platform ban and public notification.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="text-blue-600 shrink-0" size={22} />
            4. Emergency Services Exclusion Disclaimer
          </h2>
          <p className="text-sm">
            <strong>CRITICAL NOTICE:</strong> Xdoc is strictly a digital ticket organizer and consultation scheduler. This application **MUST NOT** be used under critical emergency circumstances. For trauma events or immediate medical hazards, please bypass the platform and transit directly to an emergency department or contact civic rescue services (e.g. 1122).
          </p>
        </section>

        <section className="space-y-2 border-t border-slate-100 pt-6">
          <p className="text-xs text-slate-400">
            By entering the Xdoc application, you declare compliance with these standard platform rules. For dispute resolutions or clinic claim inquiries, contact us directly at <a href="mailto:legal@xdoc.pk" className="text-blue-600 underline font-semibold">legal@xdoc.pk</a>.
          </p>
        </section>
      </div>
    </div>
  );
}

// ======================================
// C. CONTACT US COMPONENT (with Firestore storage and EmailJS)
// ======================================
function ContactUsView({ language, toast }: { language: 'EN' | 'UR', toast: any }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedMessage = formData.message.trim();

    // Verification step
    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      toast.error(language === 'UR' ? "براہ کرم تمام فیلڈز کو پُر کریں!" : "Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error(language === 'UR' ? "براہ کرم درست ای میل پتہ درج کریں!" : "Please enter a valid email address.");
      return;
    }

    if (trimmedMessage.length < 10) {
      toast.error(
        language === 'UR'
          ? "پیغام کم از کم 10 حروف پر مشتمل ہونا چاہیے!"
          : "Message must be at least 10 characters long."
      );
      return;
    }

    setLoading(true);

    let saveSucceeded = false;
    try {
      // Step 1 — Save to Firestore:
      // Save contact message block directly into Firestore database under 'contactMessages' collection
      await addDoc(collection(db, 'contactMessages'), {
        fullName: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage,
        createdAt: serverTimestamp(),
        status: "unread"
      });
      saveSucceeded = true;
    } catch (err) {
      console.error("Firestore save error:", err);
      toast.error(language === 'UR' ? "معذرت، پیغام بھیجنے میں خرابی پیش آئی۔ دوبارہ کوشش کریں۔" : "Failed to send message. Please try again.");
      setLoading(false);
      return;
    }

    if (saveSucceeded) {
      // Step 2 — Send auto-reply using EmailJS:
      const SERVICE_ID = 'service_86pcyb9';
      const TEMPLATE_ID = 'template_imcre6f';
      const PUBLIC_KEY = 'SPj2aD9SHh20beaC4';

      try {
        await emailjs.send(
          SERVICE_ID,
          TEMPLATE_ID,
          {
            to_name: trimmedName,
            to_email: trimmedEmail,
            user_message: trimmedMessage,
            from_name: 'Xdoc Support Team',
            reply_to: 'xdoc.official@gmail.com'
          },
          PUBLIC_KEY
        );

        // Step 2.5 — Send separate Admin Notification Email:
        // Admin template variables: user_name, user_email, user_message
        const ADMIN_TEMPLATE_ID = 'template_admin_notification';
        try {
          await emailjs.send(
            SERVICE_ID,
            ADMIN_TEMPLATE_ID,
            {
              user_name: trimmedName,
              user_email: trimmedEmail,
              user_message: trimmedMessage
            },
            PUBLIC_KEY
          );
          console.log("Admin notification email sent successfully.");
        } catch (adminEmailErr) {
          // If admin email fails: log exact error and do not break user auto-reply flow
          console.error("Admin EmailJS Send Failed:", {
            error: adminEmailErr,
            statusCode: (adminEmailErr as any)?.status || (adminEmailErr as any)?.text || "Unknown status",
            failedParameters: {
              user_name: trimmedName,
              user_email: trimmedEmail,
              user_message: trimmedMessage
            }
          });
        }

        // Step 3 — Show success toast
        toast.success(
          language === 'UR'
            ? "✓ پیغام بھیج دیا گیا! آپ کو ای میل تصدیق مل گئی ہوگی۔"
            : "Your message has been sent successfully."
        );

        // Step 4 — Clear form
        setFormData({ name: '', email: '', message: '' });
        setSubmitted(true);
      } catch (emailErr) {
        // Step 5 — Add complete error debugging: Log EmailJS error, status code, and failed parameters
        console.error("EmailJS Send Failed:", {
          error: emailErr,
          statusCode: (emailErr as any)?.status || (emailErr as any)?.text || "Unknown status",
          failedParameters: {
            to_name: trimmedName,
            to_email: trimmedEmail,
            user_message: trimmedMessage,
            from_name: 'Xdoc Support Team',
            reply_to: 'xdoc.official@gmail.com'
          }
        });

        // Step 8 — Error handling if email fails: Keep form values and show failure toast (do not reset form or show submitted check screen)
        toast.error(
          language === 'UR'
            ? "پیغام بھیجنے میں ناکامی۔ براہ کرم دوبارہ کوشش کریں۔"
            : "Failed to send message. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const isUrdu = language === 'UR';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" dir={isUrdu ? 'rtl' : 'ltr'}>
      {/* LEFT COLUMN: CONTACT INFO CARD */}
      <div className="lg:col-span-5 bg-white rounded-[40px] border border-slate-100 p-8 md:p-10 shadow-sm space-y-8 text-slate-600">
        <div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold uppercase tracking-widest">
            {isUrdu ? 'رابطہ کی تفصیلات' : 'Get In Touch'}
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">
            {isUrdu ? 'ہم سے رابطہ کریں' : 'Contact Us'}
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">
            {isUrdu ? 'ہر سمارٹ سوال اور شکایت کے حل کے لیے دستیاب' : 'Direct interaction with our development team'}
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex gap-4 items-start">
            <a href="mailto:xdoc.official@gmail.com" className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0B5FFF] shrink-0 hover:bg-slate-100 transition-all">
              <Mail size={20} />
            </a>
            <div>
              <h3 className="text-xs text-slate-400 font-bold uppercase tracking-widest">{isUrdu ? 'ای میل ایڈریس' : 'E-mail Support'}</h3>
              <a href="mailto:xdoc.official@gmail.com" className="font-bold text-slate-900 text-sm mt-1 sm:text-base font-mono block hover:text-[#0B5FFF] transition-colors">
                xdoc.official@gmail.com
              </a>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0B5FFF] shrink-0">
              <Phone size={20} />
            </div>
            <div>
              <h3 className="text-xs text-slate-400 font-bold uppercase tracking-widest">{isUrdu ? 'واٹس ایپ ہیلپ لائن' : 'WhatsApp Contact'}</h3>
              <p className="font-bold text-slate-900 text-sm mt-1 sm:text-base font-mono">+92 315 2328605</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-xs">
          <p className="font-medium text-slate-500 leading-relaxed">
            {isUrdu 
              ? 'ہماری سپورٹ ٹیم پیر سے ہفتہ صبح 9 بجے سے شام 6 بجے تک براہ راست آپ کے سوالات کا جواب دینے کے لیے فعال ہے۔' 
              : 'Our customer success desk operates Monday through Saturday, 9:00 AM to 6:00 PM, delivering direct solutions for clinic admins.'}
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: CONTACT FORM */}
      <div className="lg:col-span-7 bg-white rounded-[40px] border border-slate-100 p-8 md:p-12 shadow-sm">
        {submitted ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto border border-emerald-100">
              <CheckCircle className="animate-bounce" size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">
              {isUrdu ? 'پیغام بھیج دیا گیا!' : 'Message Sent!'}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium">
              {isUrdu 
                ? 'شکریہ! ہم جلد جواب دیں گے۔' 
                : 'Thank you! We will reply soon.'}
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-6 px-6 py-3 bg-[#0B5FFF] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-[1.03] active:scale-95 transition-all shadow-lg cursor-pointer"
            >
              {isUrdu ? 'نیا پیغام بھیجیں' : 'Submit Another Message'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitMessage} className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
              {isUrdu ? 'ہمیں لکھیں' : 'Write Us a Message'}
            </h2>

            <div className="space-y-4">
              {/* Patient/User Name Input */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                  {isUrdu ? 'آپ کا پورا نام' : 'Your full name'}
                </label>
                <input 
                  type="text" 
                  name="to_name"
                  placeholder={isUrdu ? 'مثال: محمد احمد' : 'e.g., Mohammad Ahmed'}
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-slate-700 text-sm transition-all uppercase"
                  required
                />
              </div>

              {/* Email Input */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                  {isUrdu ? 'ای میل ایڈریس' : 'Your email address'}
                </label>
                <input 
                  type="email" 
                  name="to_email"
                  placeholder="name@gmail.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-slate-700 text-sm transition-all"
                  required
                />
              </div>

              {/* Content Message Area */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                  {isUrdu ? 'تفصیلی پیغام' : 'Your message or feedback details'}
                </label>
                <textarea 
                  rows={4}
                  name="user_message"
                  placeholder={isUrdu ? 'اپنا سوال یا شکایت یہاں درج کریں...' : 'Write your details, hospital name or query details...'}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary font-medium text-slate-700 text-sm transition-all"
                  required
                />
              </div>
            </div>

            {/* SEND BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white font-black rounded-2xl text-xs tracking-wider uppercase transition-all shadow-xl hover:scale-[1.02] active:scale-95 disabled:bg-slate-300 disabled:scale-100 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>{isUrdu ? 'بھیج رہا ہے...' : 'Bhej raha hai...'}</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>{isUrdu ? 'پیغام ارسال کریں' : 'Send Message'}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ======================================
// D. ABOUT US COMPONENT
// ======================================
function AboutUsView({ language }: { language: 'EN' | 'UR' }) {
  const isUrdu = language === 'UR';

  if (isUrdu) {
    return (
      <div className="bg-white rounded-[40px] border border-slate-100 p-8 md:p-12 shadow-sm space-y-10 font-sans text-right leading-relaxed" dir="rtl">
        <div className="border-b border-slate-100 pb-6">
          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold uppercase tracking-widest">ہمارا مشن</span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mt-2">ہمارے بارے میں (About Us)</h1>
          <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest font-bold font-mono">ڈیجیٹل پاکستان، سمارٹ ہیلتھ کیئر</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Globe size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">ہمارا خواب</h3>
            <p className="text-xs text-slate-500">
              پاکستان کے کونے کونے میں مریضوں کو ہسپتالوں کے طویل ترین انتظار اور قطاروں سے نجات دلا کر سیکنڈوں میں کنکشن قائم کرنا۔
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Award size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">ہمارا مشن</h3>
            <p className="text-xs text-slate-500">
              ڈاکٹرز رoster اور لائیو بکنگ سسٹمز کے ساتھ مریضوں کو گھر بیٹھے او پی ڈی (OPD) کا حقیقی کنٹرول دینا۔
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Users size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">صارفین کی تعداد</h3>
            <p className="text-xs text-slate-500">
              ہزاروں مستند مریضوں اور درجنوں مستند پاکستانی ہسپتالوں اور کلینکس کا ایک فعال اور مخلص نیٹ ورک۔
            </p>
          </div>
        </div>

        <div className="space-y-6 text-slate-600 text-sm">
          <p>
            پاکستان کے عام طبی نظام میں مریضوں کو ہسپتال یا کلینک جا کر لائنوں میں گھنٹوں کھڑے رہنا پڑتا تھا جس سے بوڑھے مریضوں کو شدید تکلیف کا سامنا کرنا پڑتا تھا۔ اسی لیے <strong>Xdoc</strong> کا وجود عمل میں لایا گیا ہے۔
          </p>
          <p>
            ہمارا خودکار <strong>ریئل ٹائم ٹوکن سسٹم</strong> ہسپتال انتظامیہ کو اجازت دیتا ہے کہ وہ لائیو مانیٹرنگ اسکرین پر اگلے مریض کو کال کر سکیں جس سے گھر میں موجود مریض اپنے موبائل اسکرین پر لائیو ٹریکر کے ذریعے اپنی آمد کی پلاننگ کر لیتا ہے۔ یہ طبی خدمات میں انقلاب لانے کی ایک اہم ترین کڑی ہے۔
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[40px] border border-slate-100 p-8 md:p-12 shadow-sm space-y-10 font-sans text-left leading-relaxed">
      <div className="border-b border-slate-100 pb-6">
        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold uppercase tracking-widest">Our Vision & Mission</span>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mt-2">About Xdoc</h1>
        <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest font-bold font-mono">Empowering Patient Autonomy in Pakistan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Globe size={22} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Digital Gateway</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Eliminating clinical overcrowding, making healthcare schedules dynamically accessible for every Pakistani household.
          </p>
        </div>

        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Award size={22} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Structured OPD</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Revolutionizing patient waiting experiences with clean sequence trackers, doctor schedules, and digital bookings.
          </p>
        </div>

        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Users size={22} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Unified Directory</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Connecting authenticated citizens with practicing physicians across all levels of hospital ecosystems.
          </p>
        </div>
      </div>

      <div className="space-y-6 text-slate-600 text-sm leading-relaxed">
        <p>
          In traditional Pakistani healthcare systems, seeking even basic general examinations at hospitals meant sitting through hours in physical waiting arenas, which causes compounding risks of cross-infections and severe distress. <strong>Xdoc</strong> was founded as a digital antidote.
        </p>
        <p>
          By establishing independent digital panels for clinics and patient trackers, we enable medical administrators to drive patient pipelines with digital tokens. This keeps patients safely at home until they are next in queue, optimizing practitioner utilization rates and keeping citizens safe.
        </p>
      </div>
    </div>
  );
}

// ======================================
// E. CONTENT POLICY COMPONENT
// ======================================
function ContentPolicyView({ language }: { language: 'EN' | 'UR' }) {
  const isUrdu = language === 'UR';

  if (isUrdu) {
    return (
      <div className="bg-white rounded-[40px] border border-slate-100 p-8 md:p-12 shadow-sm space-y-8 font-sans text-right leading-relaxed" dir="rtl">
        <div className="border-b border-slate-100 pb-6">
          <span className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold uppercase tracking-widest">توجہ فرمائیں</span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mt-2">مواد کی پالیسی (Content Policy)</h1>
          <p className="text-xs text-slate-400 mt-2 font-mono">آخری ترمیم: 20 مئی 2026</p>
        </div>

        <div className="space-y-6 text-slate-600">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="text-red-600 shrink-0 ml-2" size={22} />
              1۔ ممنوعہ اور فرضی معلومات پر پابندی
            </h2>
            <p className="text-sm">
              Xdoc پر کسی بھی قسم کی غلط، فرضی یا گمراہ کن طبی معلومات، علاج یا دواؤں کو پوسٹ کرنے کی سخت ممانعت ہے۔ ہسپتالوں کے پروفائل پر ڈاکٹر کا لائسنس، پی ایم ڈی سی نمبر اور فیس کا درست ہونا قانوناً لازمی ہے۔ فرضی ڈاکٹرز کی رجسٹریشن کرنے والے اکاؤنٹس کو قانون نافذ کرنے والے اداروں کو رپورٹ کیا جائے گا۔
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="text-blue-600 shrink-0 ml-2" size={22} />
              2۔ میڈیکل ڈس کلیمر (Medical Disclaimer)
            </h2>
            <p className="text-sm">
              Xdoc ایک ٹیکنالوجی پلیٹ فارم ہے، یہ خود ڈاکٹر نہیں ہے اور نہ ہی یہ ہسپتالوں میں کی گئی تشخیصی مشاورت کو اثر انداز کرتا ہے۔ کسی بھی بیماری کی صورت میں مریض کا اپنے معالج سے تفصیلی مشورہ کرنا ازحد ضروری ہے۔
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="text-blue-600 shrink-0 ml-2" size={22} />
              3۔ غلط اور نامناسب رویے کے خلاف کاروائی
            </h2>
            <p className="text-sm">
              مریضوں اور ہسپتالوں کے مابین کسی قسم کی نامناسب گفتگو یا غیراخلاقی ریمارکس کی صورت میں انتظامیہ کے پاس یہ حق محفوظ ہے کہ وہ متعلقہ صارف کا ڈیٹا حذف کر کے ان پر مستقل پابندی عائد کرے۔
            </p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[40px] border border-slate-100 p-8 md:p-12 shadow-sm space-y-8 font-sans text-left leading-relaxed">
      <div className="border-b border-slate-100 pb-6">
        <span className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold uppercase tracking-widest">Compliance Restrictions</span>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mt-2">Content Policy</h1>
        <p className="text-xs text-slate-400 mt-2 font-mono">Last modified: May 20, 2026</p>
      </div>

      <div className="space-y-6 text-slate-600">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="text-red-500 shrink-0" size={22} />
            1. Prohibited Representations & Fraud Protection
          </h2>
          <p className="text-sm">
            Xdoc prohibits the posting of fraudulent healthcare claims, incorrect specialist certifications, or fabricated OPD listings. All healthcare information submitted by clinics must correspond to legal credentials. Impersonating licensed medical practitioners is a civil offence; we systematically forward fake accounts to regulatory courts.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="text-blue-600 shrink-0" size={22} />
            2. Medical Practice Liability Exclusion
          </h2>
          <p className="text-sm">
            Xdoc handles digital routing logistics and cannot be held liable for counseling errors, diagnosis oversights, treatment plans, or operational failures occurring within physical clinics. Booking consultation tokens represents a relationship formed strictly between the individual citizen and their certified physician.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="text-blue-600 shrink-0" size={22} />
            3. Abuse Reporting Mechanism
          </h2>
          <p className="text-sm">
            Should a practitioner or patient notice misleading materials, abusive comments, or incorrect billing patterns within hospital profile listings, they are requested to report it immediately. Our review team audits complaints and removes violations within 12 hours.
          </p>
        </section>
      </div>
    </div>
  );
}
