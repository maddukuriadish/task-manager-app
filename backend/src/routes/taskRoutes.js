const express = require('express');
const { 
  create, 
  getAllTasks,  // ← Add import
  getTask,      // ← Add import
  update,       // ← Add import
  remove        // ← Add import
} = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * All routes are protected - require authentication
 */

/**
 * GET /api/tasks
 * Get all tasks for authenticated user
 */
router.get('/', authenticateToken, getAllTasks);

/**
 * GET /api/tasks/:id
 * Get a specific task by ID
 * 
 * Example: GET /api/tasks/5
 */
router.get('/:id', authenticateToken, getTask);

/**
 * POST /api/tasks
 * Create a new task
 */
router.post('/', authenticateToken, create);

/**
 * PUT /api/tasks/:id
 * Update a task
 * 
 * Example: PUT /api/tasks/5
 */
router.put('/:id', authenticateToken, update);

/**
 * DELETE /api/tasks/:id
 * Delete a task
 * 
 * Example: DELETE /api/tasks/5
 */
router.delete('/:id', authenticateToken, remove);

module.exports = router;