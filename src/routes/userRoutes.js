const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

// Admin/Librarian only routes
router.get('/', authenticateToken, authorize('admin', 'librarian'), userController.getAllUsers);
router.get('/stats', authenticateToken, authorize('admin'), userController.getUserStats);
router.get('/:id', authenticateToken, authorize('admin', 'librarian'), userController.getUserById);

// Admin only routes
router.post('/', authenticateToken, authorize('admin'), userController.createUser);
router.put('/:id', authenticateToken, authorize('admin'), userController.updateUser);
router.delete('/:id', authenticateToken, authorize('admin'), userController.deleteUser);
router.put('/:id/reset-password', authenticateToken, authorize('admin'), userController.resetUserPassword);

module.exports = router;
