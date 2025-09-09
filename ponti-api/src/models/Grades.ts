import mongoose, { Document, Schema } from 'mongoose';

// Interface for Grades document
export interface IGrades extends Document {
  _id: mongoose.Types.ObjectId;
  studentId: string;
  periodId: string;
  courseCode: string;
  courseName: string;
  courseNrc: string;
  instructor: string;
  credits: number;
  evaluations: Array<{
    evaluationId: string;
    name: string;
    type: string;
    weight: number;
    maxScore: number;
    score?: number;
    date: Date;
    feedback?: string;
    isSubmitted: boolean;
  }>;
  finalGrade: {
    numericGrade?: number;
    letterGrade?: string;
    status: string;
    gpaPoints?: number;
    isApproved: boolean;
  };
  attendance: {
    totalClasses: number;
    attendedClasses: number;
    attendancePercentage: number;
    absences: Array<{
      date: Date;
      reason?: string;
      isExcused: boolean;
    }>;
  };
  statistics: {
    currentAverage: number;
    projectedGrade: number;
    classRank?: number;
    classAverage?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Evaluation subdocument schema
const evaluationSchema = new Schema({
  evaluationId: {
    type: String,
    required: [true, 'Evaluation ID is required'],
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Evaluation name is required'],
    trim: true,
    maxlength: [100, 'Evaluation name cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Evaluation type is required'],
    enum: {
      values: ['exam', 'quiz', 'assignment', 'project', 'presentation', 'participation', 'laboratory', 'homework', 'other'],
      message: 'Evaluation type must be one of: exam, quiz, assignment, project, presentation, participation, laboratory, homework, other'
    }
  },
  weight: {
    type: Number,
    required: [true, 'Evaluation weight is required'],
    min: [0, 'Weight cannot be negative'],
    max: [100, 'Weight cannot exceed 100%']
  },
  maxScore: {
    type: Number,
    required: [true, 'Maximum score is required'],
    min: [0, 'Maximum score cannot be negative']
  },
  score: {
    type: Number,
    min: [0, 'Score cannot be negative'],
    validate: {
      validator: function(this: any, score: number) {
        return !score || score <= this.maxScore;
      },
      message: 'Score cannot exceed maximum score'
    }
  },
  date: {
    type: Date,
    required: [true, 'Evaluation date is required']
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: [1000, 'Feedback cannot exceed 1000 characters']
  },
  isSubmitted: {
    type: Boolean,
    required: true,
    default: false
  }
}, { _id: false });

// Final grade subdocument schema
const finalGradeSchema = new Schema({
  numericGrade: {
    type: Number,
    min: [0, 'Numeric grade cannot be negative'],
    max: [5.0, 'Numeric grade cannot exceed 5.0']
  },
  letterGrade: {
    type: String,
    enum: {
      values: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'I', 'W', 'P'],
      message: 'Letter grade must be one of: A+, A, A-, B+, B, B-, C+, C, C-, D+, D, F, I, W, P'
    }
  },
  status: {
    type: String,
    required: [true, 'Grade status is required'],
    enum: {
      values: ['in_progress', 'completed', 'failed', 'withdrawn', 'incomplete', 'pass'],
      message: 'Status must be one of: in_progress, completed, failed, withdrawn, incomplete, pass'
    },
    default: 'in_progress'
  },
  gpaPoints: {
    type: Number,
    min: [0, 'GPA points cannot be negative'],
    max: [5.0, 'GPA points cannot exceed 5.0']
  },
  isApproved: {
    type: Boolean,
    required: true,
    default: false
  }
}, { _id: false });

// Absence subdocument schema
const absenceSchema = new Schema({
  date: {
    type: Date,
    required: [true, 'Absence date is required']
  },
  reason: {
    type: String,
    trim: true,
    maxlength: [200, 'Absence reason cannot exceed 200 characters']
  },
  isExcused: {
    type: Boolean,
    required: true,
    default: false
  }
}, { _id: false });

// Attendance subdocument schema
const attendanceSchema = new Schema({
  totalClasses: {
    type: Number,
    required: [true, 'Total classes is required'],
    min: [0, 'Total classes cannot be negative']
  },
  attendedClasses: {
    type: Number,
    required: [true, 'Attended classes is required'],
    min: [0, 'Attended classes cannot be negative'],
    validate: {
      validator: function(this: any, attended: number) {
        return attended <= this.totalClasses;
      },
      message: 'Attended classes cannot exceed total classes'
    }
  },
  attendancePercentage: {
    type: Number,
    required: [true, 'Attendance percentage is required'],
    min: [0, 'Attendance percentage cannot be negative'],
    max: [100, 'Attendance percentage cannot exceed 100%']
  },
  absences: [absenceSchema]
}, { _id: false });

// Statistics subdocument schema
const statisticsSchema = new Schema({
  currentAverage: {
    type: Number,
    required: [true, 'Current average is required'],
    min: [0, 'Current average cannot be negative'],
    max: [5.0, 'Current average cannot exceed 5.0'],
    default: 0
  },
  projectedGrade: {
    type: Number,
    required: [true, 'Projected grade is required'],
    min: [0, 'Projected grade cannot be negative'],
    max: [5.0, 'Projected grade cannot exceed 5.0'],
    default: 0
  },
  classRank: {
    type: Number,
    min: [1, 'Class rank must be at least 1']
  },
  classAverage: {
    type: Number,
    min: [0, 'Class average cannot be negative'],
    max: [5.0, 'Class average cannot exceed 5.0']
  }
}, { _id: false });

// Main Grades schema
const gradesSchema = new Schema<IGrades>({
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
  courseNrc: {
    type: String,
    required: [true, 'Course NRC is required'],
    trim: true,
    maxlength: [10, 'Course NRC cannot exceed 10 characters']
  },
  instructor: {
    type: String,
    required: [true, 'Instructor name is required'],
    trim: true,
    maxlength: [100, 'Instructor name cannot exceed 100 characters']
  },
  credits: {
    type: Number,
    required: [true, 'Course credits is required'],
    min: [1, 'Credits must be at least 1'],
    max: [10, 'Credits cannot exceed 10']
  },
  evaluations: {
    type: [evaluationSchema],
    validate: {
      validator: function(evaluations: any[]) {
        const totalWeight = evaluations.reduce((sum, eval) => sum + eval.weight, 0);
        return totalWeight <= 100;
      },
      message: 'Total evaluation weights cannot exceed 100%'
    }
  },
  finalGrade: {
    type: finalGradeSchema,
    required: [true, 'Final grade information is required'],
    default: () => ({ status: 'in_progress', isApproved: false })
  },
  attendance: {
    type: attendanceSchema,
    required: [true, 'Attendance information is required'],
    default: () => ({ totalClasses: 0, attendedClasses: 0, attendancePercentage: 0, absences: [] })
  },
  statistics: {
    type: statisticsSchema,
    required: [true, 'Statistics are required'],
    default: () => ({ currentAverage: 0, projectedGrade: 0 })
  }
}, {
  timestamps: true,
  collection: 'grades'
});

// Indexes for optimization
gradesSchema.index({ studentId: 1, periodId: 1, courseCode: 1 }, { unique: true });
gradesSchema.index({ studentId: 1 });
gradesSchema.index({ periodId: 1 });
gradesSchema.index({ courseCode: 1 });
gradesSchema.index({ instructor: 1 });
gradesSchema.index({ 'finalGrade.status': 1 });
gradesSchema.index({ 'finalGrade.isApproved': 1 });

// Compound indexes for common queries
gradesSchema.index({ studentId: 1, 'finalGrade.status': 1 });
gradesSchema.index({ periodId: 1, courseCode: 1 });
gradesSchema.index({ studentId: 1, periodId: 1 });

// Pre-save middleware to calculate statistics
gradesSchema.pre('save', function(next) {
  // Calculate attendance percentage
  if (this.attendance.totalClasses > 0) {
    this.attendance.attendancePercentage = Math.round(
      (this.attendance.attendedClasses / this.attendance.totalClasses) * 100
    );
  }
  
  // Calculate current average from submitted evaluations
  const submittedEvaluations = this.evaluations.filter(eval => eval.isSubmitted && eval.score !== undefined);
  if (submittedEvaluations.length > 0) {
    let weightedSum = 0;
    let totalWeight = 0;
    
    submittedEvaluations.forEach(eval => {
      const normalizedScore = (eval.score! / eval.maxScore) * 5.0; // Convert to 5.0 scale
      weightedSum += normalizedScore * (eval.weight / 100);
      totalWeight += eval.weight / 100;
    });
    
    if (totalWeight > 0) {
      this.statistics.currentAverage = Math.round((weightedSum / totalWeight) * 100) / 100;
    }
  }
  
  // Calculate projected grade (assuming remaining evaluations get current average)
  if (this.evaluations.length > 0) {
    let projectedSum = 0;
    let totalWeight = 0;
    
    this.evaluations.forEach(eval => {
      if (eval.isSubmitted && eval.score !== undefined) {
        const normalizedScore = (eval.score / eval.maxScore) * 5.0;
        projectedSum += normalizedScore * (eval.weight / 100);
      } else {
        // Use current average for pending evaluations
        projectedSum += this.statistics.currentAverage * (eval.weight / 100);
      }
      totalWeight += eval.weight / 100;
    });
    
    if (totalWeight > 0) {
      this.statistics.projectedGrade = Math.round((projectedSum / totalWeight) * 100) / 100;
    }
  }
  
  // Update final grade status and approval
  if (this.finalGrade.numericGrade !== undefined) {
    this.finalGrade.isApproved = this.finalGrade.numericGrade >= 3.0;
    this.finalGrade.status = this.finalGrade.isApproved ? 'completed' : 'failed';
    
    // Calculate GPA points
    this.finalGrade.gpaPoints = this.finalGrade.numericGrade;
    
    // Assign letter grade
    if (this.finalGrade.numericGrade >= 4.6) this.finalGrade.letterGrade = 'A+';
    else if (this.finalGrade.numericGrade >= 4.0) this.finalGrade.letterGrade = 'A';
    else if (this.finalGrade.numericGrade >= 3.5) this.finalGrade.letterGrade = 'B+';
    else if (this.finalGrade.numericGrade >= 3.0) this.finalGrade.letterGrade = 'B';
    else if (this.finalGrade.numericGrade >= 2.5) this.finalGrade.letterGrade = 'C+';
    else if (this.finalGrade.numericGrade >= 2.0) this.finalGrade.letterGrade = 'C';
    else if (this.finalGrade.numericGrade >= 1.5) this.finalGrade.letterGrade = 'D+';
    else if (this.finalGrade.numericGrade >= 1.0) this.finalGrade.letterGrade = 'D';
    else this.finalGrade.letterGrade = 'F';
  }
  
  next();
});

// Static methods
gradesSchema.statics.findByStudentId = function(studentId: string) {
  return this.find({ studentId }).sort({ periodId: -1, courseName: 1 });
};

gradesSchema.statics.findByStudentAndPeriod = function(studentId: string, periodId: string) {
  return this.find({ studentId, periodId }).sort({ courseName: 1 });
};

gradesSchema.statics.findByPeriod = function(periodId: string) {
  return this.find({ periodId });
};

gradesSchema.statics.findApprovedCourses = function(studentId: string) {
  return this.find({ studentId, 'finalGrade.isApproved': true });
};

gradesSchema.statics.calculateGPA = async function(studentId: string, periodId?: string) {
  const query: any = { studentId, 'finalGrade.numericGrade': { $exists: true } };
  if (periodId) query.periodId = periodId;
  
  const grades = await this.find(query);
  
  if (grades.length === 0) return 0;
  
  let totalPoints = 0;
  let totalCredits = 0;
  
  grades.forEach((grade: any) => {
    totalPoints += grade.finalGrade.numericGrade * grade.credits;
    totalCredits += grade.credits;
  });
  
  return totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0;
};

// Instance methods
gradesSchema.methods.addEvaluation = function(evaluation: any) {
  this.evaluations.push(evaluation);
  return this.save();
};

gradesSchema.methods.updateEvaluationScore = function(evaluationId: string, score: number, feedback?: string) {
  const evaluation = this.evaluations.find((eval: any) => eval.evaluationId === evaluationId);
  if (evaluation) {
    evaluation.score = score;
    evaluation.isSubmitted = true;
    if (feedback) evaluation.feedback = feedback;
    return this.save();
  }
  throw new Error('Evaluation not found');
};

gradesSchema.methods.addAbsence = function(date: Date, reason?: string, isExcused: boolean = false) {
  this.attendance.absences.push({ date, reason, isExcused });
  this.attendance.totalClasses += 1;
  if (!isExcused) {
    // Don't count excused absences against attendance
    this.attendance.attendedClasses = this.attendance.totalClasses - 
      this.attendance.absences.filter((abs: any) => !abs.isExcused).length;
  }
  return this.save();
};

gradesSchema.methods.getSubmittedEvaluations = function() {
  return this.evaluations.filter((eval: any) => eval.isSubmitted);
};

gradesSchema.methods.getPendingEvaluations = function() {
  return this.evaluations.filter((eval: any) => !eval.isSubmitted);
};

gradesSchema.methods.getEvaluationsByType = function(type: string) {
  return this.evaluations.filter((eval: any) => eval.type === type);
};

// Virtual for unexcused absences count
gradesSchema.virtual('unexcusedAbsences').get(function() {
  return this.attendance.absences.filter((absence: any) => !absence.isExcused).length;
});

// Virtual for completion percentage
gradesSchema.virtual('completionPercentage').get(function() {
  if (this.evaluations.length === 0) return 0;
  const submittedCount = this.evaluations.filter((eval: any) => eval.isSubmitted).length;
  return Math.round((submittedCount / this.evaluations.length) * 100);
});

// Ensure virtual fields are serialized
gradesSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

// Create and export the model
export const Grades = mongoose.model<IGrades>('Grades', gradesSchema);