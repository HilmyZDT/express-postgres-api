'use strict';
const bcrypt = require('bcryptjs');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // User can borrow many books
      User.hasMany(models.BookLoan, {
        foreignKey: 'userId',
        as: 'bookLoans'
      });
    }

    // Instance method to check password
    async checkPassword(password) {
      return await bcrypt.compare(password, this.password);
    }

    // Instance method to get user without password
    toJSON() {
      const user = { ...this.get() };
      delete user.password;
      return user;
    }
  }
  User.init({
    name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'librarian', 'member'),
      defaultValue: 'member'
    },
    membershipNumber: DataTypes.STRING,
    phone: DataTypes.STRING,
    address: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      }
    }
  });
  return User;
};