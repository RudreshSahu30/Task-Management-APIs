import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

/**
 * Validation Error Detail Interface
 * Matches the format from taskValidation middleware
 */
interface ValidationErrorDetail {
  field: string;
  message: string;
}

/**
 * Custom Error Interface
 * Extends the base Error with additional properties for API errors
 */
interface CustomError extends Error {
  statusCode?: number;
  errors?: ValidationErrorDetail[];
}

/**
 * Global Error Handler Middleware
 * Catches and formats all errors thrown in the application
 * 
 * Handles:
 * - Validation errors with multiple field errors
 * - General application errors
 * - Unexpected errors
 * 
 * Logs all errors using Winston for debugging and monitoring
 * 
 * @param err - The error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error details using Winston logger
  logger.error(`[Error] ${statusCode}: ${message}`, {
    method: req.method,
    url: req.url,
    statusCode,
    stack: err.stack,
    errors: err.errors, // Include validation errors if present
  });

  // If it's a validation error with multiple field errors, return detailed format
  if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
    res.status(statusCode).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors
    });
    return;
  }

  // For other errors, return simple format
  res.status(statusCode).json({
    error: {
      message,
      statusCode,
    },
  });
};
