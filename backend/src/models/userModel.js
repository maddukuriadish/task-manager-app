const pool = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Create a new user in the database
 * 
 * Why we're doing this:
 * - Separate database logic from business logic (separation of concerns)
 * - Reusable: other parts of app can call this
 * - Easier to test and maintain
 */
const createUser = async (email, password, name) => {
  // Hash the password before storing
  // Why? NEVER store plain text passwords! If database is compromised, 
  // passwords are still protected
  const saltRounds = 10; // Higher = more secure but slower
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // SQL query to insert new user
  const query = `
    INSERT INTO users (email, password_hash, name)
    VALUES ($1, $2, $3)
    RETURNING id, email, name, created_at
  `;
  
  // $1, $2, $3 are parameterized queries
  // Why? Prevents SQL injection attacks!
  // Bad:  "INSERT INTO users VALUES ('" + email + "')" 
  //       User could enter: "); DROP TABLE users; --
  // Good: Uses parameters, database escapes dangerous characters
  
  const values = [email, passwordHash, name];

  try {
    const result = await pool.query(query, values);
    // RETURNING clause gives us back the created user
    // We don't return the password_hash (security!)
    return result.rows[0];
  } catch (error) {
    // Check if error is duplicate email (unique constraint violation)
    if (error.code === '23505') { // PostgreSQL error code for unique violation
      throw new Error('Email already exists');
    }
    throw error; // Re-throw other errors
  }
};

/**
 * Find user by email
 * 
 * Why we need this:
 * - Login requires finding user by email
 * - We'll verify password separately in controller
 * - Returns full user record including password_hash (needed for verification)
 */
const findUserByEmail = async (email) => {
  const query = `
    SELECT id, email, password_hash, name, created_at
    FROM users
    WHERE email = $1
  `;
  
  const result = await pool.query(query, [email]);
  
  // If no user found, result.rows will be empty array
  if (result.rows.length === 0) {
    return null; // No user with this email
  }
  
  return result.rows[0]; // Return the user object
};

/**
 * Find user by ID
 * 
 * Why we need this:
 * - After verifying JWT token, we have userId
 * - We want to fetch fresh user data from database
 * - Don't return password_hash (not needed for user profile)
 */
const findUserById = async (userId) => {
  const query = `
    SELECT id, email, name, created_at
    FROM users
    WHERE id = $1
  `;
  
  const result = await pool.query(query, [userId]);
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows[0];
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById, // ← Add this export
};