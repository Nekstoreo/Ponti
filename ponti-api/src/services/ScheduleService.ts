import { ISchedule } from '../models/Schedule';
import { ScheduleRepository, IScheduleRepository } from '../repositories/ScheduleRepository';
import { CustomError, ErrorCodes } from '../types';

export interface NextClassInfo {
  class: any;
  timeSlot: any;
  isToday: boolean;
  day?: string;
  minutesUntilStart?: number;
  status: 'current' | 'upcoming' | 'none';
}

export interface ClassInfo {
  courseNrc: string;
  courseCode: string;
  courseName: string;
  instructor: string;
  credits: number;
  timeSlots: Array<{
    startTime: string;
    endTime: string;
    location: {
      buildingId: string;
      room: string;
      fullLocation: string;
    };
  }>;
  type: string;
}

export interface ScheduleSummary {
  totalCredits: number;
  totalCourses: number;
  weeklyHours: number;
  averageClassesPerDay: number;
  busiestDay: string;
  lightestDay: string;
  timeDistribution: {
    morning: number; // 6:00-12:00
    afternoon: number; // 12:00-18:00
    evening: number; // 18:00-22:00
  };
}

export interface WeeklySchedule {
  monday: ClassInfo[];
  tuesday: ClassInfo[];
  wednesday: ClassInfo[];
  thursday: ClassInfo[];
  friday: ClassInfo[];
  saturday: ClassInfo[];
  sunday: ClassInfo[];
}

export interface IScheduleService {
  getStudentSchedule(studentId: string, periodId?: string): Promise<ISchedule>;
  getCurrentSchedule(studentId: string): Promise<ISchedule>;
  getNextClass(studentId: string): Promise<NextClassInfo>;
  getClassesByDay(studentId: string, day: string, periodId?: string): Promise<ClassInfo[]>;
  getWeeklySchedule(studentId: string, periodId?: string): Promise<WeeklySchedule>;
  getScheduleSummary(studentId: string, periodId?: string): Promise<ScheduleSummary>;
  checkTimeConflicts(studentId: string, newClass: any): Promise<boolean>;
  getClassesByInstructor(studentId: string, instructor: string, periodId?: string): Promise<ClassInfo[]>;
  calculateScheduleMetrics(schedule: ISchedule): ScheduleSummary;
}

export class ScheduleService implements IScheduleService {
  private scheduleRepository: IScheduleRepository;

  constructor(scheduleRepository?: IScheduleRepository) {
    this.scheduleRepository = scheduleRepository || new ScheduleRepository();
  }

  async getStudentSchedule(studentId: string, periodId?: string): Promise<ISchedule> {
    try {
      let schedule: ISchedule | null;

      if (periodId) {
        schedule = await this.scheduleRepository.findByStudentAndPeriod(studentId, periodId);
      } else {
        schedule = await this.scheduleRepository.findCurrentSchedule(studentId);
      }

      if (!schedule) {
        const error: CustomError = new Error('Schedule not found') as CustomError;
        error.statusCode = 404;
        error.code = ErrorCodes.NOT_FOUND;
        error.details = { studentId, periodId };
        throw error;
      }

      return schedule;
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }

      const serviceError: CustomError = new Error('Failed to get student schedule') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async getCurrentSchedule(studentId: string): Promise<ISchedule> {
    try {
      const schedule = await this.scheduleRepository.findCurrentSchedule(studentId);

      if (!schedule) {
        const error: CustomError = new Error('Current schedule not found') as CustomError;
        error.statusCode = 404;
        error.code = ErrorCodes.NOT_FOUND;
        error.details = { studentId };
        throw error;
      }

      return schedule;
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }

      const serviceError: CustomError = new Error('Failed to get current schedule') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async getNextClass(studentId: string): Promise<NextClassInfo> {
    try {
      const schedule = await this.getCurrentSchedule(studentId);
      const nextClassData = schedule.getNextClass();

      if (!nextClassData) {
        return {
          class: null,
          timeSlot: null,
          isToday: false,
          status: 'none'
        };
      }

      // Calculate minutes until start
      let minutesUntilStart = 0;
      if (nextClassData.isToday) {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const [startHour, startMinute] = nextClassData.timeSlot.startTime.split(':').map(Number);
        const startTime = startHour * 60 + startMinute;
        minutesUntilStart = startTime - currentTime;
      }

      // Determine status
      let status: 'current' | 'upcoming' | 'none' = 'upcoming';
      if (nextClassData.isToday && minutesUntilStart <= 0) {
        // Check if class is currently happening
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const [endHour, endMinute] = nextClassData.timeSlot.endTime.split(':').map(Number);
        const endTime = endHour * 60 + endMinute;
        
        if (currentTime < endTime) {
          status = 'current';
        }
      }

      return {
        class: nextClassData.class,
        timeSlot: nextClassData.timeSlot,
        isToday: nextClassData.isToday,
        day: nextClassData.day,
        minutesUntilStart: Math.max(0, minutesUntilStart),
        status
      };
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }

      const serviceError: CustomError = new Error('Failed to get next class') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async getClassesByDay(studentId: string, day: string, periodId?: string): Promise<ClassInfo[]> {
    try {
      const classes = await this.scheduleRepository.findClassesByDay(studentId, day, periodId);
      
      return classes.map(cls => ({
        courseNrc: cls.courseNrc,
        courseCode: cls.courseCode,
        courseName: cls.courseName,
        instructor: cls.instructor,
        credits: cls.credits,
        timeSlots: cls.schedule.timeSlots,
        type: cls.type
      }));
    } catch (error) {
      const serviceError: CustomError = new Error('Failed to get classes by day') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async getWeeklySchedule(studentId: string, periodId?: string): Promise<WeeklySchedule> {
    try {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const weeklySchedule: WeeklySchedule = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      };

      for (const day of days) {
        weeklySchedule[day as keyof WeeklySchedule] = await this.getClassesByDay(studentId, day, periodId);
      }

      return weeklySchedule;
    } catch (error) {
      const serviceError: CustomError = new Error('Failed to get weekly schedule') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async getScheduleSummary(studentId: string, periodId?: string): Promise<ScheduleSummary> {
    try {
      const schedule = await this.getStudentSchedule(studentId, periodId);
      return this.calculateScheduleMetrics(schedule);
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }

      const serviceError: CustomError = new Error('Failed to get schedule summary') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async checkTimeConflicts(studentId: string, newClass: any): Promise<boolean> {
    try {
      return await this.scheduleRepository.findConflictingSchedules(studentId, newClass);
    } catch (error) {
      const serviceError: CustomError = new Error('Failed to check time conflicts') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async getClassesByInstructor(studentId: string, instructor: string, periodId?: string): Promise<ClassInfo[]> {
    try {
      const schedule = await this.getStudentSchedule(studentId, periodId);
      const classes = schedule.classes.filter(cls => 
        cls.instructor.toLowerCase().includes(instructor.toLowerCase())
      );

      return classes.map(cls => ({
        courseNrc: cls.courseNrc,
        courseCode: cls.courseCode,
        courseName: cls.courseName,
        instructor: cls.instructor,
        credits: cls.credits,
        timeSlots: cls.schedule.timeSlots,
        type: cls.type
      }));
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }

      const serviceError: CustomError = new Error('Failed to get classes by instructor') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  calculateScheduleMetrics(schedule: ISchedule): ScheduleSummary {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayClassCounts: { [key: string]: number } = {};
    const timeDistribution = {
      morning: 0,   // 6:00-12:00
      afternoon: 0, // 12:00-18:00
      evening: 0    // 18:00-22:00
    };

    // Initialize day counts
    days.forEach(day => {
      dayClassCounts[day] = 0;
    });

    // Count classes per day and time distribution
    schedule.classes.forEach(cls => {
      cls.schedule.days.forEach(day => {
        dayClassCounts[day]++;
      });

      // Analyze time slots for time distribution
      cls.schedule.timeSlots.forEach(timeSlot => {
        const startHour = parseInt(timeSlot.startTime.split(':')[0]);
        
        if (startHour >= 6 && startHour < 12) {
          timeDistribution.morning++;
        } else if (startHour >= 12 && startHour < 18) {
          timeDistribution.afternoon++;
        } else if (startHour >= 18 && startHour < 22) {
          timeDistribution.evening++;
        }
      });
    });

    // Find busiest and lightest days
    let busiestDay = 'monday';
    let lightestDay = 'monday';
    let maxClasses = dayClassCounts.monday;
    let minClasses = dayClassCounts.monday;

    days.forEach(day => {
      if (dayClassCounts[day] > maxClasses) {
        maxClasses = dayClassCounts[day];
        busiestDay = day;
      }
      if (dayClassCounts[day] < minClasses) {
        minClasses = dayClassCounts[day];
        lightestDay = day;
      }
    });

    // Calculate average classes per day
    const totalClassDays = Object.values(dayClassCounts).reduce((sum, count) => sum + (count > 0 ? 1 : 0), 0);
    const averageClassesPerDay = totalClassDays > 0 ? schedule.summary.totalCourses / totalClassDays : 0;

    return {
      totalCredits: schedule.summary.totalCredits,
      totalCourses: schedule.summary.totalCourses,
      weeklyHours: schedule.summary.weeklyHours,
      averageClassesPerDay: Math.round(averageClassesPerDay * 100) / 100,
      busiestDay,
      lightestDay,
      timeDistribution
    };
  }
}

// Export singleton instance
export const scheduleService = new ScheduleService();