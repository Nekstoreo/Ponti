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


export type PoiCategory =
  | "todo"
  | "academico"
  | "comida"
  | "servicios"
  | "bienestar"
  | "cultura";

export interface PoiItem {
  id: string;
  title: string;
  subtitle?: string;
  category: Exclude<PoiCategory, "todo">;
  // Posición relativa en el lienzo del mapa (0-100)
  x: number;
  y: number;
  // Datos opcionales
  isOpenNow?: boolean;
  hours?: string;
  description?: string;
  imageUrl?: string;
}


