import { Router } from 'express';
import { TaskController } from '../controllers/taskController.js';
import { SubtaskController } from '../controllers/subtaskController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createTaskValidator, updateTaskValidator, taskQueryValidator } from '../validators/taskValidator.js';
import { createSubtaskValidator } from '../validators/subtaskValidator.js';

const router = Router();

// All task routes require authentication
router.use(authMiddleware);

router.get('/', taskQueryValidator, TaskController.getTasks);
router.post('/', createTaskValidator, TaskController.createTask);
router.get('/:id', TaskController.getTaskById);
router.put('/:id', updateTaskValidator, TaskController.updateTask);
router.delete('/:id', TaskController.deleteTask);

router.patch('/:id/complete', TaskController.completeTask);
router.patch('/:id/reopen', TaskController.reopenTask);
router.patch('/:id/archive', TaskController.archiveTask);

// Nested subtask routes on tasks
router.get('/:taskId/subtasks', SubtaskController.getSubtasks);
router.post('/:taskId/subtasks', createSubtaskValidator, SubtaskController.createSubtask);

export default router;
