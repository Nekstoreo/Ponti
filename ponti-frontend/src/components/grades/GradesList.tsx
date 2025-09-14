"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGradeStore, getStatusColor } from "@/store/gradeStore";
import { CourseGrade } from "@/data/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BookOpen,
  Calendar,
  User,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronRight
} from "lucide-react";
import LoadingSkeleton from "@/components/animations/LoadingSkeleton";
// import { StaggeredAnimation } from "@/components/animations/PageTransition";

interface GradesListProps {
  compact?: boolean;
  showSummary?: boolean;
}

export default function GradesList({ compact = false, showSummary = true }: GradesListProps) {
  const router = useRouter();
  const {
    courseGrades,
    gradeSummary,
    selectedSemester,
    isLoading,
    error,
    setSelectedSemester,
    getGradesBySemester,
    refreshGrades,
    initializeData,
  } = useGradeStore();


  useEffect(() => {
    if (courseGrades.length === 0) {
      initializeData();
    }
  }, [courseGrades.length, initializeData]);

  const currentSemesterGrades = getGradesBySemester(selectedSemester);
  const currentGrades = currentSemesterGrades.filter(grade => grade.status === 'pending');
  const completedGrades = courseGrades.filter(grade =>
    grade.status === 'approved' || grade.status === 'failed'
  );

  // Combined and sorted list of all courses
  const allGrades = [...currentGrades, ...completedGrades].sort((a, b) => {
    // First sort by status (pending first, then approved, then failed)
    const statusOrder = { 'pending': 0, 'approved': 1, 'failed': 2, 'withdrawn': 3 };
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;

    // Then sort by course name alphabetically
    return a.courseName.localeCompare(b.courseName);
  });

  const availableSemesters = Array.from(
    new Set(courseGrades.map(grade => grade.semester))
  ).sort().reverse();

  const handleCourseClick = (course: CourseGrade) => {
    router.push(`/calificaciones/${course.courseId}`);
  };

  const handleRefresh = async () => {
    await refreshGrades();
  };

  if (isLoading && courseGrades.length === 0) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-8 w-64" />
        <LoadingSkeleton variant="list" count={4} />
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'withdrawn': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprobada';
      case 'pending': return 'En Curso';
      case 'failed': return 'Reprobada';
      case 'withdrawn': return 'Retirada';
      default: return 'En Curso';
    }
  };

  // En los mock data, las notas ya están en escala de 0-5, no necesitamos convertir
  const toFive = (grade: number) => {
    // Si la nota está en escala de 0-100, convertirla a 0-5
    if (grade > 5) {
      return (grade / 100) * 5;
    }
    // Si ya está en escala de 0-5, devolverla tal cual
    return grade;
  };

  const gradeColor5 = (g: number) => {
    if (g >= 4) return 'text-green-600';
    if (g >= 3) return 'text-blue-600';
    if (g >= 2.5) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const CourseCard = ({ course }: { course: CourseGrade }) => (
    <Card
      className="cursor-pointer mb-4"
      onClick={() => handleCourseClick(course)}
    >
      <CardContent className="px-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">
                {course.courseCode}
              </span>
              <Badge
                variant="secondary"
                className={`text-xs ${getStatusColor(course.status)}`}
              >
                {getStatusIcon(course.status)}
                <span className="ml-1">{getStatusLabel(course.status)}</span>
              </Badge>
            </div>

            <h3 className="font-semibold text-sm leading-tight mb-1.5">
              {course.courseName}
            </h3>

            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1.5">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{course.professor}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{course.credits} créditos</span>
              </div>
            </div>

          </div>

          <div className="flex flex-col items-end gap-1 ml-3">
            {course.currentAverage !== null && (
              <div className="text-right">
                {course.status === 'pending' ? (
                  <>
                    <div className="flex items-center">
                      <div className={`text-sm font-medium ${gradeColor5(toFive(course.currentAverage))}`}>
                        {toFive(course.currentAverage).toFixed(2)}/5.0
                      </div>
                      <span className="ml-1 text-xs text-muted-foreground">*</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground flex items-center">
                      {course.assessments.filter(a => a.earnedScore !== null).length}/{course.assessments.length} eval.
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`text-lg font-bold ${gradeColor5(toFive(course.currentAverage))}`}>
                      {toFive(course.currentAverage).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Nota Final
                    </div>
                  </>
                )}
              </div>
            )}
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <div className="space-y-6">
        {/* Summary Cards */}
        {showSummary && !compact && (
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">GPA Semestre</p>
                    <p className="text-lg font-bold text-primary">
                      {gradeSummary.semesterGPA?.toFixed(2) || "N/A"}
                    </p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">GPA Acumulado</p>
                    <p className="text-lg font-bold text-secondary-foreground">
                      {gradeSummary.cumulativeGPA?.toFixed(2) || "N/A"}
                    </p>
                  </div>
                  <TrendingDown className="w-5 h-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Semester Selector */}
        {!compact && (
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Mis Cursos</h2>
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableSemesters.map(semester => (
                  <SelectItem key={semester} value={semester}>
                    {semester}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="px-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="mt-2"
              >
                Reintentar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Unified Courses List */}
        <div className="space-y-2">
          {allGrades.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No hay materias registradas</h3>
                <p className="text-sm text-muted-foreground">
                  No tienes materias registradas para este semestre
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-4 sm:gap-5">
              {allGrades.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>

        {/* Nota explicativa */}
        {!compact && courseGrades.some(course => course.status === 'pending') && (
          <div className="mt-0 mb-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-0 mt-0 py-1">
              <span>Total de cursos: {allGrades.length}</span>
              <div className="flex gap-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  En Curso: {currentGrades.length}
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Completados: {completedGrades.length}
                </span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground pt-2 border-t border-border">
              * Las notas de cursos en progreso reflejan únicamente las evaluaciones calificadas hasta el momento.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
