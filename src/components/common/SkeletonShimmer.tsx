import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={cn(
        'skeleton-shimmer rounded-lg bg-white/[0.04] border border-white/[0.04]',
        className
      )}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="glass-panel rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden p-4 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-8 w-32" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-16 ml-auto" />
        </div>
      ))}
    </div>
  );
};

export const DocumentPreviewSkeleton: React.FC = () => {
  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center min-h-[380px] space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-52 w-80 rounded-xl" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  );
};
