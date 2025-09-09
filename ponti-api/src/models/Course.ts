import mongoose, { Document, Schema } from 'mongoose';

// Interface for Course document
export interface ICourse extends Document {
  _id: mongoose.Types.ObjectId;
  courseId: string;
  courseCode: string;
  name: string;
  description: string;
  credits: number;
  type: string;
  level: string;
  department: string;
  prerequisites: string[];
  corequisites: string[];
  syllabus: {
    objectives: string[];
    topics: Array<{
      week: number;
      title: string;
      description: string;
      readings?: string[];
    }>;
    evaluationMethods: Array<{
      method: string;
      percentage: number;
      description?: string;
    }>;
    bibliography: Array<{
      type: string;
      title: string;
      author: string;
      year?: number;
      publisher?: string;
      isbn?: string;
      url?: string;
    }>;
  };
  schedule: {
    modalityType: string;
    weeklyHours: number;
    theoreticalHours: number;
    practicalHours: number;
    laboratoryHours: number;
  };
  availability: {
    campuses: string[];
    programs: string[];
    semesters: string[];
  };
  instructors: Array<{
    instructorId: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  }>;
  capacity: {
    minimum: number;
    maximum: number;
  };
  language: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Syllabus topic subdocument schema
const syllabusTopicSchema = new Schema({
  week: {
    type: Number,
    required: [true, 'Week number is required'],
    min: [1, 'Week number must be at least 1'],
    max: [20, 'Week number cannot exceed 20']
  },
  title: {
    type: String,
    required: [true, 'Topic title is required'],
    trim: true,
    maxlength: [200, 'Topic title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Topic description is required'],
    trim: true,
    maxlength: [1000, 'Topic description cannot exceed 1000 characters']
  },
  readings: [{
    type: String,
    trim: true,
    maxlength: [500, 'Reading reference cannot exceed 500 characters']
  }]
}, { _id: false });

// Evaluation method subdocument schema
const evaluationMethodSchema = new Schema({
  method: {
    type: String,
    required: [true, 'Evaluation method is required'],
    enum: {
      values: ['exam', 'quiz', 'assignment', 'project', 'presentation', 'participation', 'laboratory', 'other'],
      message: 'Evaluation method must be one of: exam, quiz, assignment, project, presentation, participation, laboratory, other'
    }
  },
  percentage: {
    type: Number,
    required: [true, 'Evaluation percentage is required'],
    min: [0, 'Percentage cannot be negative'],
    max: [100, 'Percentage cannot exceed 100']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Evaluation description cannot exceed 500 characters']
  }
}, { _id: false });

// Bibliography subdocument schema
const bibliographySchema = new Schema({
  type: {
    type: String,
    required: [true, 'Bibliography type is required'],
    enum: {
      values: ['book', 'article', 'journal', 'website', 'thesis', 'conference', 'other'],
      message: 'Bibliography type must be one of: book, article, journal, website, thesis, conference, other'
    }
  },
  title: {
    type: String,
    required: [true, 'Bibliography title is required'],
    trim: true,
    maxlength: [300, 'Title cannot exceed 300 characters']
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    maxlength: [200, 'Author name cannot exceed 200 characters']
  },
  year: {
    type: Number,
    min: [1900, 'Publication year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Publication year cannot be in the future']
  },
  publisher: {
    type: String,
    trim: true,
    maxlength: [200, 'Publisher name cannot exceed 200 characters']
  },
  isbn: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/.test(v);
      },
      message: 'Please provide a valid ISBN'
    }
  },
  url: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'URL must be a valid web address'
    }
  }
}, { _id: false });

// Syllabus subdocument schema
const syllabusSchema = new Schema({
  objectives: [{
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Objective cannot exceed 500 characters']
  }],
  topics: [syllabusTopicSchema],
  evaluationMethods: {
    type: [evaluationMethodSchema],
    validate: {
      validator: function(methods: any[]) {
        const totalPercentage = methods.reduce((sum, method) => sum + method.percentage, 0);
        return totalPercentage === 100;
      },
      message: 'Evaluation methods must total 100%'
    }
  },
  bibliography: [bibliographySchema]
}, { _id: false });

// Schedule subdocument schema
const scheduleSchema = new Schema({
  modalityType: {
    type: String,
    required: [true, 'Modality type is required'],
    enum: {
      values: ['presential', 'virtual', 'hybrid', 'blended'],
      message: 'Modality type must be one of: presential, virtual, hybrid, blended'
    }
  },
  weeklyHours: {
    type: Number,
    required: [true, 'Weekly hours is required'],
    min: [1, 'Weekly hours must be at least 1'],
    max: [20, 'Weekly hours cannot exceed 20']
  },
  theoreticalHours: {
    type: Number,
    required: [true, 'Theoretical hours is required'],
    min: [0, 'Theoretical hours cannot be negative']
  },
  practicalHours: {
    type: Number,
    required: [true, 'Practical hours is required'],
    min: [0, 'Practical hours cannot be negative']
  },
  laboratoryHours: {
    type: Number,
    required: [true, 'Laboratory hours is required'],
    min: [0, 'Laboratory hours cannot be negative']
  }
}, { 
  _id: false,
  validate: {
    validator: function(schedule: any) {
      return schedule.theoreticalHours + schedule.practicalHours + schedule.laboratoryHours === schedule.weeklyHours;
    },
    message: 'Sum of theoretical, practical, and laboratory hours must equal weekly hours'
  }
});

// Availability subdocument schema
const availabilitySchema = new Schema({
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
  }]
}, { _id: false });

// Instructor subdocument schema
const instructorSchema = new Schema({
  instructorId: {
    type: String,
    required: [true, 'Instructor ID is required'],
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Instructor name is required'],
    trim: true,
    maxlength: [100, 'Instructor name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Instructor email is required'],
    lowercase: true,
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please provide a valid email address'
    }
  },
  role: {
    type: String,
    required: [true, 'Instructor role is required'],
    enum: {
      values: ['professor', 'associate_professor', 'assistant_professor', 'lecturer', 'teaching_assistant'],
      message: 'Instructor role must be one of: professor, associate_professor, assistant_professor, lecturer, teaching_assistant'
    }
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true
  }
}, { _id: false });

// Capacity subdocument schema
const capacitySchema = new Schema({
  minimum: {
    type: Number,
    required: [true, 'Minimum capacity is required'],
    min: [1, 'Minimum capacity must be at least 1']
  },
  maximum: {
    type: Number,
    required: [true, 'Maximum capacity is required'],
    min: [1, 'Maximum capacity must be at least 1'],
    validate: {
      validator: function(this: any, max: number) {
        return max >= this.minimum;
      },
      message: 'Maximum capacity must be greater than or equal to minimum capacity'
    }
  }
}, { _id: false });

// Main Course schema
const courseSchema = new Schema<ICourse>({
  courseId: {
    type: String,
    required: [true, 'Course ID is required'],
    unique: true,
    trim: true,
    maxlength: [20, 'Course ID cannot exceed 20 characters'],
    index: true
  },
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [15, 'Course code cannot exceed 15 characters'],
    validate: {
      validator: function(v: string) {
        return /^[A-Z]{2,4}\d{3,4}$/.test(v);
      },
      message: 'Course code must follow format: 2-4 letters followed by 3-4 digits (e.g., MATH101)'
    }
  },
  name: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
    maxlength: [200, 'Course name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true,
    maxlength: [2000, 'Course description cannot exceed 2000 characters']
  },
  credits: {
    type: Number,
    required: [true, 'Course credits is required'],
    min: [1, 'Course must have at least 1 credit'],
    max: [10, 'Course cannot have more than 10 credits']
  },
  type: {
    type: String,
    required: [true, 'Course type is required'],
    enum: {
      values: ['core', 'elective', 'prerequisite', 'corequisite', 'optional'],
      message: 'Course type must be one of: core, elective, prerequisite, corequisite, optional'
    }
  },
  level: {
    type: String,
    required: [true, 'Course level is required'],
    enum: {
      values: ['undergraduate', 'graduate', 'postgraduate', 'doctorate'],
      message: 'Course level must be one of: undergraduate, graduate, postgraduate, doctorate'
    }
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  prerequisites: [{
    type: String,
    ref: 'Course'
  }],
  corequisites: [{
    type: String,
    ref: 'Course'
  }],
  syllabus: {
    type: syllabusSchema,
    required: [true, 'Course syllabus is required']
  },
  schedule: {
    type: scheduleSchema,
    required: [true, 'Course schedule information is required']
  },
  availability: {
    type: availabilitySchema,
    required: [true, 'Course availability is required']
  },
  instructors: [instructorSchema],
  capacity: {
    type: capacitySchema,
    required: [true, 'Course capacity is required']
  },
  language: {
    type: String,
    required: [true, 'Course language is required'],
    enum: {
      values: ['spanish', 'english', 'bilingual'],
      message: 'Course language must be one of: spanish, english, bilingual'
    },
    default: 'spanish'
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true
  }
}, {
  timestamps: true,
  collection: 'courses'
});

// Indexes for optimization
courseSchema.index({ courseId: 1 }, { unique: true });
courseSchema.index({ courseCode: 1 }, { unique: true });
courseSchema.index({ department: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ type: 1 });
courseSchema.index({ isActive: 1 });
courseSchema.index({ credits: 1 });
courseSchema.index({ language: 1 });

// Compound indexes for common queries
courseSchema.index({ department: 1, level: 1 });
courseSchema.index({ type: 1, isActive: 1 });
courseSchema.index({ level: 1, isActive: 1 });
courseSchema.index({ 'availability.campuses': 1, isActive: 1 });
courseSchema.index({ 'availability.programs': 1, isActive: 1 });

// Static methods
courseSchema.statics.findActiveCourses = function() {
  return this.find({ isActive: true });
};

courseSchema.statics.findByCourseId = function(courseId: string) {
  return this.findOne({ courseId, isActive: true });
};

courseSchema.statics.findByCourseCode = function(courseCode: string) {
  return this.findOne({ courseCode: courseCode.toUpperCase(), isActive: true });
};

courseSchema.statics.findByDepartment = function(department: string) {
  return this.find({ department, isActive: true });
};

courseSchema.statics.findByLevel = function(level: string) {
  return this.find({ level, isActive: true });
};

courseSchema.statics.findByCredits = function(credits: number) {
  return this.find({ credits, isActive: true });
};

// Instance methods
courseSchema.methods.hasPrerequisites = function() {
  return this.prerequisites && this.prerequisites.length > 0;
};

courseSchema.methods.hasCorequisites = function() {
  return this.corequisites && this.corequisites.length > 0;
};

courseSchema.methods.getActiveInstructors = function() {
  return this.instructors.filter((instructor: any) => instructor.isActive);
};

courseSchema.methods.isAvailableInCampus = function(campusId: string) {
  return this.availability.campuses.includes(campusId);
};

courseSchema.methods.isAvailableForProgram = function(programId: string) {
  return this.availability.programs.includes(programId);
};

courseSchema.methods.isAvailableInSemester = function(semester: string) {
  return this.availability.semesters.includes(semester);
};

// Virtual for total syllabus topics
courseSchema.virtual('totalTopics').get(function() {
  return this.syllabus.topics.length;
});

// Virtual for total bibliography items
courseSchema.virtual('totalBibliography').get(function() {
  return this.syllabus.bibliography.length;
});

// Ensure virtual fields are serialized
courseSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

// Create and export the model
export const Course = mongoose.model<ICourse>('Course', courseSchema);