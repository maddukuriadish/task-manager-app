const { createUser, findUserByEmail } = require('../models/userModel'); // ← Update this line
const bcrypt = require('bcryptjs'); // ← Add this if not already there
const jwt = require('jsonwebtoken'); // ← Add this

/**
 * Handle user registration
 * 
 * Flow:
 * 1. User submits signup form
 * 2. Frontend sends POST to /api/auth/signup
 * 3. This function runs
 * 4. Validates data, creates user, returns success
 */
const signup = async (req, res) => {
  try {
    // Extract data from request body
    const { email, password, name } = req.body;

    // Basic validation
    // Why here AND in database? Defense in depth!
    // - Faster to reject bad requests early
    // - Better error messages for users
    // - Database constraints are last line of defense
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Email, password, and name are required',
      });
    }

    // Email format validation (basic)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
      });
    }

    // Password strength check
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters',
      });
    }

    // Call model to create user
    const user = await createUser(email, password, name);

    // Success! Return user data (NOT password)
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    // Handle errors
    if (error.message === 'Email already exists') {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Log error for debugging (in production, use proper logging)
    console.error('Signup error:', error);
    
    // Don't expose internal errors to users (security)
    res.status(500).json({ error: 'Server error during signup' });
  }
};

/**
 * Handle user login
 * 
 * Flow:
 * 1. User submits email/password
 * 2. Find user in database
 * 3. Verify password matches stored hash
 * 4. Generate JWT token
 * 5. Return token to user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    // Find user by email
    const user = await findUserByEmail(email);

    if (!user) {
      // User doesn't exist
      // Security note: Don't reveal "email not found" vs "wrong password"
      // Both return same generic message to prevent user enumeration
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }

    // Verify password
    // bcrypt.compare() hashes the input password and compares with stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      // Password doesn't match
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }

    // Password is correct! Generate JWT token
    // Token payload - data stored IN the token (anyone can decode this!)
    const tokenPayload = {
      userId: user.id,
      email: user.email,
    };

    // Sign the token with secret key
    // This creates a signature that proves we generated it
    // exp: expiration time
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' } // Default 7 days
    );

    // Success! Return token and user info
    res.status(200).json({
      message: 'Login successful',
      token: token, // Frontend will store this and send with future requests
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

module.exports = {
  signup,
  login, // ← Add this export
};