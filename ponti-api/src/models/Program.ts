import mongoose, { Document, Schema } from 'mongoose';

// Interface for Program document
export interface IProgram extends Document {
  _id: mongoose.Types.ObjectId;
  programId: string;
  name: string;
  shortName: string;
  description: string;
  level: string;
  duration: {
    semesters: number;
    years: number;
  };
  requirements: {
    totalCredits: number;
    coreCredits: number;
    electiveCredits: number;
    minimumGPA: number;
  };
  campusId: string;
  schoolId: string;
  faculty: string;
  department: string;
  degree: {
    title: string;
    type: string;
  };
  curriculum: Array<{
    semesterNumber: number;
    courses: Array<{
      courseId: string;
      isRequired: boolean;
      prerequisites: string[];
    }>;
  }>;
  admissionRequirements: {
    minimumScore: number;
    requiredTests: string[];
    additionalRequirements: string[];
  };
  careerOpportunities: string[];
  accreditation: {
    isAccredited: boolean;
    accreditingBody?: string;
    validUntil?: Date;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Duration subdocument schema
const durationSchema = new Schema({
  semesters: {
    type: Number,
    required: [true, 'Number of semesters is required'],
    min: [1, 'Program must have at least 1 semester']
  },
  years: {
    type: Number,
    required: [true, 'Number of years is required'],
    min: [0.5, 'Program must be at least 0.5 years']
  }
}, { _id: false });

// Requirements subdocument schema
const requirementsSchema = new Schema({
  totalCredits: {
    type: Number,
    required: [true, 'Total credits is required'],
    min: [1, 'Total credits must be at least 1']
  },
  coreCredits: {
    type: Number,
    required: [true, 'Core credits is required'],
    min: [0, 'Core credits cannot be negative']
  },
  electiveCredits: {
    type: Number,
    required: [true, 'Elective credits is required'],
    min: [0, 'Elective credits cannot be negative']
  },
  minimumGPA: {
    type: Number,
    required: [true, 'Minimum GPA is required'],
    min: [0, 'Minimum GPA cannot be negative'],
    max: [5.0, 'Minimum GPA cannot exceed 5.0']
  }
}, { _id: false });

// Degree subdocument schema
const degreeSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Degree title is required'],
    trim: true,
    maxlength: [200, 'Degree title cannot exceed 200 characters']
  },
  type: {
    type: String,
    required: [true, 'Degree type is required'],
    enum: {
      values: ['bachelor', 'master', 'doctorate', 'certificate', 'diploma'],
      message: 'Degree type must be one of: bachelor, master, doctorate, certificate, diploma'
    }
  }
}, { _id: false });

// Course in curriculum subdocument schema
const curriculumCourseSchema = new Schema({
  courseId: {
    type: String,
    required: [true, 'Course ID is required'],
    ref: 'Course'
  },
  isRequired: {
    type: Boolean,
    required: true,
    default: true
  },
  prerequisites: [{
    type: String,
    ref: 'Course'
  }]
}, { _id: false });

// Curriculum subdocument schema
const curriculumSchema = new Schema({
  semesterNumber: {
    type: Number,
    required: [true, 'Semester number is required'],
    min: [1, 'Semester number must be at least 1']
  },
  courses: [curriculumCourseSchema]
}, { _id: false });

// Admission requirements subdocument schema
const admissionRequirementsSchema = new Schema({
  minimumScore: {
    type: Number,
    required: [true, 'Minimum admission score is required'],
    min: [0, 'Minimum score cannot be negative']
  },
  requiredTests: [{
    type: String,
    trim: true
  }],
  additionalRequirements: [{
    type: String,
    trim: true
  }]
}, { _id: false });

// Accreditation subdocument schema
const accreditationSchema = new Schema({
  isAccredited: {
    type: Boolean,
    required: true,
    default: false
  },
  accreditingBody: {
    type: String,
    trim: true,
    maxlength: [100, 'Accrediting body name cannot exceed 100 characters']
  },
  validUntil: {
    type: Date,
    validate: {
      validator: function(v: Date) {
        return !v || v > new Date();
      },
      message: 'Accreditation valid until date must be in the future'
    }
  }
}, { _id: false });

// Main Program schema
const programSchema = new Schema<IProgram>({
  programId: {
    type: String,
    required: [true, 'Program ID is required'],
    unique: true,
    trim: true,
    maxlength: [20, 'Program ID cannot exceed 20 characters'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Program name is required'],
    trim: true,
    maxlength: [200, 'Program name cannot exceed 200 characters']
  },
  shortName: {
    type: String,
    required: [true, 'Program short name is required'],
    trim: true,
    maxlength: [20, 'Program short name cannot exceed 20 characters']
  },
  description: {
    type: String,
    required: [true, 'Program description is required'],
    trim: true,
    maxlength: [2000, 'Program description cannot exceed 2000 characters']
  },
  level: {
    type: String,
    required: [true, 'Program level is required'],
    enum: {
      values: ['undergraduate', 'graduate', 'postgraduate', 'doctorate'],
      message: 'Program level must be one of: undergraduate, graduate, postgraduate, doctorate'
    }
  },
  duration: {
    type: durationSchema,
    required: [true, 'Program duration is required']
  },
  requirements: {
    type: requirementsSchema,
    required: [true, 'Program requirements are required']
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
  faculty: {
    type: String,
    required: [true, 'Faculty is required'],
    trim: true,
    maxlength: [100, 'Faculty name cannot exceed 100 characters']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  degree: {
    type: degreeSchema,
    required: [true, 'Degree information is required']
  },
  curriculum: [curriculumSchema],
  admissionRequirements: {
    type: admissionRequirementsSchema,
    required: [true, 'Admission requirements are required']
  },
  careerOpportunities: [{
    type: String,
    trim: true,
    maxlength: [200, 'Career opportunity description cannot exceed 200 characters']
  }],
  accreditation: {
    type: accreditationSchema,
    required: true,
    default: () => ({ isAccredited: false })
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true
  }
}, {
  timestamps: true,
  collection: 'programs'
});

// Indexes for optimization
programSchema.index({ programId: 1 }, { unique: true });
programSchema.index({ campusId: 1 });
programSchema.index({ schoolId: 1 });
programSchema.index({ level: 1 });
programSchema.index({ isActive: 1 });
programSchema.index({ faculty: 1 });
programSchema.index({ department: 1 });

// Compound indexes for common queries
programSchema.index({ campusId: 1, level: 1 });
programSchema.index({ schoolId: 1, isActive: 1 });
programSchema.index({ level: 1, isActive: 1 });

// Static methods
programSchema.statics.findActivePrograms = function() {
  return this.find({ isActive: true });
};

programSchema.statics.findByProgramId = function(programId: string) {
  return this.findOne({ programId, isActive: true });
};

programSchema.statics.findByCampus = function(campusId: string) {
  return this.find({ campusId, isActive: true });
};

programSchema.statics.findByLevel = function(level: string) {
  return this.find({ level, isActive: true });
};

// Instance methods
programSchema.methods.getCoursesBySemester = function(semesterNumber: number) {
  const semester = this.curriculum.find((sem: any) => sem.semesterNumber === semesterNumber);
  return semester ? semester.courses : [];
};

programSchema.methods.getRequiredCourses = function() {
  const allCourses: any[] = [];
  this.curriculum.forEach((semester: any) => {
    semester.courses.forEach((course: any) => {
      if (course.isRequired) {
        allCourses.push(course);
      }
    });
  });
  return allCourses;
};

programSchema.methods.getElectiveCourses = function() {
  const allCourses: any[] = [];
  this.curriculum.forEach((semester: any) => {
    semester.courses.forEach((course: any) => {
      if (!course.isRequired) {
        allCourses.push(course);
      }
    });
  });
  return allCourses;
};

// Virtual for total curriculum courses
programSchema.virtual('totalCourses').get(function() {
  return this.curriculum.reduce((total: number, semester: any) => {
    return total + semester.courses.length;
  }, 0);
});

// Ensure virtual fields are serialized
programSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

// Create and export the model
export const Program = mongoose.model<IProgram>('Program', programSchema);