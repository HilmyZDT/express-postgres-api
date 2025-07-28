'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert Users
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    await queryInterface.bulkInsert('Users', [
      {
        name: 'Admin User',
        email: 'admin@library.com',
        password: hashedPassword,
        role: 'admin',
        membershipNumber: 'LIB001001',
        phone: '+1234567890',
        address: '123 Admin Street',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Librarian Jane',
        email: 'librarian@library.com',
        password: hashedPassword,
        role: 'librarian',
        membershipNumber: 'LIB001002',
        phone: '+1234567891',
        address: '456 Librarian Ave',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'John Member',
        email: 'member1@library.com',
        password: hashedPassword,
        role: 'member',
        membershipNumber: 'LIB001003',
        phone: '+1234567892',
        address: '789 Member Blvd',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Alice Reader',
        email: 'member2@library.com',
        password: hashedPassword,
        role: 'member',
        membershipNumber: 'LIB001004',
        phone: '+1234567893',
        address: '321 Reader Lane',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // Insert Books
    await queryInterface.bulkInsert('Books', [
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '978-0-7432-7356-5',
        publishedYear: 1925,
        genre: 'Fiction',
        description: 'A classic American novel set in the summer of 1922.',
        totalCopies: 3,
        availableCopies: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '978-0-06-112008-4',
        publishedYear: 1960,
        genre: 'Fiction',
        description: 'A novel about racial injustice and childhood in the American South.',
        totalCopies: 2,
        availableCopies: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: '1984',
        author: 'George Orwell',
        isbn: '978-0-452-28423-4',
        publishedYear: 1949,
        genre: 'Dystopian Fiction',
        description: 'A dystopian social science fiction novel.',
        totalCopies: 4,
        availableCopies: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        isbn: '978-0-14-143951-8',
        publishedYear: 1813,
        genre: 'Romance',
        description: 'A romantic novel of manners.',
        totalCopies: 2,
        availableCopies: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'The Catcher in the Rye',
        author: 'J.D. Salinger',
        isbn: '978-0-316-76948-0',
        publishedYear: 1951,
        genre: 'Fiction',
        description: 'A controversial novel about teenage rebellion.',
        totalCopies: 3,
        availableCopies: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '978-0-13-235088-4',
        publishedYear: 2008,
        genre: 'Technology',
        description: 'A handbook of agile software craftsmanship.',
        totalCopies: 5,
        availableCopies: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'JavaScript: The Good Parts',
        author: 'Douglas Crockford',
        isbn: '978-0-596-51774-8',
        publishedYear: 2008,
        genre: 'Technology',
        description: 'A guide to the good parts of JavaScript.',
        totalCopies: 4,
        availableCopies: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'The Art of War',
        author: 'Sun Tzu',
        isbn: '978-1-59030-963-7',
        publishedYear: -500,
        genre: 'Philosophy',
        description: 'An ancient Chinese military treatise.',
        totalCopies: 2,
        availableCopies: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Books', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};
