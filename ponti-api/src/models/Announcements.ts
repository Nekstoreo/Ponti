import mongoose, { Document, Schema } from 'mongoose';

// Interface for Announcements document
export interface IAnnouncements extends Document {
  _id: mongoose.Types.ObjectId;
  announcementId: string;
  title: string;
  content: string;
  summary?: string;
  type: string;
  priority: string;
  category: string;
  author: {
    name: string;
    role: string;
    department?: string;
    email?: string;
  };
  targeting: {
    campuses: string[];
    programs: string[];
    semesters: string[];
    studentLevels: string[];
    isGlobal: boolean;
  };
  media: Array<{
    type: string;
    url: string;
    filename: string;
    size?: number;
    mimeType?: string;
  }>;
  schedule: {
    publishDate: Date;
    expirationDate?: Date;
    isScheduled: boolean;
    timezone: string;
  };
  engagement: {
    views: number;
    likes: number;
    shares: number;
    comments: Array<{
      studentId: string;
      content: string;
      timestamp: Date;
      isApproved: boolean;
    }>;
  };
  status: string;
  tags: string[];
  isSticky: boolean;
  requiresAcknowledgment: boolean;
  acknowledgments: Array<{
    studentId: string;
    acknowledgedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Author subdocument schema
const authorSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
    maxlength: [100, 'Author name cannot exceed 100 characters']
  },
  role: {
    type: String,
    required: [true, 'Author role is required'],
    enum: {
      values: ['admin', 'faculty', 'staff', 'coordinator', 'dean', 'rector', 'system'],
      message: 'Author role must be one of: admin, faculty, staff, coordinator, dean, rector, system'
    }
  },
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  email: {
    type: String,
    lowercase: true,
    validate: {
      validator: function(v: string) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please provide a valid email address'
    }
  }
}, { _id: false });

// Targeting subdocument schema
const targetingSchema = new Schema({
  campuses: [{
    type: String,
    ref: 'Campus'
  }],
  programs: [{
    type: String,
    ref: 'Program'
  }],
  semesters: [{
    type: String,
    validate: {
      validator: function(v: string) {
        return /^(1|2|3|4|5|6|7|8|9|10)$/.test(v);
      },
      message: 'Semester must be a number between 1 and 10'
    }
  }],
  studentLevels: [{
    type: String,
    enum: {
      values: ['undergraduate', 'graduate', 'postgraduate', 'doctorate'],
      message: 'Student level must be one of: undergraduate, graduate, postgraduate, doctorate'
    }
  }],
  isGlobal: {
    type: Boolean,
    required: true,
    default: false
  }
}, { _id: false });

// Media subdocument schema
const mediaSchema = new Schema({
  type: {
    type: String,
    required: [true, 'Media type is required'],
    enum: {
      values: ['image', 'video', 'document', 'audio', 'link'],
      message: 'Media type must be one of: image, video, document, audio, link'
    }
  },
  url: {
    type: String,
    required: [true, 'Media URL is required'],
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Media URL must be a valid web address'
    }
  },
  filename: {
    type: String,
    required: [true, 'Filename is required'],
    trim: true,
    maxlength: [255, 'Filename cannot exceed 255 characters']
  },
  size: {
    type: Number,
    min: [0, 'File size cannot be negative']
  },
  mimeType: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/.test(v);
      },
      message: 'Invalid MIME type format'
    }
  }
}, { _id: false });

// Schedule subdocument schema
const scheduleSchema = new Schema({
  publishDate: {
    type: Date,
    required: [true, 'Publish date is required'],
    default: Date.now
  },
  expirationDate: {
    type: Date,
    validate: {
      validator: function(this: any, expirationDate: Date) {
        return !expirationDate || expirationDate > this.publishDate;
      },
      message: 'Expiration date must be after publish date'
    }
  },
  isScheduled: {
    type: Boolean,
    required: true,
    default: false
  },
  timezone: {
    type: String,
    required: [true, 'Timezone is required'],
    default: 'America/Bogota'
  }
}, { _id: false });

// Comment subdocument schema
const commentSchema = new Schema({
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    validate: {
      validator: function(v: string) {
        return /^\d{9}$/.test(v);
      },
      message: 'Student ID must be exactly 9 digits'
    },
    ref: 'Student'
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  isApproved: {
    type: Boolean,
    required: true,
    default: false
  }
}, { _id: false });

// Engagement subdocument schema
const engagementSchema = new Schema({
  views: {
    type: Number,
    required: true,
    min: [0, 'Views cannot be negative'],
    default: 0
  },
  likes: {
    type: Number,
    required: true,
    min: [0, 'Likes cannot be negative'],
    default: 0
  },
  shares: {
    type: Number,
    required: true,
    min: [0, 'Shares cannot be negative'],
    default: 0
  },
  comments: [commentSchema]
}, { _id: false });

// Acknowledgment subdocument schema
const acknowledgmentSchema = new Schema({
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    validate: {
      validator: function(v: string) {
        return /^\d{9}$/.test(v);
      },
      message: 'Student ID must be exactly 9 digits'
    },
    ref: 'Student'
  },
  acknowledgedAt: {
    type: Date,
    required: true,
    default: Date.now
  }
}, { _id: false });

// Main Announcements schema
const announcementsSchema = new Schema<IAnnouncements>({
  announcementId: {
    type: String,
    required: [true, 'Announcement ID is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Announcement ID cannot exceed 50 characters'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Announcement content is required'],
    trim: true,
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  summary: {
    type: String,
    trim: true,
    maxlength: [300, 'Summary cannot exceed 300 characters']
  },
  type: {
    type: String,
    required: [true, 'Announcement type is required'],
    enum: {
      values: ['news', 'event', 'alert', 'reminder', 'update', 'maintenance', 'emergency', 'academic', 'administrative'],
      message: 'Type must be one of: news, event, alert, reminder, update, maintenance, emergency, academic, administrative'
    }
  },
  priority: {
    type: String,
    required: [true, 'Priority is required'],
    enum: {
      values: ['low', 'normal', 'high', 'urgent', 'critical'],
      message: 'Priority must be one of: low, normal, high, urgent, critical'
    },
    default: 'normal'
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['academic', 'administrative', 'events', 'deadlines', 'scholarships', 'jobs', 'health', 'technology', 'general'],
      message: 'Category must be one of: academic, administrative, events, deadlines, scholarships, jobs, health, technology, general'
    }
  },
  author: {
    type: authorSchema,
    required: [true, 'Author information is required']
  },
  targeting: {
    type: targetingSchema,
    required: [true, 'Targeting information is required'],
    default: () => ({ isGlobal: false })
  },
  media: [mediaSchema],
  schedule: {
    type: scheduleSchema,
    required: [true, 'Schedule information is required'],
    default: () => ({})
  },
  engagement: {
    type: engagementSchema,
    required: [true, 'Engagement information is required'],
    default: () => ({})
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['draft', 'scheduled', 'published', 'expired', 'archived', 'deleted'],
      message: 'Status must be one of: draft, scheduled, published, expired, archived, deleted'
    },
    default: 'draft'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  isSticky: {
    type: Boolean,
    required: true,
    default: false
  },
  requiresAcknowledgment: {
    type: Boolean,
    required: true,
    default: false
  },
  acknowledgments: [acknowledgmentSchema]
}, {
  timestamps: true,
  collection: 'announcements'
});

// Indexes for optimization
announcementsSchema.index({ announcementId: 1 }, { unique: true });
announcementsSchema.index({ status: 1 });
announcementsSchema.index({ type: 1 });
announcementsSchema.index({ priority: 1 });
announcementsSchema.index({ category: 1 });
announcementsSchema.index({ 'schedule.publishDate': -1 });
announcementsSchema.index({ 'schedule.expirationDate': 1 });
announcementsSchema.index({ 'targeting.campuses': 1 });
announcementsSchema.index({ 'targeting.programs': 1 });
announcementsSchema.index({ 'targeting.semesters': 1 });
announcementsSchema.index({ 'targeting.studentLevels': 1 });
announcementsSchema.index({ 'targeting.isGlobal': 1 });
announcementsSchema.index({ tags: 1 });
announcementsSchema.index({ isSticky: 1 });

// Compound indexes for common queries
announcementsSchema.index({ status: 1, 'schedule.publishDate': -1 });
announcementsSchema.index({ priority: 1, status: 1 });
announcementsSchema.index({ category: 1, status: 1 });
announcementsSchema.index({ 'targeting.isGlobal': 1, status: 1 });
announcementsSchema.index({ isSticky: 1, 'schedule.publishDate': -1 });

// Pre-save middleware to auto-generate summary if not provided
announcementsSchema.pre('save', function(next) {
  if (!this.summary && this.content) {
    // Generate summary from first 150 characters of content
    this.summary = this.content.substring(0, 150).trim();
    if (this.content.length > 150) {
      this.summary += '...';
    }
  }
  
  // Auto-update status based on schedule
  const now = new Date();
  if (this.schedule.publishDate > now && this.status === 'published') {
    this.status = 'scheduled';
  } else if (this.schedule.expirationDate && this.schedule.expirationDate < now && this.status === 'published') {
    this.status = 'expired';
  }
  
  next();
});

// Static methods
announcementsSchema.statics.findPublished = function() {
  const now = new Date();
  return this.find({
    status: 'published',
    'schedule.publishDate': { $lte: now },
    $or: [
      { 'schedule.expirationDate': { $exists: false } },
      { 'schedule.expirationDate': { $gt: now } }
    ]
  }).sort({ isSticky: -1, 'schedule.publishDate': -1 });
};

announcementsSchema.statics.findByTargeting = function(campusId?: string, programId?: string, semester?: string, studentLevel?: string) {
  const now = new Date();
  const query: any = {
    status: 'published',
    'schedule.publishDate': { $lte: now },
    $or: [
      { 'schedule.expirationDate': { $exists: false } },
      { 'schedule.expirationDate': { $gt: now } }
    ]
  };
  
  const targetingConditions: any[] = [{ 'targeting.isGlobal': true }];
  
  if (campusId) {
    targetingConditions.push({ 'targeting.campuses': campusId });
  }
  if (programId) {
    targetingConditions.push({ 'targeting.programs': programId });
  }
  if (semester) {
    targetingConditions.push({ 'targeting.semesters': semester });
  }
  if (studentLevel) {
    targetingConditions.push({ 'targeting.studentLevels': studentLevel });
  }
  
  query.$and = [{ $or: targetingConditions }];
  
  return this.find(query).sort({ isSticky: -1, priority: -1, 'schedule.publishDate': -1 });
};

announcementsSchema.statics.findByCategory = function(category: string) {
  return this.findPublished().where({ category });
};

announcementsSchema.statics.findByPriority = function(priority: string) {
  return this.findPublished().where({ priority });
};

announcementsSchema.statics.findExpired = function() {
  const now = new Date();
  return this.find({
    status: 'published',
    'schedule.expirationDate': { $lt: now }
  });
};

// Instance methods
announcementsSchema.methods.incrementViews = function() {
  this.engagement.views += 1;
  return this.save();
};

announcementsSchema.methods.addLike = function() {
  this.engagement.likes += 1;
  return this.save();
};

announcementsSchema.methods.addShare = function() {
  this.engagement.shares += 1;
  return this.save();
};

announcementsSchema.methods.addComment = function(studentId: string, content: string) {
  this.engagement.comments.push({
    studentId,
    content,
    timestamp: new Date(),
    isApproved: false
  });
  return this.save();
};

announcementsSchema.methods.acknowledgeByStudent = function(studentId: string) {
  const existingAck = this.acknowledgments.find((ack: any) => ack.studentId === studentId);
  if (!existingAck) {
    this.acknowledgments.push({
      studentId,
      acknowledgedAt: new Date()
    });
    return this.save();
  }
  return Promise.resolve(this);
};

announcementsSchema.methods.isTargetedTo = function(campusId?: string, programId?: string, semester?: string, studentLevel?: string) {
  if (this.targeting.isGlobal) return true;
  
  if (campusId && this.targeting.campuses.includes(campusId)) return true;
  if (programId && this.targeting.programs.includes(programId)) return true;
  if (semester && this.targeting.semesters.includes(semester)) return true;
  if (studentLevel && this.targeting.studentLevels.includes(studentLevel)) return true;
  
  return false;
};

announcementsSchema.methods.isExpired = function() {
  if (!this.schedule.expirationDate) return false;
  return new Date() > this.schedule.expirationDate;
};

announcementsSchema.methods.isScheduledForFuture = function() {
  return new Date() < this.schedule.publishDate;
};

announcementsSchema.methods.getApprovedComments = function() {
  return this.engagement.comments.filter((comment: any) => comment.isApproved);
};

announcementsSchema.methods.getAcknowledgmentRate = function() {
  if (!this.requiresAcknowledgment) return null;
  // This would need additional logic to calculate against target audience
  return this.acknowledgments.length;
};

// Virtual for engagement score
announcementsSchema.virtual('engagementScore').get(function() {
  return this.engagement.views + (this.engagement.likes * 2) + (this.engagement.shares * 3) + (this.engagement.comments.length * 1.5);
});

// Virtual for is active
announcementsSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'published' && 
         this.schedule.publishDate <= now && 
         (!this.schedule.expirationDate || this.schedule.expirationDate > now);
});

// Ensure virtual fields are serialized
announcementsSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

// Create and export the model
export const Announcements = mongoose.model<IAnnouncements>('Announcements', announcementsSchema);