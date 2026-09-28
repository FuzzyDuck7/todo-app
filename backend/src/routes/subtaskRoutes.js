import { Router } from 'express';
import { SubtaskController } from '../controllers/subtaskController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { updateSubtaskValidator } from '../validators/subtaskValidator.js';

const router = Router();

router.use(authMiddleware);

router.put('/:id', updateSubtaskValidator, SubtaskController.updateSubtask);
router.patch('/:id/complete', SubtaskController.toggleComplete);
router.delete('/:id', SubtaskController.deleteSubtask);

export default router;
