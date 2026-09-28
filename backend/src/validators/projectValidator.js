import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';

export const createProjectValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required')
    .isLength({ max: 100 }).withMessage('Project name cannot exceed 100 characters'),
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('color')
    .optional()
    .matches(/^#([0-9A-F]{3}){1,2}$/i).withMessage('Color must be a valid hex code (e.g. #6366f1)'),
  validate
];

export const updateProjectValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Project name cannot be empty')
    .isLength({ max: 100 }).withMessage('Project name cannot exceed 100 characters'),
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('color')
    .optional()
    .matches(/^#([0-9A-F]{3}){1,2}$/i).withMessage('Color must be a valid hex code'),
  validate
];
