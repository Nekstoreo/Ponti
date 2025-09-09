import { APIResponse, APIErrorResponse as APIError, ErrorCodes, PaginationMeta } from '../types';

/**
 * Create a standardized success response
 */
export const createSuccessResponse = <T>(
  data: T,
  message?: string,
  meta?: { pagination?: PaginationMeta }
): APIResponse<T> => {
  return {
    success: true,
    data,
    message,
    meta: {
      ...meta,
      timestamp: new Date().toISOString(),
    },
  };
};

/**
 * Create a standardized error response
 */
export const createErrorResponse = (
  code: ErrorCodes,
  message: string,
  details?: unknown
): APIError => {
  return {
    success: false,
    error: {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    },
  };
};

/**
 * Calculate pagination metadata
 */
export const calculatePagination = (page: number, limit: number, total: number): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

/**
 * Sanitize user input by removing potentially dangerous characters
 */
export const sanitizeInput = (input: string): string => {
  return input.replace(/[<>"'%;()&+]/g, '');
};

/**
 * Generate a random string of specified length
 */
export const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Check if a string is a valid email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if a string is a valid student ID format (9 digits)
 */
export const isValidStudentId = (studentId: string): boolean => {
  const studentIdRegex = /^\d{9}$/;
  return studentIdRegex.test(studentId);
};

// Re-export database utilities
export * from './database';

// Re-export error classes
export * from './errors';

// Re-export response utilities
export * from './response';
export * from './responseFormatter';

// Re-export sanitizer utilities
export * from './sanitizer';
