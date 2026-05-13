import React from 'react';
import { motion } from 'motion/react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export const SkeletonBox: React.FC<SkeletonProps & { borderRadius?: string }> = ({ 
  className = '', 
  width, 
  height, 
  borderRadius = '12px' 
}) => (
  <motion.div
    animate={{ opacity: [0.4, 0.8, 0.4] }}
    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
    style={{ width, height, borderRadius }}
    className={`bg-slate-200 dark:bg-[#1C3552] ${className}`}
  />
);

export const SkeletonLine: React.FC<SkeletonProps> = ({ className = '', width = '100%' }) => (
  <SkeletonBox height={14} width={width} borderRadius="6px" className={className} />
);

export const SkeletonCircle: React.FC<SkeletonProps & { size: number }> = ({ size, className = '' }) => (
  <SkeletonBox height={size} width={size} borderRadius="50%" className={className} />
);

export const SkeletonPill: React.FC<SkeletonProps> = ({ className = '', width = '80px' }) => (
  <SkeletonBox height={24} width={width} borderRadius="20px" className={className} />
);

// Legacy/Compatibility component
export const Skeleton: React.FC<SkeletonProps & { variant?: 'rect' | 'circle' | 'text' }> = ({ 
  className = '', 
  width, 
  height, 
  variant = 'rect' 
}) => {
  if (variant === 'circle') return <SkeletonCircle size={Number(height || width || 40)} className={className} />;
  if (variant === 'text') return <SkeletonLine width={width} className={className} />;
  return <SkeletonBox width={width} height={height} className={className} />;
};

export const HospitalCardSkeleton = () => (
  <div className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-sm space-y-4">
    <SkeletonBox height={180} className="w-full" />
    <SkeletonLine width="70%" />
    <SkeletonLine width="40%" />
    <div className="flex gap-2 py-2">
      <SkeletonPill width={70} />
      <SkeletonPill width={90} />
      <SkeletonPill width={75} />
    </div>
    <SkeletonLine width="35%" />
    <SkeletonBox height={48} className="w-full rounded-2xl" />
  </div>
);

export const HospitalListingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[...Array(4)].map((_, i) => <HospitalCardSkeleton key={i} />)}
  </div>
);

export const HospitalDetailSkeleton = () => (
  <div className="space-y-8 pb-20">
    <SkeletonBox height={250} className="w-full rounded-none md:rounded-[40px]" />
    
    <div className="px-6 space-y-8">
      <div className="flex items-center gap-4">
        <SkeletonCircle size={64} />
        <div className="space-y-2">
          <SkeletonLine width={200} />
          <SkeletonLine width={150} />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <SkeletonBox key={i} height={80} className="rounded-3xl" />)}
      </div>

      <div className="space-y-4">
        <SkeletonLine width="30%" />
        <div className="flex gap-3">
          {[...Array(5)].map((_, i) => <SkeletonPill key={i} />)}
        </div>
      </div>

      <div className="space-y-4">
        <SkeletonLine width="25%" />
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonBox key={i} height={60} className="rounded-2xl" />)}
        </div>
      </div>

      <div className="space-y-6">
        <SkeletonLine width="20%" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6 bg-white rounded-[32px] border border-slate-100 space-y-4">
              <div className="flex items-center gap-4">
                <SkeletonCircle size={48} />
                <div className="space-y-2">
                  <SkeletonLine width={120} />
                  <SkeletonLine width={80} />
                </div>
              </div>
              <SkeletonLine width="30%" />
              <SkeletonBox height={40} className="w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const TokenRowSkeleton = () => (
  <div className="p-6 bg-white rounded-[32px] border border-slate-100 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <SkeletonBox width={32} height={32} className="rounded-xl" />
      <div className="space-y-2">
        <SkeletonLine width={180} />
        <SkeletonLine width={100} />
      </div>
    </div>
    <div className="flex items-center gap-4">
      <SkeletonLine width={60} />
      <SkeletonPill width={80} />
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="p-8 space-y-10">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 space-y-4">
          <SkeletonCircle size={40} />
          <SkeletonLine width={60} />
          <SkeletonLine width={40} />
        </div>
      ))}
    </div>
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => <TokenRowSkeleton key={i} />)}
    </div>
  </div>
);

export const HistorySkeleton = () => (
  <div className="space-y-6">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <SkeletonLine width={150} />
            <SkeletonLine width={120} />
          </div>
          <SkeletonPill width={100} />
        </div>
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <SkeletonLine width={100} />
            <SkeletonLine width={80} />
          </div>
          <SkeletonPill width={80} />
        </div>
      </div>
    ))}
  </div>
);

export const ReceptionSkeleton = () => (
  <div className="p-8 space-y-12">
    <div className="flex flex-col items-center gap-6">
      <SkeletonBox width={250} height={180} className="rounded-[40px]" />
      <div className="text-center space-y-3">
        <SkeletonLine width={200} />
        <SkeletonLine width={150} />
      </div>
    </div>

    <div className="grid grid-cols-4 gap-4 px-12">
      {[...Array(4)].map((_, i) => <SkeletonBox key={i} height={60} className="rounded-3xl" />)}
    </div>

    <div className="space-y-4 px-12">
      {[...Array(5)].map((_, i) => <TokenRowSkeleton key={i} />)}
    </div>
  </div>
);

export const StatSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="space-y-3">
          <SkeletonLine width={80} />
          <SkeletonLine width={120} height={32} />
        </div>
        <SkeletonBox height={56} width={56} className="rounded-2xl" />
      </div>
    ))}
  </div>
);

export const ListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-4">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="p-4 bg-white rounded-2xl border border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SkeletonCircle size={40} />
          <div className="space-y-2">
            <SkeletonLine width={120} />
            <SkeletonLine width={80} />
          </div>
        </div>
        <SkeletonBox height={32} width={80} className="rounded-lg" />
      </div>
    ))}
  </div>
);
