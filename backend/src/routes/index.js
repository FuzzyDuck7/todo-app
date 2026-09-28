import { Router } from 'express';
import authRoutes from './authRoutes.js';
import projectRoutes from './projectRoutes.js';
import taskRoutes from './taskRoutes.js';
import subtaskRoutes from './subtaskRoutes.js';
import labelRoutes from './labelRoutes.js';
import reminderRoutes from './reminderRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import { isSupabaseConfigured } from '../config/database.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TaskFlow API is healthy and operational',
    database: isSupabaseConfigured ? 'supabase_remote' : 'integrated_local',
    timestamp: new Date().toISOString()
  });
});

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/subtasks', subtaskRoutes);
router.use('/labels', labelRoutes);
router.use('/reminders', reminderRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
