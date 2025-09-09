import { Router } from 'express';
import { studentController } from '../controllers/StudentController';
import { validateBody } from '../middleware/validation';
import { updatePreferencesSchema } from '../validators/student.validator';
import { authenticateToken } from '../middleware/auth';

const router: Router = Router();

// All student routes require authentication
router.use(authenticateToken);

/**
 * GET /api/students/profile
 * Get authenticated student's profile
 */
router.get('/profile', studentController.getProfile);

/**
 * PUT /api/students/preferences
 * Update authenticated student's preferences
 */
router.put('/preferences', validateBody(updatePreferencesSchema), studentController.updatePreferences);

/**
 * GET /api/students/academic-summary
 * Get authenticated student's academic summary
 */
router.get('/academic-summary', studentController.getAcademicSummary);

export default router;