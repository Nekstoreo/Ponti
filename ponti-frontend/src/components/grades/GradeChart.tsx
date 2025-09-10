"use client";

import { CourseGrade } from "@/data/types";
import { getGradeColor, getLetterGrade } from "@/store/gradeStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Target,
  Award,
  Clock
} from "lucide-react";

interface GradeChartProps {
  course: CourseGrade;
}

export default function GradeChart({ course }: GradeChartProps) {
  const publishedAssessments = course.assessments.filter(a => a.isPublished && a.earnedScore !== null);
  
  // Calculate statistics
  const scores = publishedAssessments.map(a => a.earnedScore!);

  const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;
  
  // Score distribution
  const scoreRanges = [
    { range: '90-100', label: 'A', count: 0, color: 'bg-green-500' },
    { range: '80-89', label: 'B', count: 0, color: 'bg-blue-500' },
    { range: '70-79', label: 'C', count: 0, color: 'bg-yellow-500' },
    { range: '60-69', label: 'D', count: 0, color: 'bg-orange-500' },
    { range: '0-59', label: 'F', count: 0, color: 'bg-red-500' },
  ];

  scores.forEach(score => {
    if (score >= 90) scoreRanges[0].count++;
    else if (score >= 80) scoreRanges[1].count++;
    else if (score >= 70) scoreRanges[2].count++;
    else if (score >= 60) scoreRanges[3].count++;
    else scoreRanges[4].count++;
  });

  // Assessment type performance
  const typePerformance = course.assessments.reduce((acc, assessment) => {
    if (assessment.earnedScore !== null) {
      if (!acc[assessment.type]) {
        acc[assessment.type] = { total: 0, count: 0, scores: [] };
      }
      acc[assessment.type].total += assessment.earnedScore;
      acc[assessment.type].count += 1;
      acc[assessment.type].scores.push(assessment.earnedScore);
    }
    return acc;
  }, {} as Record<string, { total: number; count: number; scores: number[] }>);

  const typeAverages = Object.entries(typePerformance).map(([type, data]) => ({
    type,
    average: data.total / data.count,
    count: data.count,
  }));

  // Trend calculation
  const getTrend = () => {
    if (scores.length < 2) return null;
    const recent = scores.slice(-3);
    const earlier = scores.slice(-6, -3);
    if (earlier.length === 0) return null;
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
    
    return recentAvg - earlierAvg;
  };

  const trend = getTrend();

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    color = "text-foreground" 
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ComponentType<{ className?: string }>;
    color?: string;
  }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );

  const DistributionBar = ({ 
    range, 
    count, 
    total, 
    color, 
    label 
  }: {
    range: string;
    count: number;
    total: number;
    color: string;
    label: string;
  }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${color}`} />
            <span className="font-medium">{label}</span>
            <span className="text-muted-foreground">({range}%)</span>
          </div>
          <span className="font-medium">{count}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Promedio General"
          value={`${averageScore.toFixed(1)}%`}
          subtitle={getLetterGrade(averageScore)}
          icon={BarChart3}
          color={getGradeColor(averageScore)}
        />
        
        <StatCard
          title="Tendencia"
          value={trend !== null ? `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%` : 'N/A'}
          subtitle={trend !== null ? (trend > 0 ? 'Mejorando' : trend < 0 ? 'Declinando' : 'Estable') : 'Insuficientes datos'}
          icon={trend !== null && trend > 0 ? TrendingUp : TrendingDown}
          color={trend !== null ? (trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600') : 'text-gray-600'}
        />
        
        <StatCard
          title="Calificación Más Alta"
          value={`${highestScore.toFixed(1)}%`}
          subtitle={getLetterGrade(highestScore)}
          icon={Award}
          color={getGradeColor(highestScore)}
        />
        
        <StatCard
          title="Calificación Más Baja"
          value={`${lowestScore.toFixed(1)}%`}
          subtitle={getLetterGrade(lowestScore)}
          icon={Target}
          color={getGradeColor(lowestScore)}
        />
      </div>

      {/* Score Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <PieChart className="w-4 h-4" />
            Distribución de Calificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {scoreRanges.map((range, index) => (
            <DistributionBar
              key={index}
              range={range.range}
              count={range.count}
              total={scores.length}
              color={range.color}
              label={range.label}
            />
          ))}
          {scores.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No hay calificaciones para mostrar distribución</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance by Assessment Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <BarChart3 className="w-4 h-4" />
            Rendimiento por Tipo de Evaluación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {typeAverages.length > 0 ? (
            typeAverages.map((type, index) => {
              const typeLabels: Record<string, string> = {
                exam: 'Exámenes',
                quiz: 'Quizzes',
                assignment: 'Tareas',
                project: 'Proyectos',
                participation: 'Participación',
                final: 'Final',
              };

              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {typeLabels[type.type] || type.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        ({type.count} evaluación{type.count !== 1 ? 'es' : ''})
                      </span>
                    </div>
                    <span className={`font-medium ${getGradeColor(type.average)}`}>
                      {type.average.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={type.average} className="h-2" />
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No hay suficientes datos para análisis por tipo</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Performance Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4" />
            Progreso Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {publishedAssessments.length > 0 ? (
            <div className="space-y-3">
              {publishedAssessments.slice(-5).map((assessment, index) => (
                <div key={assessment.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{assessment.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(assessment.date).toLocaleDateString('es-ES', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${getGradeColor(assessment.earnedScore!)}`}>
                      {assessment.earnedScore!.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getLetterGrade(assessment.earnedScore!)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No hay evaluaciones completadas</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
