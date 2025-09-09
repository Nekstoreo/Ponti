import { Response, NextFunction } from 'express';
import { scheduleService } from '../services/ScheduleService';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest, CustomError, ErrorCodes } from '../types';

export class ScheduleController {
  /**
   * GET /api/schedules/current
   * Get authenticated student's current schedule
   */
  async getCurrentSchedule(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.studentId;
      
      if (!studentId) {
        const error: CustomError = new Error('Student ID not found in request') as CustomError;
        error.statusCode = 401;
        error.code = ErrorCodes.AUTHENTICATION_ERROR;
        throw error;
      }

      const { periodId } = req.query;
      const schedule = await scheduleService.getStudentSchedule(studentId, periodId as string);
      
      sendSuccess(res, schedule, 'Schedule retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/schedules/next-class
   * Get authenticated student's next class
   */
  async getNextClass(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.studentId;
      
      if (!studentId) {
        const error: CustomError = new Error('Student ID not found in request') as CustomError;
        error.statusCode = 401;
        error.code = ErrorCodes.AUTHENTICATION_ERROR;
        throw error;
      }

      const nextClass = await scheduleService.getNextClass(studentId);
      
      sendSuccess(res, nextClass, 'Next class retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/schedules/day/:day
   * Get authenticated student's classes for a specific day
   */
  async getClassesByDay(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.studentId;
      
      if (!studentId) {
        const error: CustomError = new Error('Student ID not found in request') as CustomError;
        error.statusCode = 401;
        error.code = ErrorCodes.AUTHENTICATION_ERROR;
        throw error;
      }

      const { day } = req.params;
      const { periodId } = req.query;
      
      const classes = await scheduleService.getClassesByDay(studentId, day, periodId as string);
      
      sendSuccess(res, classes, `Classes for ${day} retrieved successfully`, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/schedules/weekly
   * Get authenticated student's weekly schedule
   */
  async getWeeklySchedule(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.studentId;
      
      if (!studentId) {
        const error: CustomError = new Error('Student ID not found in request') as CustomError;
        error.statusCode = 401;
        error.code = ErrorCodes.AUTHENTICATION_ERROR;
        throw error;
      }

      const { periodId } = req.query;
      const weeklySchedule = await scheduleService.getWeeklySchedule(studentId, periodId as string);
      
      sendSuccess(res, weeklySchedule, 'Weekly schedule retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/schedules/summary
   * Get authenticated student's schedule summary with metrics
   */
  async getScheduleSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.studentId;
      
      if (!studentId) {
        const error: CustomError = new Error('Student ID not found in request') as CustomError;
        error.statusCode = 401;
        error.code = ErrorCodes.AUTHENTICATION_ERROR;
        throw error;
      }

      const { periodId } = req.query;
      const summary = await scheduleService.getScheduleSummary(studentId, periodId as string);
      
      sendSuccess(res, summary, 'Schedule summary retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
export const scheduleController = new ScheduleController();