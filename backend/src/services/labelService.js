import { LabelModel } from '../models/LabelModel.js';

export class LabelService {
  static async getUserLabels(userId) {
    return LabelModel.findByUserId(userId);
  }

  static async createLabel(userId, { name, color }) {
    if (!name || !name.trim()) {
      const error = new Error('Label name is required');
      error.code = 'VALIDATION_ERROR';
      error.statusCode = 400;
      throw error;
    }
    return LabelModel.create({ userId, name, color });
  }

  static async updateLabel(id, userId, updates) {
    const existing = await LabelModel.findById(id, userId);
    if (!existing) {
      const error = new Error('Label not found');
      error.code = 'LABEL_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    return LabelModel.update(id, userId, updates);
  }

  static async deleteLabel(id, userId) {
    const existing = await LabelModel.findById(id, userId);
    if (!existing) {
      const error = new Error('Label not found');
      error.code = 'LABEL_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    return LabelModel.delete(id, userId);
  }
}
