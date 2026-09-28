import { AuthService } from '../services/authService.js';
import { successResponse } from '../utils/response.js';

export class AuthController {
  static async register(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const result = await AuthService.register({ name, email, password });
      return successResponse(res, result, 'User registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });
      return successResponse(res, result, 'Logged in successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req, res, next) {
    try {
      const user = await AuthService.getProfile(req.user.id);
      return successResponse(res, { user }, 'User profile retrieved', 200);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const { name, avatar_url } = req.body;
      const updatedUser = await AuthService.updateProfile(req.user.id, { name, avatar_url });
      return successResponse(res, { user: updatedUser }, 'Profile updated successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await AuthService.changePassword(req.user.id, { currentPassword, newPassword });
      return successResponse(res, result, 'Password changed successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res) {
    // JWT is stateless on client; server acknowledges successful logout
    return successResponse(res, null, 'Logged out successfully', 200);
  }
}
