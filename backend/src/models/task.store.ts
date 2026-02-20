import { Task, TaskStatus, TaskPriority, CreateTaskDTO, UpdateTaskDTO } from '../models/task.model';
import { randomUUID } from 'crypto';

/**
 * In-Memory Task Store
 * Provides CRUD operations for task management without a database
 * Uses a Map for O(1) lookup performance
 */
class TaskStore {
  private tasks: Map<string, Task>;

  constructor() {
    this.tasks = new Map();
  }

  /**
   * Get all tasks from the store
   * @returns Array of all tasks
   */
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get a single task by ID
   * @param id - The unique identifier of the task
   * @returns The task if found, undefined otherwise
   */
  getTaskById(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  /**
   * Create a new task
   * @param taskData - The data for creating a new task
   * @returns The newly created task
   */
  createTask(taskData: CreateTaskDTO): Task {
    const newTask: Task = {
      id: randomUUID(),
      title: taskData.title,
      description: taskData.description,
      status: taskData.status || TaskStatus.PENDING,
      priority: taskData.priority || TaskPriority.MEDIUM,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tasks.set(newTask.id, newTask);
    return newTask;
  }

  /**
   * Update an existing task
   * @param id - The unique identifier of the task to update
   * @param taskData - The data to update
   * @returns The updated task if found, undefined otherwise
   */
  updateTask(id: string, taskData: UpdateTaskDTO): Task | undefined {
    const existingTask = this.tasks.get(id);
    
    if (!existingTask) {
      return undefined;
    }

    const updatedTask: Task = {
      ...existingTask,
      ...taskData,
      // Convert dueDate to Date object if it's a string
      dueDate: taskData.dueDate !== undefined 
        ? new Date(taskData.dueDate) 
        : existingTask.dueDate,
      updatedAt: new Date()
    };

    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  /**
   * Delete a task by ID
   * @param id - The unique identifier of the task to delete
   * @returns true if task was deleted, false if not found
   */
  deleteTask(id: string): boolean {
    return this.tasks.delete(id);
  }

  /**
   * Clear all tasks from the store
   * Useful for testing purposes
   */
  clearAll(): void {
    this.tasks.clear();
  }

  /**
   * Get the total count of tasks
   * @returns The number of tasks in the store
   */
  getTaskCount(): number {
    return this.tasks.size;
  }
}

// Export a singleton instance of the task store
export const taskStore = new TaskStore();
