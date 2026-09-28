import { body, query } from 'express-validator';
import { validate } from '../middleware/validate.js';

export const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ max: 255 }).withMessage('Task title cannot exceed 255 characters'),
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent']).withMessage('Priority must be low, medium, high, or urgent'),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'completed', 'archived']).withMessage('Status must be todo, in_progress, completed, or archived'),
  body('dueDate')
    .optional({ nullable: true })
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Due date must be formatted as YYYY-MM-DD'),
  body('dueTime')
    .optional({ nullable: true }),
  body('estimatedMinutes')
    .optional({ nullable: true })
    .isInt({ min: 0 }).withMessage('Estimated duration must be a non-negative number of minutes'),
  body('recurrence')
    .optional()
    .isIn(['none', 'daily', 'weekly', 'monthly']).withMessage('Recurrence must be none, daily, weekly, or monthly'),
  body('labelIds')
    .optional()
    .isArray().withMessage('labelIds must be an array'),
  validate
];

export const updateTaskValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Task title cannot be empty')
    .isLength({ max: 255 }).withMessage('Task title cannot exceed 255 characters'),
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent']).withMessage('Priority must be low, medium, high, or urgent'),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'completed', 'archived']).withMessage('Status must be todo, in_progress, completed, or archived'),
  body('dueDate')
    .optional({ nullable: true })
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Due date must be formatted as YYYY-MM-DD'),
  body('dueTime')
    .optional({ nullable: true }),
  body('estimatedMinutes')
    .optional({ nullable: true })
    .isInt({ min: 0 }).withMessage('Estimated duration must be a non-negative number of minutes'),
  body('recurrence')
    .optional()
    .isIn(['none', 'daily', 'weekly', 'monthly']).withMessage('Recurrence must be none, daily, weekly, or monthly'),
  body('labelIds')
    .optional()
    .isArray().withMessage('labelIds must be an array'),
  validate
];

export const taskQueryValidator = [
  query('status')
    .optional()
    .isIn(['todo', 'in_progress', 'completed', 'archived', 'active']).withMessage('Invalid status filter'),
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority filter'),
  query('dueFilter')
    .optional()
    .isIn(['today', 'upcoming', 'overdue']).withMessage('Invalid dueFilter parameter'),
  query('sortBy')
    .optional()
    .isIn(['due_date', 'priority', 'created_at', 'updated_at', 'title', 'status']).withMessage('Invalid sortBy parameter'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc']).withMessage('Invalid sortOrder parameter'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validate
];
