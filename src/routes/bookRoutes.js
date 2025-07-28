const express = require('express');
const bookController = require('../controllers/bookController');
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

// Protected routes that need to come before /:id routes
router.get('/my-borrowed', authenticateToken, bookController.getMyBorrowedBooks);
router.get('/my-history', authenticateToken, bookController.getMyLoanHistory);
router.get('/loans', authenticateToken, authorize('admin', 'librarian'), bookController.getAllLoans);
router.put('/loans/:loanId/return', authenticateToken, bookController.returnBook);
router.put('/update-overdue', authenticateToken, authorize('admin', 'librarian'), bookController.updateOverdueStatus);

// Public routes (can view books without authentication)
router.get('/', bookController.getAllBooks);
router.get('/:id', bookController.getBookById);

// Protected routes with :id parameter
router.post('/:id/borrow', authenticateToken, bookController.borrowBook);

// Admin/Librarian only routes
router.post('/', authenticateToken, authorize('admin', 'librarian'), bookController.createBook);
router.put('/:id', authenticateToken, authorize('admin', 'librarian'), bookController.updateBook);

// Admin only routes
router.delete('/:id', authenticateToken, authorize('admin'), bookController.deleteBook);

module.exports = router;
