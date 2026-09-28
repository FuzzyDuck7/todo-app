import { TaskService } from '../services/taskService.js';
import { successResponse } from '../utils/response.js';

export class TaskController {
  static async getTasks(req, res, next) {
    try {
      const result = await TaskService.getTasks(req.user.id, req.query);
      return successResponse(res, result.tasks, 'Tasks retrieved successfully', 200, {
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTaskById(req, res, next) {
    try {
      const { id } = req.params;
      const task = await TaskService.getTaskById(id, req.user.id);
      return successResponse(res, task, 'Task details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createTask(req, res, next) {
    try {
      const task = await TaskService.createTask(req.user.id, req.body);
      return successResponse(res, task, 'Task created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateTask(req, res, next) {
    try {
      const { id } = req.params;
      const task = await TaskService.updateTask(id, req.user.id, req.body);
      return successResponse(res, task, 'Task updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteTask(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await TaskService.deleteTask(id, req.user.id);
      return successResponse(res, deleted, 'Task deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async completeTask(req, res, next) {
    try {
      const { id } = req.params;
      const completed = await TaskService.completeTask(id, req.user.id);
      return successResponse(res, completed, 'Task marked as completed');
    } catch (error) {
      next(error);
    }
  }

  static async reopenTask(req, res, next) {
    try {
      const { id } = req.params;
      const reopened = await TaskService.reopenTask(id, req.user.id);
      return successResponse(res, reopened, 'Task reopened successfully');
    } catch (error) {
      next(error);
    }
  }

  static async archiveTask(req, res, next) {
    try {
      const { id } = req.params;
      const archived = await TaskService.archiveTask(id, req.user.id);
      return successResponse(res, archived, 'Task archived successfully');
    } catch (error) {
      next(error);
    }
  }
}
