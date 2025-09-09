/**
 * Base application error class
 */
export abstract class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    details?: any
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 400, true, details);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, true);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error (403)
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, true);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, true);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict error (409)
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', details?: any) {
    super(message, 409, true, details);
    this.name = 'ConflictError';
  }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, true);
    this.name = 'RateLimitError';
  }
}

/**
 * Internal server error (500)
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', details?: any) {
    super(message, 500, true, details);
    this.name = 'InternalServerError';
  }
}

/**
 * Database error
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', details?: any) {
    super(message, 500, true, details);
    this.name = 'DatabaseError';
  }
}

/**
 * External service error
 */
export class ExternalServiceError extends AppError {
  constructor(message: string = 'External service unavailable', statusCode: number = 503) {
    super(message, statusCode, true);
    this.name = 'ExternalServiceError';
  }
}

/**
 * JWT token error
 */
export class TokenError extends AppError {
  constructor(message: string = 'Invalid token', statusCode: number = 401) {
    super(message, statusCode, true);
    this.name = 'TokenError';
  }
}

/**
 * Service unavailable error (503)
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable') {
    super(message, 503, true);
    this.name = 'ServiceUnavailableError';
  }
}

/**
 * Bad request error (400)
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', details?: any) {
    super(message, 400, true, details);
    this.name = 'BadRequestError';
  }
}

/**
 * Error factory for creating specific error types
 */
export class ErrorFactory {
  static createValidationError(field: string, value: any, constraint: string): ValidationError {
    return new ValidationError(`Validation failed for field '${field}'`, {
      field,
      value,
      constraint,
      code: 'VALIDATION_ERROR'
    });
  }

  static createDuplicateError(field: string, value: any): ConflictError {
    return new ConflictError(`Duplicate value for field '${field}'`, {
      field,
      value,
      code: 'DUPLICATE_ERROR'
    });
  }

  static createNotFoundError(resource: string, identifier?: string): NotFoundError {
    const message = identifier 
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    
    return new NotFoundError(message);
  }

  static createAuthenticationError(reason?: string): AuthenticationError {
    const message = reason 
      ? `Authentication failed: ${reason}`
      : 'Authentication failed';
    
    return new AuthenticationError(message);
  }

  static createAuthorizationError(resource?: string, action?: string): AuthorizationError {
    const message = resource && action
      ? `Access denied: insufficient permissions to ${action} ${resource}`
      : 'Access denied: insufficient permissions';
    
    return new AuthorizationError(message);
  }
}

/**
 * Error code constants
 */
export const ERROR_CODES = {
  // Authentication & Authorization
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  ACCESS_DENIED: 'ACCESS_DENIED',
  
  // Validation
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Database
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  DATABASE_ERROR: 'DATABASE_ERROR',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Server
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR'
} as const;

/**
 * Utility function to check if error is operational
 */
export const isOperationalError = (error: Error): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

/**
 * Utility function to sanitize error for logging
 * Removes sensitive information from error details
 */
export const sanitizeErrorForLogging = (error: AppError): Partial<AppError> => {
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
  
  const sanitizedError = {
    name: error.name,
    message: error.message,
    statusCode: error.statusCode,
    timestamp: error.timestamp,
    stack: error.stack,
    details: error.details
  };

  // Remove sensitive information from details
  if (sanitizedError.details && typeof sanitizedError.details === 'object') {
    const sanitizedDetails = { ...sanitizedError.details };
    
    const sanitizeObject = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj;
      
      const sanitized = Array.isArray(obj) ? [] : {};
      
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        const isSensitive = sensitiveFields.some(field => lowerKey.includes(field));
        
        if (isSensitive) {
          (sanitized as any)[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
          (sanitized as any)[key] = sanitizeObject(value);
        } else {
          (sanitized as any)[key] = value;
        }
      }
      
      return sanitized;
    };
    
    sanitizedError.details = sanitizeObject(sanitizedDetails);
  }

  return sanitizedError;
};