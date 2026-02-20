import morgan, { StreamOptions } from 'morgan';
import { Request, Response } from 'express';
import logger from '../config/logger';

/**
 * Morgan HTTP Request Logging Middleware
 * Integrates Morgan with Winston for comprehensive request logging
 * 
 * Features:
 * - Captures all incoming HTTP requests
 * - Logs method, URL, status code, response time, and timestamp
 * - Integrates with Winston logger for consistent log management
 * - Custom format: [METHOD] /endpoint - Status: XXX - Execution time: Xms
 * - Streams logs to Winston instead of console.log
 */

/**
 * Custom Morgan stream that writes to Winston logger
 * This ensures all HTTP logs go through Winston's transport system
 */
const stream: StreamOptions = {
  /**
   * Write function called by Morgan for each request
   * @param message - The formatted log message from Morgan
   */
  write: (message: string) => {
    // Use Winston's http level for request logs
    // Trim the message to remove trailing newline added by Morgan
    logger.http(message.trim());
  },
};

/**
 * Custom Morgan token for execution time in milliseconds
 * Morgan provides response-time token, but we format it as "Xms"
 */
morgan.token('execution-time', (req: Request, res: Response): string => {
  const responseTime = res.getHeader('X-Response-Time');
  return responseTime ? `${responseTime}ms` : '0ms';
});

/**
 * Custom Morgan token for timestamp
 * Format: YYYY-MM-DD HH:mm:ss
 */
morgan.token('timestamp', (): string => {
  const now = new Date();
  return now.toISOString().replace('T', ' ').split('.')[0];
});

/**
 * Custom Morgan format string
 * Format: [TIMESTAMP] [METHOD] /url - Status: XXX - Execution time: Xms
 * 
 * Morgan tokens used:
 * - :timestamp - Custom timestamp token
 * - :method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * - :url - Request URL
 * - :status - HTTP response status code
 * - :response-time - Response time in milliseconds
 * 
 * Example output:
 * [2026-02-20 10:30:15] [GET] /api/tasks - Status: 200 - Execution time: 15ms
 */
const requestLogFormat = 
  '[:timestamp] [:method] :url - Status: :status - Execution time: :response-time ms';

/**
 * Simplified format for console output
 * Shows only essential information for readability
 * Format: [METHOD] /url - Status: XXX - Xms
 */
const consoleLogFormat = 
  '[:method] :url - Status: :status - :response-time ms';

/**
 * Skip function to filter out certain requests from logging
 * Currently configured to log all requests
 * Can be modified to skip health checks or specific endpoints
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @returns true to skip logging, false to log
 */
const skip = (req: Request, res: Response): boolean => {
  // Option 1: Skip health check endpoint (commented out)
  // if (req.url === '/health') return true;
  
  // Option 2: Skip successful requests in production (commented out)
  // const env = process.env.NODE_ENV || 'development';
  // if (env === 'production' && res.statusCode < 400) return true;
  
  // Currently logging all requests
  return false;
};

/**
 * Morgan middleware instance with Winston integration
 * Uses the custom format and streams output to Winston logger
 * 
 * Configuration:
 * - format: Custom format string defined above
 * - stream: Winston logger stream
 * - skip: Function to filter requests (currently logs all)
 */
export const requestLogger = morgan(requestLogFormat, {
  stream,
  skip,
});

/**
 * Alternative: Simplified Morgan middleware for console-only output
 * Useful for quick debugging without full Winston setup
 * Not used by default but available for specific use cases
 */
export const simpleRequestLogger = morgan(consoleLogFormat);

/**
 * Middleware to add response time header
 * This is used in conjunction with Morgan's response-time token
 * Calculates and adds X-Response-Time header to responses
 */
export const responseTimeMiddleware = (
  req: Request,
  res: Response,
  next: Function
): void => {
  const startTime = Date.now();
  
  // Listen for response finish event
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    res.setHeader('X-Response-Time', duration);
  });
  
  next();
};

/**
 * Export default as the main request logger
 * Usage in app.ts: app.use(requestLogger);
 */
export default requestLogger;
