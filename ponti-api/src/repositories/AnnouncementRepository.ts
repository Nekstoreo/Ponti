import { Announcements, IAnnouncements } from '../models/Announcements';
import { FilterQuery, UpdateQuery } from 'mongoose';

export interface AnnouncementFilters {
  campusId?: string;
  programId?: string;
  semester?: string;
  studentLevel?: string;
  category?: string;
  type?: string;
  priority?: string;
  tags?: string[];
  isSticky?: boolean;
  requiresAcknowledgment?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface IAnnouncementRepository {
  findById(id: string): Promise<IAnnouncements | null>;
  findByAnnouncementId(announcementId: string): Promise<IAnnouncements | null>;
  create(announcementData: Partial<IAnnouncements>): Promise<IAnnouncements>;
  update(announcementId: string, updateData: UpdateQuery<IAnnouncements>): Promise<IAnnouncements | null>;
  delete(announcementId: string): Promise<boolean>;
  findPublished(): Promise<IAnnouncements[]>;
  findByTargeting(filters: AnnouncementFilters): Promise<IAnnouncements[]>;
  findWithPagination(filters: AnnouncementFilters, options: PaginationOptions): Promise<PaginatedResult<IAnnouncements>>;
  findByCategory(category: string): Promise<IAnnouncements[]>;
  findByPriority(priority: string): Promise<IAnnouncements[]>;
  findExpired(): Promise<IAnnouncements[]>;
  findScheduled(): Promise<IAnnouncements[]>;
  incrementViews(announcementId: string): Promise<IAnnouncements | null>;
  addEngagement(announcementId: string, type: 'like' | 'share'): Promise<IAnnouncements | null>;
  addComment(announcementId: string, studentId: string, content: string): Promise<IAnnouncements | null>;
  acknowledgeAnnouncement(announcementId: string, studentId: string): Promise<IAnnouncements | null>;
  getEngagementStats(announcementId: string): Promise<any>;
  searchAnnouncements(searchTerm: string, filters?: AnnouncementFilters): Promise<IAnnouncements[]>;
}

export class AnnouncementRepository implements IAnnouncementRepository {
  async findById(id: string): Promise<IAnnouncements | null> {
    try {
      return await Announcements.findById(id).exec();
    } catch (error) {
      throw new Error(`Error finding announcement by ID: ${error}`);
    }
  }

  async findByAnnouncementId(announcementId: string): Promise<IAnnouncements | null> {
    try {
      return await Announcements.findOne({ announcementId }).exec();
    } catch (error) {
      throw new Error(`Error finding announcement by announcement ID: ${error}`);
    }
  }

  async create(announcementData: Partial<IAnnouncements>): Promise<IAnnouncements> {
    try {
      const announcement = new Announcements(announcementData);
      return await announcement.save();
    } catch (error) {
      throw new Error(`Error creating announcement: ${error}`);
    }
  }

  async update(announcementId: string, updateData: UpdateQuery<IAnnouncements>): Promise<IAnnouncements | null> {
    try {
      return await Announcements.findOneAndUpdate(
        { announcementId },
        updateData,
        { new: true, runValidators: true }
      ).exec();
    } catch (error) {
      throw new Error(`Error updating announcement: ${error}`);
    }
  }

  async delete(announcementId: string): Promise<boolean> {
    try {
      const result = await Announcements.deleteOne({ announcementId }).exec();
      return result.deletedCount > 0;
    } catch (error) {
      throw new Error(`Error deleting announcement: ${error}`);
    }
  }

  async findPublished(): Promise<IAnnouncements[]> {
    try {
      const now = new Date();
      return await Announcements.find({
        status: 'published',
        'schedule.publishDate': { $lte: now },
        $or: [
          { 'schedule.expirationDate': { $exists: false } },
          { 'schedule.expirationDate': { $gt: now } }
        ]
      })
      .sort({ isSticky: -1, 'schedule.publishDate': -1 })
      .exec();
    } catch (error) {
      throw new Error(`Error finding published announcements: ${error}`);
    }
  }

  async findByTargeting(filters: AnnouncementFilters): Promise<IAnnouncements[]> {
    try {
      const now = new Date();
      const query: FilterQuery<IAnnouncements> = {
        status: 'published',
        'schedule.publishDate': { $lte: now },
        $or: [
          { 'schedule.expirationDate': { $exists: false } },
          { 'schedule.expirationDate': { $gt: now } }
        ]
      };

      // Build targeting conditions
      const targetingConditions: any[] = [{ 'targeting.isGlobal': true }];

      if (filters.campusId) {
        targetingConditions.push({ 'targeting.campuses': filters.campusId });
      }
      if (filters.programId) {
        targetingConditions.push({ 'targeting.programs': filters.programId });
      }
      if (filters.semester) {
        targetingConditions.push({ 'targeting.semesters': filters.semester });
      }
      if (filters.studentLevel) {
        targetingConditions.push({ 'targeting.studentLevels': filters.studentLevel });
      }

      query.$and = [{ $or: targetingConditions }];

      // Apply additional filters
      if (filters.category) {
        query.category = filters.category;
      }
      if (filters.type) {
        query.type = filters.type;
      }
      if (filters.priority) {
        query.priority = filters.priority;
      }
      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
      }
      if (filters.isSticky !== undefined) {
        query.isSticky = filters.isSticky;
      }
      if (filters.requiresAcknowledgment !== undefined) {
        query.requiresAcknowledgment = filters.requiresAcknowledgment;
      }

      // Date range filters
      if (filters.dateFrom || filters.dateTo) {
        const dateQuery: any = {};
        if (filters.dateFrom) {
          dateQuery.$gte = filters.dateFrom;
        }
        if (filters.dateTo) {
          dateQuery.$lte = filters.dateTo;
        }
        query['schedule.publishDate'] = { ...query['schedule.publishDate'], ...dateQuery };
      }

      return await Announcements.find(query)
        .sort({ isSticky: -1, priority: -1, 'schedule.publishDate': -1 })
        .exec();
    } catch (error) {
      throw new Error(`Error finding announcements by targeting: ${error}`);
    }
  }

  async findWithPagination(filters: AnnouncementFilters, options: PaginationOptions): Promise<PaginatedResult<IAnnouncements>> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 10;
      const skip = (page - 1) * limit;
      const sortBy = options.sortBy || 'schedule.publishDate';
      const sortOrder = options.sortOrder === 'asc' ? 1 : -1;

      // Build the same query as findByTargeting
      const announcements = await this.findByTargeting(filters);
      
      // Apply sorting
      const sortOptions: any = {};
      if (sortBy === 'priority') {
        sortOptions.priority = sortOrder;
        sortOptions.isSticky = -1;
      } else if (sortBy === 'engagement') {
        // Sort by engagement score (calculated virtually)
        sortOptions['engagement.views'] = sortOrder;
      } else {
        sortOptions[sortBy] = sortOrder;
        sortOptions.isSticky = -1;
      }

      const totalItems = announcements.length;
      const totalPages = Math.ceil(totalItems / limit);
      
      // Apply pagination manually since we already have the filtered results
      const paginatedData = announcements.slice(skip, skip + limit);

      return {
        data: paginatedData,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Error finding announcements with pagination: ${error}`);
    }
  }

  async findByCategory(category: string): Promise<IAnnouncements[]> {
    try {
      return await this.findByTargeting({ category });
    } catch (error) {
      throw new Error(`Error finding announcements by category: ${error}`);
    }
  }

  async findByPriority(priority: string): Promise<IAnnouncements[]> {
    try {
      return await this.findByTargeting({ priority });
    } catch (error) {
      throw new Error(`Error finding announcements by priority: ${error}`);
    }
  }

  async findExpired(): Promise<IAnnouncements[]> {
    try {
      const now = new Date();
      return await Announcements.find({
        status: 'published',
        'schedule.expirationDate': { $lt: now }
      }).exec();
    } catch (error) {
      throw new Error(`Error finding expired announcements: ${error}`);
    }
  }

  async findScheduled(): Promise<IAnnouncements[]> {
    try {
      const now = new Date();
      return await Announcements.find({
        status: 'scheduled',
        'schedule.publishDate': { $gt: now }
      })
      .sort({ 'schedule.publishDate': 1 })
      .exec();
    } catch (error) {
      throw new Error(`Error finding scheduled announcements: ${error}`);
    }
  }

  async incrementViews(announcementId: string): Promise<IAnnouncements | null> {
    try {
      return await Announcements.findOneAndUpdate(
        { announcementId },
        { $inc: { 'engagement.views': 1 } },
        { new: true }
      ).exec();
    } catch (error) {
      throw new Error(`Error incrementing views: ${error}`);
    }
  }

  async addEngagement(announcementId: string, type: 'like' | 'share'): Promise<IAnnouncements | null> {
    try {
      const updateField = type === 'like' ? 'engagement.likes' : 'engagement.shares';
      return await Announcements.findOneAndUpdate(
        { announcementId },
        { $inc: { [updateField]: 1 } },
        { new: true }
      ).exec();
    } catch (error) {
      throw new Error(`Error adding ${type}: ${error}`);
    }
  }

  async addComment(announcementId: string, studentId: string, content: string): Promise<IAnnouncements | null> {
    try {
      return await Announcements.findOneAndUpdate(
        { announcementId },
        {
          $push: {
            'engagement.comments': {
              studentId,
              content,
              timestamp: new Date(),
              isApproved: false
            }
          }
        },
        { new: true }
      ).exec();
    } catch (error) {
      throw new Error(`Error adding comment: ${error}`);
    }
  }

  async acknowledgeAnnouncement(announcementId: string, studentId: string): Promise<IAnnouncements | null> {
    try {
      // Check if already acknowledged
      const existing = await Announcements.findOne({
        announcementId,
        'acknowledgments.studentId': studentId
      }).exec();

      if (existing) {
        return existing;
      }

      return await Announcements.findOneAndUpdate(
        { announcementId },
        {
          $push: {
            acknowledgments: {
              studentId,
              acknowledgedAt: new Date()
            }
          }
        },
        { new: true }
      ).exec();
    } catch (error) {
      throw new Error(`Error acknowledging announcement: ${error}`);
    }
  }

  async getEngagementStats(announcementId: string): Promise<any> {
    try {
      const announcement = await Announcements.findOne({ announcementId }).exec();
      
      if (!announcement) {
        return null;
      }

      const approvedComments = announcement.engagement.comments.filter(
        (comment: any) => comment.isApproved
      );

      return {
        views: announcement.engagement.views,
        likes: announcement.engagement.likes,
        shares: announcement.engagement.shares,
        totalComments: announcement.engagement.comments.length,
        approvedComments: approvedComments.length,
        acknowledgments: announcement.acknowledgments.length,
        engagementScore: announcement.engagement.views + 
                        (announcement.engagement.likes * 2) + 
                        (announcement.engagement.shares * 3) + 
                        (announcement.engagement.comments.length * 1.5)
      };
    } catch (error) {
      throw new Error(`Error getting engagement stats: ${error}`);
    }
  }

  async searchAnnouncements(searchTerm: string, filters?: AnnouncementFilters): Promise<IAnnouncements[]> {
    try {
      const now = new Date();
      const query: FilterQuery<IAnnouncements> = {
        status: 'published',
        'schedule.publishDate': { $lte: now },
        $or: [
          { 'schedule.expirationDate': { $exists: false } },
          { 'schedule.expirationDate': { $gt: now } }
        ],
        $and: [
          {
            $or: [
              { title: { $regex: searchTerm, $options: 'i' } },
              { content: { $regex: searchTerm, $options: 'i' } },
              { summary: { $regex: searchTerm, $options: 'i' } },
              { tags: { $in: [new RegExp(searchTerm, 'i')] } }
            ]
          }
        ]
      };

      // Apply additional filters if provided
      if (filters) {
        if (filters.category) {
          query.category = filters.category;
        }
        if (filters.type) {
          query.type = filters.type;
        }
        if (filters.priority) {
          query.priority = filters.priority;
        }
        
        // Apply targeting filters
        if (filters.campusId || filters.programId || filters.semester || filters.studentLevel) {
          const targetingConditions: any[] = [{ 'targeting.isGlobal': true }];
          
          if (filters.campusId) {
            targetingConditions.push({ 'targeting.campuses': filters.campusId });
          }
          if (filters.programId) {
            targetingConditions.push({ 'targeting.programs': filters.programId });
          }
          if (filters.semester) {
            targetingConditions.push({ 'targeting.semesters': filters.semester });
          }
          if (filters.studentLevel) {
            targetingConditions.push({ 'targeting.studentLevels': filters.studentLevel });
          }
          
          query.$and.push({ $or: targetingConditions });
        }
      }

      return await Announcements.find(query)
        .sort({ isSticky: -1, priority: -1, 'schedule.publishDate': -1 })
        .exec();
    } catch (error) {
      throw new Error(`Error searching announcements: ${error}`);
    }
  }
}