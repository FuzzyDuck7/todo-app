import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-8">
      <Loader2 className={`${sizeMap[size] || sizeMap.md} animate-spin text-brand-600 dark:text-brand-400`} />
      {text && <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">{text}</p>}
    </div>
  );
};

export const TaskSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-800 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
          <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded w-1/2" />
        </div>
        <div className="w-16 h-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </div>
    </div>
  );
};
