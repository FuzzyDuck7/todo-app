import React, { useState } from 'react';
import { Settings, Sun, Moon, Database, Download, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { taskService } from '../services/taskService';

export const SettingsPage = () => {
  const { isDark, toggleTheme } = useTheme();
  const { success, error } = useToast();
  const [exporting, setExporting] = useState(false);

  const handleExportData = async () => {
    try {
      setExporting(true);
      const res = await taskService.getTasks({ limit: 10000 });
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.tasks, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `taskflow_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      success('Tasks backup exported successfully');
    } catch (err) {
      error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-brand-500" />
          <span>Settings</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Preferences, theme appearance, and data management
        </p>
      </div>

      {/* Theme Preference */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Appearance</h2>
        <p className="text-xs text-slate-400 mb-6">Choose how TaskFlow looks on your device</p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => {
              if (isDark) toggleTheme();
            }}
            className={`p-4 rounded-2xl border text-left flex items-center gap-4 transition-all ${
              !isDark
                ? 'border-brand-500 bg-brand-50/40 text-brand-900 ring-2 ring-brand-500'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Light Mode</p>
              <p className="text-xs text-slate-400 mt-0.5">Clean crisp appearance</p>
            </div>
          </button>

          <button
            onClick={() => {
              if (!isDark) toggleTheme();
            }}
            className={`p-4 rounded-2xl border text-left flex items-center gap-4 transition-all ${
              isDark
                ? 'border-brand-500 bg-slate-800 text-white ring-2 ring-brand-500'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Dark Mode</p>
              <p className="text-xs text-slate-400 mt-0.5">Sleek high-contrast palette</p>
            </div>
          </button>
        </div>
      </div>

      {/* Database & Architecture */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-500" />
          <span>Database & Cloud Architecture</span>
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          TaskFlow uses Supabase PostgreSQL with strict Row Level Security (RLS) policies.
        </p>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Database Driver:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">Supabase (@supabase/supabase-js) + PostgreSQL</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Security Isolation:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>JWT User Derivation & RLS Active</span>
            </span>
          </div>
        </div>
      </div>

      {/* Data Backup & Export */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
          <Download className="w-5 h-5 text-brand-500" />
          <span>Data Export & Backup</span>
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Download a complete JSON export of all your tasks, subtasks, and labels.
        </p>

        <button
          onClick={handleExportData}
          disabled={exporting}
          className="px-6 py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>{exporting ? 'Generating Backup...' : 'Export Tasks as JSON'}</span>
        </button>
      </div>
    </div>
  );
};
