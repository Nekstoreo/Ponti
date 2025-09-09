import { Schedule, ISchedule } from '../models/Schedule';
import { FilterQuery, UpdateQuery } from 'mongoose';

export interface IScheduleRepository {
  findById(id: string): Promise<ISchedule | null>;
  findByStudentId(studentId: string): Promise<ISchedule[]>;
  findByStudentAndPeriod(studentId: string, periodId: string): Promise<ISchedule | null>;
  findByPeriod(periodId: string): Promise<ISchedule[]>;
  create(scheduleData: Partial<ISchedule>): Promise<ISchedule>;
  update(studentId: string, periodId: string, updateData: UpdateQuery<ISchedule>): Promise<ISchedule | null>;
  delete(studentId: string, periodId: string): Promise<boolean>;
  findCurrentSchedule(studentId: string): Promise<ISchedule | null>;
  findClassesByDay(studentId: string, day: string, periodId?: string): Promise<any[]>;
  findNextClass(studentId: string): Promise<any>;
  findByInstructor(instructor: string, periodId?: string): Promise<ISchedule[]>;
  findConflictingSchedules(studentId: string, newClass: any): Promise<boolean>;
  getScheduleStats(periodId: string): Promise<any>;
}

export class ScheduleRepository implements IScheduleRepository {
  async findById(id: string): Promise<ISchedule | null> {
    try {
      return await Schedule.findById(id).exec();
    } catch (error) {
      throw new Error(`Error finding schedule by ID: ${error}`);
    }
  }

  async findByStudentId(studentId: string): Promise<ISchedule[]> {
    try {
      return await Schedule.find({ studentId })
        .sort({ periodId: -1 })
        .exec();
    } catch (error) {
      throw new Error(`Error finding schedules by student ID: ${error}`);
    }
  }

  async findByStudentAndPeriod(studentId: string, periodId: string): Promise<ISchedule | null> {
    try {
      return await Schedule.findOne({ studentId, periodId }).exec();
    } catch (error) {
      throw new Error(`Error finding schedule by student and period: ${error}`);
    }
  }

  async findByPeriod(periodId: string): Promise<ISchedule[]> {
    try {
      return await Schedule.find({ periodId }).exec();
    } catch (error) {
      throw new Error(`Error finding schedules by period: ${error}`);
    }
  }

  async create(scheduleData: Partial<ISchedule>): Promise<ISchedule> {
    try {
      const schedule = new Schedule(scheduleData);
      return await schedule.save();
    } catch (error) {
      throw new Error(`Error creating schedule: ${error}`);
    }
  }

  async update(studentId: string, periodId: string, updateData: UpdateQuery<ISchedule>): Promise<ISchedule | null> {
    try {
      return await Schedule.findOneAndUpdate(
        { studentId, periodId },
        updateData,
        { new: true, runValidators: true }
      ).exec();
    } catch (error) {
      throw new Error(`Error updating schedule: ${error}`);
    }
  }

  async delete(studentId: string, periodId: string): Promise<boolean> {
    try {
      const result = await Schedule.deleteOne({ studentId, periodId }).exec();
      return result.deletedCount > 0;
    } catch (error) {
      throw new Error(`Error deleting schedule: ${error}`);
    }
  }

  async findCurrentSchedule(studentId: string): Promise<ISchedule | null> {
    try {
      // Get current period based on date
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const currentPeriod = currentMonth <= 6 ? `${currentYear}-1` : `${currentYear}-2`;

      return await Schedule.findOne({ 
        studentId, 
        periodId: currentPeriod 
      }).exec();
    } catch (error) {
      throw new Error(`Error finding current schedule: ${error}`);
    }
  }

  async findClassesByDay(studentId: string, day: string, periodId?: string): Promise<any[]> {
    try {
      let query: FilterQuery<ISchedule> = { studentId };
      
      if (periodId) {
        query.periodId = periodId;
      } else {
        // Use current period if not specified
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const currentPeriod = currentMonth <= 6 ? `${currentYear}-1` : `${currentYear}-2`;
        query.periodId = currentPeriod;
      }

      const schedule = await Schedule.findOne(query).exec();
      
      if (!schedule) return [];

      return schedule.classes.filter((cls: any) => 
        cls.schedule.days.includes(day.toLowerCase())
      );
    } catch (error) {
      throw new Error(`Error finding classes by day: ${error}`);
    }
  }

  async findNextClass(studentId: string): Promise<any> {
    try {
      const schedule = await this.findCurrentSchedule(studentId);
      
      if (!schedule) return null;

      return schedule.getNextClass();
    } catch (error) {
      throw new Error(`Error finding next class: ${error}`);
    }
  }

  async findByInstructor(instructor: string, periodId?: string): Promise<ISchedule[]> {
    try {
      let query: FilterQuery<ISchedule> = {
        'classes.instructor': { $regex: instructor, $options: 'i' }
      };

      if (periodId) {
        query.periodId = periodId;
      }

      return await Schedule.find(query).exec();
    } catch (error) {
      throw new Error(`Error finding schedules by instructor: ${error}`);
    }
  }

  async findConflictingSchedules(studentId: string, newClass: any): Promise<boolean> {
    try {
      const schedule = await this.findCurrentSchedule(studentId);
      
      if (!schedule) return false;

      return schedule.hasTimeConflict(newClass);
    } catch (error) {
      throw new Error(`Error checking for conflicting schedules: ${error}`);
    }
  }

  async getScheduleStats(periodId: string): Promise<any> {
    try {
      const stats = await Schedule.aggregate([
        { $match: { periodId } },
        {
          $group: {
            _id: null,
            totalStudents: { $sum: 1 },
            totalCredits: { $sum: '$summary.totalCredits' },
            totalCourses: { $sum: '$summary.totalCourses' },
            totalWeeklyHours: { $sum: '$summary.weeklyHours' },
            avgCreditsPerStudent: { $avg: '$summary.totalCredits' },
            avgCoursesPerStudent: { $avg: '$summary.totalCourses' },
            avgWeeklyHoursPerStudent: { $avg: '$summary.weeklyHours' }
          }
        }
      ]).exec();

      return stats[0] || {
        totalStudents: 0,
        totalCredits: 0,
        totalCourses: 0,
        totalWeeklyHours: 0,
        avgCreditsPerStudent: 0,
        avgCoursesPerStudent: 0,
        avgWeeklyHoursPerStudent: 0
      };
    } catch (error) {
      throw new Error(`Error getting schedule statistics: ${error}`);
    }
  }
}