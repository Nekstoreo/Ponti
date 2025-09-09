/**
 * Error handling system test utility
 * This file contains functions to test various error scenarios
 */

import { Request, Response, NextFunction } from 'express';
import { 
  AppError, 
  ValidationError, 
  AuthenticationError, 
  NotFoundError, 
  ConflictError,
  InternalServerError,
  ErrorFactory,
  ERROR_CODES
} from './errors';

/**
 * Test route handlers for different error types
 */
export const testErrorHandlers = {
  // Test validation error
  validationError: (req: Request, res: Response, next: NextFunction) => {
    const error = ErrorFactory.createValidationError('email', 'invalid-email', 'Must be a valid email address');
    next(error);
  },

  // Test authentication error
  authenticationError: (req: Request, res: Response, next: NextFunction) => {
    const error = ErrorFactory.createAuthenticationError('Invalid credentials provided');
    next(error);
  },

  // Test authorization error
  authorizationError: (req: Request, res: Response, next: NextFunction) => {
    const error = ErrorFactory.createAuthorizationError('student profile', 'update');
    next(error);
  },

  // Test not found error
  notFoundError: (req: Request, res: Response, next: NextFunction) => {
    const error = ErrorFactory.createNotFoundError('Student', req.params.id);
    next(error);
  },

  // Test conflict error
  conflictError: (req: Request, res: Response, next: NextFunction) => {
    const error = ErrorFactory.createDuplicateError('email', 'test@example.com');
    next(error);
  },

  // Test internal server error
  internalServerError: (req: Request, res: Response, next: NextFunction) => {
    const error = new InternalServerError('Database connection failed', {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      details: 'Connection timeout after 30 seconds'
    });
    next(error);
  },

  // Test unhandled error (non-AppError)
  unhandledError: (req: Request, res: Response, next: NextFunction) => {
    const error = new Error('This is an unhandled error');
    next(error);
  },

  // Test async error
  asyncError: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Simulate async operation that fails
      await new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Async operation failed')), 100);
      });
    } catch (error) {
      next(error);
    }
  },

  // Test JSON parsing error simulation
  jsonParsingError: (req: Request, res: Response, next: NextFunction) => {
    const error = new SyntaxError('Unexpected token in JSON at position 0');
    (error as any).body = true; // Simulate body parsing error
    next(error);
  },

  // Test database validation error simulation
  mongooseValidationError: (req: Request, res: Response, next: NextFunction) => {
    const error = new Error('Validation failed');
    error.name = 'ValidationError';
    (error as any).errors = {
      email: {
        path: 'email',
        message: 'Email is required',
        value: undefined,
        kind: 'required'
      },
      studentId: {
        path: 'studentId',
        message: 'Student ID must be 9 digits',
        value: '12345',
        kind: 'minlength'
      }
    };
    next(error);
  },

  // Test MongoDB duplicate key error simulation
  mongoDuplicateError: (req: Request, res: Response, next: NextFunction) => {
    const error = new Error('E11000 duplicate key error');
    error.name = 'MongoError';
    (error as any).code = 11000;
    (error as any).keyValue = { email: 'duplicate@example.com' };
    next(error);
  },

  // Test JWT token expired error simulation
  jwtExpiredError: (req: Request, res: Response, next: NextFunction) => {
    const error = new Error('jwt expired');
    error.name = 'TokenExpiredError';
    next(error);
  },

  // Test JWT malformed error simulation
  jwtMalformedError: (req: Request, res: Response, next: NextFunction) => {
    const error = new Error('jwt malformed');
    error.name = 'JsonWebTokenError';
    next(error);
  }
};

/**
 * Test data for error scenarios
 */
export const testErrorData = {
  validationErrors: [
    { field: 'email', value: 'invalid-email', constraint: 'Must be a valid email' },
    { field: 'password', value: '123', constraint: 'Must be at least 6 characters' },
    { field: 'studentId', value: '12345', constraint: 'Must be exactly 9 digits' }
  ],
  
  authenticationScenarios: [
    'Invalid credentials',
    'Token expired',
    'Token malformed',
    'User not found'
  ],
  
  authorizationScenarios: [
    { resource: 'student profile', action: 'update' },
    { resource: 'admin panel', action: 'access' },
    { resource: 'grades', action: 'modify' }
  ],
  
  notFoundResources: [
    { type: 'Student', id: '507f1f77bcf86cd799439011' },
    { type: 'Course', id: 'MATH101' },
    { type: 'Schedule', id: '2024-1' }
  ],
  
  conflictScenarios: [
    { field: 'email', value: 'existing@example.com' },
    { field: 'studentId', value: '123456789' }
  ]
};

/**
 * Utility to create test error instances
 */
export const createTestError = (type: string, data?: any): AppError => {
  switch (type) {
    case 'validation':
      return new ValidationError('Validation failed', data);
    case 'authentication':
      return new AuthenticationError(data?.message || 'Authentication failed');
    case 'notFound':
      return new NotFoundError(data?.message || 'Resource not found');
    case 'conflict':
      return new ConflictError(data?.message || 'Resource conflict', data);
    case 'internal':
      return new InternalServerError(data?.message || 'Internal server error', data);
    default:
      return new InternalServerError('Unknown error type');
  }
};

/**
 * Test error logging functionality
 */
export const testErrorLogging = () => {
  const errors = [
    createTestError('validation', { field: 'email', value: 'invalid' }),
    createTestError('authentication', { message: 'Invalid token' }),
    createTestError('notFound', { message: 'Student not found' }),
    createTestError('internal', { message: 'Database connection failed' })
  ];

  console.log('Testing error creation and properties:');
  errors.forEach((error, index) => {
    console.log(`\nError ${index + 1}:`);
    console.log(`  Name: ${error.name}`);
    console.log(`  Message: ${error.message}`);
    console.log(`  Status Code: ${error.statusCode}`);
    console.log(`  Operational: ${error.isOperational}`);
    console.log(`  Timestamp: ${error.timestamp}`);
    if (error.details) {
      console.log(`  Details: ${JSON.stringify(error.details, null, 2)}`);
    }
  });
};

// Export for testing purposes
export default {
  testErrorHandlers,
  testErrorData,
  createTestError,
  testErrorLogging
};