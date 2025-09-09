import { Response } from 'express';
import { ResponseFormatter, HTTP_STATUS, RESPONSE_MESSAGES } from './responseFormatter';
import { APISuccessResponse, APIErrorResponse, PaginationMeta } from '../types';

// Re-export for backward compatibility
export { HTTP_STATUS, RESPONSE_MESSAGES };
export type { APISuccessResponse, APIErrorResponse, PaginationMeta };

/**
 * Sends a successful response
 * @deprecated Use ResponseFormatter.sendSuccess instead
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200,
  pagination?: PaginationMeta
): Response => {
  return ResponseFormatter.sendSuccess(res, data, message, statusCode, pagination);
};

/**
 * Sends a created response (201)
 * @deprecated Use ResponseFormatter.sendCreated instead
 */
export const sendCreated = <T>(
  res: Response,
  data: T,
  message: string = RESPONSE_MESSAGES.CREATED
): Response => {
  return ResponseFormatter.sendCreated(res, data, message);
};

/**
 * Sends a no content response (204)
 * @deprecated Use ResponseFormatter.sendNoContent instead
 */
export const sendNoContent = (res: Response): Response => {
  return ResponseFormatter.sendNoContent(res);
};

/**
 * Creates pagination metadata
 * @deprecated Use ResponseFormatter.createPaginationMeta instead
 */
export const createPaginationMeta = (
  page: number,
  limit: number,
  total: number
): PaginationMeta => {
  return ResponseFormatter.createPaginationMeta(page, limit, total);
};

/**
 * Sends a paginated response
 * @deprecated Use ResponseFormatter.sendPaginated instead
 */
export const sendPaginated = <T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): Response => {
  return ResponseFormatter.sendPaginated(res, data, page, limit, total, message);
};

/**
 * Sends an error response
 * @deprecated Use ResponseFormatter.sendError instead
 */
export const sendError = (
  res: Response,
  code: string,
  message: string,
  statusCode: number = 500,
  details?: any
): Response => {
  return ResponseFormatter.sendError(res, code, message, statusCode, details);
};

/**
 * Response wrapper utility for consistent API responses
 * @deprecated Use ResponseFormatter instead
 */
export class ResponseWrapper {
  /**
   * Wrap successful response
   */
  static success<T>(
    data: T,
    message?: string,
    pagination?: PaginationMeta
  ): APISuccessResponse<T> {
    return ResponseFormatter.success(data, message, pagination);
  }

  /**
   * Wrap error response
   */
  static error(
    code: string,
    message: string,
    details?: any
  ): APIErrorResponse {
    return ResponseFormatter.error(code, message, details);
  }

  /**
   * Wrap paginated response
   */
  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
  ): APISuccessResponse<T[]> {
    return ResponseFormatter.paginated(data, page, limit, total, message);
  }
}

// Export the new ResponseFormatter as the primary interface
export { ResponseFormatter };
export default ResponseFormatter;