const { 
  createTask, 
  getTasksByUserId,    // ← Add import
  getTaskById,         // ← Add import
  updateTask,          // ← Add import
  deleteTask           // ← Add import
} = require('../models/taskModel');


/**
 * Create a new task for the authenticated user
 * 
 * This route is PROTECTED - only authenticated users can create tasks
 * 
 * Flow:
 * 1. User sends request with JWT token
 * 2. Auth middleware verifies token, sets req.user
 * 3. This controller extracts userId from req.user
 * 4. Creates task linked to that user
 * 5. Returns created task
 */
const create = async (req, res) => {
  try {
    // Extract task data from request body
    const { title, description, priority, dueDate, status } = req.body;

    // Validation: Title is required
    if (!title || title.trim() === '') {
      return res.status(400).json({
        error: 'Title is required',
      });
    }

    // Validation: Priority must be valid value
    const validPriorities = ['low', 'medium', 'high'];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        error: 'Priority must be low, medium, or high',
      });
    }

    // Validation: Status must be valid value
    const validStatuses = ['pending', 'in_progress', 'completed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Status must be pending, in_progress, or completed',
      });
    }

    // Validation: Due date should be a valid date (if provided)
    if (dueDate) {
      const date = new Date(dueDate);
      if (isNaN(date.getTime())) {
        return res.status(400).json({
          error: 'Invalid due date format',
        });
      }
    }

    // Get authenticated user's ID
    // This was set by authenticateToken middleware!
    const userId = req.user.userId;

    // Prepare task data
    const taskData = {
      title: title.trim(),
      description: description?.trim(),
      priority,
      dueDate,
      status,
    };

    // Create task in database
    const task = await createTask(userId, taskData);

    // Success! Return created task
    res.status(201).json({
      message: 'Task created successfully',
      task: {
        id: task.id,
        userId: task.user_id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.due_date,
        status: task.status,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
      },
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Server error creating task' });
  }
};

// ... existing create function ...

/**
 * Get all tasks for the authenticated user
 * 
 * Returns all tasks owned by the user
 * Ordered by creation date (newest first)
 */
const getAllTasks = async (req, res) => {
  try {
    // Get authenticated user's ID from token
    const userId = req.user.userId;

    // Fetch all tasks for this user
    const tasks = await getTasksByUserId(userId);

    // Format response
    const formattedTasks = tasks.map(task => ({
      id: task.id,
      userId: task.user_id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.due_date,
      status: task.status,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    }));

    res.status(200).json({
      count: formattedTasks.length,
      tasks: formattedTasks,
    });

  } catch (error) {
    console.error('Get all tasks error:', error);
    res.status(500).json({ error: 'Server error fetching tasks' });
  }
};

/**
 * Get a single task by ID
 * 
 * Security: Only returns task if it belongs to authenticated user
 */
const getTask = async (req, res) => {
  try {
    // Get task ID from URL parameter
    // Example: GET /api/tasks/5 → req.params.id = "5"
    const taskId = parseInt(req.params.id);

    // Validate task ID is a number
    if (isNaN(taskId)) {
      return res.status(400).json({
        error: 'Invalid task ID',
      });
    }

    // Get authenticated user's ID
    const userId = req.user.userId;

    // Fetch task (only if it belongs to this user)
    const task = await getTaskById(taskId, userId);

    if (!task) {
      // Task doesn't exist OR doesn't belong to this user
      // We return the same error for both (security: don't reveal if task exists)
      return res.status(404).json({
        error: 'Task not found',
      });
    }

    // Task found and belongs to user
    res.status(200).json({
      task: {
        id: task.id,
        userId: task.user_id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.due_date,
        status: task.status,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
      },
    });

  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Server error fetching task' });
  }
};

/**
 * Update a task
 * 
 * Security: Only updates task if it belongs to authenticated user
 * Validation: Same rules as create
 */
const update = async (req, res) => {
  try {
    // Get task ID from URL
    const taskId = parseInt(req.params.id);

    if (isNaN(taskId)) {
      return res.status(400).json({
        error: 'Invalid task ID',
      });
    }

    // Extract updated data from request body
    const { title, description, priority, dueDate, status } = req.body;

    // Validation: Title is required
    if (!title || title.trim() === '') {
      return res.status(400).json({
        error: 'Title is required',
      });
    }

    // Validation: Priority
    const validPriorities = ['low', 'medium', 'high'];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        error: 'Priority must be low, medium, or high',
      });
    }

    // Validation: Status
    const validStatuses = ['pending', 'in_progress', 'completed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Status must be pending, in_progress, or completed',
      });
    }

    // Validation: Due date
    if (dueDate) {
      const date = new Date(dueDate);
      if (isNaN(date.getTime())) {
        return res.status(400).json({
          error: 'Invalid due date format',
        });
      }
    }

    // Get authenticated user's ID
    const userId = req.user.userId;

    // Prepare updated task data
    const taskData = {
      title: title.trim(),
      description: description?.trim() || null,
      priority: priority || 'medium',
      dueDate: dueDate || null,
      status: status || 'pending',
    };

    // Update task in database
    const updatedTask = await updateTask(taskId, userId, taskData);

    if (!updatedTask) {
      // Task doesn't exist OR doesn't belong to this user
      return res.status(404).json({
        error: 'Task not found',
      });
    }

    // Success!
    res.status(200).json({
      message: 'Task updated successfully',
      task: {
        id: updatedTask.id,
        userId: updatedTask.user_id,
        title: updatedTask.title,
        description: updatedTask.description,
        priority: updatedTask.priority,
        dueDate: updatedTask.due_date,
        status: updatedTask.status,
        createdAt: updatedTask.created_at,
        updatedAt: updatedTask.updated_at,
      },
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Server error updating task' });
  }
};

/**
 * Delete a task
 * 
 * Security: Only deletes task if it belongs to authenticated user
 */
const remove = async (req, res) => {
  try {
    // Get task ID from URL
    const taskId = parseInt(req.params.id);

    if (isNaN(taskId)) {
      return res.status(400).json({
        error: 'Invalid task ID',
      });
    }

    // Get authenticated user's ID
    const userId = req.user.userId;

    // Delete task
    const deleted = await deleteTask(taskId, userId);

    if (!deleted) {
      // Task doesn't exist OR doesn't belong to this user
      return res.status(404).json({
        error: 'Task not found',
      });
    }

    // Success!
    res.status(200).json({
      message: 'Task deleted successfully',
    });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Server error deleting task' });
  }
};

module.exports = {
  create,
  getAllTasks,  // ← Add
  getTask,      // ← Add
  update,       // ← Add
  remove,       // ← Add (can't use 'delete' - reserved keyword in JavaScript)
};