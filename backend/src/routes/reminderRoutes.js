import { Router } from 'express';
import { ReminderController } from '../controllers/reminderController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', ReminderController.getReminders);
router.post('/', ReminderController.createReminder);
router.put('/:id', ReminderController.updateReminder);
router.delete('/:id', ReminderController.deleteReminder);

export default router;
