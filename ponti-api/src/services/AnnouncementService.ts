import { IAnnouncements } from '../models/Announcements';
import { AnnouncementRepository, IAnnouncementRepository, AnnouncementFilters, PaginationOptions, PaginatedResult } from '../repositories/AnnouncementRepository';
import { StudentService, IStudentService } from './StudentService';
import { CustomError, ErrorCodes } from '../types';

export interface PersonalizedFilters {
  studentId: string;
  includeGlobal?: boolean;
  priorityThreshold?: 'low' | 'normal' | 'high' | 'urgent' | 'critical';
  categories?: string[];
  excludeAcknowledged?: boolean;
}

export interface AnnouncementFeed {
  sticky: IAnnouncements[];
  priority: IAnnouncements[];
  regular: IAnnouncements[];
  total: number;
}

export interface AnnouncementStats {
  totalPublished: number;
  totalExpired: number;
  totalScheduled: number;
  byCategory: { [category: string]: number };
  byPriority: { [priority: string]: number };
  engagementSummary: {
    totalViews: number;
    totalLikes: number;
    totalShares: number;
    totalComments: number;
  };
}

export interface IAnnouncementService {
  getPersonalizedFeed(filters: PersonalizedFilters, pagination?: PaginationOptions): Promise<PaginatedResult<IAnnouncements>>;
  getAnnouncementById(announcementId: string): Promise<IAnnouncements>;
  getAnnouncementFeed(filters: PersonalizedFilters): Promise<AnnouncementFeed>;
  searchAnnouncements(searchTerm: string, filters?: AnnouncementFilters): Promise<IAnnouncements[]>;
  getAnnouncementsByCategory(category: string, studentId?: string): Promise<IAnnouncements[]>;
  getAnnouncementsByPriority(priority: string, studentId?: string): Promise<IAnnouncements[]>;
  markAsViewed(announcementId: string): Promise<IAnnouncements>;
  addLike(announcementId: string): Promise<IAnnouncements>;
  addShare(announcementId: string): Promise<IAnnouncements>;
  addComment(announcementId: string, studentId: string, content: string): Promise<IAnnouncements>;
  acknowledgeAnnouncement(announcementId: string, studentId: string): Promise<IAnnouncements>;
  getEngagementStats(announcementId: string): Promise<any>;
  getAnnouncementStats(): Promise<AnnouncementStats>;
  getRecommendedAnnouncements(studentId: string, limit?: number): Promise<IAnnouncements[]>;
}

export class AnnouncementService implements IAnnouncementService {
  private announcementRepository: IAnnouncementRepository;
  private studentService: IStudentService;

  constructor(announcementRepository?: IAnnouncementRepository, studentService?: IStudentService) {
    this.announcementRepository = announcementRepository || new AnnouncementRepository();
    this.studentService = studentService || new StudentService();
  }

  async getPersonalizedFeed(filters: PersonalizedFilters, pagination?: PaginationOptions): Promise<PaginatedResult<IAnnouncements>> {
    try {
      // Get student profile for targeting
      const studentProfile = await this.studentService.getProfile(filters.studentId);
      
      const announcementFilters: AnnouncementFilters = {
        campusId: studentProfile.academic.campus,
        programId: studentProfile.academic.program,
        semester: studentProfile.academic.semester,
        studentLevel: studentProfile.academic.level
      };

      // Apply additional filters
      if (filters.categories && filters.categories.length > 0) {
        // For multiple categories, we'll need to make multiple calls or modify the repository
        // For now, we'll use the first category
        announcementFilters.category = filters.categories[0];
      }

      // Apply priority threshold
      if (filters.priorityThreshold) {
        const priorityOrder = ['low', 'normal', 'high', 'urgent', 'critical'];
        const thresholdIndex = priorityOrder.indexOf(filters.priorityThreshold);
        // This would need repository modification to support priority filtering by threshold
        // For now, we'll apply it post-fetch
      }

      const result = await this.announcementRepository.findWithPagination(announcementFilters, pagination || {});

      // Post-process to apply priority threshold and exclude acknowledged
      if (filters.priorityThreshold || filters.excludeAcknowledged) {
        const priorityOrder = ['low', 'normal', 'high', 'urgent', 'critical'];
        const thresholdIndex = filters.priorityThreshold ? priorityOrder.indexOf(filters.priorityThreshold) : -1;

        result.data = result.data.filter(announcement => {
          // Apply priority threshold
          if (thresholdIndex >= 0) {
            const announcementPriorityIndex = priorityOrder.indexOf(announcement.priority);
            if (announcementPriorityIndex < thresholdIndex) {
              return false;
            }
          }

          // Exclude acknowledged announcements
          if (filters.excludeAcknowledged && announcement.requiresAcknowledgment) {
            const isAcknowledged = announcement.acknowledgments.some(
              ack => ack.studentId === filters.studentId
            );
            if (isAcknowledged) {
              return false;
            }
          }

          return true;
        });

        // Update pagination info
        result.pagination.totalItems = result.data.length;
        result.pagination.totalPages = Math.ceil(result.data.length / result.pagination.itemsPerPage);
      }

      return result;
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }

      const serviceError: CustomError = new Error('Failed to get personalized feed') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async getAnnouncementById(announcementId: string): Promise<IAnnouncements> {
    try {
      const announcement = await this.announcementRepository.findByAnnouncementId(announcementId);
      
      if (!announcement) {
        const error: CustomError = new Error('Announcement not found') as CustomError;
        error.statusCode = 404;
        error.code = ErrorCodes.NOT_FOUND;
        throw error;
      }

      return announcement;
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }

      const serviceError: CustomError = new Error('Failed to get announcement') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async getAnnouncementFeed(filters: PersonalizedFilters): Promise<AnnouncementFeed> {
    try {
      const allAnnouncements = await this.getPersonalizedFeed(filters, { limit: 100 });
      
      const sticky = allAnnouncements.data.filter(a => a.isSticky);
      const priority = allAnnouncements.data.filter(a => !a.isSticky && ['urgent', 'critical'].includes(a.priority));
      const regular = allAnnouncements.data.filter(a => !a.isSticky && !['urgent', 'critical'].includes(a.priority));

      return {
        sticky,
        priority,
        regular,
        total: allAnnouncements.data.length
      };
    } catch (error) {
      const serviceError: CustomError = new Error('Failed to get announcement feed') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async searchAnnouncements(searchTerm: string, filters?: AnnouncementFilters): Promise<IAnnouncements[]> {
    try {
      return await this.announcementRepository.searchAnnouncements(searchTerm, filters);
    } catch (error) {
      const serviceError: CustomError = new Error('Failed to search announcements') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async getAnnouncementsByCategory(category: string, studentId?: string): Promise<IAnnouncements[]> {
    try {
      if (studentId) {
        const personalizedFilters: PersonalizedFilters = {
          studentId,
          categories: [category]
        };
        const result = await this.getPersonalizedFeed(personalizedFilters, { limit: 50 });
        return result.data;
      } else {
        return await this.announcementRepository.findByCategory(category);
      }
    } catch (error) {
      const serviceError: CustomError = new Error('Failed to get announcements by category') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async getAnnouncementsByPriority(priority: string, studentId?: string): Promise<IAnnouncements[]> {
    try {
      if (studentId) {
        const personalizedFilters: PersonalizedFilters = {
          studentId,
          priorityThreshold: priority as any
        };
        const result = await this.getPersonalizedFeed(personalizedFilters, { limit: 50 });
        return result.data;
      } else {
        return await this.announcementRepository.findByPriority(priority);
      }
    } catch (error) {
      const serviceError: CustomError = new Error('Failed to get announcements by priority') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async markAsViewed(announcementId: string): Promise<IAnnouncements> {
    try {
      const announcement = await this.announcementRepository.incrementViews(announcementId);
      
      if (!announcement) {
        const error: CustomError = new Error('Announcement not found') as CustomError;
        error.statusCode = 404;
        error.code = ErrorCodes.NOT_FOUND;
        throw error;
      }

      return announcement;
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }

      const serviceError: CustomError = new Error('Failed to mark announcement as viewed') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async addLike(announcementId: string): Promise<IAnnouncements> {
    try {
      const announcement = await this.announcementRepository.addEngagement(announcementId, 'like');
      
      if (!announcement) {
        const error: CustomError = new Error('Announcement not found') as CustomError;
        error.statusCode = 404;
        error.code = ErrorCodes.NOT_FOUND;
        throw error;
      }

      return announcement;
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }

      const serviceError: CustomError = new Error('Failed to add like') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async addShare(announcementId: string): Promise<IAnnouncements> {
    try {
      const announcement = await this.announcementRepository.addEngagement(announcementId, 'share');
      
      if (!announcement) {
        const error: CustomError = new Error('Announcement not found') as CustomError;
        error.statusCode = 404;
        error.code = ErrorCodes.NOT_FOUND;
        throw error;
      }

      return announcement;
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }

      const serviceError: CustomError = new Error('Failed to add share') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async addComment(announcementId: string, studentId: string, content: string): Promise<IAnnouncements> {
    try {
      // Validate student exists
      await this.studentService.validateStudentExists(studentId);

      const announcement = await this.announcementRepository.addComment(announcementId, studentId, content);
      
      if (!announcement) {
        const error: CustomError = new Error('Announcement not found') as CustomError;
        error.statusCode = 404;
        error.code = ErrorCodes.NOT_FOUND;
        throw error;
      }

      return announcement;
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }

      const serviceError: CustomError = new Error('Failed to add comment') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async acknowledgeAnnouncement(announcementId: string, studentId: string): Promise<IAnnouncements> {
    try {
      // Validate student exists
      await this.studentService.validateStudentExists(studentId);

      const announcement = await this.announcementRepository.acknowledgeAnnouncement(announcementId, studentId);
      
      if (!announcement) {
        const error: CustomError = new Error('Announcement not found') as CustomError;
        error.statusCode = 404;
        error.code = ErrorCodes.NOT_FOUND;
        throw error;
      }

      return announcement;
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }

      const serviceError: CustomError = new Error('Failed to acknowledge announcement') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async getEngagementStats(announcementId: string): Promise<any> {
    try {
      const stats = await this.announcementRepository.getEngagementStats(announcementId);
      
      if (!stats) {
        const error: CustomError = new Error('Announcement not found') as CustomError;
        error.statusCode = 404;
        error.code = ErrorCodes.NOT_FOUND;
        throw error;
      }

      return stats;
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }

      const serviceError: CustomError = new Error('Failed to get engagement stats') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async getAnnouncementStats(): Promise<AnnouncementStats> {
    try {
      const published = await this.announcementRepository.findPublished();
      const expired = await this.announcementRepository.findExpired();
      const scheduled = await this.announcementRepository.findScheduled();

      // Calculate category distribution
      const byCategory: { [category: string]: number } = {};
      const byPriority: { [priority: string]: number } = {};
      let totalViews = 0;
      let totalLikes = 0;
      let totalShares = 0;
      let totalComments = 0;

      published.forEach(announcement => {
        // Category stats
        byCategory[announcement.category] = (byCategory[announcement.category] || 0) + 1;
        
        // Priority stats
        byPriority[announcement.priority] = (byPriority[announcement.priority] || 0) + 1;
        
        // Engagement stats
        totalViews += announcement.engagement.views;
        totalLikes += announcement.engagement.likes;
        totalShares += announcement.engagement.shares;
        totalComments += announcement.engagement.comments.length;
      });

      return {
        totalPublished: published.length,
        totalExpired: expired.length,
        totalScheduled: scheduled.length,
        byCategory,
        byPriority,
        engagementSummary: {
          totalViews,
          totalLikes,
          totalShares,
          totalComments
        }
      };
    } catch (error) {
      const serviceError: CustomError = new Error('Failed to get announcement stats') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async getRecommendedAnnouncements(studentId: string, limit: number = 5): Promise<IAnnouncements[]> {
    try {
      // Get student profile for better recommendations
      const studentProfile = await this.studentService.getProfile(studentId);
      
      // Get personalized feed with high priority and relevant categories
      const personalizedFilters: PersonalizedFilters = {
        studentId,
        priorityThreshold: 'normal',
        categories: ['academic', 'deadlines', 'events'], // Most relevant categories
        excludeAcknowledged: true
      };

      const result = await this.getPersonalizedFeed(personalizedFilters, { limit });
      
      // Sort by engagement score and priority
      const recommendations = result.data.sort((a, b) => {
        const priorityOrder = ['low', 'normal', 'high', 'urgent', 'critical'];
        const aPriorityIndex = priorityOrder.indexOf(a.priority);
        const bPriorityIndex = priorityOrder.indexOf(b.priority);
        
        // First sort by priority
        if (aPriorityIndex !== bPriorityIndex) {
          return bPriorityIndex - aPriorityIndex;
        }
        
        // Then by engagement score
        const aEngagement = a.engagement.views + (a.engagement.likes * 2) + (a.engagement.shares * 3);
        const bEngagement = b.engagement.views + (b.engagement.likes * 2) + (b.engagement.shares * 3);
        
        return bEngagement - aEngagement;
      });

      return recommendations.slice(0, limit);
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }

      const serviceError: CustomError = new Error('Failed to get recommended announcements') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }
}

// Export singleton instance
export const announcementService = new AnnouncementService();