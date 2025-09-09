import { Response } from 'express';
import { APISuccessResponse, APIErrorResponse, PaginationMeta } from '../types';

/**
 * Response formatter utility class for consistent API responses
 * Provides static methods for creating standardized response objects
 */
export class ResponseFormatter {
  /**
   * Create a successful response object
   */
  static success<T>(
    data: T,
    message?: string,
    pagination?: PaginationMeta
  ): APISuccessResponse<T> {
    return {
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString(),
        ...(pagination && { pagination })
      }
    };
  }

  /**
   * Create an error response object
   */
  static error(
    code: string,
    message: string,
    details?: any
  ): APIErrorResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Create a paginated response object
   */
  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
  ): APISuccessResponse<T[]> {
    const pagination = this.createPaginationMeta(page, limit, total);
    return this.success(data, message, pagination);
  }

  /**
   * Create pagination metadata
   */
  static createPaginationMeta(
    page: number,
    limit: number,
    total: number
  ): PaginationMeta {
    const totalPages = Math.ceil(total / limit);
    
    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }

  /**
   * Send a successful response with Express Response object
   */
  static sendSuccess<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200,
    pagination?: PaginationMeta
  ): Response {
    const response = this.success(data, message, pagination);
    return res.status(statusCode).json(response);
  }

  /**
   * Send an error response with Express Response object
   */
  static sendError(
    res: Response,
    code: string,
    message: string,
    statusCode: number = 500,
    details?: any
  ): Response {
    const response = this.error(code, message, details);
    return res.status(statusCode).json(response);
  }

  /**
   * Send a paginated response with Express Response object
   */
  static sendPaginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
  ): Response {
    const response = this.paginated(data, page, limit, total, message);
    return res.status(200).json(response);
  }

  /**
   * Send a created response (201) with Express Response object
   */
  static sendCreated<T>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully'
  ): Response {
    return this.sendSuccess(res, data, message, 201);
  }

  /**
   * Send a no content response (204)
   */
  static sendNoContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Send an accepted response (202)
   */
  static sendAccepted<T>(
    res: Response,
    data: T,
    message: string = 'Request accepted for processing'
  ): Response {
    return this.sendSuccess(res, data, message, 202);
  }
}

/**
 * Response status constants for consistent HTTP status codes
 */
export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  
  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  
  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const;

/**
 * Common response messages for consistency
 */
export const RESPONSE_MESSAGES = {
  // Success messages
  SUCCESS: 'Operation completed successfully',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  RETRIEVED: 'Data retrieved successfully',
  
  // Authentication messages
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  TOKEN_REFRESHED: 'Token refreshed successfully',
  
  // Error messages
  VALIDATION_FAILED: 'Validation failed',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
  CONFLICT: 'Resource conflict',
  INTERNAL_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  
  // Specific feature messages
  PROFILE_RETRIEVED: 'Profile retrieved successfully',
  PREFERENCES_UPDATED: 'Preferences updated successfully',
  SCHEDULE_RETRIEVED: 'Schedule retrieved successfully',
  ANNOUNCEMENTS_RETRIEVED: 'Announcements retrieved successfully'
} as const;

/**
 * Pagination utilities
 */
export class PaginationUtils {
  /**
   * Parse pagination parameters from query string
   */
  static parseParams(query: any): { page: number; limit: number } {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
    
    return { page, limit };
  }

  /**
   * Calculate offset for database queries
   */
  static calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * Validate pagination parameters
   */
  static validateParams(page: number, limit: number): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (page < 1) {
      errors.push('Page must be greater than 0');
    }
    
    if (limit < 1) {
      errors.push('Limit must be greater than 0');
    }
    
    if (limit > 100) {
      errors.push('Limit cannot exceed 100');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Create pagination links for API responses
   */
  static createLinks(
    baseUrl: string,
    page: number,
    limit: number,
    total: number
  ): { first?: string; prev?: string; next?: string; last?: string } {
    const totalPages = Math.ceil(total / limit);
    const links: any = {};
    
    // First page link
    if (page > 1) {
      links.first = `${baseUrl}?page=1&limit=${limit}`;
    }
    
    // Previous page link
    if (page > 1) {
      links.prev = `${baseUrl}?page=${page - 1}&limit=${limit}`;
    }
    
    // Next page link
    if (page < totalPages) {
      links.next = `${baseUrl}?page=${page + 1}&limit=${limit}`;
    }
    
    // Last page link
    if (page < totalPages) {
      links.last = `${baseUrl}?page=${totalPages}&limit=${limit}`;
    }
    
    return links;
  }
}

/**
 * Response metadata utilities
 */
export class ResponseMetadata {
  /**
   * Add request tracking metadata
   */
  static addRequestTracking(meta: any, requestId?: string, userId?: string): any {
    return {
      ...meta,
      requestId,
      userId,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Add performance metadata
   */
  static addPerformanceMetrics(meta: any, startTime: number): any {
    return {
      ...meta,
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Add API version metadata
   */
  static addVersionInfo(meta: any, version: string = '1.0.0'): any {
    return {
      ...meta,
      apiVersion: version,
      timestamp: new Date().toISOString()
    };
  }
}

export default ResponseFormatter;