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

// Helper function to convert numerical grade to GPA scale (0-4)
function convertToGradePoints(grade: number): number {
  if (grade >= 97) return 4.0;  // A+
  if (grade >= 93) return 4.0;  // A
  if (grade >= 90) return 3.7;  // A-
  if (grade >= 87) return 3.3;  // B+
  if (grade >= 83) return 3.0;  // B
  if (grade >= 80) return 2.7;  // B-
  if (grade >= 77) return 2.3;  // C+
  if (grade >= 73) return 2.0;  // C
  if (grade >= 70) return 1.7;  // C-
  if (grade >= 67) return 1.3;  // D+
  if (grade >= 65) return 1.0;  // D
  return 0.0; // F
}

// Helper function to convert numerical grade to letter grade
export function getLetterGrade(grade: number): string {
  if (grade >= 97) return "A+";
  if (grade >= 93) return "A";
  if (grade >= 90) return "A-";
  if (grade >= 87) return "B+";
  if (grade >= 83) return "B";
  if (grade >= 80) return "B-";
  if (grade >= 77) return "C+";
  if (grade >= 73) return "C";
  if (grade >= 70) return "C-";
  if (grade >= 67) return "D+";
  if (grade >= 65) return "D";
  return "F";
}

// Helper function to get color class for grade
export function getGradeColor(grade: number): string {
  if (grade >= 90) return "text-green-600";
  if (grade >= 80) return "text-blue-600";
  if (grade >= 70) return "text-yellow-600";
  if (grade >= 60) return "text-orange-600";
  return "text-red-600";
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
