const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

class AuthService {
  // Generate JWT token
  generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
  }

  // Register new user
  async register(userData) {
    try {
      const { name, email, password, role = 'member', phone, address } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error('Email already registered');
      }

      // Generate membership number
      const membershipNumber = this.generateMembershipNumber();

      // Create user
      const user = await User.create({
        name,
        email,
        password, // Will be hashed by the model hook
        role,
        membershipNumber,
        phone,
        address
      });

      // Generate token
      const token = this.generateToken(user.id);

      return {
        user: user.toJSON(), // This excludes password
        token
      };
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  // Login user
  async login(email, password) {
    try {
      // Find user with password included
      const user = await User.findOne({ 
        where: { email },
        attributes: { include: ['password'] }
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check password
      const isValidPassword = await user.checkPassword(password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Generate token
      const token = this.generateToken(user.id);

      return {
        user: user.toJSON(), // This excludes password
        token
      };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  // Get user profile
  async getProfile(userId) {
    try {
      const user = await User.findByPk(userId, {
        include: [
          {
            association: 'bookLoans',
            include: [{ association: 'book' }]
          }
        ]
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw new Error(`Error fetching profile: ${error.message}`);
    }
  }

  // Update user profile
  async updateProfile(userId, updateData) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Remove sensitive fields from update
      const allowedUpdates = ['name', 'phone', 'address'];
      const filteredUpdates = {};
      
      Object.keys(updateData).forEach(key => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = updateData[key];
        }
      });

      await user.update(filteredUpdates);
      return user.toJSON();
    } catch (error) {
      throw new Error(`Error updating profile: ${error.message}`);
    }
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findByPk(userId, {
        attributes: { include: ['password'] }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isValidPassword = await user.checkPassword(currentPassword);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Update password (will be hashed by model hook)
      await user.update({ password: newPassword });

      return { message: 'Password changed successfully' };
    } catch (error) {
      throw new Error(`Error changing password: ${error.message}`);
    }
  }

  // Generate membership number
  generateMembershipNumber() {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `LIB${timestamp.slice(-6)}${random}`;
  }
}

module.exports = new AuthService();
