import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/AuthService';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest, LoginCredentials, CustomError, ErrorCodes } from '../types';

export class AuthController {
  /**
   * POST /api/auth/login
   * Authenticate student with credentials
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const credentials: LoginCredentials = req.body;
      
      const authResult = await authService.login(credentials);
      
      sendSuccess(res, authResult, 'Login successful', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/refresh
   * Refresh JWT token
   */
  async refresh(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const currentToken = authService.extractTokenFromHeader(authHeader);
      
      if (!currentToken) {
        const error: CustomError = new Error('No token provided') as CustomError;
        error.statusCode = 401;
        error.code = ErrorCodes.AUTHENTICATION_ERROR;
        throw error;
      }

      const authResult = await authService.refreshToken(currentToken);
      
      sendSuccess(res, authResult, 'Token refreshed successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   * Logout user (client-side token removal)
   */
  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Since we're using stateless JWT tokens, logout is handled client-side
      // This endpoint serves as a confirmation and could be used for logging purposes
      
      sendSuccess(res, null, 'Logout successful', 200);
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
export const authController = new AuthController();