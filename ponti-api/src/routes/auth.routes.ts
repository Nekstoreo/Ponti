import { Router } from 'express';
import { authController } from '../controllers/AuthController';
import { validateBody } from '../middleware/validation';
import { loginSchema } from '../validators/auth.validator';
import { authenticateToken } from '../middleware/auth';

const router: Router = Router();

/**
 * POST /api/auth/login
 * Authenticate student with credentials
 */
router.post('/login', validateBody(loginSchema), authController.login);

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', authenticateToken, authController.refresh);

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', authenticateToken, authController.logout);

export default router;