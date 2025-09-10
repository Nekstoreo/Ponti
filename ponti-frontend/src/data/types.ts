export type DayKey = "L" | "M" | "X" | "J" | "V" | "S";

export interface UserProfile {
  id: string;
  fullName: string;
  studentId: string;
  email: string;
  phone?: string;
  avatar?: string;
  birthDate?: string;
  gender?: 'M' | 'F' | 'O';
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface AcademicInfo {
  program: string;
  faculty: string;
  semester: number;
  admissionDate: string;
  graduationDate?: string;
  gpa: number;
  totalCredits: number;
  completedCredits: number;
  academicStatus: 'active' | 'inactive' | 'graduated' | 'suspended';
}

export interface UserPreferences {
  language: 'es' | 'en';
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  privacy: {
    showProfile: boolean;
    showGrades: boolean;
    showSchedule: boolean;
  };
}

export type NotificationType = "class_reminder" | "announcement" | "schedule_change" | "service_update" | "general";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string; // ISO date
  isRead: boolean;
  isImportant?: boolean;
  // Datos adicionales según el tipo
  classData?: {
    courseName: string;
    room: string;
    startTime: string;
  };
  announcementData?: {
    announcementId: string;
    category: string;
  };
  actionUrl?: string; // Para deep linking
  expiresAt?: string; // Fecha de expiración
}

export interface NotificationSettings {
  classReminders: {
    enabled: boolean;
    minutesBefore: number; // minutos antes de la clase
  };
  announcements: {
    enabled: boolean;
    importantOnly: boolean;
  };
  scheduleChanges: {
    enabled: boolean;
  };
  serviceUpdates: {
    enabled: boolean;
  };
  general: {
    enabled: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm
    end: string; // HH:mm
  };
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

export type AnnouncementCategory = "academico" | "administrativo" | "eventos" | "general";

export interface AnnouncementItem {
  id: string;
  title: string;
  summary: string;
  content?: string; // Contenido completo para la vista de detalle
  category: AnnouncementCategory;
  createdAt: string; // ISO date
  isRead?: boolean;
  isImportant?: boolean;
  author?: string;
  tags?: string[];
}

// Tipos para el sistema de calificaciones
export type GradeStatus = 'approved' | 'failed' | 'pending' | 'withdrawn';
export type AssessmentType = 'exam' | 'quiz' | 'assignment' | 'project' | 'participation' | 'final';

export interface AssessmentItem {
  id: string;
  name: string;
  type: AssessmentType;
  date: string; // ISO date
  maxScore: number;
  earnedScore: number | null;
  weight: number; // Porcentaje del total (0-100)
  feedback?: string;
  isPublished: boolean;
}

export interface CourseGrade {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  professor: string;
  semester: string; // e.g., "2024-1"
  credits: number;
  assessments: AssessmentItem[];
  currentAverage: number | null; // Promedio actual (0-100)
  finalGrade: number | null; // Calificación final (0-100)
  letterGrade?: string; // A, B, C, D, F
  status: GradeStatus;
  lastUpdated: string; // ISO date
}

export interface GradeSummary {
  semesterGPA: number | null; // GPA del semestre actual
  cumulativeGPA: number | null; // GPA acumulado
  totalCredits: number;
  completedCredits: number;
  inProgressCredits: number;
  approvedCourses: number;
  failedCourses: number;
  pendingCourses: number;
}

export interface GradeSettings {
  showDetailedGrades: boolean;
  gradeNotifications: boolean;
  averageCalculationMethod: 'weighted' | 'simple';
  showProjections: boolean;
}

// Tipos para el sistema de bienestar
export type MoodLevel = 1 | 2 | 3 | 4 | 5; // 1 = muy mal, 5 = excelente
export type StressLevel = 'low' | 'medium' | 'high';
export type WellnessCategory = 'mental' | 'physical' | 'academic' | 'social' | 'financial';

export interface MoodEntry {
  id: string;
  date: string; // ISO date
  mood: MoodLevel;
  stressLevel: StressLevel;
  sleepHours?: number;
  notes?: string;
  activities?: string[]; // ejercicio, estudio, socializar, etc.
  energy?: MoodLevel;
  focus?: MoodLevel;
}

export interface WellnessRecommendation {
  id: string;
  category: WellnessCategory;
  title: string;
  description: string;
  actionText: string;
  priority: 'low' | 'medium' | 'high';
  icon: string;
  estimatedTime?: string; // "5 min", "1 hora", etc.
  isCompleted?: boolean;
  tags?: string[];
}

export interface WellnessInsight {
  id: string;
  type: 'trend' | 'achievement' | 'suggestion' | 'alert';
  title: string;
  description: string;
  value?: string; // "75%", "+2 puntos", etc.
  trend?: 'up' | 'down' | 'stable';
  period: string; // "Esta semana", "Último mes", etc.
  icon: string;
}

export interface WellnessMetrics {
  averageMood: number;
  averageStress: StressLevel;
  averageSleep: number;
  averageEnergy: number;
  averageFocus: number;
  streakDays: number;
  completedRecommendations: number;
  weeklyTrend: 'improving' | 'declining' | 'stable';
}

// Tipos para el sistema de búsqueda global
export type SearchCategory = 
  | 'horarios' 
  | 'calificaciones' 
  | 'mapa' 
  | 'anuncios' 
  | 'bienestar' 
  | 'configuracion'
  | 'todo';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: SearchCategory;
  subcategory?: string;
  route: string;
  icon?: string;
  relevanceScore: number;
  metadata?: {
    date?: string;
    time?: string;
    location?: string;
    status?: string;
    tags?: string[];
    [key: string]: unknown;
  };
}

export interface SearchFilters {
  categories: SearchCategory[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy: 'relevance' | 'date' | 'alphabetical';
  maxResults: number;
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  filters: SearchFilters;
  isSearching: boolean;
  recentSearches: string[];
  searchHistory: SearchResult[];
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
  // Nuevos campos para modal enriquecido
  image?: string; // Hero image for cultural POIs
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  // Información adicional por categoría
  buildingInfo?: {
    levels: number;
    facilities: string[];
  };
}

export type ServiceCategory = "academico" | "administrativo" | "bienestar" | "tecnologia" | "biblioteca" | "deportes";

export interface UniversityService {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  location: string;
  building?: string;
  floor?: string;
  phone?: string;
  email?: string;
  website?: string;
  hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday?: string;
    sunday?: string;
  };
  isOpenNow?: boolean;
  imageUrl?: string;
  tags: string[];
  // Integración con mapa
  mapLocation?: {
    x: number;
    y: number;
  };
}


