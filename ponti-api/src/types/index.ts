import { Request } from 'express';

// Extend Express Request interface to include authenticated user
export interface AuthenticatedRequest extends Request {
  studentId?: string;
  user?: {
    studentId: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

// Standard API Response interfaces
export interface APISuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    pagination?: PaginationMeta;
    timestamp: string;
  };
}

export interface APIErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    timestamp: string;
  };
}

export type APIResponse<T = unknown> = APISuccessResponse<T> | APIErrorResponse;

// Backward compatibility alias
export type APIError = APIErrorResponse;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Authentication related types
export interface LoginCredentials {
  studentId: string;
  password: string;
}

export interface AuthResult {
  token: string;
  expiresIn: string;
  user: {
    studentId: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

// Common error types
export enum ErrorCodes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR', // Alias for backward compatibility
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
}

export interface CustomError extends Error {
  statusCode: number;
  code: ErrorCodes;
  details?: unknown;
}

// Student related types for API responses
export interface StudentProfile {
  studentId: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  gender: string;
  academic: {
    level: string;
    semester: string;
    status: string;
    admissionPeriod: string;
    campusId: string;
    schoolId: string;
    programId: string;
    currentPeriod: string;
    metrics: {
      totalCreditsAttempted: number;
      totalCreditsApproved: number;
      currentGPA: number;
      totalSemesters: number;
    };
  };
  preferences: {
    notifications: {
      classReminders: boolean;
      announcements: boolean;
      grades: boolean;
    };
    theme: string;
    language: string;
  };
  age?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AcademicSummary {
  level: string;
  semester: string;
  status: string;
  gpa: number;
  totalCredits: number;
}
