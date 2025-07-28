const { User, BookLoan } = require('../models');
const { Op } = require('sequelize');

class UserService {
  // Membuat user baru (Admin only)
  async createUser(userData) {
    try {
      const user = await User.create(userData);
      return user.toJSON(); // Excludes password
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  // Mendapatkan semua user dengan pagination
  async getAllUsers(options = {}) {
    try {
      const { page = 1, limit = 10, role = '', search = '' } = options;
      const offset = (page - 1) * limit;
      const whereClause = {};

      // Filter by role
      if (role) {
        whereClause.role = role;
      }

      // Search functionality
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { membershipNumber: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows } = await User.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['name', 'ASC']],
        include: [
          {
            association: 'bookLoans',
            where: { status: { [Op.in]: ['borrowed', 'overdue'] } },
            required: false,
            include: [{ association: 'book' }]
          }
        ]
      });

      return {
        users: rows,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit)
      };
    } catch (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
  }

  // Mendapatkan user berdasarkan ID
  async getUserById(id) {
    try {
      const user = await User.findByPk(id, {
        include: [
          {
            association: 'bookLoans',
            include: [{ association: 'book' }],
            order: [['borrowDate', 'DESC']]
          }
        ]
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  // Update user (Admin only)
  async updateUser(id, userData) {
    try {
      const user = await User.findByPk(id);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Remove sensitive fields that shouldn't be updated this way
      const allowedUpdates = ['name', 'email', 'role', 'phone', 'address', 'membershipNumber'];
      const filteredUpdates = {};
      
      Object.keys(userData).forEach(key => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = userData[key];
        }
      });

      await user.update(filteredUpdates);
      return user.toJSON();
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  // Hapus user (Admin only)
  async deleteUser(id) {
    try {
      const user = await User.findByPk(id);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Check if user has active loans
      const activeLoans = await BookLoan.count({
        where: {
          userId: id,
          status: { [Op.in]: ['borrowed', 'overdue'] }
        }
      });

      if (activeLoans > 0) {
        throw new Error('Cannot delete user with active book loans');
      }
      
      await user.destroy();
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  // Cari user berdasarkan email
  async getUserByEmail(email) {
    try {
      const user = await User.findOne({
        where: { email }
      });
      return user;
    } catch (error) {
      throw new Error(`Error fetching user by email: ${error.message}`);
    }
  }

  // Get user statistics (Admin only)
  async getUserStats() {
    try {
      const totalUsers = await User.count();
      const memberCount = await User.count({ where: { role: 'member' } });
      const librarianCount = await User.count({ where: { role: 'librarian' } });
      const adminCount = await User.count({ where: { role: 'admin' } });

      const activeLoans = await BookLoan.count({
        where: { status: { [Op.in]: ['borrowed', 'overdue'] } }
      });

      const overdueLoans = await BookLoan.count({
        where: { status: 'overdue' }
      });

      return {
        totalUsers,
        usersByRole: {
          members: memberCount,
          librarians: librarianCount,
          admins: adminCount
        },
        activeLoans,
        overdueLoans
      };
    } catch (error) {
      throw new Error(`Error fetching user statistics: ${error.message}`);
    }
  }

  // Reset user password (Admin only)
  async resetUserPassword(id, newPassword) {
    try {
      const user = await User.findByPk(id);
      
      if (!user) {
        throw new Error('User not found');
      }

      await user.update({ password: newPassword });
      return { message: 'Password reset successfully' };
    } catch (error) {
      throw new Error(`Error resetting password: ${error.message}`);
    }
  }
}

module.exports = new UserService();
