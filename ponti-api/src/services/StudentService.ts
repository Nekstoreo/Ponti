import { IStudent } from '../models/Student';
import { StudentRepository, IStudentRepository } from '../repositories/StudentRepository';
import { CustomError, ErrorCodes } from '../types';

export interface AcademicSummary {
  level: string;
  semester: string;
  status: string;
  gpa: number;
  totalCredits: number;
  totalCreditsAttempted: number;
  totalSemesters: number;
  program: string;
  campus: string;
  admissionPeriod: string;
  currentPeriod: string;
}

export interface StudentProfile {
  studentId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  birthDate: Date;
  age: number;
  gender: string;
  academic: AcademicSummary;
  preferences: IStudent['preferences'];
  createdAt: Date;
  updatedAt: Date;
}

export interface PreferencesUpdate {
  notifications?: {
    classReminders?: boolean;
    announcements?: boolean;
    grades?: boolean;
  };
  theme?: 'light' | 'dark' | 'system';
  language?: 'es' | 'en';
}

export interface IStudentService {
  getProfile(studentId: string): Promise<StudentProfile>;
  updatePreferences(studentId: string, preferences: PreferencesUpdate): Promise<IStudent>;
  getAcademicSummary(studentId: string): Promise<AcademicSummary>;
  validateStudentExists(studentId: string): Promise<void>;
  getStudentsByProgram(programId: string): Promise<IStudent[]>;
  getStudentsByCampus(campusId: string): Promise<IStudent[]>;
  getActiveStudents(): Promise<IStudent[]>;
}

export class StudentService implements IStudentService {
  private studentRepository: IStudentRepository;

  constructor(studentRepository?: IStudentRepository) {
    this.studentRepository = studentRepository || new StudentRepository();
  }

  async getProfile(studentId: string): Promise<StudentProfile> {
    try {
      const student = await this.studentRepository.findByStudentId(studentId);
      
      if (!student) {
        const error: CustomError = new Error('Student not found') as CustomError;
        error.statusCode = 404;
        error.code = ErrorCodes.NOT_FOUND;
        throw error;
      }

      // Calculate age
      const today = new Date();
      const birthDate = student.birthDate;
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      const profile: StudentProfile = {
        studentId: student.studentId,
        email: student.email,
        firstName: student.firstName,
        lastName: student.lastName,
        fullName: student.getFullName(),
        birthDate: student.birthDate,
        age,
        gender: student.gender,
        academic: {
          level: student.academic.level,
          semester: student.academic.semester,
          status: student.academic.status,
          gpa: student.academic.metrics.currentGPA,
          totalCredits: student.academic.metrics.totalCreditsApproved,
          totalCreditsAttempted: student.academic.metrics.totalCreditsAttempted,
          totalSemesters: student.academic.metrics.totalSemesters,
          program: student.academic.programId,
          campus: student.academic.campusId,
          admissionPeriod: student.academic.admissionPeriod,
          currentPeriod: student.academic.currentPeriod
        },
        preferences: student.preferences,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt
      };

      return profile;
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }

      const serviceError: CustomError = new Error('Failed to get student profile') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async updatePreferences(studentId: string, preferences: PreferencesUpdate): Promise<IStudent> {
    try {
      // Validate student exists
      await this.validateStudentExists(studentId);

      // Build the update object with proper nesting
      const updateData: any = {};
      
      if (preferences.notifications) {
        if (preferences.notifications.classReminders !== undefined) {
          updateData['preferences.notifications.classReminders'] = preferences.notifications.classReminders;
        }
        if (preferences.notifications.announcements !== undefined) {
          updateData['preferences.notifications.announcements'] = preferences.notifications.announcements;
        }
        if (preferences.notifications.grades !== undefined) {
          updateData['preferences.notifications.grades'] = preferences.notifications.grades;
        }
      }

      if (preferences.theme !== undefined) {
        updateData['preferences.theme'] = preferences.theme;
      }

      if (preferences.language !== undefined) {
        updateData['preferences.language'] = preferences.language;
      }

      const updatedStudent = await this.studentRepository.update(studentId, { $set: updateData });
      
      if (!updatedStudent) {
        const error: CustomError = new Error('Failed to update preferences') as CustomError;
        error.statusCode = 500;
        error.code = ErrorCodes.INTERNAL_SERVER_ERROR;
        throw error;
      }

      return updatedStudent;
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }

      const serviceError: CustomError = new Error('Failed to update student preferences') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async getAcademicSummary(studentId: string): Promise<AcademicSummary> {
    try {
      const student = await this.studentRepository.findByStudentId(studentId);
      
      if (!student) {
        const error: CustomError = new Error('Student not found') as CustomError;
        error.statusCode = 404;
        error.code = ErrorCodes.NOT_FOUND;
        throw error;
      }

      const summary: AcademicSummary = {
        level: student.academic.level,
        semester: student.academic.semester,
        status: student.academic.status,
        gpa: student.academic.metrics.currentGPA,
        totalCredits: student.academic.metrics.totalCreditsApproved,
        totalCreditsAttempted: student.academic.metrics.totalCreditsAttempted,
        totalSemesters: student.academic.metrics.totalSemesters,
        program: student.academic.programId,
        campus: student.academic.campusId,
        admissionPeriod: student.academic.admissionPeriod,
        currentPeriod: student.academic.currentPeriod
      };

      return summary;
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }

      const serviceError: CustomError = new Error('Failed to get academic summary') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async validateStudentExists(studentId: string): Promise<void> {
    try {
      const exists = await this.studentRepository.exists(studentId);
      
      if (!exists) {
        const error: CustomError = new Error('Student not found') as CustomError;
        error.statusCode = 404;
        error.code = ErrorCodes.NOT_FOUND;
        throw error;
      }
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }

      const serviceError: CustomError = new Error('Failed to validate student existence') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async getStudentsByProgram(programId: string): Promise<IStudent[]> {
    try {
      return await this.studentRepository.findByProgram(programId);
    } catch (error) {
      const serviceError: CustomError = new Error('Failed to get students by program') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async getStudentsByCampus(campusId: string): Promise<IStudent[]> {
    try {
      return await this.studentRepository.findByCampus(campusId);
    } catch (error) {
      const serviceError: CustomError = new Error('Failed to get students by campus') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async getActiveStudents(): Promise<IStudent[]> {
    try {
      return await this.studentRepository.findActiveStudents();
    } catch (error) {
      const serviceError: CustomError = new Error('Failed to get active students') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }
}

// Export singleton instance
export const studentService = new StudentService();