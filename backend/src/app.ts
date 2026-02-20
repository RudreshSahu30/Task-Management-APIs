import express, { Application } from 'express';
import healthRoutes from './routes/health.routes';
import taskRoutes from './routes/task.routes';
import { errorHandler } from './middleware/errorHandler';
import requestLogger from './middleware/requestLogger';
import logger from './config/logger';

const app: Application = express();

// Request logging middleware (must be first to capture all requests)
app.use(requestLogger);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', healthRoutes);
app.use('/api/tasks', taskRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
