import { Router } from 'express';
import { scheduleController } from '../controllers/ScheduleController';
import { validateQuery, validateParams } from '../middleware/validation';
import { scheduleQuerySchema, dayParamSchema } from '../validators/schedule.validator';
import { authenticateToken } from '../middleware/auth';

const router: Router = Router();

// All schedule routes require authentication
router.use(authenticateToken);

/**
 * GET /api/schedules/current
 * Get authenticated student's current schedule
 */
router.get('/current', validateQuery(scheduleQuerySchema), scheduleController.getCurrentSchedule);

/**
 * GET /api/schedules/next-class
 * Get authenticated student's next class
 */
router.get('/next-class', scheduleController.getNextClass);

/**
 * GET /api/schedules/weekly
 * Get authenticated student's weekly schedule
 */
router.get('/weekly', validateQuery(scheduleQuerySchema), scheduleController.getWeeklySchedule);

/**
 * GET /api/schedules/summary
 * Get authenticated student's schedule summary with metrics
 */
router.get('/summary', validateQuery(scheduleQuerySchema), scheduleController.getScheduleSummary);

/**
 * GET /api/schedules/day/:day
 * Get authenticated student's classes for a specific day
 */
router.get('/day/:day', 
  validateParams(dayParamSchema), 
  validateQuery(scheduleQuerySchema), 
  scheduleController.getClassesByDay
);

export default router;