import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Folder,
  Plus,
  ArrowLeft,
  Edit2,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useToast } from '../context/ToastContext';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { TaskCard } from '../components/TaskCard';
import { ProgressBar } from '../components/ProgressBar';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';

export const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openCreateTaskModal, openEditProjectModal, refreshKey, triggerRefresh } = useTasks();
  const { success, error } = useToast();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const data = await projectService.getProjectById(id);
        setProject(data);
      } catch (err) {
        error(err.message || 'Project not found');
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchProject();
    }
  }, [id, refreshKey]);

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

  const handleDeleteProject = async () => {
    if (!project) return;
    try {
      await projectService.deleteProject(project.id);
      success('Project deleted');
      triggerRefresh();
      navigate('/projects');
    } catch (err) {
      error(err.message || 'Failed to delete project');
    }
  };

  if (loading && !project) {
    return (
      <div className="space-y-6">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4 animate-pulse" />
        <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
      </div>
    );
  }

  const tasks = project?.tasks || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all projects</span>
        </Link>
      </div>

      {/* Project Banner / Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md"
              style={{ backgroundColor: project?.color || '#6366f1' }}
            >
              <Folder className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {project?.name}
              </h1>
              {project?.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openEditProjectModal(project)}
              className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Edit Project"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              className="p-2 text-rose-500 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Delete Project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => openCreateTaskModal({ projectId: project?.id })}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-brand-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Overall Completion</span>
            <span>
              {project?.completedCount || 0} of {project?.taskCount || 0} completed ({project?.progress || 0}%)
            </span>
          </div>
          <ProgressBar
            value={project?.completedCount || 0}
            max={project?.taskCount || 1}
            size="md"
            color="bg-brand-500"
          />
        </div>
      </div>

      {/* Task list belonging to this project */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">
          Tasks in this Project ({tasks.length})
        </h2>

        {tasks.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No tasks in this project yet"
            description="Start adding tasks to organize this project's milestones."
            actionText="+ Add Task to Project"
            onAction={() => openCreateTaskModal({ projectId: project?.id })}
          />
        ) : (
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
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Project"
        message="Are you sure you want to delete this project? Associated tasks will remain in your inbox."
        confirmText="Delete Project"
        isDanger={true}
        onConfirm={handleDeleteProject}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
};
