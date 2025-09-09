import { Response, NextFunction } from 'express';
import { studentService } from '../services/StudentService';
import { ResponseFormatter, RESPONSE_MESSAGES, HTTP_STATUS } from '../utils/responseFormatter';
import { AuthenticatedRequest, CustomError, ErrorCodes } from '../types';

export class StudentController {
  /**
   * GET /api/students/profile
   * Get authenticated student's profile
   */
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const studentId = req.studentId;

      if (!studentId) {
        const error: CustomError = new Error('Student ID not found in request') as CustomError;
        error.statusCode = 401;
        error.code = ErrorCodes.AUTHENTICATION_ERROR;
        throw error;
      }

      const profile = await studentService.getProfile(studentId);

      return ResponseFormatter.sendSuccess(
        res,
        profile,
        RESPONSE_MESSAGES.PROFILE_RETRIEVED,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/students/preferences
   * Update authenticated student's preferences
   */
  async updatePreferences(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const studentId = req.studentId;

      if (!studentId) {
        const error: CustomError = new Error('Student ID not found in request') as CustomError;
        error.statusCode = 401;
        error.code = ErrorCodes.AUTHENTICATION_ERROR;
        throw error;
      }

      const preferences = req.body;
      const updatedStudent = await studentService.updatePreferences(studentId, preferences);

      // Return only the updated preferences, not the full student object
      const responseData = {
        studentId: updatedStudent.studentId,
        preferences: updatedStudent.preferences,
        updatedAt: updatedStudent.updatedAt
      };

      return ResponseFormatter.sendSuccess(
        res,
        responseData,
        RESPONSE_MESSAGES.PREFERENCES_UPDATED,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/students/academic-summary
   * Get authenticated student's academic summary
   */
  async getAcademicSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const studentId = req.studentId;

      if (!studentId) {
        const error: CustomError = new Error('Student ID not found in request') as CustomError;
        error.statusCode = 401;
        error.code = ErrorCodes.AUTHENTICATION_ERROR;
        throw error;
      }

      const academicSummary = await studentService.getAcademicSummary(studentId);

      return ResponseFormatter.sendSuccess(
        res,
        academicSummary,
        'Academic summary retrieved successfully',
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
export const studentController = new StudentController();