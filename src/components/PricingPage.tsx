import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Check, 
  X, 
  MessageCircle, 
  ArrowLeft, 
  HelpCircle, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Zap,
  Star
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { BrandLogo } from './ui/BrandLogo';

interface PricingPageProps {
  onBack: () => void;
  onSignUp?: () => void;
  onLogin?: () => void;
  language: 'EN' | 'UR';
}

export default function PricingPage({ onBack, onSignUp, onLogin, language }: PricingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const plans = [
    {
      id: 'basic',
      name: language === 'UR' ? 'بنیادی' : 'Basic',
      badge: 'IDEAL START',
      price: 'Rs. 1,000',
      period: language === 'UR' ? '/مہینہ' : '/month',
      desc: language === 'UR' ? 'چھوٹی کلینک اور آغاز کے لیے بہترین' : 'Perfect for small clinics starting their digital journey',
      ctaText: language === 'UR' ? 'شروع کریں ← واٹس ایپ' : 'Get Started → WhatsApp Us',
      ctaUrl: 'https://wa.me/923152328605',
      accentColor: 'border-slate-200',
      popular: false,
      badgeColor: 'bg-slate-100 text-slate-700',
      included: [
        language === 'UR' ? '1 ڈاکٹر کی حد' : '1 Doctor limit',
        language === 'UR' ? '50 مریض فی مہینہ' : '50 Patients/month',
        language === 'UR' ? 'ٹوکن سسٹم' : 'Token System',
        language === 'UR' ? 'بنیادی ڈیش بورڈ' : 'Basic Dashboard',
        language === 'UR' ? 'اسٹینڈرڈ سپورٹ' : 'Standard Support',
      ],
      excluded: [
        language === 'UR' ? 'متعدد ڈاکٹرز' : 'Multiple Doctors',
        language === 'UR' ? 'اپوائنٹمنٹس ماڈیول' : 'Appointments Module',
        language === 'UR' ? 'نسخہ جات کا ماڈیول' : 'Prescriptions Module',
        language === 'UR' ? 'طبی ریکارڈز (EHR)' : 'Medical Records',
        language === 'UR' ? 'ترجیحی سپورٹ' : 'Priority Support',
        language === 'UR' ? 'ایڈوانسڈ تجزیات' : 'Advanced Analytics',
      ],
    },
    {
      id: 'standard',
      name: language === 'UR' ? 'اسٹینڈرڈ' : 'Standard',
      badge: 'MOST POPULAR',
      price: 'Rs. 2,500',
      period: language === 'UR' ? '/مہینہ' : '/month',
      desc: language === 'UR' ? 'بڑھتے ہوئے کلینکس اور ہسپتالوں کے لیے' : 'Ideal for growing clinics and expanding hospitals',
      ctaText: language === 'UR' ? 'شروع کریں ← واٹس ایپ' : 'Get Started → WhatsApp Us',
      ctaUrl: 'https://wa.me/923152328605',
      accentColor: 'border-[#0B5FFF] ring-4 ring-[#0B5FFF]/10 shadow-[#0B5FFF]/10 shadow-2xl',
      popular: true,
      badgeColor: 'bg-[#0B5FFF] text-white',
      included: [
        language === 'UR' ? '5 ڈاکٹرز تک' : 'Up to 5 Doctors',
        language === 'UR' ? '200 مریض فی مہینہ' : '200 Patients/month',
        language === 'UR' ? 'ٹوکن سسٹم' : 'Token System',
        language === 'UR' ? 'اپوائنٹمنٹس ماڈیول' : 'Appointments Module',
        language === 'UR' ? 'نسخہ جات کا ماڈیول' : 'Prescriptions Module',
        language === 'UR' ? 'پیشہ ورانہ ڈیش بورڈ' : 'Professional Dashboard',
        language === 'UR' ? 'ترجیحی سپورٹ' : 'Priority Support',
      ],
      excluded: [
        language === 'UR' ? 'طبی ریکارڈز (EHR)' : 'Medical Records',
        language === 'UR' ? 'ایڈوانسڈ تجزیات' : 'Advanced Analytics',
        language === 'UR' ? 'اپنی مرضی کی برانڈنگ' : 'Custom Branding',
      ],
    },
    {
      id: 'premium',
      name: language === 'UR' ? 'پریمیم' : 'Premium',
      badge: 'BEST VALUE',
      price: 'Rs. 5,000',
      period: language === 'UR' ? '/مہینہ' : '/month',
      desc: language === 'UR' ? 'بڑے ہسپتالوں اور جامع صحت مراکز کے لیے' : 'Unleash full power for custom medical setups',
      ctaText: language === 'UR' ? 'شروع کریں ← واٹس ایپ' : 'Get Started → WhatsApp Us',
      ctaUrl: 'https://wa.me/923152328605',
      accentColor: 'border-slate-200',
      popular: false,
      badgeColor: 'bg-indigo-100 text-indigo-700',
      included: [
        language === 'UR' ? 'لامحدود ڈاکٹرز' : 'Unlimited Doctors',
        language === 'UR' ? 'لامحدود مریض' : 'Unlimited Patients',
        language === 'UR' ? 'ٹوکن سسٹم' : 'Token System',
        language === 'UR' ? 'اپوائنٹمنٹس ماڈیول' : 'Appointments Module',
        language === 'UR' ? 'نسخہ جات کا ماڈیول' : 'Prescriptions Module',
        language === 'UR' ? 'طبی ریکارڈز (EHR)' : 'Medical Records',
        language === 'UR' ? 'ایڈوانسڈ تجزیات' : 'Advanced Analytics',
        language === 'UR' ? 'اپنی مرضی کی برانڈنگ' : 'Custom Branding',
        language === 'UR' ? '24/7 مخصوص سپورٹ' : '24/7 Dedicated Support',
        language === 'UR' ? 'نئے فیچرز تک جلد رسائی' : 'Early Access to New Features',
      ],
      excluded: [],
    },
  ];

  const faqs = [
    {
      q: language === 'UR' ? 'کیا میں کسی بھی وقت پلان تبدیل کر سکتا ہوں؟' : 'Can I change plans anytime?',
      a: language === 'UR' 
        ? 'جی ہاں! آپ ہماری واٹس ایپ سپورٹ ٹیم سے رابطہ کر کے اپنا پلان کسی بھی وقت اپ گریڈ یا تبدیل کر سکتے ہیں۔'
        : 'Yes! You can upgrade or switch plans by contacting our WhatsApp support team.',
    },
    {
      q: language === 'UR' ? 'آپ ادائیگی کے کون سے طریقے قبول کرتے ہیں؟' : 'What payment methods do you accept?',
      a: language === 'UR'
        ? 'ہم ایزی پیسہ، جاز کیش، بینک ٹرانسفر، اور اسٹینڈرڈ کریڈٹ آپشنز کو سپورٹ کرتے ہیں۔'
        : 'We support EasyPaisa, JazzCash, bank transfers, and standard credit options.',
    },
    {
      q: language === 'UR' ? 'کیا کوئی سیٹ اپ فیس ہے؟' : 'Is there a setup fee?',
      a: language === 'UR'
        ? 'بالکل نہیں۔ کوئی اضافی چارجز نہیں ہیں۔ قیمت فلیٹ ہے اور تمام فیچرز آپ کے منتخب کردہ پلان کے مطابق فراہم کیے جاتے ہیں۔'
        : 'None at all. Pricing is flat with all features matching your chosen plan.',
    },
    {
      q: language === 'UR' ? 'میرا پلان کتنی جلدی فعال ہوتا ہے؟' : 'How fast is my plan activated?',
      a: language === 'UR'
        ? 'ادائیگی کی تصدیق کے بعد 24 گھنٹوں کے اندر آپ کا منتخب کردہ پلان فعال کر دیا جاتا ہے۔'
        : 'Your plan is activated within 24 hours after payment confirmation.',
    }
  ];

  return (
    <div className={`bg-slate-50 min-h-screen flex flex-col justify-between font-sans text-slate-800 ${
      language === 'UR' ? 'text-right' : 'text-left'
    }`} dir={language === 'UR' ? 'rtl' : 'ltr'}>
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-white/60 via-sky-50/40 to-white/60 backdrop-blur-2xl border-b border-indigo-100/30 px-6 py-4 shadow-[0_8px_30px_rgba(11,95,255,0.02)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-2xl transition-all cursor-pointer flex items-center gap-2 text-xs font-bold"
              id="back-home-header-btn"
            >
              <ArrowLeft size={16} className={language === 'UR' ? 'rotate-180' : ''} />
              <span>{language === 'UR' ? 'ہوم پیج' : 'Home'}</span>
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
              <BrandLogo size={32} />
              <span className="text-xl font-black tracking-tight text-slate-900">Xdoc</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {onLogin && (
              <button 
                onClick={onLogin}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 transition-all"
              >
                {language === 'UR' ? 'لاگ ان' : 'Login'}
              </button>
            )}
            {onSignUp && (
              <button 
                onClick={onSignUp}
                className="hidden sm:block px-5 py-2.5 rounded-2xl bg-[#0B5FFF] hover:bg-[#0B5FFF]/90 text-white text-[11px] font-black uppercase tracking-wider shadow-lg shadow-[#0B5FFF]/20 transition-all duration-300"
              >
                {language === 'UR' ? 'مفت اکاؤنٹ بنائیں' : 'Sign Up Free'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto space-y-20">
        
        {/* Page Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-[11px] font-bold text-primary uppercase tracking-widest">
            <Sparkles size={12} className="text-primary" />
            <span>{language === 'UR' ? 'سادہ اور شفاف قیمتیں' : 'Simple, transparent pricing'}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {language === 'UR' ? 'اپنا پلان منتخب کریں' : 'Choose Your Plan'}
          </h1>
          <p className="text-slate-500 font-medium text-base md:text-lg">
            {language === 'UR' 
              ? 'آپ کے ہسپتال یا کلینک کو ڈیجیٹل کرنے کے لیے ہر ضروری ماڈیول دستیاب ہے' 
              : 'Everything your hospital or clinic needs to go digital'}
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-6">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: plan.id === 'basic' ? 0 : plan.id === 'standard' ? 0.1 : 0.2 }}
              className={`flex flex-col justify-between p-8 rounded-[36px] bg-white border-2 relative transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${plan.accentColor}`}
            >
              {/* Most Popular Ribbon */}
              {plan.popular && (
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-amber-500 text-white text-[9px] font-black tracking-widest uppercase py-1 px-4 rounded-full shadow-md flex items-center gap-1">
                  <Star size={10} fill="currentColor" />
                  <span>{language === 'UR' ? 'سب سے مقبول' : 'Most Popular'}</span>
                </div>
              )}

              <div>
                {/* Badge Label */}
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 text-[10px] font-black tracking-wider rounded-xl uppercase ${plan.badgeColor}`}>
                    {plan.badge}
                  </span>
                </div>

                {/* Plan Title & Price */}
                <div className="space-y-2 mb-6">
                  <h3 className="text-2xl font-black text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-400 font-medium">{plan.desc}</p>
                  <div className="pt-2 flex items-baseline gap-1.5">
                    <span className="text-3xl md:text-4xl font-extrabold text-slate-900">{plan.price}</span>
                    <span className="text-slate-400 text-sm font-semibold">{plan.period}</span>
                  </div>
                </div>

                <div className="h-px bg-slate-100 my-6" />

                {/* Features List */}
                <ul className="space-y-4 mb-8 text-sm text-slate-600 font-semibold leading-relaxed">
                  {/* Included features */}
                  {plan.included.map((feature, i) => (
                    <li key={`inc-${i}`} className="flex items-start gap-3">
                      <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600 shrink-0 mt-0.5">
                        <Check size={14} strokeWidth={3} />
                      </span>
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}

                  {/* Excluded features */}
                  {plan.excluded.map((feature, i) => (
                    <li key={`exc-${i}`} className="flex items-start gap-3">
                      <span className="p-1 rounded-lg bg-red-50 text-red-400 shrink-0 mt-0.5">
                        <X size={14} strokeWidth={3} />
                      </span>
                      <span className="text-slate-400 line-through decoration-slate-300 font-medium">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <div>
                <a
                  href={plan.ctaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 ${
                    plan.popular
                      ? 'bg-[#0B5FFF] hover:bg-[#0B5FFF]/90 text-white shadow-lg shadow-[#0B5FFF]/20'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <MessageCircle size={16} fill="currentColor" />
                  <span>{plan.ctaText}</span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pricing FAQ Section */}
        <div className="space-y-10 pt-10 border-t border-slate-200/60">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {language === 'UR' ? 'عام طور پر پوچھے گئے سوالات' : 'Frequently Asked Questions'}
            </h2>
            <p className="text-slate-500 font-medium text-sm">
              {language === 'UR' 
                ? 'اپنے پلان کو اپ گریڈ کرنے یا کسی بھی معلومات کے لیے یہ سوالات دیکھیں' 
                : 'Need immediate clarity? Find swift, structured answers below'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3 transition-all duration-300 hover:shadow-md hover:border-slate-200/50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-50 text-primary shrink-0">
                    <HelpCircle size={18} />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm md:text-base">{faq.q}</h4>
                </div>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-medium pl-1 md:pl-2">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="pt-8">
          <div className="bg-[#0F2236] text-white rounded-[40px] p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#0B5FFF]/10 blur-3xl rounded-full" />
            <div className="space-y-3 relative z-10 text-center md:text-left max-w-2xl">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight">
                {language === 'UR' ? 'ابھی بھی سوالات ہیں؟' : 'Still Have Questions?'}
              </h3>
              <p className="text-slate-300 text-sm font-medium leading-relaxed">
                {language === 'UR' 
                  ? 'ہماری سپورٹ ٹیم آپ کے ہسٹل یا کلینک کے لیے صحیح پلان کا انتخاب کرنے میں مدد کے لیے تیار ہے۔' 
                  : 'Our support team is ready to help you choose the right plan for your hospital or clinic.'}
              </p>
            </div>
            <div className="relative z-10 shrink-0">
              <a
                href="https://wa.me/923152328605"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3.5 px-8 py-5 rounded-3xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-[#25D366]/20 transition-all duration-300 hover:scale-[1.03] active:scale-95"
              >
                <MessageCircle size={18} fill="currentColor" />
                <span>{language === 'UR' ? 'واٹس ایپ پر رابطہ کریں' : 'Contact Us on WhatsApp'}</span>
              </a>
            </div>
          </div>
        </div>

      </main>

      {/* Footer Section */}
      <footer className="bg-slate-950 text-white py-12 px-6 border-t border-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <BrandLogo size={28} />
            <span className="text-lg font-bold text-white tracking-tight">Xdoc</span>
          </div>
          <p className="text-xs text-slate-500 font-medium font-sans">
            © 2026 Xdoc. {language === 'UR' ? 'جملہ حقوق محفوظ ہیں۔ پاکستان میں محبت کے ساتھ تیار کیا گیا۔' : 'All rights reserved. Built with ❤️ in Pakistan.'}
          </p>
        </div>
      </footer>

    </div>
  );
}
