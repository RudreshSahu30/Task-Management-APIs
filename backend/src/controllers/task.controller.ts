import { Request, Response, NextFunction } from 'express';
import { taskStore } from '../models/task.store';
import { CreateTaskDTO, UpdateTaskDTO } from '../models/task.model';

/**
 * Get all tasks
 * @route GET /api/tasks
 * @description Retrieves all tasks from the in-memory store
 * @returns {200} Array of all tasks
 */
export const getAllTasks = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const tasks = taskStore.getAllTasks();
    
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single task by ID
 * @route GET /api/tasks/:id
 * @description Retrieves a specific task by its unique identifier
 * @param {string} id - The unique task identifier (UUID)
 * @returns {200} The requested task
 * @returns {404} Task not found error
 */
export const getTaskById = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { id } = req.params;
    const task = taskStore.getTaskById(id);

    if (!task) {
      res.status(404).json({
        success: false,
        message: `Task with ID '${id}' not found`
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new task
 * @route POST /api/tasks
 * @description Creates a new task with the provided data
 * @body {CreateTaskDTO} Task creation data (title required, description and status optional)
 * @returns {201} The newly created task
 * @returns {400} Validation error if input is invalid
 */
export const createTask = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const taskData: CreateTaskDTO = req.body;
    const newTask = taskStore.createTask(taskData);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing task
 * @route PUT /api/tasks/:id
 * @description Updates a task with the provided data (partial updates supported)
 * @param {string} id - The unique task identifier (UUID)
 * @body {UpdateTaskDTO} Task update data (all fields optional)
 * @returns {200} The updated task
 * @returns {404} Task not found error
 * @returns {400} Validation error if input is invalid
 */
export const updateTask = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { id } = req.params;
    const taskData: UpdateTaskDTO = req.body;

    const updatedTask = taskStore.updateTask(id, taskData);

    if (!updatedTask) {
      res.status(404).json({
        success: false,
        message: `Task with ID '${id}' not found`
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a task
 * @route DELETE /api/tasks/:id
 * @description Permanently removes a task from the store
 * @param {string} id - The unique task identifier (UUID)
 * @returns {200} Success message confirming deletion
 * @returns {404} Task not found error
 */
export const deleteTask = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { id } = req.params;
    const deleted = taskStore.deleteTask(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: `Task with ID '${id}' not found`
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
