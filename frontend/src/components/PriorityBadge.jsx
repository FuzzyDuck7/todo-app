import React from 'react';
import { ArrowDown, Minus, ArrowUp, AlertCircle } from 'lucide-react';

export const PriorityBadge = ({ priority = 'medium', size = 'sm' }) => {
  const p = (priority || 'medium').toLowerCase();

  const configs = {
    low: {
      label: 'Low',
      bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
      icon: <ArrowDown className="w-3.5 h-3.5" />,
      dot: 'bg-blue-500'
    },
    medium: {
      label: 'Medium',
      bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
      icon: <Minus className="w-3.5 h-3.5" />,
      dot: 'bg-amber-500'
    },
    high: {
      label: 'High',
      bg: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800',
      icon: <ArrowUp className="w-3.5 h-3.5" />,
      dot: 'bg-orange-500'
    },
    urgent: {
      label: 'Urgent',
      bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 animate-pulse',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      dot: 'bg-rose-500'
    }
  };

  const config = configs[p] || configs.medium;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold ${config.bg}`}
      title={`Priority: ${config.label}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
