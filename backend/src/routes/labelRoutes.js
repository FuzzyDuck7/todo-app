import { Router } from 'express';
import { LabelController } from '../controllers/labelController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createLabelValidator, updateLabelValidator } from '../validators/labelValidator.js';

const router = Router();

router.use(authMiddleware);

router.get('/', LabelController.getLabels);
router.post('/', createLabelValidator, LabelController.createLabel);
router.put('/:id', updateLabelValidator, LabelController.updateLabel);
router.delete('/:id', LabelController.deleteLabel);

export default router;
