import { ProjectService } from '../services/projectService.js';
import { successResponse } from '../utils/response.js';

export class ProjectController {
  static async getProjects(req, res, next) {
    try {
      const projects = await ProjectService.getUserProjects(req.user.id);
      return successResponse(res, projects, 'Projects retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getProjectById(req, res, next) {
    try {
      const { id } = req.params;
      const project = await ProjectService.getProjectById(id, req.user.id);
      return successResponse(res, project, 'Project details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createProject(req, res, next) {
    try {
      const { name, description, color } = req.body;
      const project = await ProjectService.createProject(req.user.id, { name, description, color });
      return successResponse(res, project, 'Project created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateProject(req, res, next) {
    try {
      const { id } = req.params;
      const project = await ProjectService.updateProject(id, req.user.id, req.body);
      return successResponse(res, project, 'Project updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteProject(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await ProjectService.deleteProject(id, req.user.id);
      return successResponse(res, deleted, 'Project deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
