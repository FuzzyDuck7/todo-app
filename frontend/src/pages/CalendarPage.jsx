import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { taskService } from '../services/taskService';
import { PriorityBadge } from '../components/PriorityBadge';

export const CalendarPage = () => {
  const { openCreateTaskModal, openTaskDetails, refreshKey } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        // Fetch user tasks
        const res = await taskService.getTasks({ limit: 1000 });
        setTasks(res.tasks);
      } catch (err) {
        console.error('Failed to load tasks for calendar:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [refreshKey]);

  // Calendar dates computation
  const { days, monthName } = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const lastDate = new Date(year, month + 1, 0).getDate();
    const prevLastDate = new Date(year, month, 0).getDate();

    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const days = [];

    // Previous month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevLastDate - i;
      const prevDate = new Date(year, month - 1, d);
      days.push({
        date: prevDate,
        dateString: prevDate.toISOString().split('T')[0],
        dayNumber: d,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= lastDate; i++) {
      const curDate = new Date(year, month, i);
      days.push({
        date: curDate,
        dateString: curDate.toISOString().split('T')[0],
        dayNumber: i,
        isCurrentMonth: true
      });
    }

    // Next month padding days to complete 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        date: nextDate,
        dateString: nextDate.toISOString().split('T')[0],
        dayNumber: i,
        isCurrentMonth: false
      });
    }

    return { days, monthName };
  }, [year, month, currentDate]);

  // Group tasks by due_date
  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      if (t.due_date) {
        if (!map[t.due_date]) map[t.due_date] = [];
        map[t.due_date].push(t);
      }
    });
    return map;
  }, [tasks]);

  const todayStr = new Date().toISOString().split('T')[0];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <CalendarIcon className="w-7 h-7 text-brand-500" />
            <span>Schedule Calendar</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Visual deadline planner and day-by-day scheduler
          </p>
        </div>

        {/* Month controls & Quick Add */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-3 text-sm font-bold text-slate-800 dark:text-slate-200 min-w-[140px] text-center">
              {monthName}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleToday}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            Today
          </button>

          <button
            onClick={() => openCreateTaskModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        {/* Days of week row */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800/70">
          {days.map((dayItem, idx) => {
            const dayTasks = tasksByDate[dayItem.dateString] || [];
            const isToday = dayItem.dateString === todayStr;

            return (
              <div
                key={idx}
                onClick={() =>
                  openCreateTaskModal({
                    dueDate: dayItem.dateString
                  })
                }
                className={`min-h-[105px] sm:min-h-[125px] p-1.5 sm:p-2.5 transition-colors cursor-pointer group flex flex-col justify-between ${
                  !dayItem.isCurrentMonth
                    ? 'bg-slate-50/40 dark:bg-slate-950/40 text-slate-300 dark:text-slate-600'
                    : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                } ${isToday ? 'bg-brand-50/20 dark:bg-brand-950/10' : ''}`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-all ${
                      isToday
                        ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/30'
                        : dayItem.isCurrentMonth
                        ? 'text-slate-800 dark:text-slate-200'
                        : 'text-slate-400'
                    }`}
                  >
                    {dayItem.dayNumber}
                  </span>

                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-400 hidden sm:inline">
                      {dayTasks.length} task{dayTasks.length === 1 ? '' : 's'}
                    </span>
                  )}
                </div>

                {/* Day Tasks preview pills */}
                <div className="space-y-1 flex-1 overflow-y-auto max-h-20 pr-0.5">
                  {dayTasks.slice(0, 3).map((task) => {
                    const isCompleted = task.status === 'completed';
                    const isOverdue = task.due_date < todayStr && !isCompleted;

                    let pillColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200';
                    if (isCompleted) {
                      pillColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 line-through opacity-70';
                    } else if (isOverdue) {
                      pillColor = 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900';
                    } else if (task.priority === 'urgent') {
                      pillColor = 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200';
                    } else if (task.priority === 'high') {
                      pillColor = 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-200';
                    }

                    return (
                      <div
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          openTaskDetails(task.id);
                        }}
                        className={`px-1.5 py-0.5 rounded-md text-[11px] font-medium truncate transition-transform hover:scale-[1.02] ${pillColor}`}
                        title={task.title}
                      >
                        {isOverdue && '⚠️ '}
                        {task.title}
                      </div>
                    );
                  })}

                  {dayTasks.length > 3 && (
                    <span className="text-[10px] font-bold text-slate-400 pl-1 block">
                      +{dayTasks.length - 3} more
                    </span>
                  )}
                </div>

                {/* Quick Add indicator on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end text-brand-600 dark:text-brand-400 text-[10px] font-semibold mt-1">
                  <span>+ Add</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
