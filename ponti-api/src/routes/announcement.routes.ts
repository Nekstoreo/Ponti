import { Router } from 'express';
import { announcementController } from '../controllers/AnnouncementController';
import { validateQuery, validateParams } from '../middleware/validation';
import { announcementQuerySchema, announcementParamSchema } from '../validators/announcement.validator';
import { authenticateToken } from '../middleware/auth';

const router: Router = Router();

// All announcement routes require authentication
router.use(authenticateToken);

/**
 * GET /api/announcements/feed
 * Get personalized announcement feed
 */
router.get('/feed', validateQuery(announcementQuerySchema), announcementController.getPersonalizedFeed);

/**
 * GET /api/announcements/recommended
 * Get recommended announcements
 */
router.get('/recommended', announcementController.getRecommendedAnnouncements);

/**
 * GET /api/announcements/search
 * Search announcements
 */
router.get('/search', announcementController.searchAnnouncements);

/**
 * GET /api/announcements/category/:category
 * Get announcements by category
 */
router.get('/category/:category', announcementController.getAnnouncementsByCategory);

/**
 * GET /api/announcements/priority/:priority
 * Get announcements by priority
 */
router.get('/priority/:priority', announcementController.getAnnouncementsByPriority);

/**
 * GET /api/announcements/:id
 * Get specific announcement by ID
 */
router.get('/:id', validateParams(announcementParamSchema), announcementController.getAnnouncementById);

/**
 * POST /api/announcements/:id/like
 * Add like to announcement
 */
router.post('/:id/like', validateParams(announcementParamSchema), announcementController.likeAnnouncement);

/**
 * POST /api/announcements/:id/share
 * Add share to announcement
 */
router.post('/:id/share', validateParams(announcementParamSchema), announcementController.shareAnnouncement);

/**
 * POST /api/announcements/:id/acknowledge
 * Acknowledge announcement
 */
router.post('/:id/acknowledge', validateParams(announcementParamSchema), announcementController.acknowledgeAnnouncement);

export default router;