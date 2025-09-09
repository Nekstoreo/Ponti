import { Request, Response, NextFunction } from 'express';
import { APISuccessResponse, APIErrorResponse, PaginationMeta } from '../types';

/**
 * Extend Express Response interface to include custom response methods
 */
declare global {
  namespace Express {
    interface Response {
      success<T>(data: T, message?: string, statusCode?: number): Response;
      created<T>(data: T, message?: string): Response;
      accepted<T>(data: T, message?: string): Response;
      noContent(): Response;
      paginated<T>(data: T[], page: number, limit: number, total: number, message?: string): Response;
      error(code: string, message: string, statusCode?: number, details?: any): Response;
    }
  }
}

/**
 * Middleware to add standardized response methods to Express Response object
 */
export const responseMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  /**
   * Send a successful response
   */
  res.success = function<T>(data: T, message?: string, statusCode: number = 200): Response {
    const response: APISuccessResponse<T> = {
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString()
      }
    };

    return this.status(statusCode).json(response);
  };

  /**
   * Send a created response (201)
   */
  res.created = function<T>(data: T, message: string = 'Resource created successfully'): Response {
    const response: APISuccessResponse<T> = {
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString()
      }
    };

    return this.status(201).json(response);
  };

  /**
   * Send an accepted response (202)
   */
  res.accepted = function<T>(data: T, message: string = 'Request accepted for processing'): Response {
    const response: APISuccessResponse<T> = {
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString()
      }
    };

    return this.status(202).json(response);
  };

  /**
   * Send a no content response (204)
   */
  res.noContent = function(): Response {
    return this.status(204).send();
  };

  /**
   * Send a paginated response
   */
  res.paginated = function<T>(
    data: T[], 
    page: number, 
    limit: number, 
    total: number, 
    message?: string
  ): Response {
    const totalPages = Math.ceil(total / limit);
    
    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };

    const response: APISuccessResponse<T[]> = {
      success: true,
      data,
      message,
      meta: {
        pagination,
        timestamp: new Date().toISOString()
      }
    };

    return this.status(200).json(response);
  };

  /**
   * Send an error response
   */
  res.error = function(
    code: string, 
    message: string, 
    statusCode: number = 500, 
    details?: any
  ): Response {
    const response: APIErrorResponse = {
      success: false,
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString()
      }
    };

    return this.status(statusCode).json(response);
  };

  next();
};

export default responseMiddleware;