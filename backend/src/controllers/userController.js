const { findUserById } = require('../models/userModel');

/**
 * Get current authenticated user's profile
 * 
 * This route is PROTECTED - only works if valid JWT token is sent
 * 
 * Flow:
 * 1. User sends request with JWT token in Authorization header
 * 2. Auth middleware verifies token and extracts userId
 * 3. Auth middleware attaches user info to req.user
 * 4. This controller runs and fetches user from database
 * 5. Returns user profile
 */
const getCurrentUser = async (req, res) => {
  try {
    // req.user was set by auth middleware!
    // It contains: { userId: 1, email: "john@example.com" }
    const userId = req.user.userId;

    // Fetch fresh user data from database
    // Why not just use data from token?
    // - Token might be old, user data might have changed (name, email, etc.)
    // - Database is source of truth
    const user = await findUserById(userId);

    if (!user) {
      // User was deleted but token is still valid
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // Return user profile
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
      },
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Server error fetching user' });
  }
};

module.exports = {
  getCurrentUser,
};