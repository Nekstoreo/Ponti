"use client";

import { useEffect, useState } from "react";
import { useWellnessStore, getMoodEmoji, getMoodLabel, getStressLabel } from "@/store/wellnessStore";
import { MoodLevel, WellnessRecommendation } from "@/data/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  AlertTriangle,
  Plus,
  BarChart3,
  Clock,
  Zap,
  Focus
} from "lucide-react";
import LoadingSkeleton from "@/components/animations/LoadingSkeleton";
import PullToRefresh from "@/components/animations/PullToRefresh";
import { StaggeredAnimation } from "@/components/animations/PageTransition";
import { useRouter } from "next/navigation";

export default function WellnessHub() {
  const router = useRouter();
  const {
    metrics,
    insights,
    isLoading,
    error,
    refreshData,
    initializeData,
    getActiveRecommendations,
    getTodayMoodEntry
  } = useWellnessStore();

  const [activeTab, setActiveTab] = useState<"overview" | "insights" | "recommendations">("overview");

  useEffect(() => {
    if (metrics.averageMood === 0) {
      initializeData();
    }
  }, [metrics.averageMood, initializeData]);

  const activeRecommendations = getActiveRecommendations();
  const todayMood = getTodayMoodEntry();

  const handleRefresh = async () => {
    await refreshData();
  };

  const handleAddMoodEntry = () => {
    router.push('/bienestar/mood-tracker');
  };

  if (isLoading && metrics.averageMood === 0) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-8 w-64" />
        <LoadingSkeleton variant="list" count={4} />
      </div>
    );
  }

  const MetricCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    color = "text-primary",
    trend,
    onClick 
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ComponentType<{ className?: string }>;
    color?: string;
    trend?: 'up' | 'down' | 'stable';
    onClick?: () => void;
  }) => (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-all duration-200 ${onClick ? 'hover:scale-[1.02]' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">{title}</p>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="flex flex-col items-center gap-1">
            <Icon className="w-5 h-5 text-muted-foreground" />
            {trend && (
              <div className={`flex items-center ${
                trend === 'up' ? 'text-green-600' : 
                trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {trend === 'up' && <TrendingUp className="w-3 h-3" />}
                {trend === 'down' && <TrendingDown className="w-3 h-3" />}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const InsightCard = ({ insight }: { insight: typeof insights[0] }) => (
    <Card className={`border-l-4 ${
      insight.type === 'achievement' ? 'border-l-green-500 bg-green-50/50' :
      insight.type === 'alert' ? 'border-l-red-500 bg-red-50/50' :
      insight.type === 'trend' ? 'border-l-blue-500 bg-blue-50/50' :
      'border-l-purple-500 bg-purple-50/50'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">{insight.icon}</div>
          <div className="flex-1">
            <h3 className="font-medium text-sm mb-1">{insight.title}</h3>
            <p className="text-xs text-muted-foreground mb-2">{insight.description}</p>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                {insight.period}
              </Badge>
              {insight.value && (
                <span className={`text-sm font-medium ${
                  insight.trend === 'up' ? 'text-green-600' : 
                  insight.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {insight.value}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const RecommendationCard = ({ recommendation }: { recommendation: WellnessRecommendation }) => (
    <Card className={`border-l-4 ${
      recommendation.priority === 'high' ? 'border-l-red-400' :
      recommendation.priority === 'medium' ? 'border-l-yellow-400' :
      'border-l-gray-400'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">{recommendation.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-sm">{recommendation.title}</h3>
              <Badge variant={
                recommendation.priority === 'high' ? 'destructive' :
                recommendation.priority === 'medium' ? 'default' : 'secondary'
              } className="text-xs">
                {recommendation.priority === 'high' ? 'Importante' :
                 recommendation.priority === 'medium' ? 'Medio' : 'Opcional'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{recommendation.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{recommendation.estimatedTime}</span>
              </div>
              <Button size="sm" variant="outline" className="h-6 text-xs">
                {recommendation.actionText}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <PullToRefresh onRefresh={handleRefresh} disabled={isLoading}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Centro de Bienestar</h1>
            <p className="text-sm text-muted-foreground">
              Tu bienestar académico y personal
            </p>
          </div>
          <Button
            onClick={handleAddMoodEntry}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Estado
          </Button>
        </div>

        {/* Today's Status */}
        {todayMood ? (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{getMoodEmoji(todayMood.mood)}</div>
                <div>
                  <h3 className="font-medium">Estado de hoy</h3>
                  <p className="text-sm text-muted-foreground">
                    {getMoodLabel(todayMood.mood)} • Estrés {getStressLabel(todayMood.stressLevel)}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-sm font-medium">{metrics.streakDays} días</div>
                  <div className="text-xs text-muted-foreground">racha actual</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">¿Cómo te sientes hoy?</h3>
                  <p className="text-sm text-muted-foreground">
                    Registra tu estado de ánimo para obtener insights personalizados
                  </p>
                </div>
                <Button onClick={handleAddMoodEntry} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-4 h-4" />
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

        {/* Main Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            title="Estado de Ánimo"
            value={`${metrics.averageMood.toFixed(1)}/5`}
            subtitle={`${getMoodEmoji(Math.max(1, Math.min(5, Math.round(metrics.averageMood))) as MoodLevel)} ${getMoodLabel(Math.max(1, Math.min(5, Math.round(metrics.averageMood))) as MoodLevel)}`}
            icon={Heart}
            color="text-pink-600"
            trend={metrics.weeklyTrend === 'improving' ? 'up' : metrics.weeklyTrend === 'declining' ? 'down' : 'stable'}
            onClick={() => router.push('/bienestar/mood-tracker')}
          />
          <MetricCard
            title="Energía"
            value={`${metrics.averageEnergy.toFixed(1)}/5`}
            subtitle="Promedio semanal"
            icon={Zap}
            color="text-yellow-600"
          />
          <MetricCard
            title="Concentración"
            value={`${metrics.averageFocus.toFixed(1)}/5`}
            subtitle="Nivel actual"
            icon={Focus}
            color="text-blue-600"
          />
          <MetricCard
            title="Sueño"
            value={`${metrics.averageSleep.toFixed(1)}h`}
            subtitle="Promedio nocturno"
            icon={Clock}
            color="text-purple-600"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "overview" | "insights" | "recommendations")}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="insights">
              <Brain className="w-4 h-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              <Target className="w-4 h-4 mr-2" />
              Recomendaciones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Progreso Semanal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Estado de Ánimo</span>
                    <span className="text-sm font-medium">{(metrics.averageMood / 5 * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={metrics.averageMood / 5 * 100} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Energía</span>
                    <span className="text-sm font-medium">{(metrics.averageEnergy / 5 * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={metrics.averageEnergy / 5 * 100} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Concentración</span>
                    <span className="text-sm font-medium">{(metrics.averageFocus / 5 * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={metrics.averageFocus / 5 * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium">Racha Actual</span>
                    </div>
                    <span className="text-lg font-bold text-yellow-600">{metrics.streakDays} días</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">Recomendaciones Completadas</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{metrics.completedRecommendations}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-3 mt-4">
            {insights.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No hay insights disponibles</h3>
                  <p className="text-sm text-muted-foreground">
                    Registra tu estado de ánimo durante algunos días para obtener insights personalizados
                  </p>
                </CardContent>
              </Card>
            ) : (
              <StaggeredAnimation staggerDelay={100}>
                {insights.map(insight => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </StaggeredAnimation>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-3 mt-4">
            {activeRecommendations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">¡Todas las recomendaciones completadas!</h3>
                  <p className="text-sm text-muted-foreground">
                    Excelente trabajo. Nuevas recomendaciones aparecerán según tus necesidades
                  </p>
                </CardContent>
              </Card>
            ) : (
              <StaggeredAnimation staggerDelay={100}>
                {activeRecommendations.map(recommendation => (
                  <RecommendationCard key={recommendation.id} recommendation={recommendation} />
                ))}
              </StaggeredAnimation>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PullToRefresh>
  );
}
