import { Router } from 'express';
import { ProjectController } from '../controllers/projectController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createProjectValidator, updateProjectValidator } from '../validators/projectValidator.js';

const router = Router();

// All project routes require authentication
router.use(authMiddleware);

router.get('/', ProjectController.getProjects);
router.post('/', createProjectValidator, ProjectController.createProject);
router.get('/:id', ProjectController.getProjectById);
router.put('/:id', updateProjectValidator, ProjectController.updateProject);
router.delete('/:id', ProjectController.deleteProject);

export default router;
