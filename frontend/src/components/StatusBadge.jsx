import React from 'react';
import { Circle, Clock, CheckCircle2, Archive } from 'lucide-react';

export const StatusBadge = ({ status = 'todo' }) => {
  const s = (status || 'todo').toLowerCase();

  const configs = {
    todo: {
      label: 'To Do',
      bg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      icon: <Circle className="w-3 h-3 text-slate-400" />
    },
    in_progress: {
      label: 'In Progress',
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
      icon: <Clock className="w-3 h-3 text-indigo-500 animate-spin" style={{ animationDuration: '4s' }} />
    },
    completed: {
      label: 'Completed',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      icon: <CheckCircle2 className="w-3 h-3 text-emerald-500" />
    },
    archived: {
      label: 'Archived',
      bg: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
      icon: <Archive className="w-3 h-3 text-zinc-400" />
    }
  };

  const config = configs[s] || configs.todo;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium ${config.bg}`}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
