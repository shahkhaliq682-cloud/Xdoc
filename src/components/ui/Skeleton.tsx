import React from 'react';
import { motion } from 'motion/react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'rect' | 'circle' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width, 
  height, 
  variant = 'rect' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0.4 }}
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{ 
        repeat: Infinity, 
        duration: 1.5, 
        ease: "easeInOut" 
      }}
      style={{ width, height }}
      className={`
        bg-slate-200 dark:bg-slate-700
        ${variant === 'circle' ? 'rounded-full' : 'rounded-2xl'}
        ${className}
      `}
    />
  );
};

export const HospitalCardSkeleton = () => (
  <div className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-sm space-y-4">
    <Skeleton height={200} className="w-full" />
    <Skeleton variant="text" height={24} className="w-3/4" />
    <Skeleton variant="text" height={16} className="w-1/2" />
    <div className="flex gap-2">
      <Skeleton height={24} className="w-16 rounded-lg" />
      <Skeleton height={24} className="w-16 rounded-lg" />
      <Skeleton height={24} className="w-16 rounded-lg" />
    </div>
    <Skeleton variant="text" height={20} className="w-1/3" />
    <Skeleton height={48} className="w-full rounded-2xl" />
  </div>
);

export const TokenRowSkeleton = () => (
  <div className="p-6 bg-white rounded-[32px] border border-slate-100 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <Skeleton variant="circle" height={48} width={48} />
      <div className="space-y-2">
        <Skeleton variant="text" height={16} width={120} />
        <Skeleton variant="text" height={12} width={80} />
      </div>
    </div>
    <div className="space-y-2 text-right">
      <Skeleton variant="text" height={12} width={60} className="ml-auto" />
      <Skeleton height={24} width={80} className="rounded-lg ml-auto" />
    </div>
  </div>
);

export const StatSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="space-y-3">
          <Skeleton variant="text" height={10} width={80} />
          <Skeleton variant="text" height={32} width={100} />
        </div>
        <Skeleton variant="rect" height={56} width={56} className="rounded-2xl" />
      </div>
    ))}
  </div>
);

export const ListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-4">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="p-4 bg-white rounded-2xl border border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton variant="circle" height={40} width={40} />
          <div className="space-y-2">
            <Skeleton variant="text" height={14} width={120} />
            <Skeleton variant="text" height={10} width={80} />
          </div>
        </div>
        <Skeleton height={32} width={80} className="rounded-lg" />
      </div>
    ))}
  </div>
);
