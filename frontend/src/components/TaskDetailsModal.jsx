import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Tag,
  Folder,
  Trash2,
  Edit2,
  Archive,
  Plus,
  Bell,
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTasks } from '../context/TaskContext';
import { useToast } from '../context/ToastContext';
import { taskService } from '../services/taskService';
import { reminderService } from '../services/reminderService';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import { ConfirmDialog } from './ConfirmDialog';

export const TaskDetailsModal = () => {
  const { selectedTaskId, closeTaskDetails, openEditTaskModal, triggerRefresh } = useTasks();
  const { success, error } = useToast();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [submittingSubtask, setSubmittingSubtask] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // New reminder input state
  const [showReminderInput, setShowReminderInput] = useState(false);
  const [reminderDateTime, setReminderDateTime] = useState('');

  const fetchTask = async (id) => {
    try {
      setLoading(true);
      const data = await taskService.getTaskById(id);
      setTask(data);
    } catch (err) {
      error(err.message || 'Failed to load task details');
      closeTaskDetails();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTaskId) {
      fetchTask(selectedTaskId);
    } else {
      setTask(null);
    }
  }, [selectedTaskId]);

  if (!selectedTaskId) return null;

  const handleToggleComplete = async () => {
    if (!task) return;
    try {
      if (task.status === 'completed') {
        const updated = await taskService.reopenTask(task.id);
        setTask(updated);
        success('Task reopened');
      } else {
        try {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.7 }
          });
        } catch (e) {}
        const updated = await taskService.completeTask(task.id);
        setTask(updated);
        success('Task completed! Keep up the momentum!');
      }
      triggerRefresh();
    } catch (err) {
      error(err.message || 'Action failed');
    }
  };

  const handleArchive = async () => {
    if (!task) return;
    try {
      const updated = await taskService.archiveTask(task.id);
      setTask(updated);
      success('Task moved to archive');
      triggerRefresh();
    } catch (err) {
      error(err.message || 'Failed to archive');
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    try {
      await taskService.deleteTask(task.id);
      success('Task deleted successfully');
      triggerRefresh();
      setIsDeleteDialogOpen(false);
      closeTaskDetails();
    } catch (err) {
      error(err.message || 'Failed to delete task');
    }
  };

  // Subtask management
  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !task) return;
    setSubmittingSubtask(true);
    try {
      const newSt = await taskService.addSubtask(task.id, newSubtaskTitle.trim());
      setTask((prev) => ({
        ...prev,
        subtasks: [...(prev.subtasks || []), newSt]
      }));
      setNewSubtaskTitle('');
      triggerRefresh();
    } catch (err) {
      error(err.message || 'Failed to add subtask');
    } finally {
      setSubmittingSubtask(false);
    }
  };

  const handleToggleSubtask = async (subtaskId) => {
    try {
      const updated = await taskService.toggleSubtask(subtaskId);
      setTask((prev) => ({
        ...prev,
        subtasks: prev.subtasks.map((st) => (st.id === subtaskId ? updated : st))
      }));
      triggerRefresh();
    } catch (err) {
      error(err.message || 'Failed to update subtask');
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      await taskService.deleteSubtask(subtaskId);
      setTask((prev) => ({
        ...prev,
        subtasks: prev.subtasks.filter((st) => st.id !== subtaskId)
      }));
      triggerRefresh();
    } catch (err) {
      error(err.message || 'Failed to delete subtask');
    }
  };

  // Reminders
  const handleCreateReminder = async (e) => {
    e.preventDefault();
    if (!reminderDateTime || !task) return;
    try {
      const created = await reminderService.createReminder({
        taskId: task.id,
        remindAt: new Date(reminderDateTime).toISOString()
      });
      setTask((prev) => ({
        ...prev,
        reminders: [...(prev.reminders || []), created]
      }));
      setReminderDateTime('');
      setShowReminderInput(false);
      success('Reminder set');
    } catch (err) {
      error(err.message || 'Failed to create reminder');
    }
  };

  const subtasks = task?.subtasks || [];
  const completedSubtasksCount = subtasks.filter((st) => st.completed).length;
  const isCompleted = task?.status === 'completed';

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
        <div
          className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 animate-slide-up"
          role="dialog"
        >
          {loading ? (
            <div className="py-20 text-center text-slate-400">Loading task details...</div>
          ) : !task ? null : (
            <>
              {/* Header Bar */}
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleToggleComplete}
                    className={`p-1 rounded-lg transition-transform active:scale-95 ${
                      isCompleted ? 'text-emerald-500' : 'text-slate-400 hover:text-brand-500'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 fill-emerald-500 text-white dark:text-slate-900" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      closeTaskDetails();
                      openEditTaskModal(task);
                    }}
                    className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit task"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleArchive}
                    className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Archive task"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="p-2 text-rose-500 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={closeTaskDetails}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <div className="py-4">
                <h1
                  className={`text-xl sm:text-2xl font-bold ${
                    isCompleted
                      ? 'line-through text-slate-400 dark:text-slate-500'
                      : 'text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {task.title}
                </h1>
                {task.description ? (
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {task.description}
                  </p>
                ) : (
                  <p className="mt-2 text-xs italic text-slate-400">No description provided</p>
                )}
              </div>

              {/* Task Properties Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl my-3 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Project</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 truncate">
                    {task.project ? (
                      <>
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: task.project.color }}
                        />
                        <span className="truncate">{task.project.name}</span>
                      </>
                    ) : (
                      'Inbox'
                    )}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Due Date</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{task.due_date || 'No deadline'}</span>
                    {task.due_time && <span>({task.due_time.substring(0, 5)})</span>}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Est. Duration</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{task.estimated_minutes ? `${task.estimated_minutes} min` : 'Not set'}</span>
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Recurrence</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200 capitalize">
                    {task.recurrence || 'None'}
                  </span>
                </div>
              </div>

              {/* Labels list */}
              {task.labels && task.labels.length > 0 && (
                <div className="flex flex-wrap gap-2 py-2">
                  {task.labels.map((l) => (
                    <span
                      key={l.id}
                      className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: `${l.color}20`,
                        color: l.color,
                        border: `1px solid ${l.color}40`
                      }}
                    >
                      #{l.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Subtasks Section */}
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-brand-500" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Subtasks ({completedSubtasksCount}/{subtasks.length})
                    </h3>
                  </div>
                  {subtasks.length > 0 && (
                    <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                      {Math.round((completedSubtasksCount / subtasks.length) * 100)}%
                    </span>
                  )}
                </div>

                {subtasks.length > 0 && (
                  <ProgressBar
                    value={completedSubtasksCount}
                    max={subtasks.length}
                    size="sm"
                    className="mb-4"
                  />
                )}

                {/* Subtask list */}
                <div className="space-y-2 mb-3">
                  {subtasks.map((st) => (
                    <div
                      key={st.id}
                      className="group flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <label className="flex items-center gap-3 flex-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={st.completed}
                          onChange={() => handleToggleSubtask(st.id)}
                          className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300 dark:border-slate-700"
                        />
                        <span
                          className={`text-sm ${
                            st.completed
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          {st.title}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleDeleteSubtask(st.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Subtask Form */}
                <form onSubmit={handleAddSubtask} className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Add a step to this task..."
                    disabled={submittingSubtask}
                    className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button
                    type="submit"
                    disabled={submittingSubtask || !newSubtaskTitle.trim()}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all disabled:opacity-50"
                  >
                    Add Step
                  </button>
                </form>
              </div>

              {/* Reminders section */}
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Reminders</h3>
                  </div>
                  {!showReminderInput && (
                    <button
                      onClick={() => setShowReminderInput(true)}
                      className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Set Reminder</span>
                    </button>
                  )}
                </div>

                {showReminderInput && (
                  <form onSubmit={handleCreateReminder} className="flex gap-2 mb-3">
                    <input
                      type="datetime-local"
                      value={reminderDateTime}
                      onChange={(e) => setReminderDateTime(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <button
                      type="submit"
                      disabled={!reminderDateTime}
                      className="px-3 py-1.5 bg-brand-600 text-white rounded-xl text-xs font-semibold"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReminderInput(false)}
                      className="px-2 py-1.5 text-slate-500 text-xs"
                    >
                      Cancel
                    </button>
                  </form>
                )}

                {(task.reminders || []).length > 0 ? (
                  <div className="space-y-1.5">
                    {task.reminders.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between px-3 py-2 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs text-amber-800 dark:text-amber-300"
                      >
                        <span className="flex items-center gap-1.5">
                          <Bell className="w-3.5 h-3.5" />
                          <span>Remind on: {new Date(r.remind_at).toLocaleString()}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No reminders set for this task</p>
                )}
              </div>

              {/* Metadata Footer */}
              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex flex-wrap justify-between gap-2">
                <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                {task.completed_at && (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Completed: {new Date(task.completed_at).toLocaleString()}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Task"
        message="Are you sure you want to permanently delete this task and all its subtasks?"
        confirmText="Delete Task"
        isDanger={true}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </>
  );
};
