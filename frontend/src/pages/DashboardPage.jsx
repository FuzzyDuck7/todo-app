import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BarChart3,
  Plus,
  Flame,
  FolderPlus,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Inbox
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useToast } from '../context/ToastContext';
import { analyticsService } from '../services/analyticsService';
import { taskService } from '../services/taskService';
import { TaskCard } from '../components/TaskCard';
import { ProgressBar } from '../components/ProgressBar';
import { LoadingSpinner, TaskSkeleton } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { openCreateTaskModal, openCreateProjectModal, refreshKey, triggerRefresh } = useTasks();
  const { success, error } = useToast();

  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState({ insights: [], suggestions: [] });
  const [todayTasks, setTodayTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [sumData, insightData, todayRes, overdueRes] = await Promise.all([
          analyticsService.getSummary(),
          analyticsService.getInsights(),
          taskService.getTasks({ dueFilter: 'today', limit: 10 }),
          taskService.getTasks({ dueFilter: 'overdue', limit: 5 })
        ]);

        setSummary(sumData);
        setInsights(insightData);
        setTodayTasks(todayRes.tasks);
        setOverdueTasks(overdueRes.tasks);
      } catch (err) {
        error(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [refreshKey]);

  const handleToggleTask = async (task) => {
    try {
      if (task.status === 'completed') {
        await taskService.reopenTask(task.id);
        success('Task reopened');
      } else {
        await taskService.completeTask(task.id);
        success('Task completed! Great progress!');
      }
      triggerRefresh();
    } catch (err) {
      error(err.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      success('Task deleted');
      triggerRefresh();
    } catch (err) {
      error(err.message || 'Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.updateTask(taskId, { status: newStatus });
      triggerRefresh();
    } catch (err) {
      error(err.message || 'Failed to update status');
    }
  };

  if (loading && !summary) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="space-y-3">
          <TaskSkeleton />
          <TaskSkeleton />
        </div>
      </div>
    );
  }

  const todayCount = summary?.todayTasksCount || 0;
  const completedToday = summary?.completedTodayCount || 0;
  const todayProgress = todayCount > 0 ? Math.round((completedToday / todayCount) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Greeting & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Good day, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here is your daily task summary and performance snapshot.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openCreateProjectModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
          >
            <FolderPlus className="w-4 h-4 text-sky-500" />
            <span>Add Project</span>
          </button>
          <button
            onClick={() => openCreateTaskModal()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Overdue Alert Banner if overdue tasks exist */}
      {summary?.totalOverdue > 0 && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 animate-slide-up shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">
                You have {summary.totalOverdue} overdue task{summary.totalOverdue === 1 ? '' : 's'}
              </p>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
                Review deadlines to keep your workflow on track.
              </p>
            </div>
          </div>
          <Link
            to="/tasks?view=overdue"
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs shrink-0"
          >
            Review Overdue
          </Link>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Today's Tasks */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Due Today</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{summary?.todayTasksCount}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Scheduled for today</span>
        </div>

        {/* Overdue */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Overdue</span>
          <div className="flex items-baseline justify-between">
            <span className={`text-2xl font-bold ${summary?.totalOverdue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}>
              {summary?.totalOverdue}
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Requires attention</span>
        </div>

        {/* Completed Today */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Done Today</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{summary?.completedTodayCount}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Finished so far</span>
        </div>

        {/* Active Tasks */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Total Active</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{summary?.totalActive}</span>
            <Inbox className="w-4 h-4 text-brand-500" />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">In backlog & todo</span>
        </div>

        {/* Completion Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Completion Rate</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{summary?.completionRate}%</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Lifetime tasks</span>
        </div>

        {/* Daily Streak */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Daily Streak</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-500">{summary?.streak}d</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Consecutive days</span>
        </div>
      </div>

      {/* Today's Productivity Progress Bar Card */}
      <div className="bg-gradient-to-r from-brand-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-brand-500/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-200">Today's Progress</span>
            <h2 className="text-xl sm:text-2xl font-bold mt-0.5">
              {completedToday} of {todayCount} tasks completed
            </h2>
          </div>
          <div className="text-right">
            <span className="text-3xl font-extrabold">{todayProgress}%</span>
          </div>
        </div>

        <ProgressBar
          value={completedToday}
          max={todayCount || 1}
          color="bg-white"
          size="md"
          className="bg-brand-800/60"
        />

        <div className="flex items-center justify-between text-xs text-brand-100 mt-3 font-medium">
          <span>Remaining for today: {Math.max(0, todayCount - completedToday)}</span>
          <Link to="/tasks?view=today" className="hover:underline flex items-center gap-1 font-semibold text-white">
            <span>View Today's View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Grid: Today's Tasks + Insights & Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Today's Tasks & Urgent Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Today's Tasks</h2>
            </div>
            <Link
              to="/tasks?view=today"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <span>See all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {todayTasks.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="You're all caught up for today!"
              description="No tasks due today. Plan ahead or take a well-deserved break."
              actionText="+ Plan a Task for Today"
              onAction={() =>
                openCreateTaskModal({ dueDate: new Date().toISOString().split('T')[0] })
              }
            />
          ) : (
            <div className="space-y-3">
              {todayTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={handleToggleTask}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}

          {/* Overdue Preview if any */}
          {overdueTasks.length > 0 && (
            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <h3 className="text-sm font-bold text-rose-700 dark:text-rose-400">Overdue Tasks</h3>
                </div>
                <Link
                  to="/tasks?view=overdue"
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                >
                  View all overdue ({overdueTasks.length})
                </Link>
              </div>

              <div className="space-y-3">
                {overdueTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleTask}
                    onDelete={handleDeleteTask}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Productivity Score, Insights & Suggestions */}
        <div className="space-y-6">
          {/* Productivity Score Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Task Completion Score</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-bold">
                Real-time
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-black text-slate-900 dark:text-slate-100">
                {summary?.productivityScore || 0}
              </span>
              <span className="text-sm text-slate-400 font-medium">/ 100</span>
            </div>

            <ProgressBar
              value={summary?.productivityScore || 0}
              max={100}
              color="bg-brand-600"
              size="sm"
              className="my-3"
            />

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Transparent score calculated from on-time completion ({summary?.onTimeRate}%), completion rate, and streak consistency.
            </p>
          </div>

          {/* Genuine Productivity Insights */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Productivity Insights</h3>
            </div>

            {insights.insights.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                Complete more tasks to unlock personalized data insights.
              </p>
            ) : (
              <div className="space-y-3">
                {insights.insights.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs"
                  >
                    <p className="font-bold text-slate-800 dark:text-slate-200">{item.title}</p>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{item.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Smart Productivity Suggestions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Smart Suggestions</h3>
            </div>

            <div className="space-y-3">
              {insights.suggestions.map((sug, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs"
                >
                  <p className="font-bold text-indigo-950 dark:text-indigo-200">{sug.title}</p>
                  <p className="text-indigo-800/80 dark:text-indigo-300/80 mt-1 leading-relaxed">{sug.advice}</p>
                </div>
              ))}
            </div>

            <Link
              to="/analytics"
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Explore Full Analytics</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
