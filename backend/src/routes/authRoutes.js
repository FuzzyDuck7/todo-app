import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator
} from '../validators/authValidator.js';

const router = Router();

router.post('/register', authLimiter, registerValidator, AuthController.register);
router.post('/login', authLimiter, loginValidator, AuthController.login);
router.post('/logout', AuthController.logout);

router.get('/me', authMiddleware, AuthController.getMe);
router.put('/profile', authMiddleware, updateProfileValidator, AuthController.updateProfile);
router.put('/change-password', authMiddleware, changePasswordValidator, AuthController.changePassword);

export default router;
