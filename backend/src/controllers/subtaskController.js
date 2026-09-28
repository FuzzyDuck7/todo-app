import { SubtaskService } from '../services/subtaskService.js';
import { successResponse } from '../utils/response.js';

export class SubtaskController {
  static async getSubtasks(req, res, next) {
    try {
      const { taskId } = req.params;
      const subtasks = await SubtaskService.getSubtasks(taskId, req.user.id);
      return successResponse(res, subtasks, 'Subtasks retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createSubtask(req, res, next) {
    try {
      const { taskId } = req.params;
      const { title } = req.body;
      const subtask = await SubtaskService.createSubtask(taskId, req.user.id, { title });
      return successResponse(res, subtask, 'Subtask created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateSubtask(req, res, next) {
    try {
      const { id } = req.params;
      const subtask = await SubtaskService.updateSubtask(id, req.user.id, req.body);
      return successResponse(res, subtask, 'Subtask updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async toggleComplete(req, res, next) {
    try {
      const { id } = req.params;
      const subtask = await SubtaskService.toggleComplete(id, req.user.id);
      return successResponse(res, subtask, 'Subtask status toggled successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteSubtask(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await SubtaskService.deleteSubtask(id, req.user.id);
      return successResponse(res, deleted, 'Subtask deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
