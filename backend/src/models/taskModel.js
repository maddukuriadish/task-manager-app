const pool = require('../config/database');

/**
 * Create a new task for a user
 * 
 * Why we need user_id parameter:
 * - Every task belongs to a specific user
 * - We get user_id from the authenticated user (req.user.userId)
 * - This ensures users can only create tasks for themselves
 * 
 * Parameters explained:
 * - userId: Who owns this task (from JWT token)
 * - taskData: Object containing { title, description, priority, dueDate, status }
 */
const createTask = async (userId, taskData) => {
  const { title, description, priority, dueDate, status } = taskData;

  const query = `
    INSERT INTO tasks (user_id, title, description, priority, due_date, status)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, user_id, title, description, priority, due_date, status, created_at, updated_at
  `;

  // Why this order of values?
  // Matches the order of $1, $2, $3... in the query
  const values = [
    userId,                           // $1 - user_id (from authenticated user)
    title,                            // $2 - title (required)
    description || null,              // $3 - description (optional, null if not provided)
    priority || 'medium',             // $4 - priority (default 'medium')
    dueDate || null,                  // $5 - due_date (optional)
    status || 'pending',              // $6 - status (default 'pending')
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Create task error:', error);
    throw error;
  }
};

/**
 * Get all tasks for a specific user
 * 
 * Why filter by userId:
 * - Users should only see their own tasks (data isolation)
 * - Security: prevents users from accessing other users' tasks
 * 
 * Ordering:
 * - Most recent first (ORDER BY created_at DESC)
 * - Could add other ordering options later (by priority, due date, etc.)
 */
const getTasksByUserId = async (userId) => {
  const query = `
    SELECT id, user_id, title, description, priority, due_date, status, created_at, updated_at
    FROM tasks
    WHERE user_id = $1
    ORDER BY created_at DESC
  `;

  const result = await pool.query(query, [userId]);
  return result.rows; // Returns array of tasks (empty array if none)
};

/**
 * Get a single task by ID
 * 
 * Important: Also filter by user_id!
 * Why? Security - user can only access their own tasks
 * 
 * Example attack scenario prevented:
 * - User 1 tries to access task with id=999 (belongs to User 2)
 * - Query filters by both id AND user_id
 * - No match found, returns null
 * - User 1 cannot access User 2's task ✅
 */
const getTaskById = async (taskId, userId) => {
  const query = `
    SELECT id, user_id, title, description, priority, due_date, status, created_at, updated_at
    FROM tasks
    WHERE id = $1 AND user_id = $2
  `;
  //        ↑           ↑
  //    Task ID    Owner's ID (security!)

  const result = await pool.query(query, [taskId, userId]);

  if (result.rows.length === 0) {
    return null; // Task doesn't exist OR doesn't belong to this user
  }

  return result.rows[0];
};

/**
 * Update a task
 * 
 * Security: Only update if task belongs to user
 * 
 * Note: We're updating all fields here
 * In production, you might want partial updates (only changed fields)
 */
const updateTask = async (taskId, userId, taskData) => {
  const { title, description, priority, dueDate, status } = taskData;

  const query = `
    UPDATE tasks
    SET 
      title = $1,
      description = $2,
      priority = $3,
      due_date = $4,
      status = $5,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $6 AND user_id = $7
    RETURNING id, user_id, title, description, priority, due_date, status, created_at, updated_at
  `;
  //        ↑           ↑
  //    Task ID    Owner's ID (security!)

  const values = [
    title,
    description,
    priority,
    dueDate,
    status,
    taskId,
    userId,
  ];

  const result = await pool.query(query, values);

  if (result.rows.length === 0) {
    // No rows updated - either task doesn't exist or doesn't belong to user
    return null;
  }

  return result.rows[0];
};

/**
 * Delete a task
 * 
 * Security: Only delete if task belongs to user
 * 
 * Returns: true if deleted, false if not found or unauthorized
 */
const deleteTask = async (taskId, userId) => {
  const query = `
    DELETE FROM tasks
    WHERE id = $1 AND user_id = $2
    RETURNING id
  `;
  //        ↑           ↑
  //    Task ID    Owner's ID (security!)

  const result = await pool.query(query, [taskId, userId]);

  // If rows were deleted, result.rows.length > 0
  return result.rows.length > 0;
};

module.exports = {
  createTask,
  getTasksByUserId,    // ← Add
  getTaskById,         // ← Add
  updateTask,          // ← Add
  deleteTask,          // ← Add
};