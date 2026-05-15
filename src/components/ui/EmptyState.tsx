import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';

export const EmptyState: React.FC<{
  type: 'no_hospitals' | 'no_search' | 'no_history' | 'no_notifications' | 'no_doctors' | 'no_tokens' | 'no_staff' | 'no_revenue' | 'no_completed' | 'no_patient_found';
  onAction?: () => void;
}> = ({ type, onAction }) => {
  const { language } = useLanguage();
  const t = translations[language] as any;
  const emptyStates = t.emptyStates || t.ux?.emptyStates || {};
  
  const d = emptyStates[type] || emptyStates.noSearchResults || emptyStates.no_hospitals || {
    title: 'No Data Found',
    subtitle: 'Nothing to see here right now.',
    button: null
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center p-12 bg-white rounded-[48px] border border-slate-100 shadow-sm"
    >
      <div className="text-6xl mb-6 select-none grayscale-0 drop-shadow-xl">
        {type.includes('hospital') ? '🏥' : 
         type.includes('search') ? '🔍' : 
         type.includes('token') ? '🎫' : 
         type.includes('staff') ? '👥' : 
         type.includes('revenue') ? '💰' : '✨'}
      </div>
      <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight">{d.title}</h3>
      <p className="text-sm font-bold text-slate-500 max-w-xs mb-8 leading-relaxed">{d.subtitle}</p>
      
      {d.button && onAction && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={onAction}
          className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all"
        >
          {d.button}
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyState;
