import { ReminderService } from '../services/reminderService.js';
import { successResponse } from '../utils/response.js';

export class ReminderController {
  static async getReminders(req, res, next) {
    try {
      const reminders = await ReminderService.getUserReminders(req.user.id);
      return successResponse(res, reminders, 'Reminders retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createReminder(req, res, next) {
    try {
      const { taskId, remindAt } = req.body;
      const reminder = await ReminderService.createReminder(req.user.id, { taskId, remindAt });
      return successResponse(res, reminder, 'Reminder created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateReminder(req, res, next) {
    try {
      const { id } = req.params;
      const reminder = await ReminderService.updateReminder(id, req.user.id, req.body);
      return successResponse(res, reminder, 'Reminder updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteReminder(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await ReminderService.deleteReminder(id, req.user.id);
      return successResponse(res, deleted, 'Reminder deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
