import { Router } from 'express';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/task.controller';
import {
  validateCreateTask,
  validateUpdateTask,
  validateTaskId
} from '../middleware/taskValidation';

const router = Router();

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks
 * @access  Public
 */
router.get('/', getAllTasks);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a single task by ID
 * @access  Public
 */
router.get('/:id', validateTaskId, getTaskById);

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Public
 * @body    { title: string, description?: string, status?: TaskStatus }
 */
router.post('/', validateCreateTask, createTask);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update an existing task
 * @access  Public
 * @body    { title?: string, description?: string, status?: TaskStatus }
 */
router.put('/:id', validateTaskId, validateUpdateTask, updateTask);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Public
 */
router.delete('/:id', validateTaskId, deleteTask);

export default router;
