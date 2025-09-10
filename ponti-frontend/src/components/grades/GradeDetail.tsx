"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CourseGrade, AssessmentItem } from "@/data/types";
import { getLetterGrade, getGradeColor, getStatusColor } from "@/store/gradeStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  User,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  PieChart,
  Calculator,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { StaggeredAnimation } from "@/components/animations/PageTransition";
import GradeChart from "./GradeChart";

interface GradeDetailProps {
  course: CourseGrade;
}

export default function GradeDetail({ course }: GradeDetailProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"assessments" | "analytics" | "projections">("assessments");

  const publishedAssessments = course.assessments.filter(a => a.isPublished);
  const upcomingAssessments = course.assessments.filter(a => !a.isPublished);
  
  const totalWeight = course.assessments.reduce((sum, a) => sum + a.weight, 0);
  const completedWeight = publishedAssessments.reduce((sum, a) => sum + a.weight, 0);
  const remainingWeight = totalWeight - completedWeight;

  const getAssessmentIcon = (type: string) => {
    switch (type) {
      case 'exam': return <FileText className="w-4 h-4" />;
      case 'quiz': return <AlertCircle className="w-4 h-4" />;
      case 'assignment': return <BookOpen className="w-4 h-4" />;
      case 'project': return <TrendingUp className="w-4 h-4" />;
      case 'participation': return <MessageSquare className="w-4 h-4" />;
      case 'final': return <CheckCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getAssessmentTypeLabel = (type: string) => {
    switch (type) {
      case 'exam': return 'Examen';
      case 'quiz': return 'Quiz';
      case 'assignment': return 'Tarea';
      case 'project': return 'Proyecto';
      case 'participation': return 'Participación';
      case 'final': return 'Final';
      default: return 'Evaluación';
    }
  };

  const calculateProjectedGrade = (targetGrade: number): number => {
    if (remainingWeight === 0) return course.currentAverage || 0;
    
    const currentPoints = publishedAssessments.reduce((sum, a) => {
      if (a.earnedScore !== null) {
        return sum + (a.earnedScore * a.weight / 100);
      }
      return sum;
    }, 0);

    const pointsNeeded = targetGrade - currentPoints;
    const averageNeededInRemaining = (pointsNeeded / remainingWeight) * 100;
    
    return Math.max(0, Math.min(100, averageNeededInRemaining));
  };

  const AssessmentCard = ({ assessment, isUpcoming = false }: { assessment: AssessmentItem; isUpcoming?: boolean }) => (
    <Card className={isUpcoming ? "border-dashed opacity-70" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {getAssessmentIcon(assessment.type)}
              <Badge variant="secondary" className="text-xs">
                {getAssessmentTypeLabel(assessment.type)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {assessment.weight}%
              </Badge>
            </div>
            
            <h3 className="font-medium text-sm leading-tight mb-1">
              {assessment.name}
            </h3>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Calendar className="w-3 h-3" />
              <span>
                {format(new Date(assessment.date), "dd 'de' MMMM 'a las' HH:mm", { locale: es })}
              </span>
            </div>

            {assessment.feedback && (
              <div className="mt-2 p-2 bg-muted/30 rounded text-xs">
                <div className="flex items-start gap-1">
                  <MessageSquare className="w-3 h-3 mt-0.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{assessment.feedback}</span>
                </div>
              </div>
            )}
          </div>

          <div className="text-right ml-3">
            {isUpcoming ? (
              <div className="text-xs text-muted-foreground">
                <Clock className="w-4 h-4 mx-auto mb-1" />
                Pendiente
              </div>
            ) : assessment.earnedScore !== null ? (
              <div>
                <div className={`text-lg font-bold ${getGradeColor(assessment.earnedScore)}`}>
                  {assessment.earnedScore.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">
                  / {assessment.maxScore}
                </div>
                <div className="text-xs mt-1">
                  {getLetterGrade(assessment.earnedScore)}
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                Sin calificar
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ProjectionCard = ({ targetGrade, label, color }: { targetGrade: number; label: string; color: string }) => {
    const needed = calculateProjectedGrade(targetGrade);
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${color} mb-1`}>
              {targetGrade}%
            </div>
            <div className="text-xs text-muted-foreground mb-2">{label}</div>
            <Separator className="my-2" />
            <div className="text-xs">
              <span className="text-muted-foreground">Promedio necesario:</span>
            </div>
            <div className={`text-lg font-semibold ${getGradeColor(needed)}`}>
              {needed.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              en evaluaciones restantes
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-muted-foreground font-medium">
              {course.courseCode} • {course.semester}
            </span>
            <Badge 
              variant="secondary" 
              className={`text-xs ${getStatusColor(course.status)}`}
            >
              {course.status === 'pending' ? 'En Curso' : 'Completada'}
            </Badge>
          </div>
          <h1 className="text-lg font-bold leading-tight">{course.courseName}</h1>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{course.professor}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              <span>{course.credits} créditos</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          {course.currentAverage !== null && (
            <div className={`text-xl font-bold ${getGradeColor(course.currentAverage)}`}>
              {course.letterGrade || getLetterGrade(course.currentAverage)}
            </div>
          )}
          <div className={`text-xs ${course.currentAverage ? getGradeColor(course.currentAverage) : 'text-muted-foreground'}`}>
            {course.currentAverage?.toFixed(1) || 'N/A'}%
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      {course.status === 'pending' && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Progreso del semestre</span>
                <span className="font-medium">
                  {completedWeight}% de {totalWeight}% completado
                </span>
              </div>
              <Progress value={(completedWeight / totalWeight) * 100} className="h-2" />
              <div className="grid grid-cols-3 gap-4 text-center text-xs">
                <div>
                  <div className="font-semibold text-green-600">{publishedAssessments.length}</div>
                  <div className="text-muted-foreground">Completadas</div>
                </div>
                <div>
                  <div className="font-semibold text-blue-600">{upcomingAssessments.length}</div>
                  <div className="text-muted-foreground">Pendientes</div>
                </div>
                <div>
                  <div className="font-semibold text-orange-600">{remainingWeight}%</div>
                  <div className="text-muted-foreground">Por evaluar</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "assessments" | "analytics" | "projections")}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assessments">
            <FileText className="w-4 h-4 mr-2" />
            Evaluaciones
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <PieChart className="w-4 h-4 mr-2" />
            Análisis
          </TabsTrigger>
          <TabsTrigger value="projections">
            <Calculator className="w-4 h-4 mr-2" />
            Proyecciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assessments" className="space-y-4 mt-4">
          {/* Published Assessments */}
          {publishedAssessments.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Evaluaciones Completadas</h3>
              <StaggeredAnimation staggerDelay={100}>
                {publishedAssessments.map(assessment => (
                  <AssessmentCard key={assessment.id} assessment={assessment} />
                ))}
              </StaggeredAnimation>
            </div>
          )}

          {/* Upcoming Assessments */}
          {upcomingAssessments.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Próximas Evaluaciones</h3>
              <StaggeredAnimation staggerDelay={100}>
                {upcomingAssessments.map(assessment => (
                  <AssessmentCard key={assessment.id} assessment={assessment} isUpcoming />
                ))}
              </StaggeredAnimation>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <GradeChart course={course} />
        </TabsContent>

        <TabsContent value="projections" className="space-y-4 mt-4">
          {course.status === 'pending' && remainingWeight > 0 ? (
            <>
              <div className="text-sm text-muted-foreground mb-4">
                Basado en las evaluaciones restantes ({remainingWeight}% del total)
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ProjectionCard 
                  targetGrade={70} 
                  label="Para Aprobar (C)" 
                  color="text-yellow-600" 
                />
                <ProjectionCard 
                  targetGrade={80} 
                  label="Para B-" 
                  color="text-blue-600" 
                />
                <ProjectionCard 
                  targetGrade={90} 
                  label="Para A-" 
                  color="text-green-600" 
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Estrategia Recomendada</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  {course.currentAverage && course.currentAverage >= 80 ? (
                    <p className="text-green-700">
                      💪 Excelente progreso! Mantén tu rendimiento actual para asegurar una calificación alta.
                    </p>
                  ) : course.currentAverage && course.currentAverage >= 70 ? (
                    <p className="text-blue-700">
                      📈 Buen progreso. Enfócate en las evaluaciones de mayor peso para mejorar tu promedio.
                    </p>
                  ) : (
                    <p className="text-orange-700">
                      ⚡ Necesitas mejorar en las próximas evaluaciones. Considera buscar ayuda adicional.
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No hay proyecciones disponibles</h3>
                <p className="text-sm text-muted-foreground">
                  {course.status !== 'pending' 
                    ? 'Esta materia ya está completada' 
                    : 'No hay evaluaciones pendientes para proyectar'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
