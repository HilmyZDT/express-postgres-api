'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new columns to Users table
    await queryInterface.addColumn('Users', 'role', {
      type: Sequelize.ENUM('admin', 'librarian', 'member'),
      defaultValue: 'member',
      allowNull: false
    });
    
    await queryInterface.addColumn('Users', 'membershipNumber', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Users', 'phone', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Users', 'address', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // Add unique constraint to email
    await queryInterface.addConstraint('Users', {
      fields: ['email'],
      type: 'unique',
      name: 'users_email_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the columns
    await queryInterface.removeColumn('Users', 'role');
    await queryInterface.removeColumn('Users', 'membershipNumber');
    await queryInterface.removeColumn('Users', 'phone');
    await queryInterface.removeColumn('Users', 'address');
    
    // Remove unique constraint
    await queryInterface.removeConstraint('Users', 'users_email_unique');
  }
};
