import { Response, NextFunction } from 'express';
import { announcementService } from '../services/AnnouncementService';
import { sendSuccess, sendPaginated } from '../utils/response';
import { AuthenticatedRequest, CustomError, ErrorCodes } from '../types';

export class AnnouncementController {
  /**
   * GET /api/announcements/feed
   * Get personalized announcement feed for authenticated student
   */
  async getPersonalizedFeed(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.studentId;
      
      if (!studentId) {
        const error: CustomError = new Error('Student ID not found in request') as CustomError;
        error.statusCode = 401;
        error.code = ErrorCodes.AUTHENTICATION_ERROR;
        throw error;
      }

      const { page = 1, limit = 20, category, priority, excludeAcknowledged = true } = req.query;
      
      const personalizedFilters = {
        studentId,
        categories: category ? [category as string] : undefined,
        priorityThreshold: priority as any,
        excludeAcknowledged: excludeAcknowledged === 'true'
      };

      const paginationOptions = {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const result = await announcementService.getPersonalizedFeed(personalizedFilters, paginationOptions);
      
      sendPaginated(
        res,
        result.data,
        result.pagination.currentPage,
        result.pagination.itemsPerPage,
        result.pagination.totalItems,
        'Personalized feed retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/announcements/:id
   * Get specific announcement by ID
   */
  async getAnnouncementById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const announcement = await announcementService.getAnnouncementById(id);
      
      // Mark as viewed
      await announcementService.markAsViewed(id);
      
      sendSuccess(res, announcement, 'Announcement retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/announcements/category/:category
   * Get announcements by category
   */
  async getAnnouncementsByCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category } = req.params;
      const studentId = req.studentId;
      
      const announcements = await announcementService.getAnnouncementsByCategory(category, studentId);
      
      sendSuccess(res, announcements, `Announcements for category ${category} retrieved successfully`, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/announcements/priority/:priority
   * Get announcements by priority
   */
  async getAnnouncementsByPriority(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { priority } = req.params;
      const studentId = req.studentId;
      
      const announcements = await announcementService.getAnnouncementsByPriority(priority, studentId);
      
      sendSuccess(res, announcements, `Announcements with priority ${priority} retrieved successfully`, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/announcements/search
   * Search announcements
   */
  async searchAnnouncements(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q: searchTerm, category, priority } = req.query;
      
      if (!searchTerm) {
        const error: CustomError = new Error('Search term is required') as CustomError;
        error.statusCode = 400;
        error.code = ErrorCodes.VALIDATION_ERROR;
        throw error;
      }

      const filters = {
        category: category as string,
        priority: priority as string
      };

      const announcements = await announcementService.searchAnnouncements(searchTerm as string, filters);
      
      sendSuccess(res, announcements, 'Search results retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/announcements/:id/like
   * Add like to announcement
   */
  async likeAnnouncement(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const announcement = await announcementService.addLike(id);
      
      sendSuccess(res, { 
        announcementId: id,
        likes: announcement.engagement.likes 
      }, 'Like added successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/announcements/:id/share
   * Add share to announcement
   */
  async shareAnnouncement(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const announcement = await announcementService.addShare(id);
      
      sendSuccess(res, { 
        announcementId: id,
        shares: announcement.engagement.shares 
      }, 'Share added successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/announcements/:id/acknowledge
   * Acknowledge announcement
   */
  async acknowledgeAnnouncement(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const studentId = req.studentId;
      
      if (!studentId) {
        const error: CustomError = new Error('Student ID not found in request') as CustomError;
        error.statusCode = 401;
        error.code = ErrorCodes.AUTHENTICATION_ERROR;
        throw error;
      }

      const announcement = await announcementService.acknowledgeAnnouncement(id, studentId);
      
      sendSuccess(res, { 
        announcementId: id,
        acknowledged: true,
        acknowledgedAt: new Date()
      }, 'Announcement acknowledged successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/announcements/recommended
   * Get recommended announcements for authenticated student
   */
  async getRecommendedAnnouncements(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.studentId;
      
      if (!studentId) {
        const error: CustomError = new Error('Student ID not found in request') as CustomError;
        error.statusCode = 401;
        error.code = ErrorCodes.AUTHENTICATION_ERROR;
        throw error;
      }

      const { limit = 5 } = req.query;
      
      const recommendations = await announcementService.getRecommendedAnnouncements(
        studentId, 
        parseInt(limit as string)
      );
      
      sendSuccess(res, recommendations, 'Recommended announcements retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
export const announcementController = new AnnouncementController();