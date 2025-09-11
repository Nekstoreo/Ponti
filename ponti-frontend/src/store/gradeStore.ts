import { create } from "zustand";
import { CourseGrade, GradeSummary, GradeSettings, AssessmentItem } from "@/data/types";
import { mockCourseGrades, mockGradeSummary, mockGradeSettings } from "@/data/mockGrades";

interface GradeState {
  // Data
  courseGrades: CourseGrade[];
  gradeSummary: GradeSummary;
  settings: GradeSettings;
  
  // UI State
  selectedSemester: string;
  selectedCourse: CourseGrade | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCourseGrades: (grades: CourseGrade[]) => void;
  setGradeSummary: (summary: GradeSummary) => void;
  setSettings: (settings: Partial<GradeSettings>) => void;
  setSelectedSemester: (semester: string) => void;
  setSelectedCourse: (course: CourseGrade | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed getters
  getGradesBySemester: (semester: string) => CourseGrade[];
  getCourseById: (courseId: string) => CourseGrade | undefined;
  calculateSemesterGPA: (semester: string) => number;
  getRecentAssessments: (limit?: number) => { assessment: AssessmentItem; course: CourseGrade }[];
  getUpcomingAssessments: (limit?: number) => { assessment: AssessmentItem; course: CourseGrade }[];
  
  // Utils
  refreshGrades: () => Promise<void>;
  initializeData: () => void;
}

export const useGradeStore = create<GradeState>((set, get) => ({
  // Initial state
  courseGrades: [],
  gradeSummary: {
    semesterGPA: null,
    cumulativeGPA: null,
    totalCredits: 0,
    completedCredits: 0,
    inProgressCredits: 0,
    approvedCourses: 0,
    failedCourses: 0,
    pendingCourses: 0,
  },
  settings: {
    showDetailedGrades: true,
    gradeNotifications: true,
    averageCalculationMethod: 'weighted',
    showProjections: true,
  },
  selectedSemester: "2024-1",
  selectedCourse: null,
  isLoading: false,
  error: null,

  // Basic setters
  setCourseGrades: (grades) => set({ courseGrades: grades }),
  setGradeSummary: (summary) => set({ gradeSummary: summary }),
  setSettings: (newSettings) => set((state) => ({ 
    settings: { ...state.settings, ...newSettings } 
  })),
  setSelectedSemester: (semester) => set({ selectedSemester: semester }),
  setSelectedCourse: (course) => set({ selectedCourse: course }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // Computed getters
  getGradesBySemester: (semester) => {
    const { courseGrades } = get();
    return courseGrades.filter(grade => grade.semester === semester);
  },

  getCourseById: (courseId) => {
    const { courseGrades } = get();
    return courseGrades.find(grade => grade.courseId === courseId);
  },

  calculateSemesterGPA: (semester) => {
    const { courseGrades, settings } = get();
    const semesterGrades = courseGrades.filter(
      grade => grade.semester === semester && grade.finalGrade !== null
    );

    if (semesterGrades.length === 0) return 0;

    let totalGradePoints = 0;
    let totalCredits = 0;

    semesterGrades.forEach(grade => {
      if (grade.finalGrade !== null) {
        const gradePoints = convertToGradePoints(grade.finalGrade);
        if (settings.averageCalculationMethod === 'weighted') {
          totalGradePoints += gradePoints * grade.credits;
          totalCredits += grade.credits;
        } else {
          totalGradePoints += gradePoints;
          totalCredits += 1;
        }
      }
    });

    return totalCredits > 0 ? totalGradePoints / totalCredits : 0;
  },

  getRecentAssessments: (limit = 10) => {
    const { courseGrades } = get();
    const recentAssessments: { assessment: AssessmentItem; course: CourseGrade }[] = [];

    courseGrades.forEach(course => {
      course.assessments
        .filter(assessment => assessment.isPublished && assessment.earnedScore !== null)
        .forEach(assessment => {
          recentAssessments.push({ assessment, course });
        });
    });

    return recentAssessments
      .sort((a, b) => new Date(b.assessment.date).getTime() - new Date(a.assessment.date).getTime())
      .slice(0, limit);
  },

  getUpcomingAssessments: (limit = 10) => {
    const { courseGrades } = get();
    const now = new Date();
    const upcomingAssessments: { assessment: AssessmentItem; course: CourseGrade }[] = [];

    courseGrades.forEach(course => {
      course.assessments
        .filter(assessment => 
          !assessment.isPublished && 
          new Date(assessment.date) > now
        )
        .forEach(assessment => {
          upcomingAssessments.push({ assessment, course });
        });
    });

    return upcomingAssessments
      .sort((a, b) => new Date(a.assessment.date).getTime() - new Date(b.assessment.date).getTime())
      .slice(0, limit);
  },

  // Data loading
  refreshGrades: async () => {
    const { setLoading, setError, setCourseGrades, setGradeSummary } = get();
    
    setLoading(true);
    setError(null);
    
    try {
      // En una implementación real, esto sería un llamado a la API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular latencia
      
      setCourseGrades(mockCourseGrades);
      setGradeSummary(mockGradeSummary);
    } catch (error) {
      setError('Error al cargar las calificaciones. Inténtalo de nuevo.');
      console.error('Error loading grades:', error);
    } finally {
      setLoading(false);
    }
  },

  initializeData: () => {
    const { setCourseGrades, setGradeSummary, setSettings } = get();
    setCourseGrades(mockCourseGrades);
    setGradeSummary(mockGradeSummary);
    setSettings(mockGradeSettings);
  },
}));

// Helper: convertir 0-5 a escala GPA 0-4 (simple proporcional)
function convertToGradePoints(grade: number): number {
  if (grade < 0) return 0;
  if (grade > 5) grade = 5;
  return parseFloat(((grade / 5) * 4).toFixed(2));
}

// Helper: letra (opcional) para escala 0-5 (estilo aproximado)
export function getLetterGrade(grade: number): string {
  if (grade >= 4.7) return "A+";
  if (grade >= 4.5) return "A";
  if (grade >= 4.3) return "A-";
  if (grade >= 4.0) return "B+";
  if (grade >= 3.7) return "B";
  if (grade >= 3.5) return "B-";
  if (grade >= 3.3) return "C+";
  if (grade >= 3.0) return "C";
  if (grade >= 2.7) return "C-";
  if (grade >= 2.5) return "D"; // Aprobación mínima en muchas universidades colombianas suele ser 3.0, pero mantenemos referencia
  return "F";
}

// Colores para escala 0-5
export function getGradeColor(grade: number): string {
  if (grade >= 4) return "text-green-600";
  if (grade >= 3) return "text-blue-600";
  if (grade >= 2.5) return "text-yellow-600";
  return "text-gray-600";
}

// Helper function to get status color
export function getStatusColor(status: string): string {
  switch (status) {
    case 'approved': return "text-green-600 bg-green-50";
    case 'pending': return "text-blue-600 bg-blue-50";
    case 'failed': return "text-red-600 bg-red-50";
    case 'withdrawn': return "text-gray-600 bg-gray-50";
    default: return "text-gray-600 bg-gray-50";
  }
}
