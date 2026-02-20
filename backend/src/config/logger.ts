import winston from 'winston';
import path from 'path';
import fs from 'fs';

/**
 * Logger Configuration using Winston
 * Provides centralized logging for the application with file and console outputs
 * 
 * Features:
 * - File-based logging with rotation support
 * - Console logging for development
 * - Different log levels (error, warn, info, http, debug)
 * - Timestamp inclusion for all logs
 * - Structured JSON format for file logs
 * - Colorized format for console logs
 */

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Define log levels
 * Winston uses npm log levels by default:
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

/**
 * Define log level based on environment
 * In production, log only http and above (info, warn, error)
 * In development, log everything including debug
 */
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'http';
};

/**
 * Define colors for each log level
 * These colors will be used in console output
 */
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston about our custom colors
winston.addColors(colors);

/**
 * Custom format for file logs
 * Includes timestamp, level, and message in JSON format
 */
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Custom format for console logs
 * Colorized and more readable format for development
 */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level}]: ${info.message}`
  )
);

/**
 * Define transports (where logs will be written)
 * 1. File transport for all logs (combined.log)
 * 2. File transport for error logs only (error.log)
 * 3. Console transport for development (minimal, formatted)
 */
const transports = [
  // Write all logs to combined.log
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  
  // Write error logs to error.log
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  
  // Console transport - minimal logs for readability
  new winston.transports.Console({
    format: consoleFormat,
    // Only log http and above to console (excludes debug)
    level: 'http',
  }),
];

/**
 * Create the Winston logger instance
 * This logger will be used throughout the application
 */
const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: fileFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format: fileFormat,
    }),
  ],
  // Exit on handled exceptions
  exitOnError: false,
});

/**
 * Export the configured logger
 * Usage: import logger from './config/logger';
 *        logger.info('Application started');
 *        logger.error('Something went wrong', error);
 */
export default logger;
