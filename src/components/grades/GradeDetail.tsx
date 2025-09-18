"use client";

import { useState, useMemo } from "react";
import { CourseGrade, AssessmentItem } from "@/data/types";
import { getStatusColor } from "@/store/gradeStore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Calendar,
  User,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calculator,
  MessageSquare,
  ArrowRight,
  Target,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";

interface GradeDetailProps {
  course: CourseGrade;
}

export default function GradeDetail({ course }: GradeDetailProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"assessments" | "analytics">("assessments");

  const publishedAssessments = course.assessments.filter(a => a.isPublished);
  const upcomingAssessments = course.assessments.filter(a => !a.isPublished);

  const totalWeight = course.assessments.reduce((sum, a) => sum + a.weight, 0);
  const completedWeight = publishedAssessments.reduce((sum, a) => sum + a.weight, 0);
  const remainingWeight = totalWeight - completedWeight;

  // --- Escala 0 - 5 ---
  // earnedScore ya viene en escala 0-5
  const toFiveScale = (value: number) => Math.min(5, Math.max(0, value)); // aseguramos límites 0-5
  const fromFiveToPercent = (grade5: number) => (grade5 / 5) * 100; // para cálculos de peso relativo

  // Puntos actuales (porcentaje acumulado ponderado, 0-100)
  const currentPointsPercent = useMemo(() => publishedAssessments.reduce((sum, a) => {
    if (a.earnedScore !== null) return sum + ((fromFiveToPercent(a.earnedScore)) * a.weight / 100);
    return sum;
  }, 0), [publishedAssessments]);

  // Usar directamente el currentAverage del curso que ya está calculado correctamente
  const currentGrade5 = course.currentAverage !== null ? course.currentAverage : toFiveScale(currentPointsPercent / 100 * 5);

  // Colores personalizados escala 0-5
  const getGradeColor5 = (g: number) => {
    if (g >= 4) return 'text-green-600';
    if (g >= 3) return 'text-blue-600';
    if (g >= 2.5) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getGradeBg5 = (g: number) => {
    if (g >= 4) return 'bg-green-50';
    if (g >= 3) return 'bg-blue-50';
    if (g >= 2.5) return 'bg-yellow-50';
    return 'bg-gray-50';
  };

  // Cálculo de promedio necesario en evaluaciones restantes para alcanzar una meta (meta en 0-5)
  const calculateRequiredRemainingAvg5 = (targetGrade5: number): { needed: number; status: 'achieved' | 'impossible' | 'needed' } => {
    if (remainingWeight <= 0) {
      return { needed: 0, status: currentGrade5 >= targetGrade5 ? 'achieved' : 'impossible' };
    }
    const targetPercent = fromFiveToPercent(targetGrade5);
    const neededPercentRemaining = (targetPercent - currentPointsPercent) / remainingWeight * 100; // porcentaje promedio requerido en evaluaciones restantes (0-100)
    const neededGrade5Remaining = toFiveScale((Math.max(0, Math.min(100, neededPercentRemaining)) / 100) * 5); // convertir de 0-100 a 0-5
    if (neededPercentRemaining <= 0) return { needed: 0, status: 'achieved' };
    if (neededPercentRemaining > 100) return { needed: 5, status: 'impossible' };
    return { needed: neededGrade5Remaining, status: 'needed' };
  };

  const handleOpenSimulator = () => {
    // Encodear los datos del curso para pasarlos como query params o usar el store
    const courseData = encodeURIComponent(JSON.stringify({
      courseId: course.courseId,
      courseName: course.courseName,
      currentAverage: course.currentAverage,
      assessments: course.assessments,
      currentGrade: currentGrade5,
      currentPoints: currentPointsPercent,
      remainingWeight
    }));
    
    router.push(`/simulador-notas?course=${courseData}`);
  };

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


  const AssessmentCard = ({ assessment, isUpcoming = false }: { assessment: AssessmentItem; isUpcoming?: boolean }) => (
    <Card className={`${isUpcoming ? "border-dashed opacity-70" : ""} mb-4`}>
      <CardContent className="px-4">
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
                {format(new Date(assessment.date), "dd 'de' MMMM", { locale: es })}
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

          <div className="text-right ml-3 min-w-[70px]">
            {isUpcoming ? (
              <div className="text-xs text-muted-foreground">
                <Clock className="w-4 h-4 mx-auto mb-1" />
                ----
              </div>
            ) : assessment.earnedScore !== null ? (
              <div>
                <div className={`text-lg font-bold ${getGradeColor5(assessment.earnedScore)}`}>
                  {assessment.earnedScore.toFixed(2)}
                </div>
                <div className="text-[10px] text-muted-foreground">/ 5.00</div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">Sin calificar</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const TargetCard5 = ({ target, label }: { target: number; label: string }) => {
    const { needed } = calculateRequiredRemainingAvg5(target);
    return (
      <Card>
        <CardContent className="px-4 space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Meta</div>
              <div className={`text-xl font-bold ${getGradeColor5(target)}`}>{target.toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Necesario</div>
              <div className={`text-lg font-semibold ${getGradeColor5(needed)}`}>{needed.toFixed(2)}</div>
            </div>
          </div>
          <Separator />
          <div className="text-xs text-muted-foreground">{label}</div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
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
          <div className={`inline-block px-3 py-1 rounded-md ${getGradeBg5(currentGrade5)} ${getGradeColor5(currentGrade5)} text-sm font-semibold min-w-[70px]`}>{currentGrade5.toFixed(2)}</div>
          <div className="text-[10px] text-muted-foreground mt-3">Acumulado</div>
        </div>
      </div>

      {course.status === 'pending' && (
        <Card>
          <CardContent className="px-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Progreso del semestre</span>
              <span className="text-sm font-medium">{completedWeight}% evaluado</span>
            </div>
            <Progress value={(completedWeight / totalWeight) * 100} className="h-2 mb-3" />
            <div className="flex items-center justify-center gap-6 text-xs">
              <span className="text-green-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                {publishedAssessments.length} completadas
              </span>
              <span className="text-blue-600 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {upcomingAssessments.length} restantes
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "assessments" | "analytics")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assessments">
            <FileText className="w-4 h-4 mr-2" />
            Evaluaciones
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <Calculator className="w-4 h-4 mr-2" />
            Análisis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assessments" className="mt-4">
          {/* Published Assessments */}
          {publishedAssessments.length > 0 && (
            <div className="flex flex-col gap-5">
              <h3 className="font-medium text-sm">Evaluaciones Completadas</h3>
              <div className="space-y-6">
                <div className="space-y-6">
                  {publishedAssessments.map(assessment => (
                    <AssessmentCard key={assessment.id} assessment={assessment} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Assessments */}
          {upcomingAssessments.length > 0 && (
            <div className="space-y-6">
              <h3 className="font-medium text-sm">Próximas Evaluaciones</h3>
              <div className="space-y-6">
                {upcomingAssessments.map(assessment => (
                  <AssessmentCard key={assessment.id} assessment={assessment} isUpcoming />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-4">
          {course.status === 'pending' && remainingWeight > 0 ? (
            <>
              <div className="text-sm text-muted-foreground">
                Evaluaciones restantes: {remainingWeight}% del total
              </div>

              <div className="grid grid-cols-2 gap-4">
                <TargetCard5 target={3.0} label="Para aprobar (≥3.0)" />
                <TargetCard5 target={4.0} label="Excelente desempeño (≥4.0)" />
              </div>

              <Card>
                <CardContent className="text-sm">
                  {currentGrade5 >= 4 ? (
                    <p className="text-green-700">💪 Excelente progreso. Mantén hábitos consistentes y consolida fortalezas.</p>
                  ) : currentGrade5 >= 3 ? (
                    <p className="text-blue-700">📈 Vas en buen camino. Enfócate en evaluaciones de alto peso para subir hacia 4.0.</p>
                  ) : currentGrade5 >= 2.5 ? (
                    <p className="text-yellow-700">⚠️ Cerca de la meta. Refuerza temas débiles antes de evaluaciones claves.</p>
                  ) : (
                    <p className="text-gray-700">🧭 Necesitas mejorar. Prioriza tutorías, práctica dirigida y planifica estudio.</p>
                  )}
                </CardContent>
              </Card>

              {/* Tarjeta del Simulador de Notas */}
              {upcomingAssessments.length > 0 && (
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
                  onClick={handleOpenSimulator}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                            <Calculator className="w-8 h-8 text-white" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">Simulador de Notas</h3>
                          <p className="text-sm text-gray-600 mb-2">
                            Proyecta tu nota final con diferentes escenarios
                          </p>
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-medium text-blue-700">
                              {upcomingAssessments.length} evaluaciones pendientes
                            </span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              )}
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
