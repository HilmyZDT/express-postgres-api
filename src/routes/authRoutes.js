const express = require('express');
const limiter = require('../middleware/rateLimit');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', limiter, authController.login);

// Protected routes (require authentication)
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);
router.put('/change-password', authenticateToken, authController.changePassword);
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;
