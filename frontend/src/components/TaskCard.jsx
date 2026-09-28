import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  MoreVertical,
  Repeat,
  CheckSquare,
  Trash2,
  Edit2,
  Archive,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { useTasks } from '../context/TaskContext';

export const TaskCard = ({ task, onToggleComplete, onDelete, onStatusChange }) => {
  const { openEditTaskModal, openTaskDetails } = useTasks();
  const [menuOpen, setMenuOpen] = useState(false);
  const [animatingComplete, setAnimatingComplete] = useState(false);

  const isCompleted = task.status === 'completed';

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!isCompleted) {
      setAnimatingComplete(true);
      try {
        confetti({
          particleCount: 30,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#10b981', '#3b82f6', '#f59e0b']
        });
      } catch (err) {}
    }
    onToggleComplete(task);
    setTimeout(() => setAnimatingComplete(false), 500);
  };

  // Due date formatting and overdue check
  let dueDateText = '';
  let isOverdue = false;
  let isToday = false;

  if (task.due_date) {
    const todayStr = new Date().toISOString().split('T')[0];
    if (task.due_date === todayStr) {
      dueDateText = 'Today';
      isToday = true;
    } else if (task.due_date < todayStr && !isCompleted) {
      dueDateText = `Overdue (${task.due_date})`;
      isOverdue = true;
    } else {
      const d = new Date(`${task.due_date}T12:00:00`);
      dueDateText = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  // Subtask progress
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((st) => st.completed).length;
  const subtaskProgress = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;

  return (
    <div
      onClick={() => openTaskDetails(task.id)}
      className={`group relative bg-white dark:bg-slate-900 border rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 ${
        isCompleted
          ? 'border-emerald-200 dark:border-emerald-950/60 bg-emerald-50/20 dark:bg-emerald-950/10'
          : isOverdue
          ? 'border-rose-200 dark:border-rose-950/80 bg-rose-50/10 dark:bg-rose-950/5'
          : 'border-slate-200/90 dark:border-slate-800'
      } ${animatingComplete ? 'scale-[1.01]' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Completion checkbox */}
        <button
          type="button"
          onClick={handleToggle}
          className={`mt-0.5 rounded-lg p-1 transition-all transform active:scale-90 ${
            isCompleted
              ? 'text-emerald-500 hover:text-emerald-600 dark:text-emerald-400'
              : 'text-slate-300 hover:text-brand-500 dark:text-slate-600 dark:hover:text-brand-400'
          }`}
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 fill-emerald-500 text-white dark:fill-emerald-400 dark:text-slate-950" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        {/* Task Title & Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4
              className={`text-sm sm:text-base font-semibold transition-all truncate ${
                isCompleted
                  ? 'line-through text-slate-400 dark:text-slate-500 font-normal'
                  : 'text-slate-800 dark:text-slate-100'
              }`}
            >
              {task.title}
            </h4>

            {/* Menu trigger */}
            <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-6 z-30 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 text-sm animate-fade-in">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        openEditTaskModal(task);
                      }}
                      className="w-full text-left px-3 py-2 flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                    >
                      <Edit2 className="w-4 h-4 text-slate-400" />
                      <span>Edit Task</span>
                    </button>
                    {onStatusChange && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          const nextStatus = task.status === 'in_progress' ? 'todo' : 'in_progress';
                          onStatusChange(task.id, nextStatus);
                        }}
                        className="w-full text-left px-3 py-2 flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                      >
                        <Clock className="w-4 h-4 text-indigo-400" />
                        <span>{task.status === 'in_progress' ? 'Set as To Do' : 'Set In Progress'}</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(task.id);
                      }}
                      className="w-full text-left px-3 py-2 flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Task</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {task.description && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Badges & Meta info */}
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
            <PriorityBadge priority={task.priority} />

            {task.project && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: task.project.color || '#6366f1' }}
                />
                <span className="truncate max-w-[120px]">{task.project.name}</span>
              </span>
            )}

            {task.due_date && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border font-medium ${
                  isOverdue
                    ? 'bg-rose-100/80 text-rose-700 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800'
                    : isToday
                    ? 'bg-amber-100/80 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800'
                    : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                }`}
              >
                {isOverdue ? <AlertCircle className="w-3 h-3 text-rose-500" /> : <Calendar className="w-3 h-3" />}
                <span>{dueDateText}</span>
                {task.due_time && <span className="opacity-80">@{task.due_time.substring(0, 5)}</span>}
              </span>
            )}

            {task.estimated_minutes > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-slate-500 dark:text-slate-400 bg-slate-100/60 dark:bg-slate-800/40">
                <Clock className="w-3 h-3" />
                <span>{task.estimated_minutes}m</span>
              </span>
            )}

            {task.recurrence && task.recurrence !== 'none' && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 capitalize"
                title={`Recurring: ${task.recurrence}`}
              >
                <Repeat className="w-3 h-3" />
                <span>{task.recurrence}</span>
              </span>
            )}

            {/* Subtask pill */}
            {subtasks.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 font-medium">
                <CheckSquare className="w-3 h-3 text-brand-500" />
                <span>
                  {completedSubtasks}/{subtasks.length}
                </span>
              </span>
            )}

            {/* Labels */}
            {(task.labels || []).map((label) => (
              <span
                key={label.id}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium"
                style={{
                  backgroundColor: `${label.color}15`,
                  color: label.color,
                  border: `1px solid ${label.color}35`
                }}
              >
                #{label.name}
              </span>
            ))}
          </div>

          {/* Subtask micro progress bar if has subtasks */}
          {subtasks.length > 0 && (
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
              <div
                className="bg-brand-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${subtaskProgress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
