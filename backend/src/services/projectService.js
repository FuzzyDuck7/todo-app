import { ProjectModel } from '../models/ProjectModel.js';
import { TaskModel } from '../models/TaskModel.js';

export class ProjectService {
  static async getUserProjects(userId) {
    const projects = await ProjectModel.findByUserId(userId);
    // Enrich with task count metrics
    const userTasksResult = await TaskModel.find({ userId, limit: 10000 });
    const allTasks = userTasksResult.tasks;

    const enriched = projects.map(project => {
      const pTasks = allTasks.filter(t => t.project_id === project.id);
      const totalTasks = pTasks.length;
      const completedTasks = pTasks.filter(t => t.status === 'completed').length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...project,
        taskCount: totalTasks,
        completedCount: completedTasks,
        progress
      };
    });

    return enriched;
  }

  static async getProjectById(id, userId) {
    const project = await ProjectModel.findById(id, userId);
    if (!project) {
      const error = new Error('Project not found');
      error.code = 'PROJECT_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    const { tasks } = await TaskModel.find({ userId, projectId: id, limit: 1000 });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      ...project,
      tasks,
      taskCount: totalTasks,
      completedCount: completedTasks,
      progress
    };
  }

  static async createProject(userId, { name, description, color }) {
    if (!name || !name.trim()) {
      const error = new Error('Project name is required');
      error.code = 'VALIDATION_ERROR';
      error.statusCode = 400;
      throw error;
    }
    return ProjectModel.create({ userId, name, description, color });
  }

  static async updateProject(id, userId, updates) {
    const existing = await ProjectModel.findById(id, userId);
    if (!existing) {
      const error = new Error('Project not found');
      error.code = 'PROJECT_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    return ProjectModel.update(id, userId, updates);
  }

  static async deleteProject(id, userId) {
    const existing = await ProjectModel.findById(id, userId);
    if (!existing) {
      const error = new Error('Project not found');
      error.code = 'PROJECT_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    return ProjectModel.delete(id, userId);
  }
}
