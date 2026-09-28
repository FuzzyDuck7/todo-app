import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar as CalendarIcon,
  BarChart3,
  Folder,
  Plus,
  Inbox,
  Sun,
  CalendarClock,
  AlertCircle,
  CheckCircle2,
  Flame,
  Settings,
  User,
  ChevronRight
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { projectService } from '../services/projectService';
import { analyticsService } from '../services/analyticsService';

export const Sidebar = ({ onCloseMobile }) => {
  const location = useLocation();
  const { openCreateProjectModal, refreshKey } = useTasks();

  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    todayTasksCount: 0,
    totalOverdue: 0,
    totalActive: 0
  });

  useEffect(() => {
    const loadSidebarData = async () => {
      try {
        const [projList, summary] = await Promise.all([
          projectService.getProjects(),
          analyticsService.getSummary()
        ]);
        setProjects(projList);
        setStats(summary);
      } catch (err) {
        // Silently handle
      }
    };
    loadSidebarData();
  }, [refreshKey]);

  const navItemClass = ({ isActive }) =>
    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold shadow-xs'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
    }`;

  const currentView = new URLSearchParams(location.search).get('view');

  return (
    <aside className="w-64 h-[calc(100vh-4rem)] sticky top-16 flex flex-col justify-between p-4 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 overflow-y-auto">
      <div className="space-y-6">
        {/* Main Navigation */}
        <div className="space-y-1">
          <NavLink to="/dashboard" onClick={onCloseMobile} className={navItemClass}>
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-4 h-4 text-brand-500" />
              <span>Dashboard</span>
            </div>
          </NavLink>

          <NavLink to="/tasks" onClick={onCloseMobile} className={navItemClass}>
            <div className="flex items-center gap-3">
              <CheckSquare className="w-4 h-4 text-emerald-500" />
              <span>All Tasks</span>
            </div>
            {stats.totalActive > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                {stats.totalActive}
              </span>
            )}
          </NavLink>

          <NavLink to="/calendar" onClick={onCloseMobile} className={navItemClass}>
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-4 h-4 text-indigo-500" />
              <span>Calendar</span>
            </div>
          </NavLink>

          <NavLink to="/analytics" onClick={onCloseMobile} className={navItemClass}>
            <div className="flex items-center gap-3">
              <BarChart3 className="w-4 h-4 text-amber-500" />
              <span>Analytics</span>
            </div>
          </NavLink>

          <NavLink to="/projects" onClick={onCloseMobile} className={navItemClass}>
            <div className="flex items-center gap-3">
              <Folder className="w-4 h-4 text-sky-500" />
              <span>Projects</span>
            </div>
          </NavLink>
        </div>

        {/* Smart Views */}
        <div>
          <div className="px-3 mb-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Smart Views
          </div>
          <div className="space-y-1">
            <NavLink
              to="/tasks?view=inbox"
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                location.pathname === '/tasks' && currentView === 'inbox'
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Inbox className="w-4 h-4 text-slate-400" />
                <span>Inbox</span>
              </div>
            </NavLink>

            <NavLink
              to="/tasks?view=today"
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                location.pathname === '/tasks' && currentView === 'today'
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Today</span>
              </div>
              {stats.todayTasksCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
                  {stats.todayTasksCount}
                </span>
              )}
            </NavLink>

            <NavLink
              to="/tasks?view=upcoming"
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                location.pathname === '/tasks' && currentView === 'upcoming'
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CalendarClock className="w-4 h-4 text-indigo-400" />
                <span>Upcoming</span>
              </div>
            </NavLink>

            <NavLink
              to="/tasks?view=overdue"
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                location.pathname === '/tasks' && currentView === 'overdue'
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <span>Overdue</span>
              </div>
              {stats.totalOverdue > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold">
                  {stats.totalOverdue}
                </span>
              )}
            </NavLink>

            <NavLink
              to="/tasks?view=high_priority"
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                location.pathname === '/tasks' && currentView === 'high_priority'
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>High Priority</span>
              </div>
            </NavLink>

            <NavLink
              to="/tasks?view=completed"
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                location.pathname === '/tasks' && currentView === 'completed'
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Completed</span>
              </div>
            </NavLink>
          </div>
        </div>

        {/* Projects List */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Projects
            </span>
            <button
              onClick={() => openCreateProjectModal()}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Add project"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
            {projects.map((p) => (
              <NavLink
                key={p.id}
                to={`/projects/${p.id}`}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`
                }
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: p.color || '#6366f1' }}
                  />
                  <span className="truncate">{p.name}</span>
                </div>
                {p.taskCount > 0 && (
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {p.completedCount}/{p.taskCount}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Profile / Settings shortcut */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
        <NavLink to="/profile" onClick={onCloseMobile} className={navItemClass}>
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-slate-400" />
            <span>Profile</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </NavLink>
        <NavLink to="/settings" onClick={onCloseMobile} className={navItemClass}>
          <div className="flex items-center gap-3">
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </NavLink>
      </div>
    </aside>
  );
};
