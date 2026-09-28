import { AnalyticsService } from '../services/analyticsService.js';
import { successResponse } from '../utils/response.js';

export class AnalyticsController {
  static async getSummary(req, res, next) {
    try {
      const summary = await AnalyticsService.getSummary(req.user.id);
      return successResponse(res, summary, 'Analytics summary retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getCompletion(req, res, next) {
    try {
      const days = parseInt(req.query.days, 10) || 14;
      const trends = await AnalyticsService.getCompletionTrends(req.user.id, days);
      return successResponse(res, trends, 'Completion trends retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getPriorities(req, res, next) {
    try {
      const priorities = await AnalyticsService.getPrioritiesBreakdown(req.user.id);
      return successResponse(res, priorities, 'Priorities breakdown retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getProjects(req, res, next) {
    try {
      const projects = await AnalyticsService.getProjectsBreakdown(req.user.id);
      return successResponse(res, projects, 'Projects breakdown retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getStatus(req, res, next) {
    try {
      const statuses = await AnalyticsService.getStatusBreakdown(req.user.id);
      return successResponse(res, statuses, 'Status breakdown retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getInsights(req, res, next) {
    try {
      const insights = await AnalyticsService.getInsights(req.user.id);
      return successResponse(res, insights, 'Productivity insights retrieved');
    } catch (error) {
      next(error);
    }
  }
}
