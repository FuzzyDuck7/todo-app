import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  LayoutList,
  Kanban,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Tag,
  Folder,
  X
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useToast } from '../context/ToastContext';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { labelService } from '../services/labelService';
import { TaskCard } from '../components/TaskCard';
import { TaskSkeleton } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';

export const TasksPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { openCreateTaskModal, refreshKey, triggerRefresh } = useTasks();
  const { success, error } = useToast();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 30, total: 0, totalPages: 1 });

  // View mode: 'list' or 'kanban'
  const [viewMode, setViewMode] = useState('list');

  // Filter & Search states
  const searchFromUrl = searchParams.get('search') || '';
  const viewFromUrl = searchParams.get('view') || 'all';

  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState(searchParams.get('project') || '');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Sync state if URL changes
  useEffect(() => {
    if (searchParams.get('search') !== null) {
      setSearchQuery(searchParams.get('search'));
    }
  }, [searchParams]);

  // Load projects and labels once
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [projRes, labelRes] = await Promise.all([
          projectService.getProjects(),
          labelService.getLabels()
        ]);
        setProjects(projRes);
        setLabels(labelRes);
      } catch (err) {}
    };
    fetchMeta();
  }, []);

  // Fetch tasks with debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const params = {
          page: pagination.page,
          limit: pagination.limit,
          search: searchQuery.trim(),
          sortBy,
          sortOrder
        };

        if (priorityFilter) params.priority = priorityFilter;
        if (projectFilter) params.projectId = projectFilter;

        // Smart view logic
        if (viewFromUrl === 'today') {
          params.dueFilter = 'today';
        } else if (viewFromUrl === 'overdue') {
          params.dueFilter = 'overdue';
        } else if (viewFromUrl === 'upcoming') {
          params.dueFilter = 'upcoming';
        } else if (viewFromUrl === 'completed') {
          params.status = 'completed';
        } else if (viewFromUrl === 'high_priority') {
          params.priority = 'urgent'; // or fetch high
        } else if (viewFromUrl === 'inbox') {
          // unassigned projects
          params.status = 'active';
        } else if (statusFilter) {
          params.status = statusFilter;
        }

        const res = await taskService.getTasks(params);
        setTasks(res.tasks);
        setPagination((prev) => ({
          ...prev,
          total: res.pagination?.total || res.tasks.length,
          totalPages: res.pagination?.totalPages || 1
        }));
      } catch (err) {
        error(err.message || 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, viewFromUrl, statusFilter, priorityFilter, projectFilter, sortBy, sortOrder, pagination.page, refreshKey]);

  const handleToggleTask = async (task) => {
    try {
      if (task.status === 'completed') {
        await taskService.reopenTask(task.id);
        success('Task reopened');
      } else {
        await taskService.completeTask(task.id);
        success('Task completed!');
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
      error(err.message || 'Failed to change status');
    }
  };

  // Drag and Drop support for Kanban view
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      handleStatusChange(taskId, targetStatus);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Split tasks for Kanban board
  const kanbanColumns = useMemo(() => {
    return {
      todo: tasks.filter((t) => t.status === 'todo'),
      in_progress: tasks.filter((t) => t.status === 'in_progress'),
      completed: tasks.filter((t) => t.status === 'completed')
    };
  }, [tasks]);

  const viewTitles = {
    all: 'All Tasks',
    inbox: 'Inbox',
    today: "Today's Tasks",
    upcoming: 'Upcoming Tasks',
    overdue: 'Overdue Tasks',
    high_priority: 'High Priority Tasks',
    completed: 'Completed Tasks'
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {viewTitles[viewFromUrl] || 'Tasks'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {pagination.total} {pagination.total === 1 ? 'task' : 'tasks'} found
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle: List vs Kanban */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <LayoutList className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span className="hidden sm:inline">Board</span>
            </button>
          </div>

          <button
            onClick={() => openCreateTaskModal()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in title or notes..."
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Project Filter */}
          <div>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  📁 {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Priorities</option>
              <option value="urgent">🔴 Urgent</option>
              <option value="high">🟠 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🔵 Low</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="created_at">Date Created</option>
              <option value="due_date">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title={`Sort order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: List View or Kanban View */}
      {loading ? (
        <div className="space-y-3">
          <TaskSkeleton />
          <TaskSkeleton />
          <TaskSkeleton />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No tasks match your criteria"
          description="Try changing your search keywords or filter options, or add a new task."
          actionText="+ Create Task"
          onAction={() => openCreateTaskModal()}
        />
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={handleToggleTask}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          ))}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Kanban Board View with Drag & Drop */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Column: To Do */}
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'todo')}
            className="bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 min-h-[500px] flex flex-col space-y-3"
          >
            <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">To Do</h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 font-bold text-slate-500">
                {kanbanColumns.todo.length}
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {kanbanColumns.todo.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <TaskCard
                    task={task}
                    onToggleComplete={handleToggleTask}
                    onDelete={handleDeleteTask}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Column: In Progress */}
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'in_progress')}
            className="bg-indigo-50/30 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-3xl p-4 min-h-[500px] flex flex-col space-y-3"
          >
            <div className="flex items-center justify-between px-2 pb-2 border-b border-indigo-100 dark:border-indigo-900/40">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">In Progress</h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 font-bold text-indigo-600 dark:text-indigo-400">
                {kanbanColumns.in_progress.length}
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {kanbanColumns.in_progress.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <TaskCard
                    task={task}
                    onToggleComplete={handleToggleTask}
                    onDelete={handleDeleteTask}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Column: Completed */}
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'completed')}
            className="bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-3xl p-4 min-h-[500px] flex flex-col space-y-3"
          >
            <div className="flex items-center justify-between px-2 pb-2 border-b border-emerald-100 dark:border-emerald-900/40">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Completed</h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 font-bold text-emerald-600 dark:text-emerald-400">
                {kanbanColumns.completed.length}
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {kanbanColumns.completed.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <TaskCard
                    task={task}
                    onToggleComplete={handleToggleTask}
                    onDelete={handleDeleteTask}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
