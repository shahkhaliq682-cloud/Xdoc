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
    primary: 'bg-health-teal text-white shadow-xl shadow-teal-500/20',
    secondary: 'bg-blue-600 text-white shadow-xl shadow-blue-500/20',
    danger: 'bg-red-500 text-white shadow-xl shadow-red-500/20',
    outline: 'bg-transparent border-2 border-slate-200 text-slate-600 hover:border-slate-300',
    ghost: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
  };

  return (
    <motion.button
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.96 } : {}}
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
          <Loader2 className="animate-spin" size={18} />
          {loadingText && <span>{loadingText}</span>}
        </div>
      )}
    </motion.button>
  );
};

export default LoadingButton;
