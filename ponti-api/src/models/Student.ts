import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface for Student document
export interface IStudent extends Document {
  _id: mongoose.Types.ObjectId;
  studentId: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  gender: string;
  academic: {
    level: string;
    semester: string;
    status: string;
    admissionPeriod: string;
    campusId: string;
    schoolId: string;
    programId: string;
    currentPeriod: string;
    metrics: {
      totalCreditsAttempted: number;
      totalCreditsApproved: number;
      currentGPA: number;
      totalSemesters: number;
    };
  };
  preferences: {
    notifications: {
      classReminders: boolean;
      announcements: boolean;
      grades: boolean;
    };
    theme: string;
    language: string;
  };
  password: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  getFullName(): string;
  getAcademicSummary(): {
    level: string;
    semester: string;
    status: string;
    gpa: number;
    totalCredits: number;
  };
}

// Academic metrics subdocument schema
const academicMetricsSchema = new Schema({
  totalCreditsAttempted: {
    type: Number,
    required: true,
    min: [0, 'Total credits attempted cannot be negative'],
    default: 0
  },
  totalCreditsApproved: {
    type: Number,
    required: true,
    min: [0, 'Total credits approved cannot be negative'],
    default: 0
  },
  currentGPA: {
    type: Number,
    required: true,
    min: [0, 'GPA cannot be negative'],
    max: [5.0, 'GPA cannot exceed 5.0'],
    default: 0
  },
  totalSemesters: {
    type: Number,
    required: true,
    min: [0, 'Total semesters cannot be negative'],
    default: 0
  }
}, { _id: false });

// Academic information subdocument schema
const academicSchema = new Schema({
  level: {
    type: String,
    required: [true, 'Academic level is required'],
    enum: {
      values: ['undergraduate', 'graduate', 'postgraduate', 'doctorate'],
      message: 'Academic level must be one of: undergraduate, graduate, postgraduate, doctorate'
    }
  },
  semester: {
    type: String,
    required: [true, 'Current semester is required'],
    validate: {
      validator: function(v: string) {
        return /^(1|2|3|4|5|6|7|8|9|10)$/.test(v);
      },
      message: 'Semester must be a number between 1 and 10'
    }
  },
  status: {
    type: String,
    required: [true, 'Academic status is required'],
    enum: {
      values: ['active', 'inactive', 'graduated', 'suspended', 'transferred'],
      message: 'Status must be one of: active, inactive, graduated, suspended, transferred'
    },
    default: 'active'
  },
  admissionPeriod: {
    type: String,
    required: [true, 'Admission period is required'],
    validate: {
      validator: function(v: string) {
        return /^\d{4}-[12]$/.test(v);
      },
      message: 'Admission period must be in format YYYY-1 or YYYY-2'
    }
  },
  campusId: {
    type: String,
    required: [true, 'Campus ID is required'],
    ref: 'Campus'
  },
  schoolId: {
    type: String,
    required: [true, 'School ID is required'],
    ref: 'School'
  },
  programId: {
    type: String,
    required: [true, 'Program ID is required'],
    ref: 'Program'
  },
  currentPeriod: {
    type: String,
    required: [true, 'Current period is required'],
    validate: {
      validator: function(v: string) {
        return /^\d{4}-[12]$/.test(v);
      },
      message: 'Current period must be in format YYYY-1 or YYYY-2'
    }
  },
  metrics: {
    type: academicMetricsSchema,
    required: true,
    default: () => ({})
  }
}, { _id: false });

// Notifications preferences subdocument schema
const notificationsSchema = new Schema({
  classReminders: {
    type: Boolean,
    required: true,
    default: true
  },
  announcements: {
    type: Boolean,
    required: true,
    default: true
  },
  grades: {
    type: Boolean,
    required: true,
    default: true
  }
}, { _id: false });

// User preferences subdocument schema
const preferencesSchema = new Schema({
  notifications: {
    type: notificationsSchema,
    required: true,
    default: () => ({})
  },
  theme: {
    type: String,
    required: true,
    enum: {
      values: ['light', 'dark', 'system'],
      message: 'Theme must be one of: light, dark, system'
    },
    default: 'system'
  },
  language: {
    type: String,
    required: true,
    enum: {
      values: ['es', 'en'],
      message: 'Language must be one of: es, en'
    },
    default: 'es'
  }
}, { _id: false });

// Main Student schema
const studentSchema = new Schema<IStudent>({
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^\d{9}$/.test(v);
      },
      message: 'Student ID must be exactly 9 digits'
    },
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please provide a valid email address'
    },
    index: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters long'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters long'],
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  birthDate: {
    type: Date,
    required: [true, 'Birth date is required'],
    validate: {
      validator: function(v: Date) {
        const today = new Date();
        const age = today.getFullYear() - v.getFullYear();
        return age >= 16 && age <= 100;
      },
      message: 'Student must be between 16 and 100 years old'
    }
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: {
      values: ['male', 'female', 'other', 'prefer_not_to_say'],
      message: 'Gender must be one of: male, female, other, prefer_not_to_say'
    }
  },
  academic: {
    type: academicSchema,
    required: [true, 'Academic information is required']
  },
  preferences: {
    type: preferencesSchema,
    required: true,
    default: () => ({})
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'students'
});

// Indexes for optimization
studentSchema.index({ studentId: 1 }, { unique: true });
studentSchema.index({ email: 1 }, { unique: true });
studentSchema.index({ 'academic.campusId': 1 });
studentSchema.index({ 'academic.programId': 1 });
studentSchema.index({ 'academic.status': 1 });
studentSchema.index({ 'academic.currentPeriod': 1 });

// Compound indexes for common queries
studentSchema.index({ 'academic.campusId': 1, 'academic.programId': 1 });
studentSchema.index({ 'academic.status': 1, 'academic.currentPeriod': 1 });

// Pre-save middleware to hash password
studentSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to compare password
studentSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to get full name
studentSchema.methods.getFullName = function(): string {
  return `${this.firstName} ${this.lastName}`;
};

// Instance method to get academic summary
studentSchema.methods.getAcademicSummary = function() {
  return {
    level: this.academic.level,
    semester: this.academic.semester,
    status: this.academic.status,
    gpa: this.academic.metrics.currentGPA,
    totalCredits: this.academic.metrics.totalCreditsApproved
  };
};

// Static method to find by student ID
studentSchema.statics.findByStudentId = function(studentId: string) {
  return this.findOne({ studentId });
};

// Static method to find active students
studentSchema.statics.findActiveStudents = function() {
  return this.find({ 'academic.status': 'active' });
};

// Virtual for age calculation
studentSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = this.birthDate;
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Ensure virtual fields are serialized
studentSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete (ret as any).password;
    delete (ret as any).__v;
    return ret;
  }
});

// Create and export the model
export const Student = mongoose.model<IStudent>('Student', studentSchema);