export type DayKey = "L" | "M" | "X" | "J" | "V" | "S";

export interface UserProfile {
  id: string;
  fullName: string;
  studentId: string;
  email: string;
}

export interface ClassBlock {
  id: string;
  courseName: string;
  professor: string;
  room: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export type WeeklySchedule = Record<DayKey, ClassBlock[]>;

export interface AnnouncementItem {
  id: string;
  title: string;
  summary: string;
  createdAt: string; // ISO date
}


