'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BookLoan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // BookLoan belongs to User
      BookLoan.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      
      // BookLoan belongs to Book
      BookLoan.belongsTo(models.Book, {
        foreignKey: 'bookId',
        as: 'book'
      });
    }
  }
  BookLoan.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    borrowDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    returnDate: DataTypes.DATE,
    status: {
      type: DataTypes.ENUM('borrowed', 'returned', 'overdue'),
      defaultValue: 'borrowed'
    },
    fine: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    }
  }, {
    sequelize,
    modelName: 'BookLoan',
  });
  return BookLoan;
};
