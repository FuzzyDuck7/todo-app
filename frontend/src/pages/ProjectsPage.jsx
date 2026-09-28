import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Folder,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle2,
  ListTodo,
  ArrowRight
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useToast } from '../context/ToastContext';
import { projectService } from '../services/projectService';
import { ProgressBar } from '../components/ProgressBar';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';

export const ProjectsPage = () => {
  const { openCreateProjectModal, openEditProjectModal, openCreateTaskModal, refreshKey, triggerRefresh } = useTasks();
  const { success, error } = useToast();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await projectService.getProjects();
        setProjects(data);
      } catch (err) {
        error(err.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [refreshKey]);

  const handleDelete = async () => {
    if (!deletingProject) return;
    try {
      await projectService.deleteProject(deletingProject.id);
      success('Project deleted');
      triggerRefresh();
      setDeletingProject(null);
    } catch (err) {
      error(err.message || 'Failed to delete project');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <Folder className="w-7 h-7 text-sky-500" />
            <span>Projects</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Group and organize related tasks into dedicated workspaces
          </p>
        </div>

        <button
          onClick={() => openCreateProjectModal()}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Project</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={Folder}
          title="No projects created yet"
          description="Create your first project to start organizing tasks into goals, classes, or sprints."
          actionText="+ Create First Project"
          onAction={() => openCreateProjectModal()}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: project.color || '#6366f1' }}
                    >
                      <Folder className="w-5 h-5" />
                    </div>
                    <div>
                      <Link
                        to={`/projects/${project.id}`}
                        className="text-base font-bold text-slate-800 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                      >
                        {project.name}
                      </Link>
                      <p className="text-xs text-slate-400">
                        {project.taskCount} {project.taskCount === 1 ? 'task' : 'tasks'}
                      </p>
                    </div>
                  </div>

                  {/* Actions Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === project.id ? null : project.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === project.id && (
                      <>
                        <div className="fixed inset-0 z-20" onClick={() => setActiveMenuId(null)} />
                        <div className="absolute right-0 top-8 z-30 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 text-xs">
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              openEditProjectModal(project);
                            }}
                            className="w-full text-left px-3 py-2 flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit Project</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              setDeletingProject(project);
                            }}
                            className="w-full text-left px-3 py-2 flex items-center gap-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Project</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {project.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {project.description}
                  </p>
                )}
              </div>

              {/* Progress and Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <ProgressBar
                  value={project.completedCount}
                  max={project.taskCount || 1}
                  color="bg-brand-500"
                  size="sm"
                />

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => openCreateTaskModal({ projectId: project.id })}
                    className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Task</span>
                  </button>

                  <Link
                    to={`/projects/${project.id}`}
                    className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
                  >
                    <span>View Project</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deletingProject)}
        title="Delete Project"
        message={`Are you sure you want to delete "${deletingProject?.name}"? Tasks associated with this project will be unlinked.`}
        confirmText="Delete Project"
        isDanger={true}
        onConfirm={handleDelete}
        onCancel={() => setDeletingProject(null)}
      />
    </div>
  );
};
