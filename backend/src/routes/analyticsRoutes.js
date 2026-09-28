import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/summary', AnalyticsController.getSummary);
router.get('/completion', AnalyticsController.getCompletion);
router.get('/priorities', AnalyticsController.getPriorities);
router.get('/projects', AnalyticsController.getProjects);
router.get('/status', AnalyticsController.getStatus);
router.get('/insights', AnalyticsController.getInsights);

export default router;
