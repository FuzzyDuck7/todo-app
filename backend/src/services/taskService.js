import { TaskModel } from '../models/TaskModel.js';
import { ProjectModel } from '../models/ProjectModel.js';

export class TaskService {
  static async getTasks(userId, query) {
    const {
      status,
      priority,
      projectId,
      search,
      dueDate,
      dueFilter,
      labelId,
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = 1,
      limit = 50
    } = query;

    return TaskModel.find({
      userId,
      status,
      priority,
      projectId,
      search,
      dueDate,
      dueFilter,
      labelId,
      sortBy,
      sortOrder,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 50
    });
  }

  static async getTaskById(id, userId) {
    const task = await TaskModel.findById(id, userId);
    if (!task) {
      const error = new Error('Task not found');
      error.code = 'TASK_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    return task;
  }

  static async createTask(userId, data) {
    if (!data.title || !data.title.trim()) {
      const error = new Error('Task title is required');
      error.code = 'VALIDATION_ERROR';
      error.statusCode = 400;
      throw error;
    }

    if (data.projectId) {
      const project = await ProjectModel.findById(data.projectId, userId);
      if (!project) {
        const error = new Error('Selected project was not found');
        error.code = 'PROJECT_NOT_FOUND';
        error.statusCode = 404;
        throw error;
      }
    }

    return TaskModel.create({
      userId,
      projectId: data.projectId,
      title: data.title,
      description: data.description,
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      dueDate: data.dueDate,
      dueTime: data.dueTime,
      estimatedMinutes: data.estimatedMinutes,
      recurrence: data.recurrence || 'none',
      labelIds: data.labelIds || []
    });
  }

  static async updateTask(id, userId, updates) {
    const existing = await TaskModel.findById(id, userId);
    if (!existing) {
      const error = new Error('Task not found');
      error.code = 'TASK_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    if (updates.projectId) {
      const project = await ProjectModel.findById(updates.projectId, userId);
      if (!project) {
        const error = new Error('Selected project was not found');
        error.code = 'PROJECT_NOT_FOUND';
        error.statusCode = 404;
        throw error;
      }
    }

    return TaskModel.update(id, userId, updates, updates.labelIds);
  }

  static async deleteTask(id, userId) {
    const existing = await TaskModel.findById(id, userId);
    if (!existing) {
      const error = new Error('Task not found');
      error.code = 'TASK_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    return TaskModel.delete(id, userId);
  }

  static async completeTask(id, userId) {
    const existing = await TaskModel.findById(id, userId);
    if (!existing) {
      const error = new Error('Task not found');
      error.code = 'TASK_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    const updated = await TaskModel.update(id, userId, {
      status: 'completed',
      completed_at: new Date().toISOString()
    });

    // Handle recurrence cleanly
    if (existing.recurrence && existing.recurrence !== 'none' && existing.due_date) {
      const currentDue = new Date(existing.due_date);
      const nextDue = new Date(currentDue);

      if (existing.recurrence === 'daily') {
        nextDue.setDate(nextDue.getDate() + 1);
      } else if (existing.recurrence === 'weekly') {
        nextDue.setDate(nextDue.getDate() + 7);
      } else if (existing.recurrence === 'monthly') {
        nextDue.setMonth(nextDue.getMonth() + 1);
      }

      const nextDueDateStr = nextDue.toISOString().split('T')[0];

      // Create next occurrence without duplicating past completions
      await TaskModel.create({
        userId,
        projectId: existing.project_id,
        title: existing.title,
        description: existing.description,
        status: 'todo',
        priority: existing.priority,
        dueDate: nextDueDateStr,
        dueTime: existing.due_time,
        estimatedMinutes: existing.estimated_minutes,
        recurrence: existing.recurrence,
        labelIds: (existing.labels || []).map(l => l.id)
      });
    }

    return updated;
  }

  static async reopenTask(id, userId) {
    const existing = await TaskModel.findById(id, userId);
    if (!existing) {
      const error = new Error('Task not found');
      error.code = 'TASK_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    return TaskModel.update(id, userId, {
      status: 'todo',
      completed_at: null
    });
  }

  static async archiveTask(id, userId) {
    const existing = await TaskModel.findById(id, userId);
    if (!existing) {
      const error = new Error('Task not found');
      error.code = 'TASK_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    return TaskModel.update(id, userId, {
      status: 'archived'
    });
  }
}
