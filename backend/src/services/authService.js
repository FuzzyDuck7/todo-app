import bcrypt from 'bcryptjs';
import { UserModel } from '../models/UserModel.js';
import { generateToken } from '../utils/jwt.js';

export class AuthService {
  static async register({ name, email, password }) {
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      const error = new Error('A user with this email already exists');
      error.code = 'EMAIL_EXISTS';
      error.statusCode = 409;
      throw error;
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const user = await UserModel.create({
      name,
      email,
      password_hash
    });

    const token = generateToken(user.id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        created_at: user.created_at
      },
      token
    };
  }

  static async login({ email, password }) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password');
      error.code = 'INVALID_CREDENTIALS';
      error.statusCode = 401;
      throw error;
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      const error = new Error('Invalid email or password');
      error.code = 'INVALID_CREDENTIALS';
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken(user.id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        created_at: user.created_at
      },
      token
    };
  }

  static async getProfile(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.code = 'USER_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  static async updateProfile(userId, { name, avatar_url }) {
    const updates = {};
    if (name) updates.name = name.trim();
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    const updatedUser = await UserModel.update(userId, updates);
    if (!updatedUser) {
      const error = new Error('User not found');
      error.code = 'USER_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    return updatedUser;
  }

  static async changePassword(userId, { currentPassword, newPassword }) {
    const userWithPassword = await UserModel.findByIdWithPassword(userId);
    if (!userWithPassword) {
      const error = new Error('User not found');
      error.code = 'USER_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await bcrypt.compare(currentPassword, userWithPassword.password_hash);
    if (!isMatch) {
      const error = new Error('Current password does not match');
      error.code = 'INCORRECT_PASSWORD';
      error.statusCode = 400;
      throw error;
    }

    const saltRounds = 10;
    const newHash = await bcrypt.hash(newPassword, saltRounds);
    await UserModel.updatePassword(userId, newHash);

    return { message: 'Password updated successfully' };
  }
}
