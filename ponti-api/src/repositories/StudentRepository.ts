import { Student, IStudent } from '../models/Student';
import { FilterQuery, UpdateQuery } from 'mongoose';

export interface IStudentRepository {
  findById(id: string): Promise<IStudent | null>;
  findByStudentId(studentId: string): Promise<IStudent | null>;
  findByEmail(email: string): Promise<IStudent | null>;
  create(studentData: Partial<IStudent>): Promise<IStudent>;
  update(studentId: string, updateData: UpdateQuery<IStudent>): Promise<IStudent | null>;
  delete(studentId: string): Promise<boolean>;
  findActiveStudents(): Promise<IStudent[]>;
  findByProgram(programId: string): Promise<IStudent[]>;
  findByCampus(campusId: string): Promise<IStudent[]>;
  updatePreferences(studentId: string, preferences: Partial<IStudent['preferences']>): Promise<IStudent | null>;
  exists(studentId: string): Promise<boolean>;
}

export class StudentRepository implements IStudentRepository {
  async findById(id: string): Promise<IStudent | null> {
    try {
      return await Student.findById(id).exec();
    } catch (error) {
      throw new Error(`Error finding student by ID: ${error}`);
    }
  }

  async findByStudentId(studentId: string): Promise<IStudent | null> {
    try {
      return await Student.findOne({ studentId }).exec();
    } catch (error) {
      throw new Error(`Error finding student by student ID: ${error}`);
    }
  }

  async findByEmail(email: string): Promise<IStudent | null> {
    try {
      return await Student.findOne({ email: email.toLowerCase() }).exec();
    } catch (error) {
      throw new Error(`Error finding student by email: ${error}`);
    }
  }

  async create(studentData: Partial<IStudent>): Promise<IStudent> {
    try {
      const student = new Student(studentData);
      return await student.save();
    } catch (error) {
      throw new Error(`Error creating student: ${error}`);
    }
  }

  async update(studentId: string, updateData: UpdateQuery<IStudent>): Promise<IStudent | null> {
    try {
      return await Student.findOneAndUpdate(
        { studentId },
        updateData,
        { new: true, runValidators: true }
      ).exec();
    } catch (error) {
      throw new Error(`Error updating student: ${error}`);
    }
  }

  async delete(studentId: string): Promise<boolean> {
    try {
      const result = await Student.deleteOne({ studentId }).exec();
      return result.deletedCount > 0;
    } catch (error) {
      throw new Error(`Error deleting student: ${error}`);
    }
  }

  async findActiveStudents(): Promise<IStudent[]> {
    try {
      return await Student.find({ 'academic.status': 'active' }).exec();
    } catch (error) {
      throw new Error(`Error finding active students: ${error}`);
    }
  }

  async findByProgram(programId: string): Promise<IStudent[]> {
    try {
      return await Student.find({ 'academic.programId': programId }).exec();
    } catch (error) {
      throw new Error(`Error finding students by program: ${error}`);
    }
  }

  async findByCampus(campusId: string): Promise<IStudent[]> {
    try {
      return await Student.find({ 'academic.campusId': campusId }).exec();
    } catch (error) {
      throw new Error(`Error finding students by campus: ${error}`);
    }
  }

  async updatePreferences(studentId: string, preferences: Partial<IStudent['preferences']>): Promise<IStudent | null> {
    try {
      return await Student.findOneAndUpdate(
        { studentId },
        { $set: { preferences } },
        { new: true, runValidators: true }
      ).exec();
    } catch (error) {
      throw new Error(`Error updating student preferences: ${error}`);
    }
  }

  async exists(studentId: string): Promise<boolean> {
    try {
      const count = await Student.countDocuments({ studentId }).exec();
      return count > 0;
    } catch (error) {
      throw new Error(`Error checking if student exists: ${error}`);
    }
  }
}