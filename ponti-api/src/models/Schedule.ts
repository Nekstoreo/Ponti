import mongoose, { Document, Schema } from 'mongoose';

// Interface for Schedule document
export interface ISchedule extends Document {
  _id: mongoose.Types.ObjectId;
  studentId: string;
  periodId: string;
  classes: Array<{
    courseNrc: string;
    courseCode: string;
    courseName: string;
    instructor: string;
    credits: number;
    schedule: {
      days: string[];
      timeSlots: Array<{
        startTime: string;
        endTime: string;
        location: {
          buildingId: string;
          room: string;
          fullLocation: string;
        };
      }>;
    };
    type: string;
    dateRange: {
      start: Date;
      end: Date;
    };
  }>;
  summary: {
    totalCredits: number;
    totalCourses: number;
    weeklyHours: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Location subdocument schema
const locationSchema = new Schema({
  buildingId: {
    type: String,
    required: [true, 'Building ID is required'],
    trim: true
  },
  room: {
    type: String,
    required: [true, 'Room is required'],
    trim: true,
    maxlength: [20, 'Room cannot exceed 20 characters']
  },
  fullLocation: {
    type: String,
    required: [true, 'Full location is required'],
    trim: true,
    maxlength: [100, 'Full location cannot exceed 100 characters']
  }
}, { _id: false });

// Time slot subdocument schema
const timeSlotSchema = new Schema({
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    validate: {
      validator: function(v: string) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Start time must be in HH:MM format (24-hour)'
    }
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    validate: {
      validator: function(v: string) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'End time must be in HH:MM format (24-hour)'
    }
  },
  location: {
    type: locationSchema,
    required: [true, 'Location is required']
  }
}, { 
  _id: false,
  validate: {
    validator: function(timeSlot: any) {
      const start = new Date(`1970-01-01T${timeSlot.startTime}:00`);
      const end = new Date(`1970-01-01T${timeSlot.endTime}:00`);
      return end > start;
    },
    message: 'End time must be after start time'
  }
});

// Class schedule subdocument schema
const classScheduleSchema = new Schema({
  days: [{
    type: String,
    required: true,
    enum: {
      values: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      message: 'Day must be one of: monday, tuesday, wednesday, thursday, friday, saturday, sunday'
    }
  }],
  timeSlots: {
    type: [timeSlotSchema],
    validate: {
      validator: function(timeSlots: any[]) {
        return timeSlots.length > 0;
      },
      message: 'At least one time slot is required'
    }
  }
}, { _id: false });

// Date range subdocument schema
const dateRangeSchema = new Schema({
  start: {
    type: Date,
    required: [true, 'Start date is required']
  },
  end: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(this: any, endDate: Date) {
        return endDate > this.start;
      },
      message: 'End date must be after start date'
    }
  }
}, { _id: false });

// Class subdocument schema
const classSchema = new Schema({
  courseNrc: {
    type: String,
    required: [true, 'Course NRC is required'],
    trim: true,
    maxlength: [10, 'Course NRC cannot exceed 10 characters']
  },
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    trim: true,
    uppercase: true,
    maxlength: [15, 'Course code cannot exceed 15 characters'],
    ref: 'Course'
  },
  courseName: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
    maxlength: [200, 'Course name cannot exceed 200 characters']
  },
  instructor: {
    type: String,
    required: [true, 'Instructor name is required'],
    trim: true,
    maxlength: [100, 'Instructor name cannot exceed 100 characters']
  },
  credits: {
    type: Number,
    required: [true, 'Credits is required'],
    min: [1, 'Credits must be at least 1'],
    max: [10, 'Credits cannot exceed 10']
  },
  schedule: {
    type: classScheduleSchema,
    required: [true, 'Class schedule is required']
  },
  type: {
    type: String,
    required: [true, 'Class type is required'],
    enum: {
      values: ['lecture', 'laboratory', 'seminar', 'workshop', 'tutorial', 'practicum', 'other'],
      message: 'Class type must be one of: lecture, laboratory, seminar, workshop, tutorial, practicum, other'
    }
  },
  dateRange: {
    type: dateRangeSchema,
    required: [true, 'Date range is required']
  }
}, { _id: false });

// Summary subdocument schema
const summarySchema = new Schema({
  totalCredits: {
    type: Number,
    required: [true, 'Total credits is required'],
    min: [0, 'Total credits cannot be negative']
  },
  totalCourses: {
    type: Number,
    required: [true, 'Total courses is required'],
    min: [0, 'Total courses cannot be negative']
  },
  weeklyHours: {
    type: Number,
    required: [true, 'Weekly hours is required'],
    min: [0, 'Weekly hours cannot be negative']
  }
}, { _id: false });

// Main Schedule schema
const scheduleSchema = new Schema<ISchedule>({
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
  periodId: {
    type: String,
    required: [true, 'Period ID is required'],
    validate: {
      validator: function(v: string) {
        return /^\d{4}-[12]$/.test(v);
      },
      message: 'Period ID must be in format YYYY-1 or YYYY-2'
    }
  },
  classes: {
    type: [classSchema],
    validate: {
      validator: function(classes: any[]) {
        return classes.length > 0;
      },
      message: 'At least one class is required'
    }
  },
  summary: {
    type: summarySchema,
    required: [true, 'Schedule summary is required']
  }
}, {
  timestamps: true,
  collection: 'schedules'
});

// Indexes for optimization
scheduleSchema.index({ studentId: 1, periodId: 1 }, { unique: true });
scheduleSchema.index({ studentId: 1 });
scheduleSchema.index({ periodId: 1 });
scheduleSchema.index({ 'classes.courseCode': 1 });
scheduleSchema.index({ 'classes.instructor': 1 });

// Compound indexes for common queries
scheduleSchema.index({ studentId: 1, 'classes.schedule.days': 1 });
scheduleSchema.index({ periodId: 1, 'classes.courseCode': 1 });

// Pre-save middleware to calculate summary
scheduleSchema.pre('save', function(next) {
  if (this.classes && this.classes.length > 0) {
    this.summary.totalCourses = this.classes.length;
    this.summary.totalCredits = this.classes.reduce((total, cls) => total + cls.credits, 0);
    
    // Calculate weekly hours
    let totalWeeklyHours = 0;
    this.classes.forEach(cls => {
      cls.schedule.timeSlots.forEach(timeSlot => {
        const start = new Date(`1970-01-01T${timeSlot.startTime}:00`);
        const end = new Date(`1970-01-01T${timeSlot.endTime}:00`);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        totalWeeklyHours += hours * cls.schedule.days.length;
      });
    });
    this.summary.weeklyHours = totalWeeklyHours;
  }
  next();
});

// Static methods
scheduleSchema.statics.findByStudentId = function(studentId: string) {
  return this.find({ studentId }).sort({ periodId: -1 });
};

scheduleSchema.statics.findByStudentAndPeriod = function(studentId: string, periodId: string) {
  return this.findOne({ studentId, periodId });
};

scheduleSchema.statics.findByPeriod = function(periodId: string) {
  return this.find({ periodId });
};

// Instance methods
scheduleSchema.methods.getClassesByDay = function(day: string) {
  return this.classes.filter((cls: any) => cls.schedule.days.includes(day));
};

scheduleSchema.methods.getNextClass = function() {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
  
  const todayClasses = this.getClassesByDay(currentDay);
  
  for (const cls of todayClasses) {
    for (const timeSlot of cls.schedule.timeSlots) {
      if (timeSlot.startTime > currentTime) {
        return {
          class: cls,
          timeSlot: timeSlot,
          isToday: true
        };
      }
    }
  }
  
  // If no more classes today, find next class in upcoming days
  const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const currentDayIndex = daysOrder.indexOf(currentDay);
  
  for (let i = 1; i < 7; i++) {
    const nextDayIndex = (currentDayIndex + i) % 7;
    const nextDay = daysOrder[nextDayIndex];
    const nextDayClasses = this.getClassesByDay(nextDay);
    
    if (nextDayClasses.length > 0) {
      const earliestClass = nextDayClasses.reduce((earliest: any, current: any) => {
        const earliestTime = earliest.schedule.timeSlots[0].startTime;
        const currentTime = current.schedule.timeSlots[0].startTime;
        return currentTime < earliestTime ? current : earliest;
      });
      
      return {
        class: earliestClass,
        timeSlot: earliestClass.schedule.timeSlots[0],
        isToday: false,
        day: nextDay
      };
    }
  }
  
  return null;
};

scheduleSchema.methods.getClassesByInstructor = function(instructor: string) {
  return this.classes.filter((cls: any) => 
    cls.instructor.toLowerCase().includes(instructor.toLowerCase())
  );
};

scheduleSchema.methods.hasTimeConflict = function(newClass: any) {
  for (const existingClass of this.classes) {
    // Check if there are common days
    const commonDays = existingClass.schedule.days.filter((day: string) => 
      newClass.schedule.days.includes(day)
    );
    
    if (commonDays.length > 0) {
      // Check for time conflicts
      for (const existingSlot of existingClass.schedule.timeSlots) {
        for (const newSlot of newClass.schedule.timeSlots) {
          const existingStart = existingSlot.startTime;
          const existingEnd = existingSlot.endTime;
          const newStart = newSlot.startTime;
          const newEnd = newSlot.endTime;
          
          // Check if times overlap
          if ((newStart < existingEnd && newEnd > existingStart)) {
            return true;
          }
        }
      }
    }
  }
  return false;
};

// Virtual for current period check
scheduleSchema.virtual('isCurrentPeriod').get(function() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
  const currentPeriod = currentMonth <= 6 ? `${currentYear}-1` : `${currentYear}-2`;
  return this.periodId === currentPeriod;
});

// Ensure virtual fields are serialized
scheduleSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

// Create and export the model
export const Schedule = mongoose.model<ISchedule>('Schedule', scheduleSchema);