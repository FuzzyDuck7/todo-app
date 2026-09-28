import { verifyToken } from '../utils/jwt.js';
import { UserModel } from '../models/UserModel.js';
import { errorResponse } from '../utils/response.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication token required', 'UNAUTHORIZED', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return errorResponse(res, 'Authentication token required', 'UNAUTHORIZED', 401);
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return errorResponse(res, 'Invalid or expired token', 'INVALID_TOKEN', 401);
    }

    // Verify user still exists in database
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 'User account no longer exists', 'USER_NOT_FOUND', 401);
    }

    // Attach authenticated user to request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    next();
  } catch (error) {
    return errorResponse(res, 'Authentication failed', 'UNAUTHORIZED', 401, error.message);
  }
};
