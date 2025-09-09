# API Response Standards

This document outlines the standardized response format for the Ponti API, ensuring consistency across all endpoints.

## Response Format

All API responses follow a consistent structure with the following fields:

### Success Response Format

```typescript
{
  success: true,
  data: T, // The actual response data
  message?: string, // Optional descriptive message
  meta?: {
    pagination?: PaginationMeta, // For paginated responses
    timestamp: string // ISO 8601 timestamp
  }
}
```

### Error Response Format

```typescript
{
  success: false,
  error: {
    code: string, // Error code for programmatic handling
    message: string, // Human-readable error message
    details?: any, // Additional error details (validation errors, etc.)
    timestamp: string // ISO 8601 timestamp
  }
}
```

## HTTP Status Codes

The API uses standard HTTP status codes:

### Success Codes (2xx)
- `200 OK` - Successful GET, PUT, PATCH requests
- `201 Created` - Successful POST requests that create resources
- `202 Accepted` - Request accepted for processing
- `204 No Content` - Successful DELETE requests

### Client Error Codes (4xx)
- `400 Bad Request` - Invalid request data or parameters
- `401 Unauthorized` - Authentication required or invalid credentials
- `403 Forbidden` - Access denied (insufficient permissions)
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (duplicate data)
- `422 Unprocessable Entity` - Validation errors
- `429 Too Many Requests` - Rate limit exceeded

### Server Error Codes (5xx)
- `500 Internal Server Error` - Unexpected server error
- `503 Service Unavailable` - Service temporarily unavailable

## Pagination

For endpoints that return lists of data, pagination is implemented using the following structure:

```typescript
{
  success: true,
  data: T[], // Array of items
  message?: string,
  meta: {
    pagination: {
      page: number, // Current page (1-based)
      limit: number, // Items per page
      total: number, // Total number of items
      totalPages: number, // Total number of pages
      hasNext: boolean, // Whether there's a next page
      hasPrev: boolean // Whether there's a previous page
    },
    timestamp: string
  }
}
```

### Pagination Parameters

- `page` (query parameter): Page number (default: 1, min: 1)
- `limit` (query parameter): Items per page (default: 20, min: 1, max: 100)

## Response Examples

### 1. Successful Data Retrieval

```json
{
  "success": true,
  "data": {
    "studentId": "123456789",
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan.perez@upb.edu.co"
  },
  "message": "Profile retrieved successfully",
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Resource Creation

```json
{
  "success": true,
  "data": {
    "id": "987654321",
    "name": "New Resource",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Resource created successfully",
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3. Paginated Response

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "Important Announcement",
      "content": "This is an important announcement for all students.",
      "publishDate": "2024-01-15T09:00:00.000Z"
    },
    {
      "id": "2",
      "title": "Schedule Update",
      "content": "There has been a change in the class schedule.",
      "publishDate": "2024-01-14T15:30:00.000Z"
    }
  ],
  "message": "Announcements retrieved successfully",
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    },
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. Validation Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed for the provided data",
    "details": {
      "field": "email",
      "message": "Email format is invalid",
      "value": "invalid-email"
    },
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 5. Authentication Error

```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Invalid credentials provided",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 6. Rate Limit Error

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_ERROR",
    "message": "Too many requests from this IP, please try again later.",
    "details": {
      "retryAfter": "60"
    },
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## Implementation Guidelines

### Using ResponseFormatter

The `ResponseFormatter` class provides static methods for creating standardized responses:

```typescript
import { ResponseFormatter, HTTP_STATUS, RESPONSE_MESSAGES } from '../utils/responseFormatter';

// Success response
return ResponseFormatter.sendSuccess(
  res,
  userData,
  RESPONSE_MESSAGES.PROFILE_RETRIEVED,
  HTTP_STATUS.OK
);

// Error response
return ResponseFormatter.sendError(
  res,
  'VALIDATION_ERROR',
  'Invalid input data',
  HTTP_STATUS.BAD_REQUEST,
  validationDetails
);

// Paginated response
return ResponseFormatter.sendPaginated(
  res,
  items,
  page,
  limit,
  total,
  'Items retrieved successfully'
);
```

### Using Express Response Extensions

The response middleware extends the Express Response object with convenience methods:

```typescript
// Success response
return res.success(userData, 'Profile retrieved successfully');

// Created response
return res.created(newResource, 'Resource created successfully');

// Paginated response
return res.paginated(items, page, limit, total, 'Items retrieved successfully');

// Error response
return res.error('VALIDATION_ERROR', 'Invalid input data', 400, details);
```

## Error Codes

Standard error codes used throughout the API:

### Authentication & Authorization
- `AUTHENTICATION_ERROR` - Invalid credentials or missing authentication
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `TOKEN_EXPIRED` - JWT token has expired
- `TOKEN_INVALID` - JWT token is malformed or invalid

### Validation
- `VALIDATION_ERROR` - General validation failure
- `INVALID_INPUT` - Invalid input format or type
- `MISSING_REQUIRED_FIELD` - Required field is missing

### Database
- `DATABASE_ERROR` - Database operation failed
- `DUPLICATE_ENTRY` - Attempt to create duplicate resource
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist

### Rate Limiting
- `RATE_LIMIT_ERROR` - Too many requests from client

### Server
- `INTERNAL_SERVER_ERROR` - Unexpected server error
- `SERVICE_UNAVAILABLE` - Service temporarily unavailable
- `EXTERNAL_SERVICE_ERROR` - External service dependency failed

## Best Practices

1. **Consistency**: Always use the standardized response format
2. **Meaningful Messages**: Provide clear, actionable error messages
3. **Appropriate Status Codes**: Use correct HTTP status codes
4. **Pagination**: Implement pagination for list endpoints
5. **Timestamps**: Include timestamps in all responses
6. **Error Details**: Provide helpful error details for debugging
7. **Security**: Don't expose sensitive information in error responses

## Validation

All responses should be validated against the standard format. Use the `validateResponseFormat` utility to ensure compliance:

```typescript
import { validateResponseFormat } from '../utils/responseExamples';

const validation = validateResponseFormat(response);
if (!validation.isValid) {
  console.error('Invalid response format:', validation.errors);
}
```

## Migration Guide

If you're updating existing endpoints to use the new standardized format:

1. Replace direct `res.json()` calls with `ResponseFormatter` methods
2. Update error handling to use standardized error responses
3. Add pagination to list endpoints
4. Include appropriate success messages
5. Ensure all responses include timestamps

### Before (Old Format)
```typescript
res.json({ user: userData });
```

### After (New Format)
```typescript
ResponseFormatter.sendSuccess(res, userData, 'User retrieved successfully');
```