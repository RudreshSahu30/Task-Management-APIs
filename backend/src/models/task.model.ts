/**
 * Task Status Enum
 * Represents the possible states a task can be in
 * - pending: Task is created but not yet started
 * - in-progress: Task is currently being worked on
 * - completed: Task has been finished
 * - blocked: Task cannot proceed due to dependencies or issues
 */
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked'
}

/**
 * Task Priority Enum
 * Represents the priority level of a task
 * - low: Low priority task
 * - medium: Medium priority task (default)
 * - high: High priority task
 * - critical: Critical/urgent task requiring immediate attention
 */
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Task Interface
 * Defines the structure of a task entity in the system
 */
export interface Task {
  /** Unique identifier for the task */
  id: string;
  
  /** Title of the task (required) */
  title: string;
  
  /** Detailed description of the task (optional) */
  description?: string;
  
  /** Current status of the task */
  status: TaskStatus;
  
  /** Priority level of the task */
  priority: TaskPriority;
  
  /** Due date for task completion (optional) */
  dueDate?: Date;
  
  /** Timestamp when the task was created */
  createdAt: Date;
  
  /** Timestamp when the task was last updated */
  updatedAt: Date;
}

/**
 * Create Task DTO (Data Transfer Object)
 * Defines the structure for creating a new task
 */
export interface CreateTaskDTO {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | Date;
}

/**
 * Update Task DTO (Data Transfer Object)
 * Defines the structure for updating an existing task
 * All fields are optional to allow partial updates
 */
export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | Date;
}
