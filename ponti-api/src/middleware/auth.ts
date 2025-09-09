import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/AuthService';
import { AuthenticatedRequest, CustomError, ErrorCodes } from '../types';

interface APIError {
  success: boolean;
  error: {
    code: ErrorCodes;
    message: string;
    details?: any;
    timestamp: string;
  };
}

/**
 * Middleware to verify JWT token and authenticate requests
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authService.extractTokenFromHeader(authHeader);

    if (!token) {
      const error: APIError = {
        success: false,
        error: {
          code: ErrorCodes.AUTHENTICATION_ERROR,
          message: 'Access token is required',
          timestamp: new Date().toISOString(),
        },
      };
      res.status(401).json(error);
      return;
    }

    // Validate token and get student
    const student = await authService.validateToken(token);

    // Add student information to request object
    req.studentId = student.studentId;
    req.user = {
      studentId: student.studentId,
      email: student.email,
      firstName: student.firstName,
      lastName: student.lastName,
    };

    next();
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      const customError = error as CustomError;
      const apiError: APIError = {
        success: false,
        error: {
          code: customError.code,
          message: customError.message,
          details: customError.details,
          timestamp: new Date().toISOString(),
        },
      };
      res.status(customError.statusCode).json(apiError);
      return;
    }

    // Handle unexpected errors
    const apiError: APIError = {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
        message: 'Authentication failed',
        timestamp: new Date().toISOString(),
      },
    };
    res.status(500).json(apiError);
  }
};

/**
 * Middleware to extract student ID from authenticated request
 * This middleware should be used after authenticateToken
 */
export const extractStudentId = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.studentId) {
    const error: APIError = {
      success: false,
      error: {
        code: ErrorCodes.AUTHENTICATION_ERROR,
        message: 'Student ID not found in request. Ensure authentication middleware is applied first.',
        timestamp: new Date().toISOString(),
      },
    };
    res.status(401).json(error);
    return;
  }

  next();
};

/**
 * Middleware for optional authentication
 * Adds user info to request if token is provided and valid, but doesn't fail if no token
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authService.extractTokenFromHeader(authHeader);

    if (token) {
      try {
        const student = await authService.validateToken(token);
        req.studentId = student.studentId;
        req.user = {
          studentId: student.studentId,
          email: student.email,
          firstName: student.firstName,
          lastName: student.lastName,
        };
      } catch (error) {
        // Ignore token validation errors for optional auth
        // Request will proceed without authentication
      }
    }

    next();
  } catch (error) {
    // For optional auth, we don't fail on errors
    next();
  }
};

/**
 * Middleware to check if the authenticated student has specific academic status
 */
export const requireAcademicStatus = (allowedStatuses: string[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.studentId) {
        const error: APIError = {
          success: false,
          error: {
            code: ErrorCodes.AUTHENTICATION_ERROR,
            message: 'Authentication required',
            timestamp: new Date().toISOString(),
          },
        };
        res.status(401).json(error);
        return;
      }

      // Get student from database to check current status
      const { Student } = await import('../models/Student');
      const student = await Student.findOne({ studentId: req.studentId });

      if (!student) {
        const error: APIError = {
          success: false,
          error: {
            code: ErrorCodes.AUTHENTICATION_ERROR,
            message: 'Student not found',
            timestamp: new Date().toISOString(),
          },
        };
        res.status(401).json(error);
        return;
      }

      if (!allowedStatuses.includes(student.academic.status)) {
        const error: APIError = {
          success: false,
          error: {
            code: ErrorCodes.AUTHORIZATION_ERROR,
            message: `Access denied. Required academic status: ${allowedStatuses.join(', ')}`,
            details: { currentStatus: student.academic.status },
            timestamp: new Date().toISOString(),
          },
        };
        res.status(403).json(error);
        return;
      }

      next();
    } catch (error) {
      const apiError: APIError = {
        success: false,
        error: {
          code: ErrorCodes.INTERNAL_SERVER_ERROR,
          message: 'Authorization check failed',
          timestamp: new Date().toISOString(),
        },
      };
      res.status(500).json(apiError);
    }
  };
};

/**
 * Middleware to check if the authenticated student belongs to specific campus
 */
export const requireCampus = (allowedCampusIds: string[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.studentId) {
        const error: APIError = {
          success: false,
          error: {
            code: ErrorCodes.AUTHENTICATION_ERROR,
            message: 'Authentication required',
            timestamp: new Date().toISOString(),
          },
        };
        res.status(401).json(error);
        return;
      }

      // Get student from database to check campus
      const { Student } = await import('../models/Student');
      const student = await Student.findOne({ studentId: req.studentId });

      if (!student) {
        const error: APIError = {
          success: false,
          error: {
            code: ErrorCodes.AUTHENTICATION_ERROR,
            message: 'Student not found',
            timestamp: new Date().toISOString(),
          },
        };
        res.status(401).json(error);
        return;
      }

      if (!allowedCampusIds.includes(student.academic.campusId)) {
        const error: APIError = {
          success: false,
          error: {
            code: ErrorCodes.AUTHORIZATION_ERROR,
            message: `Access denied. Required campus: ${allowedCampusIds.join(', ')}`,
            details: { currentCampus: student.academic.campusId },
            timestamp: new Date().toISOString(),
          },
        };
        res.status(403).json(error);
        return;
      }

      next();
    } catch (error) {
      const apiError: APIError = {
        success: false,
        error: {
          code: ErrorCodes.INTERNAL_SERVER_ERROR,
          message: 'Campus authorization check failed',
          timestamp: new Date().toISOString(),
        },
      };
      res.status(500).json(apiError);
    }
  };
};

/**
 * Middleware to ensure the authenticated student can only access their own data
 */
export const requireSelfAccess = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const requestedStudentId = req.params.studentId || req.body.studentId || req.query.studentId;
  
  if (!req.studentId) {
    const error: APIError = {
      success: false,
      error: {
        code: ErrorCodes.AUTHENTICATION_ERROR,
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      },
    };
    res.status(401).json(error);
    return;
  }

  if (requestedStudentId && requestedStudentId !== req.studentId) {
    const error: APIError = {
      success: false,
      error: {
        code: ErrorCodes.AUTHORIZATION_ERROR,
        message: 'Access denied. You can only access your own data.',
        timestamp: new Date().toISOString(),
      },
    };
    res.status(403).json(error);
    return;
  }

  next();
};