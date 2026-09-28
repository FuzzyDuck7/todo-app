import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';

export const createLabelValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Label name is required')
    .isLength({ max: 50 }).withMessage('Label name cannot exceed 50 characters'),
  body('color')
    .optional()
    .matches(/^#([0-9A-F]{3}){1,2}$/i).withMessage('Color must be a valid hex code'),
  validate
];

export const updateLabelValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Label name cannot be empty')
    .isLength({ max: 50 }).withMessage('Label name cannot exceed 50 characters'),
  body('color')
    .optional()
    .matches(/^#([0-9A-F]{3}){1,2}$/i).withMessage('Color must be a valid hex code'),
  validate
];
