import { SubtaskModel } from '../models/SubtaskModel.js';
import { TaskModel } from '../models/TaskModel.js';

export class SubtaskService {
  static async getSubtasks(taskId, userId) {
    const parent = await TaskModel.findById(taskId, userId);
    if (!parent) {
      const error = new Error('Task not found');
      error.code = 'TASK_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    return SubtaskModel.findByTaskId(taskId, userId);
  }

  static async createSubtask(taskId, userId, { title }) {
    if (!title || !title.trim()) {
      const error = new Error('Subtask title is required');
      error.code = 'VALIDATION_ERROR';
      error.statusCode = 400;
      throw error;
    }

    const parent = await TaskModel.findById(taskId, userId);
    if (!parent) {
      const error = new Error('Task not found');
      error.code = 'TASK_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    return SubtaskModel.create({ taskId, userId, title });
  }

  static async updateSubtask(id, userId, updates) {
    const existing = await SubtaskModel.findById(id, userId);
    if (!existing) {
      const error = new Error('Subtask not found');
      error.code = 'SUBTASK_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    return SubtaskModel.update(id, userId, updates);
  }

  static async toggleComplete(id, userId) {
    const existing = await SubtaskModel.findById(id, userId);
    if (!existing) {
      const error = new Error('Subtask not found');
      error.code = 'SUBTASK_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    return SubtaskModel.update(id, userId, {
      completed: !existing.completed
    });
  }

  static async deleteSubtask(id, userId) {
    const existing = await SubtaskModel.findById(id, userId);
    if (!existing) {
      const error = new Error('Subtask not found');
      error.code = 'SUBTASK_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    return SubtaskModel.delete(id, userId);
  }
}
