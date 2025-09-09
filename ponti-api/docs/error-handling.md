# Error Handling System Documentation

## Overview

The Ponti API implements a comprehensive centralized error handling system that provides consistent error responses, secure logging, and proper error categorization. The system follows best practices for Node.js/Express applications and ensures all errors are handled gracefully.

## Architecture

### Error Classes Hierarchy

```
AppError (Abstract Base Class)
├── ValidationError (400)
├── AuthenticationError (401)
├── AuthorizationError (403)
├── NotFoundError (404)
├── ConflictError (409)
├── RateLimitError (429)
├── InternalServerError (500)
├── ServiceUnavailableError (503)
├── DatabaseError (500)
├── ExternalServiceError (503)
├── TokenError (401)
└── BadRequestError (400)
```

### Core Components

1. **Error Classes** (`src/utils/errors.ts`)
   - Custom error classes extending base `AppError`
   - Error factory for consistent error creation
   - Error sanitization utilities
   - Error code constants

2. **Error Handler Middleware** (`src/middleware/errorHandler.ts`)
   - Global error handling middleware
   - Database error conversion
   - JWT error handling
   - Standardized error responses
   - Comprehensive logging

3. **Logger Configuration** (`src/config/logger.ts`)
   - Winston-based logging
   - Environment-specific formats
   - File rotation and management
   - Security event logging

## Usage

### Creating Errors

#### Using Error Classes Directly

```typescript
import { ValidationError, NotFoundError, AuthenticationError } from '../utils/errors';

// Validation error
throw new ValidationError('Email is required', {
  field: 'email',
  value: undefined,
  constraint: 'required'
});

// Not found error
throw new NotFoundError('Student not found');

// Authentication error
throw new AuthenticationError('Invalid credentials');
```

#### Using Error Factory

```typescript
import { ErrorFactory } from '../utils/errors';

// Create validation error
const error = ErrorFactory.createValidationError('email', 'invalid@', 'Must be valid email');

// Create not found error
const error = ErrorFactory.createNotFoundError('Student', '123456789');

// Create authentication error
const error = ErrorFactory.createAuthenticationError('Token expired');
```

### Error Handling in Routes

#### With Async Handler

```typescript
import { asyncHandler } from '../middleware/errorHandler';
import { NotFoundError } from '../utils/errors';

export const getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  
  if (!student) {
    throw new NotFoundError('Student not found');
  }
  
  res.json(successResponse(student));
});
```

#### Manual Error Passing

```typescript
export const updateStudent = (req, res, next) => {
  try {
    // ... logic here
  } catch (error) {
    next(error); // Pass to error handler
  }
};
```

### Response Formats

#### Success Response

```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "John Doe"
  },
  "message": "Student retrieved successfully",
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ValidationError",
    "message": "Validation failed for field 'email'",
    "details": {
      "field": "email",
      "value": "invalid@",
      "constraint": "Must be valid email",
      "code": "VALIDATION_ERROR"
    },
    "timestamp": "2024-01-15T10:30:00.000Z",
    "requestId": "req-123-456"
  }
}
```

## Error Types and Status Codes

| Error Type | Status Code | Description | When to Use |
|------------|-------------|-------------|-------------|
| ValidationError | 400 | Invalid input data | Form validation, schema validation |
| BadRequestError | 400 | Malformed request | JSON parsing errors, invalid request format |
| AuthenticationError | 401 | Authentication failed | Invalid credentials, missing token |
| TokenError | 401 | JWT token issues | Expired, malformed, or invalid tokens |
| AuthorizationError | 403 | Insufficient permissions | Access denied to resources |
| NotFoundError | 404 | Resource not found | Missing entities, invalid IDs |
| ConflictError | 409 | Resource conflict | Duplicate entries, constraint violations |
| RateLimitError | 429 | Too many requests | Rate limiting exceeded |
| InternalServerError | 500 | Server error | Unexpected errors, system failures |
| DatabaseError | 500 | Database issues | Connection failures, query errors |
| ServiceUnavailableError | 503 | Service down | Maintenance, overload |
| ExternalServiceError | 503 | External API issues | Third-party service failures |

## Logging

### Log Levels

- **ERROR**: Server errors (5xx), critical issues
- **WARN**: Security events, authentication failures
- **INFO**: Client errors (4xx), general information
- **DEBUG**: Detailed debugging information

### Log Structure

```json
{
  "level": "error",
  "message": "Server Error Occurred",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "ponti-api",
  "environment": "production",
  "error": {
    "name": "DatabaseError",
    "message": "Connection timeout",
    "statusCode": 500,
    "stack": "Error: Connection timeout\n    at ..."
  },
  "request": {
    "url": "/api/students/123",
    "method": "GET",
    "ip": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "userId": "123456789",
    "requestId": "req-123-456"
  }
}
```

### Security Logging

Security events are logged with special markers:

```json
{
  "level": "warn",
  "message": "Security Event: Authentication Failed",
  "securityEvent": true,
  "eventType": "AUTHENTICATION_FAILED",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Configuration

### Environment Variables

```env
NODE_ENV=production          # Environment (development/production/test)
LOG_LEVEL=info              # Logging level
```

### File Locations

- **Error logs**: `logs/error.log`
- **Combined logs**: `logs/combined.log`
- **Security logs**: `logs/security.log`
- **Exception logs**: `logs/exceptions.log`
- **Rejection logs**: `logs/rejections.log`

### Log Rotation

- **Max file size**: 5MB
- **Max files**: 5 (error/combined), 10 (security)
- **Tailable**: Yes (for log monitoring tools)

## Best Practices

### 1. Error Creation

```typescript
// ✅ Good - Specific error with context
throw new ValidationError('Email validation failed', {
  field: 'email',
  value: req.body.email,
  constraint: 'Must be a valid email address'
});

// ❌ Bad - Generic error without context
throw new Error('Validation failed');
```

### 2. Error Handling

```typescript
// ✅ Good - Use async handler
export const getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    throw new NotFoundError('Student not found');
  }
  res.json(successResponse(student));
});

// ❌ Bad - Manual try/catch everywhere
export const getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(student);
  } catch (error) {
    next(error);
  }
};
```

### 3. Sensitive Data

```typescript
// ✅ Good - Sanitized logging
const sanitizedError = sanitizeErrorForLogging(error);
logger.error('Authentication failed', sanitizedError);

// ❌ Bad - Logging sensitive data
logger.error('Authentication failed', {
  password: user.password, // Sensitive!
  token: req.headers.authorization // Sensitive!
});
```

### 4. Error Responses

```typescript
// ✅ Good - Consistent response format
res.status(error.statusCode).json({
  success: false,
  error: {
    code: error.name,
    message: error.message,
    timestamp: error.timestamp
  }
});

// ❌ Bad - Inconsistent format
res.status(500).json({
  error: error.message
});
```

## Testing

### Error Handler Testing

```typescript
import request from 'supertest';
import app from '../src/index';

describe('Error Handling', () => {
  it('should handle validation errors', async () => {
    const response = await request(app)
      .post('/api/students')
      .send({ email: 'invalid-email' });
    
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('ValidationError');
  });
  
  it('should handle not found errors', async () => {
    const response = await request(app)
      .get('/api/students/nonexistent');
    
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NotFoundError');
  });
});
```

## Monitoring and Alerts

### Production Monitoring

1. **Log Aggregation**: Use tools like ELK Stack, Splunk, or CloudWatch
2. **Error Tracking**: Integrate with Sentry, Bugsnag, or similar
3. **Metrics**: Track error rates, response times, and patterns
4. **Alerts**: Set up alerts for critical errors and high error rates

### Key Metrics to Monitor

- Error rate by endpoint
- Response time percentiles
- Authentication failure rates
- Database error frequency
- Rate limiting triggers

## Troubleshooting

### Common Issues

1. **Logs not appearing**: Check file permissions and disk space
2. **Memory leaks**: Monitor log file sizes and rotation
3. **Performance impact**: Adjust log levels in production
4. **Missing context**: Ensure request IDs are included

### Debug Mode

Enable debug logging in development:

```env
LOG_LEVEL=debug
NODE_ENV=development
```

This provides detailed error information including stack traces and request details.