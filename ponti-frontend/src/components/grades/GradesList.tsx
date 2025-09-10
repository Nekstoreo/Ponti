"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGradeStore, getLetterGrade, getGradeColor, getStatusColor } from "@/store/gradeStore";
import { CourseGrade } from "@/data/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
import PullToRefresh from "@/components/animations/PullToRefresh";
import { StaggeredAnimation } from "@/components/animations/PageTransition";

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

  const [activeTab, setActiveTab] = useState<"current" | "completed">("current");

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

  const CourseCard = ({ course }: { course: CourseGrade }) => (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
      onClick={() => handleCourseClick(course)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
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
            
            <h3 className="font-semibold text-sm leading-tight mb-1">
              {course.courseName}
            </h3>
            
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{course.professor}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{course.credits} créditos</span>
              </div>
            </div>

            {/* Progress bar for current courses */}
            {course.status === 'pending' && course.currentAverage !== null && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progreso actual</span>
                  <span className={getGradeColor(course.currentAverage)}>
                    {course.currentAverage.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={course.currentAverage} 
                  className="h-1.5"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-1 ml-3">
            {course.currentAverage !== null && (
              <div className="text-right">
                <div className={`text-lg font-bold ${getGradeColor(course.currentAverage)}`}>
                  {course.letterGrade || getLetterGrade(course.currentAverage)}
                </div>
                <div className={`text-xs ${getGradeColor(course.currentAverage)}`}>
                  {course.currentAverage.toFixed(1)}%
                </div>
              </div>
            )}
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <PullToRefresh onRefresh={handleRefresh} disabled={isLoading}>
      <div className="space-y-6">
        {/* Summary Cards */}
        {showSummary && !compact && (
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
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
              <CardContent className="p-4">
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
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Mis Calificaciones</h2>
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
            <CardContent className="p-4">
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

        {/* Tabs for Current vs Completed */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "current" | "completed")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">
              En Curso ({currentGrades.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completadas ({completedGrades.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-3 mt-4">
            {currentGrades.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No hay materias en curso</h3>
                  <p className="text-sm text-muted-foreground">
                    No tienes materias registradas para este semestre
                  </p>
                </CardContent>
              </Card>
            ) : (
              <StaggeredAnimation staggerDelay={100}>
                {currentGrades.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </StaggeredAnimation>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3 mt-4">
            {completedGrades.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No hay materias completadas</h3>
                  <p className="text-sm text-muted-foreground">
                    Aún no has completado ninguna materia
                  </p>
                </CardContent>
              </Card>
            ) : (
              <StaggeredAnimation staggerDelay={100}>
                {completedGrades.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </StaggeredAnimation>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PullToRefresh>
  );
}
