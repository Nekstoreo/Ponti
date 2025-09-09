import { Router } from 'express';
import authRoutes from './auth.routes';
import studentRoutes from './student.routes';
import scheduleRoutes from './schedule.routes';
import announcementRoutes from './announcement.routes';
import campusRoutes from './campus.routes';

const router: Router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/announcements', announcementRoutes);
router.use('/campus', campusRoutes);

export default router;