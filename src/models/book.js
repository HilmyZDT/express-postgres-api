'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Book can have many loans
      Book.hasMany(models.BookLoan, {
        foreignKey: 'bookId',
        as: 'bookLoans'
      });
    }
  }
  Book.init({
    title: DataTypes.STRING,
    author: DataTypes.STRING,
    isbn: DataTypes.STRING,
    publishedYear: DataTypes.INTEGER,
    genre: DataTypes.STRING,
    description: DataTypes.TEXT,
    availableCopies: DataTypes.INTEGER,
    totalCopies: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Book',
  });
  return Book;
};