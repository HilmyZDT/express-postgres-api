const { Book, BookLoan, User } = require('../models');
const { Op } = require('sequelize');

class BookService {
  // Create new book
  async createBook(bookData) {
    try {
      const book = await Book.create(bookData);
      return book;
    } catch (error) {
      throw new Error(`Error creating book: ${error.message}`);
    }
  }

  // Get all books with pagination and filters
  async getAllBooks(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        genre = '',
        author = '',
        availableOnly = false
      } = options;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Add search functionality
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { author: { [Op.iLike]: `%${search}%` } },
          { isbn: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Filter by genre
      if (genre) {
        whereClause.genre = { [Op.iLike]: `%${genre}%` };
      }

      // Filter by author
      if (author) {
        whereClause.author = { [Op.iLike]: `%${author}%` };
      }

      // Filter available books only
      if (availableOnly) {
        whereClause.availableCopies = { [Op.gt]: 0 };
      }

      const { count, rows } = await Book.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['title', 'ASC']]
      });

      return {
        books: rows,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit)
      };
    } catch (error) {
      throw new Error(`Error fetching books: ${error.message}`);
    }
  }

  // Get book by ID
  async getBookById(id) {
    try {
      const book = await Book.findByPk(id, {
        include: [
          {
            association: 'bookLoans',
            include: [
              {
                association: 'user',
                attributes: ['id', 'name', 'email', 'membershipNumber']
              }
            ],
            where: { status: { [Op.in]: ['borrowed', 'overdue'] } },
            required: false
          }
        ]
      });

      if (!book) {
        throw new Error('Book not found');
      }

      return book;
    } catch (error) {
      throw new Error(`Error fetching book: ${error.message}`);
    }
  }

  // Update book
  async updateBook(id, bookData) {
    try {
      const book = await Book.findByPk(id);
      if (!book) {
        throw new Error('Book not found');
      }

      await book.update(bookData);
      return book;
    } catch (error) {
      throw new Error(`Error updating book: ${error.message}`);
    }
  }

  // Delete book
  async deleteBook(id) {
    try {
      const book = await Book.findByPk(id);
      if (!book) {
        throw new Error('Book not found');
      }

      // Check if book has active loans
      const activeLoans = await BookLoan.count({
        where: {
          bookId: id,
          status: { [Op.in]: ['borrowed', 'overdue'] }
        }
      });

      if (activeLoans > 0) {
        throw new Error('Cannot delete book with active loans');
      }

      await book.destroy();
      return { message: 'Book deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting book: ${error.message}`);
    }
  }

  // Borrow book
  async borrowBook(bookId, userId, loanDays = 14) {
    try {
      const book = await Book.findByPk(bookId);
      if (!book) {
        throw new Error('Book not found');
      }

      if (book.availableCopies <= 0) {
        throw new Error('No available copies');
      }

      // Check if user already has this book borrowed
      const existingLoan = await BookLoan.findOne({
        where: {
          bookId,
          userId,
          status: { [Op.in]: ['borrowed', 'overdue'] }
        }
      });

      if (existingLoan) {
        throw new Error('You already have this book borrowed');
      }

      // Check user's borrowing limit (max 5 books)
      const userActiveLoans = await BookLoan.count({
        where: {
          userId,
          status: { [Op.in]: ['borrowed', 'overdue'] }
        }
      });

      if (userActiveLoans >= 5) {
        throw new Error('Maximum borrowing limit reached (5 books)');
      }

      // Calculate due date
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + loanDays);

      // Create loan record
      const loan = await BookLoan.create({
        bookId,
        userId,
        dueDate,
        status: 'borrowed'
      });

      // Decrease available copies
      await book.update({
        availableCopies: book.availableCopies - 1
      });

      // Return loan with book and user details
      const loanWithDetails = await BookLoan.findByPk(loan.id, {
        include: [
          { association: 'book' },
          { association: 'user', attributes: ['id', 'name', 'email', 'membershipNumber'] }
        ]
      });

      return loanWithDetails;
    } catch (error) {
      throw new Error(`Error borrowing book: ${error.message}`);
    }
  }

  // Return book
  async returnBook(loanId, userId) {
    try {
      const loan = await BookLoan.findOne({
        where: {
          id: loanId,
          userId,
          status: { [Op.in]: ['borrowed', 'overdue'] }
        },
        include: [{ association: 'book' }]
      });

      if (!loan) {
        throw new Error('Loan not found or already returned');
      }

      const returnDate = new Date();
      let fine = 0;

      // Calculate fine if overdue
      if (returnDate > loan.dueDate) {
        const overdueDays = Math.ceil((returnDate - loan.dueDate) / (1000 * 60 * 60 * 24));
        fine = overdueDays * 1.00; // $1 per day
      }

      // Update loan record
      await loan.update({
        returnDate,
        status: 'returned',
        fine
      });

      // Increase available copies
      await loan.book.update({
        availableCopies: loan.book.availableCopies + 1
      });

      return {
        loan,
        fine,
        message: fine > 0 ? `Book returned with fine: $${fine}` : 'Book returned successfully'
      };
    } catch (error) {
      throw new Error(`Error returning book: ${error.message}`);
    }
  }

  // Get user's borrowed books
  async getUserBorrowedBooks(userId) {
    try {
      const loans = await BookLoan.findAll({
        where: {
          userId,
          status: { [Op.in]: ['borrowed', 'overdue'] }
        },
        include: [{ association: 'book' }],
        order: [['borrowDate', 'DESC']]
      });

      return loans;
    } catch (error) {
      throw new Error(`Error fetching borrowed books: ${error.message}`);
    }
  }

  // Get loan history
  async getLoanHistory(userId, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const offset = (page - 1) * limit;

      const { count, rows } = await BookLoan.findAndCountAll({
        where: { userId },
        include: [{ association: 'book' }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['borrowDate', 'DESC']]
      });

      return {
        loans: rows,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page)
      };
    } catch (error) {
      throw new Error(`Error fetching loan history: ${error.message}`);
    }
  }

  // Admin: Get all loans
  async getAllLoans(options = {}) {
    try {
      const { page = 1, limit = 10, status = '' } = options;
      const offset = (page - 1) * limit;
      const whereClause = {};

      if (status) {
        whereClause.status = status;
      }

      const { count, rows } = await BookLoan.findAndCountAll({
        where: whereClause,
        include: [
          { association: 'book' },
          { association: 'user', attributes: ['id', 'name', 'email', 'membershipNumber'] }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['borrowDate', 'DESC']]
      });

      return {
        loans: rows,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page)
      };
    } catch (error) {
      throw new Error(`Error fetching all loans: ${error.message}`);
    }
  }

  // Update overdue status
  async updateOverdueStatus() {
    try {
      const overdueLoans = await BookLoan.findAll({
        where: {
          status: 'borrowed',
          dueDate: { [Op.lt]: new Date() }
        }
      });

      for (const loan of overdueLoans) {
        await loan.update({ status: 'overdue' });
      }

      return { updated: overdueLoans.length };
    } catch (error) {
      throw new Error(`Error updating overdue status: ${error.message}`);
    }
  }
}

module.exports = new BookService();
