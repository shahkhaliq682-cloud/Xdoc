import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SkeletonBox } from './Skeleton';

interface SmartImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackInitials?: string;
}

export const SmartImage: React.FC<SmartImageProps> = ({ src, alt, className = "", fallbackInitials }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Skeleton Placeholder */}
      <AnimatePresence>
        {isLoading && !hasError && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10"
          >
            <SkeletonBox width="100%" height="100%" borderRadius="0px" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error / Fallback State */}
      {hasError || !src ? (
        <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
          {fallbackInitials ? (
            <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-2xl font-black text-slate-400 shadow-sm mb-2">
              {fallbackInitials}
            </div>
          ) : (
            <Camera size={32} className="mb-2 opacity-50" />
          )}
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
            {alt || "No Image"}
          </span>
        </div>
      ) : (
        <motion.img
          src={src}
          alt={alt}
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ 
            opacity: isLoading ? 0 : 1,
            filter: isLoading ? 'blur(10px)' : 'blur(0px)'
          }}
          transition={{ duration: 0.5 }}
          className={`w-full h-full object-cover ${className}`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
        />
      )}
    </div>
  );
};
