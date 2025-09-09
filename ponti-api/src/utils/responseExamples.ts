/**
 * Examples of standardized API responses
 * This file demonstrates how to use the response utilities consistently
 */

import { Response } from 'express';
import { ResponseFormatter, HTTP_STATUS, RESPONSE_MESSAGES } from './responseFormatter';
import { PaginationUtils } from './responseFormatter';

/**
 * Example: Basic success response
 */
export const exampleSuccessResponse = (res: Response) => {
  const userData = {
    id: '123456789',
    name: 'Juan Pérez',
    email: 'juan.perez@upb.edu.co'
  };

  return ResponseFormatter.sendSuccess(
    res,
    userData,
    RESPONSE_MESSAGES.PROFILE_RETRIEVED,
    HTTP_STATUS.OK
  );
};

/**
 * Example: Created response
 */
export const exampleCreatedResponse = (res: Response) => {
  const newResource = {
    id: '987654321',
    name: 'New Resource',
    createdAt: new Date().toISOString()
  };

  return ResponseFormatter.sendCreated(
    res,
    newResource,
    RESPONSE_MESSAGES.CREATED
  );
};

/**
 * Example: Paginated response
 */
export const examplePaginatedResponse = (res: Response) => {
  const announcements = [
    { id: '1', title: 'Announcement 1', content: 'Content 1' },
    { id: '2', title: 'Announcement 2', content: 'Content 2' },
    { id: '3', title: 'Announcement 3', content: 'Content 3' }
  ];

  return ResponseFormatter.sendPaginated(
    res,
    announcements,
    1, // current page
    10, // items per page
    25, // total items
    RESPONSE_MESSAGES.ANNOUNCEMENTS_RETRIEVED
  );
};

/**
 * Example: Error response
 */
export const exampleErrorResponse = (res: Response) => {
  return ResponseFormatter.sendError(
    res,
    'VALIDATION_ERROR',
    'Invalid input data provided',
    HTTP_STATUS.BAD_REQUEST,
    {
      field: 'email',
      message: 'Email format is invalid',
      value: 'invalid-email'
    }
  );
};

/**
 * Example: Using Express Response extensions
 */
export const exampleUsingResponseExtensions = (res: Response) => {
  // Success response using extension method
  const data = { message: 'Hello World' };
  return res.success(data, 'Operation successful');
};

/**
 * Example: Complex paginated response with metadata
 */
export const exampleComplexPaginatedResponse = (res: Response, query: any) => {
  // Parse pagination parameters
  const { page, limit } = PaginationUtils.parseParams(query);
  
  // Validate parameters
  const validation = PaginationUtils.validateParams(page, limit);
  if (!validation.isValid) {
    return ResponseFormatter.sendError(
      res,
      'VALIDATION_ERROR',
      'Invalid pagination parameters',
      HTTP_STATUS.BAD_REQUEST,
      { errors: validation.errors }
    );
  }

  // Mock data
  const mockData = Array.from({ length: limit }, (_, i) => ({
    id: `item-${(page - 1) * limit + i + 1}`,
    name: `Item ${(page - 1) * limit + i + 1}`,
    createdAt: new Date().toISOString()
  }));

  const totalItems = 100; // Mock total

  // Create pagination links
  const baseUrl = '/api/items';
  const links = PaginationUtils.createLinks(baseUrl, page, limit, totalItems);

  // Send response with additional metadata
  const response = ResponseFormatter.paginated(
    mockData,
    page,
    limit,
    totalItems,
    'Items retrieved successfully'
  );

  // Add links to metadata
  if (response.meta) {
    (response.meta as any).links = links;
  }

  return res.status(HTTP_STATUS.OK).json(response);
};

/**
 * Example response formats for different scenarios
 */
export const EXAMPLE_RESPONSES = {
  // Success response
  success: {
    success: true,
    data: {
      id: '123456789',
      name: 'Juan Pérez',
      email: 'juan.perez@upb.edu.co'
    },
    message: 'Profile retrieved successfully',
    meta: {
      timestamp: '2024-01-15T10:30:00.000Z'
    }
  },

  // Error response
  error: {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Invalid input data provided',
      details: {
        field: 'email',
        message: 'Email format is invalid',
        value: 'invalid-email'
      },
      timestamp: '2024-01-15T10:30:00.000Z'
    }
  },

  // Paginated response
  paginated: {
    success: true,
    data: [
      { id: '1', title: 'Announcement 1', content: 'Content 1' },
      { id: '2', title: 'Announcement 2', content: 'Content 2' }
    ],
    message: 'Announcements retrieved successfully',
    meta: {
      pagination: {
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: false
      },
      timestamp: '2024-01-15T10:30:00.000Z'
    }
  },

  // Created response
  created: {
    success: true,
    data: {
      id: '987654321',
      name: 'New Resource',
      createdAt: '2024-01-15T10:30:00.000Z'
    },
    message: 'Resource created successfully',
    meta: {
      timestamp: '2024-01-15T10:30:00.000Z'
    }
  },

  // No content response (204)
  noContent: null, // Empty body with 204 status

  // Authentication error
  authError: {
    success: false,
    error: {
      code: 'AUTHENTICATION_ERROR',
      message: 'Invalid credentials provided',
      timestamp: '2024-01-15T10:30:00.000Z'
    }
  },

  // Rate limit error
  rateLimitError: {
    success: false,
    error: {
      code: 'RATE_LIMIT_ERROR',
      message: 'Too many requests from this IP, please try again later.',
      details: {
        retryAfter: '60'
      },
      timestamp: '2024-01-15T10:30:00.000Z'
    }
  }
};

/**
 * Response format validation utility
 */
export const validateResponseFormat = (response: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check if response has required success field
  if (typeof response.success !== 'boolean') {
    errors.push('Response must have a boolean "success" field');
  }

  // Check success response format
  if (response.success === true) {
    if (!response.hasOwnProperty('data')) {
      errors.push('Success response must have a "data" field');
    }

    if (response.meta && typeof response.meta.timestamp !== 'string') {
      errors.push('Meta timestamp must be a string');
    }
  }

  // Check error response format
  if (response.success === false) {
    if (!response.error) {
      errors.push('Error response must have an "error" field');
    } else {
      if (typeof response.error.code !== 'string') {
        errors.push('Error code must be a string');
      }
      if (typeof response.error.message !== 'string') {
        errors.push('Error message must be a string');
      }
      if (typeof response.error.timestamp !== 'string') {
        errors.push('Error timestamp must be a string');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};