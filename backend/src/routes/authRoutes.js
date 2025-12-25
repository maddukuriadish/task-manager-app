const express = require('express');
const { signup, login } = require('../controllers/authController');

const router = express.Router();

/**
 * POST /api/auth/signup
 * Public route (no authentication required)
 * 
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "password": "securepassword",
 *   "name": "John Doe"
 * }
 */
router.post('/signup', signup);

/**
 * POST /api/auth/login
 * Login existing user
 */
router.post('/login', login); // ← Add this route

module.exports = router;