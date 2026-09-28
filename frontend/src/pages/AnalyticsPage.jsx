import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Award,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { analyticsService } from '../services/analyticsService';
import { ProgressBar } from '../components/ProgressBar';

export const AnalyticsPage = () => {
  const [summary, setSummary] = useState(null);
  const [completionTrends, setCompletionTrends] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [projectsData, setProjectsData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [insights, setInsights] = useState({ insights: [], suggestions: [] });
  const [trendDays, setTrendDays] = useState(14);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [sum, trends, prio, projs, statuses, ins] = await Promise.all([
          analyticsService.getSummary(),
          analyticsService.getCompletion(trendDays),
          analyticsService.getPriorities(),
          analyticsService.getProjects(),
          analyticsService.getStatus(),
          analyticsService.getInsights()
        ]);

        setSummary(sum);
        setCompletionTrends(trends);
        setPriorities(prio);
        setProjectsData(projs);
        setStatusData(statuses);
        setInsights(ins);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [trendDays]);

  if (loading && !summary) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-indigo-500" />
            <span>Productivity Analytics</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Data-grounded performance metrics, velocity trends, and smart insights
          </p>
        </div>

        {/* Timespan filter for trends */}
        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-xs text-xs font-semibold">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setTrendDays(d)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                trendDays === d
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Last {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Total Created</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{summary?.totalTasks}</span>
          <span className="text-[11px] text-slate-400 block mt-1">All time records</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Total Completed</span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{summary?.totalCompleted}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Finished tasks</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Completion Rate</span>
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{summary?.completionRate}%</span>
          <span className="text-[11px] text-slate-400 block mt-1">Completed / Total</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">On-Time Rate</span>
          <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">{summary?.onTimeRate}%</span>
          <span className="text-[11px] text-slate-400 block mt-1">Completed by due date</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Avg Resolution</span>
          <span className="text-2xl font-bold text-amber-500">{summary?.averageCompletionHours}h</span>
          <span className="text-[11px] text-slate-400 block mt-1">From create to done</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Active Streak</span>
          <span className="text-2xl font-bold text-amber-500 flex items-center gap-1">
            <Flame className="w-5 h-5 fill-amber-500" />
            <span>{summary?.streak}d</span>
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Consecutive days</span>
        </div>
      </div>

      {/* Task Completion Score Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-slate-900 dark:to-indigo-950/80 border border-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Transparent Task Completion Score</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black">
              {summary?.productivityScore} <span className="text-lg font-normal text-slate-400">/ 100</span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              This score measures on-time task delivery ({summary?.onTimeRate}%), completion ratio ({summary?.completionRate}%), low overdue backlog, and consistent daily momentum ({summary?.streak}-day streak).
            </p>
          </div>

          <div className="w-full md:w-64 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Performance Level</span>
              <span>
                {summary?.productivityScore >= 80 ? 'Master' : summary?.productivityScore >= 50 ? 'Strong' : 'Building Up'}
              </span>
            </div>
            <ProgressBar
              value={summary?.productivityScore || 0}
              max={100}
              color="bg-indigo-400"
              size="md"
            />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Tasks Completed Over Time (Line Chart) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Tasks Completed Over Time</h3>
              <p className="text-xs text-slate-400 mt-0.5">Daily completion velocity for the past {trendDays} days</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={completionTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="displayLabel" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10b981' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="created"
                  name="Created"
                  stroke="#6366f1"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Tasks By Priority (Bar Chart) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Tasks by Priority</h3>
              <p className="text-xs text-slate-400 mt-0.5">Distribution across Low, Medium, High, and Urgent</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorities} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="priority" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" name="Tasks" radius={[6, 6, 0, 0]}>
                  {priorities.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Tasks by Project (Bar Chart) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Tasks by Project</h3>
              <p className="text-xs text-slate-400 mt-0.5">Total tasks distributed across your active projects</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="completed" name="Completed" stackId="a" fill="#10b981" />
                <Bar dataKey="pending" name="Pending" stackId="a" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Completion Status Breakdown (Donut Chart) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Completion Status</h3>
              <p className="text-xs text-slate-400 mt-0.5">Overall status distribution</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="status"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Productivity Insights & Smart Suggestions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Real Insights */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Personalized Insights</h3>
              <p className="text-xs text-slate-400">Calculated from your verified database records</p>
            </div>
          </div>

          {insights.insights.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4">
              Continue working with tasks to populate automated insights.
            </p>
          ) : (
            <div className="space-y-3 pt-2">
              {insights.insights.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm"
                >
                  <p className="font-bold text-slate-800 dark:text-slate-200">{item.title}</p>
                  <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{item.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Smart Recommendations */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Smart Suggestions</h3>
              <p className="text-xs text-slate-400">Rule-based recommendations to maximize efficiency</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {insights.suggestions.map((sug, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-xs sm:text-sm"
              >
                <p className="font-bold text-emerald-950 dark:text-emerald-200">{sug.title}</p>
                <p className="text-emerald-800/90 dark:text-emerald-300/80 mt-1 leading-relaxed">{sug.advice}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
