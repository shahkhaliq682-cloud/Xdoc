import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType, duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    if (duration !== Infinity) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-3 w-[90%] max-w-md pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ y: -50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              layout
              className="pointer-events-auto"
            >
              <div className={`
                px-5 py-4 rounded-[24px] shadow-2xl border flex items-center gap-4 transition-all
                ${toast.type === 'success' ? 'bg-[#E1F9F6] border-[#B2F0E7] text-[#00695C]' : ''}
                ${toast.type === 'error' ? 'bg-[#FEE2E2] border-[#FECACA] text-[#991B1B]' : ''}
                ${toast.type === 'info' ? 'bg-[#EFF6FF] border-[#DBEAFE] text-[#1E40AF]' : ''}
                ${toast.type === 'warning' ? 'bg-[#FFFBEB] border-[#FEF3C7] text-[#92400E]' : ''}
              `}>
                <div className={`
                  w-10 h-10 rounded-2xl flex items-center justify-center shrink-0
                  ${toast.type === 'success' ? 'bg-white text-[#14B8A6]' : ''}
                  ${toast.type === 'error' ? 'bg-white text-[#EF4444]' : ''}
                  ${toast.type === 'info' ? 'bg-white text-[#3B82F6]' : ''}
                  ${toast.type === 'warning' ? 'bg-white text-[#F59E0B]' : ''}
                `}>
                  {toast.type === 'success' && <CheckCircle2 size={24} />}
                  {toast.type === 'error' && <AlertCircle size={24} />}
                  {toast.type === 'info' && <Info size={24} />}
                  {toast.type === 'warning' && <AlertTriangle size={24} />}
                </div>
                
                <p className="text-sm font-black flex-1 leading-tight">{toast.message}</p>
                
                <button 
                  onClick={() => removeToast(toast.id)}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X size={18} className="opacity-50" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
