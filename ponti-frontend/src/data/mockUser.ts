import { UserProfile, AcademicInfo } from "./types";

export const mockUser: UserProfile = {
  id: "u_1",
  fullName: "Ana Pérez",
  studentId: "000123456",
  email: "ana.perez@ponti.edu",
  phone: "+57 300 123-4567",
  avatar: "/images/avatars/ana.jpg",
  birthDate: "2000-05-15",
  gender: "F",
  address: "Calle 123 #45-67, Bogotá, Colombia",
  emergencyContact: {
    name: "Carlos Pérez",
    phone: "+57 301 987-6543",
    relationship: "Padre",
  },
};

export const mockAcademicInfo: AcademicInfo = {
  program: "Ingeniería de Sistemas",
  faculty: "Facultad de Ingeniería",
  semester: 7,
  admissionDate: "2021-01-15",
  gpa: 4.2,
  totalCredits: 160,
  completedCredits: 128,
  academicStatus: "active",
};

