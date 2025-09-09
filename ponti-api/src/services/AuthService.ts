import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Student, IStudent } from '../models/Student';
import { AuthResult, LoginCredentials, CustomError, ErrorCodes } from '../types';
import config from '../config';

export class AuthService {
  /**
   * Authenticate a student with their credentials
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const { studentId, password } = credentials;

    try {
      // Find student by studentId and include password field
      const student = await Student.findOne({ studentId }).select('+password');
      
      if (!student) {
        const error: CustomError = new Error('Invalid credentials') as CustomError;
        error.statusCode = 401;
        error.code = ErrorCodes.AUTHENTICATION_ERROR;
        throw error;
      }

      // Check if student is active
      if (student.academic.status !== 'active') {
        const error: CustomError = new Error('Account is not active') as CustomError;
        error.statusCode = 401;
        error.code = ErrorCodes.AUTHENTICATION_ERROR;
        error.details = { status: student.academic.status };
        throw error;
      }

      // Verify password
      const isPasswordValid = await student.comparePassword(password);
      if (!isPasswordValid) {
        const error: CustomError = new Error('Invalid credentials') as CustomError;
        error.statusCode = 401;
        error.code = ErrorCodes.AUTHENTICATION_ERROR;
        throw error;
      }

      // Generate JWT token
      const token = this.generateToken(student);

      // Return authentication result
      return {
        token,
        expiresIn: config.jwt.expiresIn,
        user: {
          studentId: student.studentId,
          email: student.email,
          firstName: student.firstName,
          lastName: student.lastName,
        },
      };
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }
      
      const authError: CustomError = new Error('Authentication failed') as CustomError;
      authError.statusCode = 500;
      authError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      authError.details = error;
      throw authError;
    }
  }

  /**
   * Generate JWT token for authenticated student
   */
  generateToken(student: IStudent): string {
    const payload = {
      studentId: student.studentId,
      email: student.email,
      firstName: student.firstName,
      lastName: student.lastName,
      iat: Math.floor(Date.now() / 1000),
    };

    try {
      return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
        algorithm: config.jwt.algorithm as jwt.Algorithm,
        issuer: 'ponti-api',
        audience: 'ponti-app',
      });
    } catch (error) {
      const tokenError: CustomError = new Error('Token generation failed') as CustomError;
      tokenError.statusCode = 500;
      tokenError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      tokenError.details = error;
      throw tokenError;
    }
  }

  /**
   * Validate and decode JWT token
   */
  async validateToken(token: string): Promise<IStudent> {
    try {
      // Verify and decode token
      const decoded = jwt.verify(token, config.jwt.secret, {
        algorithms: [config.jwt.algorithm as jwt.Algorithm],
        issuer: 'ponti-api',
        audience: 'ponti-app',
      }) as jwt.JwtPayload;

      if (!decoded.studentId) {
        const error: CustomError = new Error('Invalid token payload') as CustomError;
        error.statusCode = 401;
        error.code = ErrorCodes.AUTHENTICATION_ERROR;
        throw error;
      }

      // Find student by studentId from token
      const student = await Student.findOne({ studentId: decoded.studentId });
      
      if (!student) {
        const error: CustomError = new Error('Student not found') as CustomError;
        error.statusCode = 401;
        error.code = ErrorCodes.AUTHENTICATION_ERROR;
        throw error;
      }

      // Check if student is still active
      if (student.academic.status !== 'active') {
        const error: CustomError = new Error('Account is no longer active') as CustomError;
        error.statusCode = 401;
        error.code = ErrorCodes.AUTHENTICATION_ERROR;
        error.details = { status: student.academic.status };
        throw error;
      }

      return student;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        const authError: CustomError = new Error('Invalid token') as CustomError;
        authError.statusCode = 401;
        authError.code = ErrorCodes.AUTHENTICATION_ERROR;
        authError.details = { reason: error.message };
        throw authError;
      }

      if (error instanceof jwt.TokenExpiredError) {
        const authError: CustomError = new Error('Token expired') as CustomError;
        authError.statusCode = 401;
        authError.code = ErrorCodes.AUTHENTICATION_ERROR;
        authError.details = { expiredAt: error.expiredAt };
        throw authError;
      }

      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }

      const validationError: CustomError = new Error('Token validation failed') as CustomError;
      validationError.statusCode = 500;
      validationError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      validationError.details = error;
      throw validationError;
    }
  }

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(config.security.bcryptSaltRounds);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      const hashError: CustomError = new Error('Password hashing failed') as CustomError;
      hashError.statusCode = 500;
      hashError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      hashError.details = error;
      throw hashError;
    }
  }

  /**
   * Compare password with hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      const compareError: CustomError = new Error('Password comparison failed') as CustomError;
      compareError.statusCode = 500;
      compareError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      compareError.details = error;
      throw compareError;
    }
  }

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Refresh token (generate new token for existing user)
   */
  async refreshToken(currentToken: string): Promise<AuthResult> {
    try {
      // Validate current token
      const student = await this.validateToken(currentToken);
      
      // Generate new token
      const newToken = this.generateToken(student);

      return {
        token: newToken,
        expiresIn: config.jwt.expiresIn,
        user: {
          studentId: student.studentId,
          email: student.email,
          firstName: student.firstName,
          lastName: student.lastName,
        },
      };
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }

      const refreshError: CustomError = new Error('Token refresh failed') as CustomError;
      refreshError.statusCode = 500;
      refreshError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      refreshError.details = error;
      throw refreshError;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();