import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, X, Sparkles, Building2, User2, Stethoscope, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface OnboardingTourProps {
  type: 'hospital' | 'patient';
  onComplete: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ type, onComplete }) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = type === 'hospital' ? 4 : 3;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem(`onboardingComplete_${type}`, 'true');
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem(`onboardingComplete_${type}`, 'true');
    onComplete();
  };

  const steps = type === 'hospital' ? [
    {
      title: t?.onboarding?.hospital?.step1Title || 'Welcome!',
      sub: t?.onboarding?.hospital?.step1Sub || 'Your hospital is now digital!',
      btn: t?.onboarding?.hospital?.step1Btn || 'Next',
      icon: <Sparkles className="text-amber-400" size={64} />,
      bg: 'bg-amber-500/10'
    },
    {
      title: t?.onboarding?.hospital?.step2Title || 'Dashboard',
      sub: t?.onboarding?.hospital?.step2Sub || 'Manage everything here.',
      btn: t?.onboarding?.hospital?.step2Btn || 'Next',
      icon: <Building2 className="text-blue-500" size={64} />,
      bg: 'bg-blue-500/10'
    },
    {
      title: t?.onboarding?.hospital?.step3Title || 'Add Doctors',
      sub: t?.onboarding?.hospital?.step3Sub || 'Patients can see them.',
      btn: t?.onboarding?.hospital?.step3Btn || 'Next',
      icon: <Stethoscope className="text-health-teal" size={64} />,
      bg: 'bg-teal-500/10'
    },
    {
      title: t?.onboarding?.hospital?.step4Title || 'Ready!',
      sub: t?.onboarding?.hospital?.step4Sub || 'Visibility is active.',
      btn: t?.onboarding?.hospital?.step4Btn || 'Start',
      icon: <CheckCircle2 className="text-emerald-500" size={64} />,
      bg: 'bg-emerald-500/10'
    }
  ] : [
    {
      title: t?.onboarding?.patient?.step1Title || 'Welcome!',
      sub: t?.onboarding?.patient?.step1Sub || 'Healthcare in one place.',
      btn: t?.onboarding?.patient?.step1Btn || 'Next',
      icon: <User2 className="text-teal-500" size={64} />,
      bg: 'bg-teal-500/10'
    },
    {
      title: t?.onboarding?.patient?.step2Title || 'Find Care',
      sub: t?.onboarding?.patient?.step2Sub || 'Hospitals and Clinics.',
      btn: t?.onboarding?.patient?.step2Btn || 'Next',
      icon: <Building2 className="text-blue-500" size={64} />,
      bg: 'bg-blue-500/10'
    },
    {
      title: t?.onboarding?.patient?.step3Title || 'Book Tokens',
      sub: t?.onboarding?.patient?.step3Sub || 'From your home.',
      btn: t?.onboarding?.patient?.step3Btn || 'Next',
      icon: <Stethoscope className="text-emerald-500" size={64} />,
      bg: 'bg-emerald-500/10'
    }
  ];

  const current = steps[currentStep - 1];

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/60">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="bg-white rounded-[56px] w-full max-w-lg p-12 text-center shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden"
        >
          <div className={`absolute top-0 left-0 w-full h-32 ${current.bg} -z-10`} />
          
          <button 
            onClick={handleSkip}
            className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>

          <div className="w-32 h-32 bg-white rounded-[40px] shadow-xl flex items-center justify-center mx-auto mb-10 translate-y-4">
            {current.icon}
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-4 px-4 leading-tight">{current.title}</h2>
          <p className="text-lg font-bold text-slate-500 mb-12 px-6">{current.sub}</p>

          <div className="flex flex-col gap-4">
            <button
              onClick={handleNext}
              className="w-full py-6 bg-health-teal text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-teal-500/20 active:shadow-none transition-all flex items-center justify-center gap-3"
            >
              {current.btn} <ChevronRight size={18} />
            </button>
            
            <button 
              onClick={handleSkip}
              className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 py-2"
            >
              {t?.onboarding?.hospital?.skip || 'Skip'}
            </button>
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${i + 1 === currentStep ? 'w-8 bg-health-teal' : 'w-2 bg-slate-200'}`} 
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OnboardingTour;
