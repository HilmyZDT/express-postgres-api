'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BookLoans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      bookId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Books',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      borrowDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      dueDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      returnDate: {
        type: Sequelize.DATE
      },
      status: {
        type: Sequelize.ENUM('borrowed', 'returned', 'overdue'),
        defaultValue: 'borrowed'
      },
      fine: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('BookLoans');
  }
};
