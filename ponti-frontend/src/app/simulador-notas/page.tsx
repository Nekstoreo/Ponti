"use client";

import { useState, useEffect, useMemo, memo, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainLayout from "@/components/MainLayout";
import PageTitle from "@/components/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  ArrowLeft,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  RotateCcw,
  Lightbulb,
  BookOpen,
  FileText,
  MessageSquare,
  X,
  Plus,
} from "lucide-react";
import { AssessmentItem } from "@/data/types";

interface SimulatorData {
  courseId: string;
  courseName: string;
  currentAverage: number | null;
  assessments: AssessmentItem[];
  currentGrade: number;
  currentPoints: number;
  remainingWeight: number;
}

// Función para generar mensajes ingeniosos basados en la nota
const getIngeniousMessage = (grade: number): string => {
  if (grade >= 4.5) {
    return "¡Excelente! Eres una máquina de estudiar. ¡Los profesores te tienen miedo! 🎓⚡";
  } else if (grade >= 4.2) {
    return "¡Sobresaliente! Tu esfuerzo realmente vale la pena 🌟😲";
  } else if (grade >= 4.0) {
    return "¡Muy bien! Tu dedicación merece una fiesta privada 📚🎊";
  } else if (grade >= 3.8) {
    return "¡Felicitaciones! Aprobaste con honores... ¡y con mucho estilo! 👏💃";
  } else if (grade >= 3.5) {
    return "¡Buen trabajo! Tu constancia merece un monumento 💪🏛️";
  } else if (grade >= 3.2) {
    return "¡Aprobaste! El esfuerzo vale la pena... ¡y tú lo demostraste! 🎯🔥";
  } else if (grade >= 3.0) {
    return "¡Aprobado! Como dicen... ¡pasar es pasar! Bienvenido al club 😅🎉";
  } else if (grade >= 2.9) {
    return "¡A un suspiro del aprobado! ¿Preparas tu mejor súplica al profesor? 🙏📝";
  } else if (grade >= 2.5) {
    return "¡Casi! Pero no te preocupes, ¡la próxima vez brillarás como una estrella! ✨📚";
  } else if (grade >= 2.2) {
    return "Buen intento, ¡pero imagina lo que lograrás con un poco más de estudio! 📝💪";
  } else if (grade >= 2.0) {
    return "¡Vamos! Tú tienes potencial para lograr cosas increíbles, ¡sigamos trabajando! 🚀📺";
  } else if (grade >= 1.8) {
    return "Cada experiencia es una lección valiosa... ¡y esta te acerca a tu mejor versión! 📖🌟";
  } else if (grade >= 1.5) {
    return "No te desanimes, ¡eres capaz de lograr mucho más de lo que imaginas! 📱📚✨";
  } else if (grade >= 1.0) {
    return "El aprendizaje es continuo y tú estás en el camino correcto... ¡sigue adelante! 🏃‍♂️💨";
  } else if (grade >= 0.5) {
    return "Cada paso cuenta, ¡y tú estás avanzando poco a poco hacia el éxito! 🦘💪";
  } else {
    return "Recuerda: el verdadero fracaso es no intentarlo... ¡y tú ya estás intentándolo! 🌟💪";
  }
};

// Componente memo para la proyección final - solo se re-renderiza cuando cambian las props
const ProyeccionFinal = memo(({
  simulatedFinalGrade,
  getGradeColor5,
  getGradeBg5,
  calculateNeededGrade
}: {
  simulatedFinalGrade: number;
  getGradeColor5: (g: number) => string;
  getGradeBg5: (g: number) => string;
  calculateNeededGrade?: {
    currentGrade: number;
    remainingPercentage: number;
    neededFor3: number;
    neededFor4: number;
    neededFor5: number;
  } | null;
}) => {
  // Determinar qué nota usar para el mensaje (actual si no llega al 100%, proyectada si llega)
  const displayGrade = calculateNeededGrade ? calculateNeededGrade.currentGrade : simulatedFinalGrade;
  const displayMessage = getIngeniousMessage(displayGrade);

  return (
    <Card className={`border-2 ${getGradeBg5(simulatedFinalGrade)}`}>
      <CardContent className="px-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg">
              {calculateNeededGrade ? 'Proyección Parcial' : 'Proyección Final'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {displayMessage}
            </p>

            {/* Información adicional cuando no llega al 100% */}
            {calculateNeededGrade && (
              <div className="mt-3 space-y-2">
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Nota actual ({100 - calculateNeededGrade.remainingPercentage}%):</span>{' '}
                  <span className={`font-bold ${getGradeColor5(calculateNeededGrade.currentGrade)}`}>
                    {calculateNeededGrade.currentGrade.toFixed(2)}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Para llegar a:</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-green-50 border border-green-200 rounded p-2 text-center">
                    <div className="font-bold text-green-700">3.0</div>
                    <div className="text-muted-foreground">
                      Necesitas {calculateNeededGrade.neededFor3.toFixed(2)} en {calculateNeededGrade.remainingPercentage}%
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded p-2 text-center">
                    <div className="font-bold text-blue-700">4.0</div>
                    <div className="text-muted-foreground">
                      Necesitas {calculateNeededGrade.neededFor4.toFixed(2)} en {calculateNeededGrade.remainingPercentage}%
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded p-2 text-center">
                    <div className="font-bold text-purple-700">5.0</div>
                    <div className="text-muted-foreground">
                      Necesitas {calculateNeededGrade.neededFor5.toFixed(2)} en {calculateNeededGrade.remainingPercentage}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="text-right">
            <div className={`text-3xl font-bold ${getGradeColor5(displayGrade)}`}>
              {displayGrade.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">
              /5.0 {calculateNeededGrade && `(${100 - calculateNeededGrade.remainingPercentage}%)`}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ProyeccionFinal.displayName = 'ProyeccionFinal';

// Componente interno que usa useSearchParams
function SimuladorNotasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [simulatorData, setSimulatorData] = useState<SimulatorData | null>(null);
  const [simulatedScores, setSimulatedScores] = useState<Record<string, number | undefined>>({});
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [showProjection, setShowProjection] = useState<boolean>(false);
  const [showInfoMessage, setShowInfoMessage] = useState<boolean>(true);
  
  // Para simulador genérico desde "Más"
  const [manualAssessments, setManualAssessments] = useState<Array<{
    id: string;
    name: string;
    weight: number;
    score: number | null;
    isPending: boolean;
  }>>([
    { id: '1', name: 'Examen Parcial 1', weight: 25, score: null, isPending: false },
    { id: '2', name: 'Examen Parcial 2', weight: 25, score: null, isPending: false },
    { id: '3', name: 'Proyecto Final', weight: 30, score: null, isPending: false },
    { id: '4', name: 'Participación', weight: 20, score: null, isPending: false },
  ]);

  // Configuración de escalas
  const toFiveScale = (value: number) => Math.min(5, Math.max(0, value));
  const fromFiveToPercent = (grade5: number) => (grade5 / 5) * 100;

  const getGradeColor5 = (g: number) => {
    if (g >= 4) return 'text-green-600';
    if (g >= 3) return 'text-blue-600';
    if (g >= 2.5) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getGradeBg5 = (g: number) => {
    if (g >= 4) return 'bg-green-100 border-green-200';
    if (g >= 3) return 'bg-blue-100 border-blue-200';
    if (g >= 2.5) return 'bg-yellow-100 border-yellow-200';
    return 'bg-gray-100 border-gray-200';
  };

  useEffect(() => {
    const courseParam = searchParams.get('course');
    
    if (courseParam) {
      try {
        const data: SimulatorData = JSON.parse(decodeURIComponent(courseParam));
        setSimulatorData(data);
      } catch (error) {
        console.error('Error parsing course data:', error);
        router.push('/calificaciones');
      }
    } else {
      // Si no hay parámetros, es acceso desde "Más", usar datos generales
      setSimulatorData(null);
    }
  }, [searchParams, router]);

  const upcomingAssessments = useMemo(() => 
    simulatorData?.assessments.filter(a => !a.isPublished) || [], 
    [simulatorData?.assessments]
  );
  
  const publishedAssessments = useMemo(() =>
    simulatorData?.assessments.filter(a => a.isPublished) || [],
    [simulatorData?.assessments]
  );

  // Calcular suma total de porcentajes y detectar evaluaciones problemáticas
  const weightCalculation = useMemo(() => {
    const totalWeight = manualAssessments.reduce((sum, a) => sum + (a.weight || 0), 0);
    const isOverLimit = totalWeight > 100;

    // Encontrar la evaluación que causa el exceso (la última que hace que se pase de 100%)
    let problematicAssessmentId = null;
    if (isOverLimit) {
      let runningTotal = 0;
      for (const assessment of manualAssessments) {
        runningTotal += assessment.weight || 0;
        if (runningTotal > 100 && !problematicAssessmentId) {
          problematicAssessmentId = assessment.id;
        }
      }
    }

    return {
      totalWeight,
      isOverLimit,
      problematicAssessmentId,
      remainingWeight: Math.max(0, 100 - totalWeight)
    };
  }, [manualAssessments]);

  // Función para calcular qué necesita en el porcentaje restante
  const calculateNeededGrade = useMemo(() => {
    if (!simulatorData && !weightCalculation.isOverLimit) {
      const totalWeight = manualAssessments.reduce((sum, a) => sum + (a.weight || 0), 0);
      const remainingWeight = weightCalculation.remainingWeight;

      if (totalWeight === 0 || remainingWeight === 0) return null;

      // Calcular nota actual ponderada
      const currentWeightedSum = manualAssessments.reduce((sum, a) => {
        const score = a.score !== null ? a.score : (simulatedScores[a.id] || 0);
        return sum + (score * (a.weight || 0));
      }, 0);

      const currentGrade = currentWeightedSum / totalWeight;

      // Calcular qué necesita para diferentes objetivos
      const calculateNeeded = (targetGrade: number) => {
        const neededWeighted = (targetGrade * 100) - currentWeightedSum;
        const neededGrade = neededWeighted / remainingWeight;
        return Math.min(5, Math.max(0, neededGrade));
      };

      return {
        currentGrade,
        remainingPercentage: remainingWeight,
        neededFor3: calculateNeeded(3.0),
        neededFor4: calculateNeeded(4.0),
        neededFor5: calculateNeeded(5.0)
      };
    }
    return null;
  }, [simulatorData, manualAssessments, simulatedScores, weightCalculation]);

  const simulatedFinalGrade = useMemo(() => {
    if (!showProjection) return 0;

    if (simulatorData) {
      // Modo con datos de curso específico
      const simulatedPercentAdded = upcomingAssessments.reduce((sum, a) => {
        const sim = simulatedScores[a.id];
        if (typeof sim === 'number' && !isNaN(sim)) {
          const percentEquivalent = fromFiveToPercent(sim);
          return sum + (percentEquivalent * a.weight / 100);
        }
        return sum;
      }, 0);

      const finalPercent = simulatorData.currentPoints + simulatedPercentAdded;
      return toFiveScale(finalPercent / 100 * 5);
    } else {
      // Modo simulador genérico
      const totalWeight = manualAssessments.reduce((sum, a) => sum + (a.weight || 0), 0);
      if (totalWeight === 0) return 0;

      const weightedSum = manualAssessments.reduce((sum, a) => {
        const score = a.score !== null ? a.score : (simulatedScores[a.id] || 0);
        return sum + (score * (a.weight || 0));
      }, 0);

      return toFiveScale(weightedSum / totalWeight);
    }
  }, [showProjection, simulatedScores, upcomingAssessments, simulatorData, manualAssessments]);

  const calculateProjection = useCallback(() => {
    setShowProjection(true);
  }, []);

  const addManualAssessment = useCallback(() => {
    const newId = Date.now().toString();
    setManualAssessments(prev => [
      ...prev,
      {
        id: newId,
        name: `Evaluación ${prev.length + 1}`,
        weight: 0,
        score: null,
        isPending: false
      }
    ]);
  }, []);

  const updateManualAssessment = useCallback((id: string, field: string, value: number | null) => {
    setManualAssessments(prev => prev.map(assessment =>
      assessment.id === id ? { ...assessment, [field]: value } : assessment
    ));
    setShowProjection(false);
  }, []);

  const removeManualAssessment = useCallback((id: string) => {
    setManualAssessments(prev => prev.filter(a => a.id !== id));
    setShowProjection(false);
  }, []);

  const handleSimulatedChange = useCallback((id: string, value: number) => {
    // Validar que el valor no sea NaN
    if (isNaN(value)) {
      setSimulatedScores(prev => ({ ...prev, [id]: undefined }));
      setSelectedPreset("");
      setShowProjection(false);
      return;
    }

    if (value < 0) value = 0;
    if (value > 5) value = 5;
    setSimulatedScores(prev => ({ ...prev, [id]: value }));
    setSelectedPreset("");
    setShowProjection(false);
  }, []);

  const resetSimulation = useCallback(() => {
    setSimulatedScores({});
    setSelectedPreset("");
    setShowProjection(false);
    if (!simulatorData) {
      setManualAssessments(prev => prev.map(a => ({ ...a, score: null })));
    }
  }, [simulatorData]);

  const applyPreset = useCallback((preset: string) => {
    setSelectedPreset(preset);
    const newScores: Record<string, number> = {};
    
    upcomingAssessments.forEach(assessment => {
      switch (preset) {
        case 'conservative':
          newScores[assessment.id] = 3.0;
          break;
        case 'optimistic':
          newScores[assessment.id] = 4.5;
          break;
        case 'realistic':
          newScores[assessment.id] = simulatorData?.currentGrade || 3.5;
          break;
        default:
          break;
      }
    });
    
    setSimulatedScores(newScores);
    setShowProjection(false);
  }, [upcomingAssessments, simulatorData?.currentGrade]);

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


  // Función para truncar texto
  const truncateText = (text: string, maxLength: number = 20) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (!simulatorData && searchParams.get('course')) {
    return (
      <MainLayout>
        <div className="px-4 pt-4 space-y-6" style={{ paddingBottom: 36 }}>
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <PageTitle title="Simulador de Notas" />
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Error al cargar datos</h3>
              <p className="text-sm text-muted-foreground">
                No se pudieron cargar los datos del curso.
              </p>
              <Button onClick={() => router.push('/calificaciones')} className="mt-4">
                Volver a Calificaciones
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  // Vista para acceso desde "Más" (sin datos específicos del curso)
  if (!simulatorData) {
    return (
      <MainLayout>
        <div className="px-4 pt-4 space-y-6" style={{ paddingBottom: 36 }}>
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Simulador de Notas</h1>
              <p className="text-sm text-muted-foreground">Calcula tu proyección final</p>
            </div>
          </div>
          
          {/* Mensaje informativo compacto y ocultable */}
          {showInfoMessage && (
            <div className="relative bg-blue-50 border border-blue-200 rounded-lg p-3">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-1 right-1 h-6 w-6 p-0"
                onClick={() => setShowInfoMessage(false)}
              >
                <X className="w-3 h-3" />
              </Button>
              <div className="flex items-start gap-2 pr-6">
                <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-800 font-medium">💡 Tip</p>
                  <p className="text-blue-700 text-xs">
                    Para usar datos específicos de una materia, ve a Calificaciones → Selecciona materia → Análisis
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Simulador Manual */}
          <Card className="border-2 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-600" />
                Simulador Manual
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              
              {/* Lista de Evaluaciones Manuales */}
              <div className="space-y-3">
                {manualAssessments.map((assessment) => {
                  const isProblematic = weightCalculation.problematicAssessmentId === assessment.id;
                  return (
                    <div
                      key={assessment.id}
                      className={`flex items-center justify-between p-3 border-2 border-dashed rounded-lg bg-blue-50/50 relative ${
                        isProblematic
                          ? 'border-red-400 bg-red-50/50'
                          : 'border-blue-300'
                      }`}
                    >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4" />
                      <div className="flex items-center gap-3">
                        {/* Input de Porcentaje */}
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={assessment.weight || ""}
                            onChange={(e) => {
                              const value = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                              // Limitar el valor al peso restante disponible
                              const maxAllowed = assessment.weight + weightCalculation.remainingWeight;
                              const finalValue = Math.min(value, maxAllowed);
                              updateManualAssessment(assessment.id, 'weight', finalValue);
                            }}
                            className="w-20 text-center font-semibold border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                        
                        {/* Botón eliminar */}
                        {manualAssessments.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-600"
                            onClick={() => removeManualAssessment(assessment.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Input de Nota */}
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={5}
                        step={0.1}
                        value={
                          assessment.score !== null 
                            ? (assessment.score === 0 ? "" : assessment.score) 
                            : (simulatedScores[assessment.id] === 0 ? "" : simulatedScores[assessment.id] || "")
                        }
                        onChange={(e) => {
                          const value = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                          if (assessment.score !== null) {
                            updateManualAssessment(assessment.id, 'score', value);
                          } else {
                            handleSimulatedChange(assessment.id, value);
                          }
                        }}
                        className="w-20 text-center font-semibold border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.0"
                      />
                      <span className="text-sm text-muted-foreground">/5.0</span>
                    </div>

                    {/* Indicador de evaluación problemática */}
                    {isProblematic && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg cursor-help"
                           title={`Esta evaluación hace que el total exceda 100%. Reduce su porcentaje para continuar.`}>
                        ⚠️
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>

              {/* Indicador de peso total */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  Total: <span className={`font-bold ${weightCalculation.isOverLimit ? 'text-red-600' : 'text-green-600'}`}>
                    {weightCalculation.totalWeight.toFixed(1)}%
                  </span>
                  {weightCalculation.isOverLimit && (
                    <span className="text-red-600 ml-2">
                      (Excede 100% - {weightCalculation.remainingWeight.toFixed(1)}% disponible)
                    </span>
                  )}
                </span>
              </div>

              {/* Botones de control */}
              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addManualAssessment}
                  disabled={weightCalculation.totalWeight >= 100}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Agregar
                </Button>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={resetSimulation}>
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Limpiar
                  </Button>
                  <Button
                    size="sm"
                    onClick={calculateProjection}
                    disabled={weightCalculation.totalWeight === 0}
                  >
                    <Calculator className="w-3 h-3 mr-1" />
                    Calcular
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Proyección Final */}
          {showProjection && weightCalculation.totalWeight > 0 && (
            <ProyeccionFinal
              simulatedFinalGrade={simulatedFinalGrade}
              getGradeColor5={getGradeColor5}
              getGradeBg5={getGradeBg5}
              calculateNeededGrade={calculateNeededGrade}
            />
          )}

          {/* Mensaje de error cuando se excede 100% en modo manual */}
          {showProjection && !simulatorData && weightCalculation.isOverLimit && (
            <Card className="border-2 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <h3 className="font-medium text-red-800">Error en configuración</h3>
                    <p className="text-sm text-red-700">
                      La suma de porcentajes excede 100%. Reduce los porcentajes para poder calcular la proyección.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="px-4 pt-4 space-y-6" style={{ paddingBottom: 36 }}>
        {/* Header Compacto */}
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Simulador de Notas</h1>
            {simulatorData && (
              <p className="text-sm text-muted-foreground">
                {simulatorData.courseName} • Actual: <span className={`font-semibold ${getGradeColor5(simulatorData.currentGrade)}`}>
                  {simulatorData.currentGrade.toFixed(2)}/5.0
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Simulador - Todas las Evaluaciones */}
        <div className="space-y-1">
          <Card className="border-2">
            <CardContent className="pt-0 space-y-4">
              {/* Evaluaciones Calificadas */}
              {publishedAssessments.length > 0 && (
                <div className="space-y-3">
                  {publishedAssessments.map(assessment => (
                    <div key={assessment.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getAssessmentIcon(assessment.type)}
                        <div>
                          <div className="font-medium text-sm" title={assessment.name}>
                            {truncateText(assessment.name)}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{assessment.weight}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getGradeColor5(assessment.earnedScore!)}`}>
                          {assessment.earnedScore!.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">/5.0</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Separador entre secciones */}
              {publishedAssessments.length > 0 && upcomingAssessments.length > 0 && (
                <div className="border-t border-gray-200 my-4"></div>
              )}

              {/* Evaluaciones Pendientes */}
              {upcomingAssessments.length > 0 ? (
                <div className="space-y-4">
               
                  {/* Presets Compactos como slider horizontal */}
                  <div className="overflow-x-auto mb-4 scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                    <div className="flex gap-2 w-max min-w-full px-1">
                      <Button
                        size="sm"
                        variant={selectedPreset === 'conservative' ? "default" : "outline"}
                        onClick={() => applyPreset('conservative')}
                        className="text-xs whitespace-nowrap"
                      >
                        Conservador (3.0)
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedPreset === 'realistic' ? "default" : "outline"}
                        onClick={() => applyPreset('realistic')}
                        className="text-xs whitespace-nowrap"
                      >
                        Realista ({simulatorData?.currentGrade.toFixed(1) || '3.5'})
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedPreset === 'optimistic' ? "default" : "outline"}
                        onClick={() => applyPreset('optimistic')}
                        className="text-xs whitespace-nowrap"
                      >
                        Optimista (4.5)
                      </Button>
                    </div>
                  </div>

                  {/* Lista de Evaluaciones Pendientes */}
                  <div className="space-y-3">
                    {upcomingAssessments.map(assessment => {
                      const sim = simulatedScores[assessment.id];
                      return (
                        <div key={assessment.id} className="flex items-center justify-between p-3 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50/50">
                          <div className="flex items-center gap-3">
                            {getAssessmentIcon(assessment.type)}
                            <div>
                              <div className="font-medium text-sm" title={assessment.name}>
                                {truncateText(assessment.name)}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{assessment.weight}%</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-0">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={0}
                                max={5}
                                step={0.1}
                                value={sim === 0 ? "" : sim || ""}
                                onChange={(e) => handleSimulatedChange(assessment.id, e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)}
                                className="w-20 text-center font-semibold border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.0"
                              />
                            </div>
                            <span className="text-xs text-muted-foreground mt-1">/5.0</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Botón Reset y Calcular */}
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={resetSimulation}>
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Limpiar
                    </Button>
                    <Button size="sm" onClick={calculateProjection}>
                      <Calculator className="w-3 h-3 mr-1" />
                      Calcular Proyección
                    </Button>
                  </div>
                </div>
              ) : publishedAssessments.length > 0 ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-medium mb-1">¡Todas las evaluaciones completadas!</h3>
                  <p className="text-sm text-muted-foreground">
                    No hay evaluaciones pendientes para simular.
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Resultado Final - Solo cuando se calcula */}
          {showProjection && upcomingAssessments.length > 0 && (
            <ProyeccionFinal
              simulatedFinalGrade={simulatedFinalGrade}
              getGradeColor5={getGradeColor5}
              getGradeBg5={getGradeBg5}
              calculateNeededGrade={null}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
}

// Componente de loading para Suspense
function LoadingFallback() {
  return (
    <MainLayout>
      <div className="px-4 pt-4 space-y-6" style={{ paddingBottom: 36 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1">
            <h1 className="text-xl font-bold">Simulador de Notas</h1>
            <p className="text-sm text-muted-foreground">Cargando...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Cargando simulador...</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

// Wrapper con Suspense
function SimuladorNotasPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SimuladorNotasContent />
    </Suspense>
  );
}

// Export directo sin Suspense para evitar parpadeos/animaciones innecesarias
export default SimuladorNotasPage;
