import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import config from './config';
import logger from './config/logger';
import { connectDB } from './config/database';
import { 
  errorHandler, 
  notFoundHandler, 
  handleUncaughtException, 
  handleUnhandledRejection, 
  handleGracefulShutdown 
} from './middleware/errorHandler';
import { responseMiddleware } from './middleware/response';
import apiRoutes from './routes';

// Create Express app
const app: Application = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMaxRequests,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_ERROR',
      message: 'Too many requests from this IP, please try again later.',
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: config.security.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message: string) => {
      logger.info(message.trim());
    },
  },
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Response middleware for standardized responses
app.use(responseMiddleware);

// Basic route
app.get('/', (_, res) => {
  res.success({
    message: 'Ponti API',
    version: '1.0.0',
    status: 'running',
    environment: config.server.env,
  }, 'Welcome to Ponti API');
});

// Health check endpoints
app.get('/health', (_, res) => {
  res.success({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }, 'API is healthy');
});

app.get('/health/db', async (_, res, next) => {
  try {
    const { checkDatabaseHealth } = await import('./config/database');
    const healthCheck = await checkDatabaseHealth();
    
    if (healthCheck.status === 'healthy') {
      res.success({
        status: healthCheck.status,
        database: healthCheck.details,
      }, 'Database is healthy');
    } else {
      res.status(503).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Database health check failed',
          details: healthCheck.details,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    next(error); // Pass error to error handler middleware
  }
});

// API Routes
app.use('/api', apiRoutes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Start server function
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    logger.info('Database connected successfully');

    // Start server
    app.listen(config.server.port, config.server.host, () => {
      logger.info(`🚀 Ponti API server running on ${config.server.host}:${config.server.port}`);
      logger.info(`📱 Environment: ${config.server.env}`);
      logger.info(`🌐 CORS Origins: ${config.security.corsOrigins.join(', ')}`);
      logger.info(`🔒 Security: Rate limiting enabled (${config.security.rateLimitMaxRequests} requests per ${config.security.rateLimitWindowMs}ms)`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', handleUnhandledRejection);

// Handle uncaught exceptions
process.on('uncaughtException', handleUncaughtException);

// Graceful shutdown
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

// Start the server
if (require.main === module) {
  startServer();
}

export default app;
