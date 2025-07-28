const appError = require('../utils/AppError');
const response = require('../utils/response');
const authService = require('../services/authService');

class AuthController {
  // POST /api/auth/register
  async register(req, res) {
    try {
      const { name, email, password, phone, address } = req.body;

      // Validation
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and password are required'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }

      const result = await authService.register({
        name,
        email,
        password,
        phone,
        address
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/auth/login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new appError('Email and password are required', 400);
      }

      const result = await authService.login(email, password);

      return response.success(res, result, 'Login successful');
    } catch (error) {
      return response.error(res, error, 401);
    }
  }

  // GET /api/auth/profile
  async getProfile(req, res) {
    try {
      const user = await authService.getProfile(req.user.id);

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: user
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // PUT /api/auth/profile
  async updateProfile(req, res) {
    try {
      const { name, phone, address } = req.body;
      
      const user = await authService.updateProfile(req.user.id, {
        name,
        phone,
        address
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // PUT /api/auth/change-password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long'
        });
      }

      const result = await authService.changePassword(
        req.user.id,
        currentPassword,
        newPassword
      );

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/auth/logout (mainly for client-side token removal)
  async logout(req, res) {
    res.status(200).json({
      success: true,
      message: 'Logout successful. Please remove the token from client storage.'
    });
  }
}

module.exports = new AuthController();
