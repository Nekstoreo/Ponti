import { Request, Response, NextFunction } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { Error as MongooseError } from 'mongoose';
import { 
  AppError, 
  ValidationError, 
  AuthenticationError, 
  DatabaseError, 
  TokenError,
  InternalServerError,
  NotFoundError,
  ConflictError,
  BadRequestError,
  ErrorFactory,
  ERROR_CODES,
  sanitizeErrorForLogging,
  isOperationalError
} from '../utils/errors';
import { logger } from '../config/logger';

/**
 * Interface for standardized API error response
 */
interface APIErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
  };
}

/**
 * Interface for standardized API success response
 */
interface APISuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
  };
}

/**
 * Handles MongoDB/Mongoose errors
 */
const handleDatabaseError = (error: MongooseError | any): AppError => {
  if (error.name === 'ValidationError') {
    const mongooseError = error as MongooseError.ValidationError;
    const validationErrors = Object.values(mongooseError.errors).map(err => ({
      field: err.path,
      message: err.message,
      value: (err as any).value,
      kind: (err as any).kind
    }));
    
    return new ValidationError('Database validation failed', {
      code: ERROR_CODES.VALIDATION_FAILED,
      errors: validationErrors
    });
  }

  if (error.name === 'CastError') {
    const castError = error as MongooseError.CastError;
    return ErrorFactory.createValidationError(
      castError.path || 'unknown',
      castError.value,
      `Expected ${castError.kind} but received ${typeof castError.value}`
    );
  }

  // Handle MongoDB duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || 'field';
    const value = error.keyValue?.[field];
    return ErrorFactory.createDuplicateError(field, value);
  }

  // Handle MongoDB connection errors
  if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
    return new DatabaseError('Database connection failed', {
      code: ERROR_CODES.DATABASE_ERROR,
      type: 'CONNECTION_ERROR',
      originalError: error.message
    });
  }

  return new DatabaseError('Database operation failed', {
    code: ERROR_CODES.DATABASE_ERROR,
    name: error.name,
    message: error.message
  });
};

/**
 * Handles JWT errors
 */
const handleJWTError = (error: JsonWebTokenError): AppError => {
  if (error instanceof TokenExpiredError) {
    return new TokenError('Token has expired', 401);
  }

  if (error.name === 'JsonWebTokenError') {
    return new TokenError('Invalid token format', 401);
  }

  if (error.name === 'NotBeforeError') {
    return new TokenError('Token not active yet', 401);
  }

  return ErrorFactory.createAuthenticationError('Token validation failed');
};

/**
 * Determines if error should be logged
 */
const shouldLogError = (error: AppError): boolean => {
  // Don't log client errors (4xx) except for authentication issues
  if (error.statusCode >= 400 && error.statusCode < 500) {
    return error.statusCode === 401 || error.statusCode === 403;
  }

  // Always log server errors (5xx)
  return error.statusCode >= 500;
};

/**
 * Logs error with appropriate level and context
 */
const logError = (error: AppError, req: Request): void => {
  // Sanitize error for logging
  const sanitizedError = sanitizeErrorForLogging(error);
  
  const requestInfo = {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.studentId || 'anonymous',
    requestId: req.get('X-Request-ID') || 'unknown',
    timestamp: new Date().toISOString()
  };

  const logContext = {
    error: sanitizedError,
    request: requestInfo,
    environment: process.env.NODE_ENV,
    service: 'ponti-api'
  };

  // Log based on error severity
  if (error.statusCode >= 500) {
    logger.error('Server Error Occurred', logContext);
    
    // Additional alert for critical errors in production
    if (process.env.NODE_ENV === 'production' && error.statusCode === 500) {
      logger.error('CRITICAL: Internal Server Error', {
        ...logContext,
        alert: true,
        severity: 'critical'
      });
    }
  } else if (error.statusCode === 401 || error.statusCode === 403) {
    // Security-related logs
    logger.warn('Security Event: Authentication/Authorization Failed', {
      ...logContext,
      securityEvent: true,
      eventType: error.statusCode === 401 ? 'AUTHENTICATION_FAILED' : 'AUTHORIZATION_FAILED'
    });
  } else if (error.statusCode === 429) {
    // Rate limiting logs
    logger.warn('Rate Limit Exceeded', {
      ...logContext,
      rateLimitEvent: true
    });
  } else {
    // Client errors
    logger.info('Client Error', logContext);
  }
};

/**
 * Creates standardized error response
 */
const createErrorResponse = (error: AppError, isDevelopment: boolean, req: Request): APIErrorResponse => {
  const response: APIErrorResponse = {
    success: false,
    error: {
      code: error.name,
      message: error.message,
      timestamp: error.timestamp
    }
  };

  // Include details for validation errors or in development
  if (error instanceof ValidationError || error instanceof ConflictError || isDevelopment) {
    response.error.details = error.details;
  }

  // Include request ID for tracking
  const requestId = req.get('X-Request-ID');
  if (requestId) {
    (response.error as any).requestId = requestId;
  }

  // Include stack trace only in development for server errors
  if (isDevelopment && error.statusCode >= 500) {
    (response.error as any).stack = error.stack;
  }

  // Add helpful information for specific error types
  if (error.statusCode === 429) {
    (response.error as any).retryAfter = req.get('Retry-After') || '60';
  }

  return response;
};

/**
 * Global error handling middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let appError: AppError;

  // Convert known error types to AppError
  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof JsonWebTokenError) {
    appError = handleJWTError(error);
  } else if (
    error.name === 'MongoError' || 
    error.name === 'ValidationError' || 
    error.name === 'CastError' || 
    error.name === 'MongoNetworkError' ||
    error.name === 'MongoTimeoutError' ||
    (error as any).code === 11000
  ) {
    appError = handleDatabaseError(error as MongooseError);
  } else if (error.name === 'SyntaxError' && 'body' in error) {
    // Handle JSON parsing errors
    appError = new BadRequestError('Invalid JSON in request body', {
      code: ERROR_CODES.INVALID_INPUT,
      originalError: error.message
    });
  } else if (error.name === 'MulterError') {
    // Handle file upload errors
    appError = new BadRequestError('File upload error', {
      code: ERROR_CODES.INVALID_INPUT,
      originalError: error.message
    });
  } else {
    // Unknown error - treat as internal server error
    appError = new InternalServerError('Something went wrong', {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      originalError: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }

  // Always log operational errors and unknown errors
  if (shouldLogError(appError) || !isOperationalError(error)) {
    logError(appError, req);
  }

  // Send error response
  const isDevelopment = process.env.NODE_ENV === 'development';
  const errorResponse = createErrorResponse(appError, isDevelopment, req);

  // Ensure response hasn't been sent already
  if (!res.headersSent) {
    res.status(appError.statusCode).json(errorResponse);
  }
};

/**
 * Handles 404 errors for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Success response helper
 */
export const successResponse = <T>(
  data: T,
  message?: string,
  meta?: APISuccessResponse<T>['meta']
): APISuccessResponse<T> => {
  return {
    success: true,
    data,
    message,
    meta: {
      ...meta,
      timestamp: new Date().toISOString()
    }
  };
};

/**
 * Process exit handler for uncaught exceptions
 */
export const handleUncaughtException = (error: Error): void => {
  logger.error('Uncaught Exception - Shutting down gracefully', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    timestamp: new Date().toISOString(),
    severity: 'critical'
  });

  // Give time for logs to be written
  setTimeout(() => {
    process.exit(1);
  }, 1000);
};

/**
 * Process exit handler for unhandled promise rejections
 */
export const handleUnhandledRejection = (reason: any, promise: Promise<any>): void => {
  logger.error('Unhandled Promise Rejection - Shutting down gracefully', {
    reason: reason instanceof Error ? {
      name: reason.name,
      message: reason.message,
      stack: reason.stack
    } : reason,
    promise: promise.toString(),
    timestamp: new Date().toISOString(),
    severity: 'critical'
  });

  // Give time for logs to be written
  setTimeout(() => {
    process.exit(1);
  }, 1000);
};

/**
 * Graceful shutdown handler
 */
export const handleGracefulShutdown = (signal: string): void => {
  logger.info(`Received ${signal} - Starting graceful shutdown`, {
    signal,
    timestamp: new Date().toISOString()
  });

  // Perform cleanup operations here
  // Close database connections, stop servers, etc.
  
  setTimeout(() => {
    logger.info('Graceful shutdown completed');
    process.exit(0);
  }, 5000);
};