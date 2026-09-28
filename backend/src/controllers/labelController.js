import { LabelService } from '../services/labelService.js';
import { successResponse } from '../utils/response.js';

export class LabelController {
  static async getLabels(req, res, next) {
    try {
      const labels = await LabelService.getUserLabels(req.user.id);
      return successResponse(res, labels, 'Labels retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createLabel(req, res, next) {
    try {
      const { name, color } = req.body;
      const label = await LabelService.createLabel(req.user.id, { name, color });
      return successResponse(res, label, 'Label created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateLabel(req, res, next) {
    try {
      const { id } = req.params;
      const label = await LabelService.updateLabel(id, req.user.id, req.body);
      return successResponse(res, label, 'Label updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteLabel(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await LabelService.deleteLabel(id, req.user.id);
      return successResponse(res, deleted, 'Label deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
