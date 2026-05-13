import React from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  loadingText,
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const variants = {
    primary: 'bg-primary text-white shadow-xl shadow-primary/20',
    secondary: 'bg-health-teal text-white shadow-xl shadow-teal-500/20',
    danger: 'bg-red-500 text-white shadow-xl shadow-red-500/20',
    outline: 'bg-white border-2 border-slate-200 text-slate-600 hover:border-slate-300',
    ghost: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
  };

  return (
    <motion.button
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      disabled={disabled || isLoading}
      className={`
        relative px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all
        disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed
        ${variants[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      <div className={`flex items-center justify-center gap-3 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center gap-3 whitespace-nowrap px-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
          />
          {loadingText ? <span>{loadingText}</span> : <span>{children}</span>}
        </div>
      )}
    </motion.button>
  );
};

export default LoadingButton;
