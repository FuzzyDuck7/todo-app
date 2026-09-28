import { ReminderModel } from '../models/ReminderModel.js';
import { TaskModel } from '../models/TaskModel.js';

export class ReminderService {
  static async getUserReminders(userId) {
    return ReminderModel.findByUserId(userId);
  }

  static async createReminder(userId, { taskId, remindAt }) {
    if (!taskId || !remindAt) {
      const error = new Error('Task ID and remind_at timestamp are required');
      error.code = 'VALIDATION_ERROR';
      error.statusCode = 400;
      throw error;
    }

    const task = await TaskModel.findById(taskId, userId);
    if (!task) {
      const error = new Error('Task not found');
      error.code = 'TASK_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    return ReminderModel.create({ userId, taskId, remindAt });
  }

  static async updateReminder(id, userId, updates) {
    const existing = await ReminderModel.findById(id, userId);
    if (!existing) {
      const error = new Error('Reminder not found');
      error.code = 'REMINDER_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    return ReminderModel.update(id, userId, updates);
  }

  static async deleteReminder(id, userId) {
    const existing = await ReminderModel.findById(id, userId);
    if (!existing) {
      const error = new Error('Reminder not found');
      error.code = 'REMINDER_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    return ReminderModel.delete(id, userId);
  }
}
