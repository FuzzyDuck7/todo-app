import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Plus, Calendar, BarChart3 } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export const MobileNavbar = () => {
  const { openCreateTaskModal } = useTasks();

  const navLinkClass = ({ isActive }) =>
    `flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
      isActive ? 'text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-500 dark:text-slate-400'
    }`;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-around shadow-lg">
      <NavLink to="/dashboard" className={navLinkClass}>
        <LayoutDashboard className="w-5 h-5" />
        <span>Home</span>
      </NavLink>

      <NavLink to="/tasks" className={navLinkClass}>
        <CheckSquare className="w-5 h-5" />
        <span>Tasks</span>
      </NavLink>

      {/* Floating Center Action */}
      <button
        onClick={() => openCreateTaskModal()}
        className="-mt-5 w-12 h-12 rounded-full bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 transition-transform active:scale-95"
        aria-label="Add task"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      <NavLink to="/calendar" className={navLinkClass}>
        <Calendar className="w-5 h-5" />
        <span>Calendar</span>
      </NavLink>

      <NavLink to="/analytics" className={navLinkClass}>
        <BarChart3 className="w-5 h-5" />
        <span>Stats</span>
      </NavLink>
    </div>
  );
};
