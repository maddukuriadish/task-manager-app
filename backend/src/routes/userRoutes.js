const express = require('express');
const { getCurrentUser } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/users/me
 * Get current authenticated user's profile
 * 
 * PROTECTED ROUTE - Requires valid JWT token
 * 
 * How to call this:
 * Headers: { Authorization: "Bearer <token>" }
 */
router.get('/me', authenticateToken, getCurrentUser);
//                 ↑                  ↑
//                 Middleware          Controller
//                 (runs first)        (runs second)

module.exports = router;