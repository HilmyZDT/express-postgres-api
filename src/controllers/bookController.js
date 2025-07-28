const bookService = require('../services/bookService');

class BookController {
  // POST /api/books - Create book (Admin/Librarian only)
  async createBook(req, res) {
    try {
      const { title, author, isbn, publishedYear, genre, description, totalCopies } = req.body;

      if (!title || !author) {
        return res.status(400).json({
          success: false,
          message: 'Title and author are required'
        });
      }

      const bookData = {
        title,
        author,
        isbn,
        publishedYear,
        genre,
        description,
        totalCopies: totalCopies || 1,
        availableCopies: totalCopies || 1
      };

      const book = await bookService.createBook(bookData);

      res.status(201).json({
        success: true,
        message: 'Book created successfully',
        data: book
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/books - Get all books with filtering and pagination
  async getAllBooks(req, res) {
    try {
      const options = {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        search: req.query.search || '',
        genre: req.query.genre || '',
        author: req.query.author || '',
        availableOnly: req.query.availableOnly === 'true'
      };

      const result = await bookService.getAllBooks(options);

      res.status(200).json({
        success: true,
        message: 'Books retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/books/:id - Get book by ID
  async getBookById(req, res) {
    try {
      const { id } = req.params;
      const book = await bookService.getBookById(id);

      res.status(200).json({
        success: true,
        message: 'Book retrieved successfully',
        data: book
      });
    } catch (error) {
      if (error.message === 'Book not found') {
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

  // PUT /api/books/:id - Update book (Admin/Librarian only)
  async updateBook(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const book = await bookService.updateBook(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Book updated successfully',
        data: book
      });
    } catch (error) {
      if (error.message === 'Book not found') {
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

  // DELETE /api/books/:id - Delete book (Admin only)
  async deleteBook(req, res) {
    try {
      const { id } = req.params;
      const result = await bookService.deleteBook(id);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      if (error.message === 'Book not found') {
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

  // POST /api/books/:id/borrow - Borrow book
  async borrowBook(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { loanDays = 14 } = req.body;

      const loan = await bookService.borrowBook(id, userId, loanDays);

      res.status(201).json({
        success: true,
        message: 'Book borrowed successfully',
        data: loan
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // PUT /api/books/loans/:loanId/return - Return book
  async returnBook(req, res) {
    try {
      const { loanId } = req.params;
      const userId = req.user.id;

      const result = await bookService.returnBook(loanId, userId);

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          loan: result.loan,
          fine: result.fine
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/books/my-borrowed - Get user's borrowed books
  async getMyBorrowedBooks(req, res) {
    try {
      const userId = req.user.id;
      const books = await bookService.getUserBorrowedBooks(userId);

      res.status(200).json({
        success: true,
        message: 'Borrowed books retrieved successfully',
        data: books
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/books/my-history - Get user's loan history
  async getMyLoanHistory(req, res) {
    try {
      const userId = req.user.id;
      const options = {
        page: req.query.page || 1,
        limit: req.query.limit || 10
      };

      const result = await bookService.getLoanHistory(userId, options);

      res.status(200).json({
        success: true,
        message: 'Loan history retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/books/loans - Get all loans (Admin/Librarian only)
  async getAllLoans(req, res) {
    try {
      const options = {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        status: req.query.status || ''
      };

      const result = await bookService.getAllLoans(options);

      res.status(200).json({
        success: true,
        message: 'All loans retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // PUT /api/books/update-overdue - Update overdue status (Admin/Librarian only)
  async updateOverdueStatus(req, res) {
    try {
      const result = await bookService.updateOverdueStatus();

      res.status(200).json({
        success: true,
        message: `Updated ${result.updated} overdue loans`,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new BookController();
