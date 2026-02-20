import { Request, Response, NextFunction } from 'express';
import { TaskStatus, TaskPriority } from '../models/task.model';
import sanitizeHtml from 'sanitize-html';

/**
 * Validation Error Interface
 * Represents a single validation error with field and message
 */
interface ValidationErrorDetail {
  field: string;
  message: string;
}

/**
 * Custom Validation Error Class
 * Extends Error to include multiple validation errors and proper status code
 */
class ValidationError extends Error {
  statusCode: number;
  errors: ValidationErrorDetail[];
  
  constructor(errors: ValidationErrorDetail[]) {
    super('Validation failed');
    this.statusCode = 400;
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Sanitize text input to prevent XSS attacks
 * Removes all HTML tags and potentially dangerous content
 * 
 * @param text - The text to sanitize
 * @returns Sanitized text without HTML tags
 */
const sanitizeText = (text: string): string => {
  return sanitizeHtml(text, {
    allowedTags: [], // No HTML tags allowed
    allowedAttributes: {}, // No attributes allowed
    disallowedTagsMode: 'recursiveEscape' // Escape disallowed tags
  }).trim();
};

/**
 * Validate and sanitize title field
 * Rules:
 * - Required
 * - Must be a string
 * - Length: 3-100 characters (after trimming)
 * - HTML/XSS sanitization applied
 * 
 * @param title - The title to validate
 * @returns Validation error or null if valid
 */
const validateTitle = (title: any): ValidationErrorDetail | null => {
  if (title === undefined || title === null) {
    return { field: 'title', message: 'Title is required' };
  }
  
  if (typeof title !== 'string') {
    return { field: 'title', message: 'Title must be a string' };
  }
  
  const trimmedTitle = title.trim();
  
  if (trimmedTitle.length < 3) {
    return { field: 'title', message: 'Title must be at least 3 characters long' };
  }
  
  if (trimmedTitle.length > 100) {
    return { field: 'title', message: 'Title must not exceed 100 characters' };
  }
  
  return null;
};

/**
 * Validate and sanitize description field
 * Rules:
 * - Optional
 * - Must be a string if provided
 * - Maximum length: 500 characters
 * - HTML/XSS sanitization applied
 * 
 * @param description - The description to validate
 * @returns Validation error or null if valid
 */
const validateDescription = (description: any): ValidationErrorDetail | null => {
  if (description === undefined || description === null) {
    return null; // Optional field
  }
  
  if (typeof description !== 'string') {
    return { field: 'description', message: 'Description must be a string' };
  }
  
  if (description.length > 500) {
    return { field: 'description', message: 'Description must not exceed 500 characters' };
  }
  
  return null;
};

/**
 * Validate status field
 * Rules:
 * - Optional
 * - Must be one of the TaskStatus enum values
 * 
 * @param status - The status to validate
 * @returns Validation error or null if valid
 */
const validateStatus = (status: any): ValidationErrorDetail | null => {
  if (status === undefined || status === null) {
    return null; // Optional field
  }
  
  const validStatuses = Object.values(TaskStatus);
  if (!validStatuses.includes(status)) {
    return {
      field: 'status',
      message: `Status must be one of: ${validStatuses.join(', ')}`
    };
  }
  
  return null;
};

/**
 * Validate priority field
 * Rules:
 * - Optional
 * - Must be one of the TaskPriority enum values
 * 
 * @param priority - The priority to validate
 * @returns Validation error or null if valid
 */
const validatePriority = (priority: any): ValidationErrorDetail | null => {
  if (priority === undefined || priority === null) {
    return null; // Optional field
  }
  
  const validPriorities = Object.values(TaskPriority);
  if (!validPriorities.includes(priority)) {
    return {
      field: 'priority',
      message: `Priority must be one of: ${validPriorities.join(', ')}`
    };
  }
  
  return null;
};

/**
 * Validate due date field
 * Rules:
 * - Optional
 * - Must be a valid date format (ISO 8601 or Date object)
 * - Must be in the future (not in the past)
 * - Must not be more than 10 years in the future
 * 
 * @param dueDate - The due date to validate
 * @returns Validation error or null if valid
 */
const validateDueDate = (dueDate: any): ValidationErrorDetail | null => {
  if (dueDate === undefined || dueDate === null) {
    return null; // Optional field
  }
  
  // Check if it's a valid date
  const date = new Date(dueDate);
  if (isNaN(date.getTime())) {
    return {
      field: 'dueDate',
      message: 'Due date must be a valid date (ISO 8601 format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)'
    };
  }
  
  // Check if date is in the future
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Reset to start of day for fair comparison
  
  const dueDateOnly = new Date(date);
  dueDateOnly.setHours(0, 0, 0, 0);
  
  if (dueDateOnly < now) {
    return {
      field: 'dueDate',
      message: 'Due date must be today or in the future'
    };
  }
  
  // Check if date is not too far in the future (10 years max)
  const tenYearsFromNow = new Date();
  tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + 10);
  
  if (date > tenYearsFromNow) {
    return {
      field: 'dueDate',
      message: 'Due date must not be more than 10 years in the future'
    };
  }
  
  return null;
};

/**
 * Validates and sanitizes the request body for creating a new task
 * Collects all validation errors and returns them together
 * Applies HTML/XSS sanitization to text fields
 * 
 * Validation Rules:
 * - title: required, 3-100 characters, sanitized
 * - description: optional, max 500 characters, sanitized
 * - status: optional, must be valid TaskStatus enum
 * - priority: optional, must be valid TaskPriority enum
 * - dueDate: optional, must be valid future date
 */
export const validateCreateTask = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    const errors: ValidationErrorDetail[] = [];

    // Validate all fields and collect errors
    const titleError = validateTitle(title);
    if (titleError) errors.push(titleError);

    const descriptionError = validateDescription(description);
    if (descriptionError) errors.push(descriptionError);

    const statusError = validateStatus(status);
    if (statusError) errors.push(statusError);

    const priorityError = validatePriority(priority);
    if (priorityError) errors.push(priorityError);

    const dueDateError = validateDueDate(dueDate);
    if (dueDateError) errors.push(dueDateError);

    // If there are validation errors, throw them all together
    if (errors.length > 0) {
      throw new ValidationError(errors);
    }

    // Sanitize text fields to prevent XSS attacks
    if (title) {
      req.body.title = sanitizeText(title);
    }

    if (description) {
      req.body.description = sanitizeText(description);
    }

    // Convert dueDate to Date object if provided
    if (dueDate) {
      req.body.dueDate = new Date(dueDate);
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validates and sanitizes the request body for updating an existing task
 * Supports partial updates - at least one field must be provided
 * Collects all validation errors and returns them together
 * Applies HTML/XSS sanitization to text fields
 * 
 * Validation Rules:
 * - At least one field must be provided
 * - title: optional, 3-100 characters if provided, sanitized
 * - description: optional, max 500 characters if provided, sanitized
 * - status: optional, must be valid TaskStatus enum if provided
 * - priority: optional, must be valid TaskPriority enum if provided
 * - dueDate: optional, must be valid future date if provided
 */
export const validateUpdateTask = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    const errors: ValidationErrorDetail[] = [];

    // Check if at least one field is provided
    if (
      title === undefined &&
      description === undefined &&
      status === undefined &&
      priority === undefined &&
      dueDate === undefined
    ) {
      errors.push({
        field: 'body',
        message: 'At least one field (title, description, status, priority, or dueDate) must be provided for update'
      });
      throw new ValidationError(errors);
    }

    // Validate provided fields and collect errors
    if (title !== undefined) {
      const titleError = validateTitle(title);
      if (titleError) errors.push(titleError);
    }

    if (description !== undefined) {
      const descriptionError = validateDescription(description);
      if (descriptionError) errors.push(descriptionError);
    }

    if (status !== undefined) {
      const statusError = validateStatus(status);
      if (statusError) errors.push(statusError);
    }

    if (priority !== undefined) {
      const priorityError = validatePriority(priority);
      if (priorityError) errors.push(priorityError);
    }

    if (dueDate !== undefined) {
      const dueDateError = validateDueDate(dueDate);
      if (dueDateError) errors.push(dueDateError);
    }

    // If there are validation errors, throw them all together
    if (errors.length > 0) {
      throw new ValidationError(errors);
    }

    // Sanitize text fields to prevent XSS attacks
    if (title !== undefined) {
      req.body.title = sanitizeText(title);
    }

    if (description !== undefined) {
      req.body.description = sanitizeText(description);
    }

    // Convert dueDate to Date object if provided
    if (dueDate !== undefined) {
      req.body.dueDate = new Date(dueDate);
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validates the task ID parameter in the request
 * Ensures that the ID is a valid UUID v4 format
 */
export const validateTaskId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { id } = req.params;
    const errors: ValidationErrorDetail[] = [];

    if (!id || typeof id !== 'string') {
      errors.push({ field: 'id', message: 'Task ID is required' });
      throw new ValidationError(errors);
    }

    // UUID v4 format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      errors.push({ field: 'id', message: 'Invalid task ID format (must be a valid UUID v4)' });
      throw new ValidationError(errors);
    }

    next();
  } catch (error) {
    next(error);
  }
};
