import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';

export const createSubtaskValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Subtask title is required')
    .isLength({ max: 255 }).withMessage('Subtask title cannot exceed 255 characters'),
  validate
];

export const updateSubtaskValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Subtask title cannot be empty')
    .isLength({ max: 255 }).withMessage('Subtask title cannot exceed 255 characters'),
  body('completed')
    .optional()
    .isBoolean().withMessage('Completed must be a boolean'),
  validate
];
