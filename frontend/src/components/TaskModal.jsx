import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Tag, Folder, Plus, Repeat, AlertCircle } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useToast } from '../context/ToastContext';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { labelService } from '../services/labelService';

export const TaskModal = () => {
  const { isTaskModalOpen, taskModalData, closeTaskModal, triggerRefresh } = useTasks();
  const { success, error } = useToast();

  const isEdit = Boolean(taskModalData?.id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [recurrence, setRecurrence] = useState('none');
  const [selectedLabelIds, setSelectedLabelIds] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [initialSubtasks, setInitialSubtasks] = useState([]);

  const [projects, setProjects] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load user's projects and labels
  useEffect(() => {
    if (!isTaskModalOpen) return;

    const fetchMeta = async () => {
      try {
        const [projList, labelList] = await Promise.all([
          projectService.getProjects(),
          labelService.getLabels()
        ]);
        setProjects(projList);
        setLabels(labelList);
      } catch (err) {
        console.error('Failed to load projects/labels:', err);
      }
    };
    fetchMeta();
  }, [isTaskModalOpen]);

  // Populate data when modal opens
  useEffect(() => {
    if (!isTaskModalOpen) return;

    if (taskModalData) {
      setTitle(taskModalData.title || '');
      setDescription(taskModalData.description || '');
      setProjectId(taskModalData.project_id || taskModalData.projectId || '');
      setPriority(taskModalData.priority || 'medium');
      setDueDate(taskModalData.due_date || taskModalData.dueDate || '');
      setDueTime(taskModalData.due_time ? taskModalData.due_time.substring(0, 5) : '');
      setEstimatedMinutes(taskModalData.estimated_minutes || taskModalData.estimatedMinutes || '');
      setRecurrence(taskModalData.recurrence || 'none');
      setSelectedLabelIds((taskModalData.labels || []).map((l) => l.id) || []);
      setInitialSubtasks([]);
    } else {
      setTitle('');
      setDescription('');
      setProjectId('');
      setPriority('medium');
      setDueDate('');
      setDueTime('');
      setEstimatedMinutes('');
      setRecurrence('none');
      setSelectedLabelIds([]);
      setInitialSubtasks([]);
    }
  }, [isTaskModalOpen, taskModalData]);

  if (!isTaskModalOpen) return null;

  const handleAddInitialSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setInitialSubtasks([...initialSubtasks, newSubtaskTitle.trim()]);
    setNewSubtaskTitle('');
  };

  const handleRemoveInitialSubtask = (index) => {
    setInitialSubtasks(initialSubtasks.filter((_, i) => i !== index));
  };

  const toggleLabel = (labelId) => {
    setSelectedLabelIds((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      error('Task title is required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        projectId: projectId || null,
        priority,
        dueDate: dueDate || null,
        dueTime: dueTime ? `${dueTime}:00` : null,
        estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes, 10) : 0,
        recurrence,
        labelIds: selectedLabelIds
      };

      if (isEdit) {
        await taskService.updateTask(taskModalData.id, payload);
        success('Task updated successfully');
      } else {
        const createdTask = await taskService.createTask(payload);

        // Add any initial subtasks
        if (initialSubtasks.length > 0) {
          await Promise.all(
            initialSubtasks.map((stTitle) => taskService.addSubtask(createdTask.id, stTitle))
          );
        }
        success('Task created successfully');
      }

      triggerRefresh();
      closeTaskModal();
    } catch (err) {
      error(err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 animate-slide-up"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {isEdit ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={closeTaskModal}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete React assignment"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key notes, details, or checklists..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all resize-none"
            />
          </div>

          {/* Priority selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: 'low', label: 'Low', color: 'border-blue-400 text-blue-600 bg-blue-50/50 dark:bg-blue-950/40' },
                { key: 'medium', label: 'Medium', color: 'border-amber-400 text-amber-600 bg-amber-50/50 dark:bg-amber-950/40' },
                { key: 'high', label: 'High', color: 'border-orange-400 text-orange-600 bg-orange-50/50 dark:bg-orange-950/40' },
                { key: 'urgent', label: 'Urgent', color: 'border-rose-400 text-rose-600 bg-rose-50/50 dark:bg-rose-950/40' }
              ].map((p) => {
                const isSelected = priority === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setPriority(p.key)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                      isSelected
                        ? `${p.color} ring-2 ring-brand-500 font-bold shadow-sm`
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Project & Recurrence row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-slate-400" />
                <span>Project</span>
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">No Project (Inbox)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-slate-400" />
                <span>Repeat</span>
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          {/* Due date, Due time, Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Due Date</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Due Time</span>
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Est. Minutes
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                placeholder="e.g. 60"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Labels */}
          {labels.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>Labels</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {labels.map((lbl) => {
                  const isSelected = selectedLabelIds.includes(lbl.id);
                  return (
                    <button
                      key={lbl.id}
                      type="button"
                      onClick={() => toggleLabel(lbl.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                        isSelected
                          ? 'border-brand-500 bg-brand-500 text-white shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      #{lbl.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Subtasks input (on create only) */}
          {!isEdit && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Initial Subtasks
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddInitialSubtask();
                    }
                  }}
                  placeholder="Type a subtask and press Enter or +"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="button"
                  onClick={handleAddInitialSubtask}
                  className="px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {initialSubtasks.length > 0 && (
                <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                  {initialSubtasks.map((st, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs"
                    >
                      <span className="text-slate-700 dark:text-slate-300">• {st}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveInitialSubtask(idx)}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={closeTaskModal}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-brand-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
