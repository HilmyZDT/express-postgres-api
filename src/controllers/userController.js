const userService = require('../services/userService');

class UserController {
  // POST /api/users - Create user (Admin only)
  async createUser(req, res) {
    try {
      const { name, email, password, role = 'member', phone, address } = req.body;
      
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

      // Check if email already exists
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
      
      const user = await userService.createUser({ 
        name, 
        email, 
        password, 
        role, 
        phone, 
        address 
      });
      
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/users - Get all users with pagination (Admin/Librarian only)
  async getAllUsers(req, res) {
    try {
      const options = {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        role: req.query.role || '',
        search: req.query.search || ''
      };

      const result = await userService.getAllUsers(options);
      
      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/users/:id - Get user by ID (Admin/Librarian only)
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      
      res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: user
      });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // PUT /api/users/:id - Update user (Admin only)
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Check if email is being updated and if it already exists
      if (updateData.email) {
        const existingUser = await userService.getUserByEmail(updateData.email);
        if (existingUser && existingUser.id !== parseInt(id)) {
          return res.status(400).json({
            success: false,
            message: 'Email already exists'
          });
        }
      }
      
      const user = await userService.updateUser(id, updateData);
      
      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // DELETE /api/users/:id - Delete user (Admin only)
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      
      // Prevent deleting own account
      if (parseInt(id) === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account'
        });
      }

      const result = await userService.deleteUser(id);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/users/stats - Get user statistics (Admin only)
  async getUserStats(req, res) {
    try {
      const stats = await userService.getUserStats();
      
      res.status(200).json({
        success: true,
        message: 'User statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // PUT /api/users/:id/reset-password - Reset user password (Admin only)
  async resetUserPassword(req, res) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message: 'New password is required'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }

      const result = await userService.resetUserPassword(id, newPassword);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new UserController();
