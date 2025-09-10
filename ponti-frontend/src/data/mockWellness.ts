import { MoodEntry, WellnessRecommendation, WellnessInsight, WellnessMetrics } from "./types";
import { subDays, format } from "date-fns";

// Generar entradas de estado de ánimo para los últimos 30 días
export const generateMockMoodEntries = (): MoodEntry[] => {
  const entries: MoodEntry[] = [];
  
  for (let i = 0; i < 30; i++) {
    const date = subDays(new Date(), i);
    const dayOfWeek = date.getDay();
    
    // Simular patrones realistas: mejor ánimo en fin de semana, más estrés en martes/miércoles
    let baseMood = 3;
    if (dayOfWeek === 0 || dayOfWeek === 6) baseMood = 4; // Fin de semana
    if (dayOfWeek === 2 || dayOfWeek === 3) baseMood = 2.5; // Mitad de semana
    
    const randomVariation = (Math.random() - 0.5) * 2;
    const mood = Math.max(1, Math.min(5, Math.round(baseMood + randomVariation))) as MoodEntry['mood'];
    
    const stressLevel = mood >= 4 ? 'low' : mood >= 3 ? 'medium' : 'high';
    
    const activities = [];
    if (Math.random() > 0.6) activities.push('ejercicio');
    if (Math.random() > 0.5) activities.push('estudio');
    if (Math.random() > 0.7) activities.push('socializar');
    if (Math.random() > 0.8) activities.push('relajacion');
    
    entries.push({
      id: `mood_${i}`,
      date: date.toISOString(),
      mood,
      stressLevel,
      sleepHours: Math.random() > 0.2 ? Math.round((Math.random() * 4 + 5) * 10) / 10 : undefined,
      energy: Math.max(1, Math.min(5, mood + Math.round((Math.random() - 0.5) * 2))) as MoodEntry['energy'],
      focus: Math.max(1, Math.min(5, mood + Math.round((Math.random() - 0.5) * 2))) as MoodEntry['focus'],
      activities,
      notes: Math.random() > 0.7 ? 
        ['Día productivo', 'Me sentí cansado', 'Buen día de estudio', 'Estrés por exámenes', 'Día relajado'][Math.floor(Math.random() * 5)] : 
        undefined
    });
  }
  
  return entries.reverse(); // Orden cronológico
};

export const mockMoodEntries = generateMockMoodEntries();

export const mockWellnessRecommendations: WellnessRecommendation[] = [
  {
    id: 'rec_breathing',
    category: 'mental',
    title: 'Ejercicio de Respiración',
    description: 'Toma un momento para relajarte con técnicas de respiración profunda.',
    actionText: 'Respirar 5 min',
    priority: 'high',
    icon: '🧘‍♀️',
    estimatedTime: '5 min',
    isCompleted: false,
    tags: ['relajación', 'estrés', 'mindfulness']
  },
  {
    id: 'rec_walk',
    category: 'physical',
    title: 'Caminar al Aire Libre',
    description: 'Una caminata corta puede mejorar tu estado de ánimo y energía.',
    actionText: 'Caminar 15 min',
    priority: 'medium',
    icon: '🚶‍♂️',
    estimatedTime: '15 min',
    isCompleted: false,
    tags: ['ejercicio', 'naturaleza', 'energía']
  },
  {
    id: 'rec_study_break',
    category: 'academic',
    title: 'Tomar un Descanso',
    description: 'Has estado estudiando mucho. Es momento de descansar.',
    actionText: 'Descansar 10 min',
    priority: 'medium',
    icon: '⏰',
    estimatedTime: '10 min',
    isCompleted: true,
    tags: ['descanso', 'productividad', 'balance']
  },
  {
    id: 'rec_hydration',
    category: 'physical',
    title: 'Hidratación',
    description: 'Asegúrate de beber suficiente agua durante el día.',
    actionText: 'Beber agua',
    priority: 'low',
    icon: '💧',
    estimatedTime: '1 min',
    isCompleted: false,
    tags: ['salud', 'hidratación', 'bienestar']
  },
  {
    id: 'rec_social',
    category: 'social',
    title: 'Conectar con Amigos',
    description: 'El contacto social es importante para tu bienestar emocional.',
    actionText: 'Escribir a un amigo',
    priority: 'medium',
    icon: '💬',
    estimatedTime: '5 min',
    isCompleted: false,
    tags: ['amistad', 'conexión', 'apoyo']
  },
  {
    id: 'rec_sleep',
    category: 'physical',
    title: 'Mejor Rutina de Sueño',
    description: 'Intenta dormir 7-8 horas para mejor rendimiento académico.',
    actionText: 'Establecer alarma',
    priority: 'high',
    icon: '😴',
    estimatedTime: '2 min',
    isCompleted: false,
    tags: ['sueño', 'descanso', 'salud']
  },
  {
    id: 'rec_organization',
    category: 'academic',
    title: 'Organizar Tareas',
    description: 'Una lista de tareas te ayudará a reducir el estrés académico.',
    actionText: 'Crear lista',
    priority: 'medium',
    icon: '📝',
    estimatedTime: '10 min',
    isCompleted: false,
    tags: ['organización', 'productividad', 'estrés']
  },
  {
    id: 'rec_gratitude',
    category: 'mental',
    title: 'Práctica de Gratitud',
    description: 'Reflexiona sobre 3 cosas por las que te sientes agradecido hoy.',
    actionText: 'Escribir gratitudes',
    priority: 'low',
    icon: '🙏',
    estimatedTime: '5 min',
    isCompleted: false,
    tags: ['gratitud', 'mindfulness', 'positividad']
  }
];

export const mockWellnessInsights: WellnessInsight[] = [
  {
    id: 'insight_mood_trend',
    type: 'trend',
    title: 'Estado de Ánimo Mejorando',
    description: 'Tu estado de ánimo ha mejorado un 15% esta semana comparado con la anterior.',
    value: '+15%',
    trend: 'up',
    period: 'Esta semana',
    icon: '📈'
  },
  {
    id: 'insight_sleep_achievement',
    type: 'achievement',
    title: '7 Días de Buen Sueño',
    description: 'Has mantenido una rutina de sueño saludable durante una semana completa.',
    value: '7 días',
    period: 'Última semana',
    icon: '🏆'
  },
  {
    id: 'insight_stress_alert',
    type: 'alert',
    title: 'Estrés Elevado Detectado',
    description: 'Tus niveles de estrés han sido altos los últimos 3 días. Considera tomar descansos.',
    period: 'Últimos 3 días',
    icon: '⚠️'
  },
  {
    id: 'insight_exercise_suggestion',
    type: 'suggestion',
    title: 'Más Actividad Física',
    description: 'Agregar 20 minutos de ejercicio podría mejorar tu energía y estado de ánimo.',
    value: '20 min',
    period: 'Recomendación diaria',
    icon: '💪'
  },
  {
    id: 'insight_focus_trend',
    type: 'trend',
    title: 'Concentración Estable',
    description: 'Tu nivel de concentración se ha mantenido consistente este mes.',
    value: '3.8/5',
    trend: 'stable',
    period: 'Este mes',
    icon: '🎯'
  }
];

export const mockWellnessMetrics: WellnessMetrics = {
  averageMood: 3.4,
  averageStress: 'medium',
  averageSleep: 7.2,
  averageEnergy: 3.2,
  averageFocus: 3.8,
  streakDays: 5,
  completedRecommendations: 12,
  weeklyTrend: 'improving'
};

// Datos para gráficos de tendencias
export const getWeeklyMoodData = () => {
  const last7Days = mockMoodEntries.slice(-7);
  return last7Days.map(entry => ({
    date: format(new Date(entry.date), 'dd/MM'),
    mood: entry.mood,
    energy: entry.energy || 3,
    focus: entry.focus || 3,
    stress: entry.stressLevel === 'low' ? 1 : entry.stressLevel === 'medium' ? 2 : 3
  }));
};

export const getMoodDistribution = () => {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  mockMoodEntries.forEach(entry => {
    distribution[entry.mood]++;
  });
  
  return Object.entries(distribution).map(([mood, count]) => ({
    mood: `${mood} ${mood === '1' ? '😞' : mood === '2' ? '😔' : mood === '3' ? '😐' : mood === '4' ? '😊' : '😄'}`,
    count,
    percentage: Math.round((count / mockMoodEntries.length) * 100)
  }));
};

export const getActivityFrequency = () => {
  const activities: Record<string, number> = {};
  
  mockMoodEntries.forEach(entry => {
    entry.activities?.forEach(activity => {
      activities[activity] = (activities[activity] || 0) + 1;
    });
  });
  
  return Object.entries(activities)
    .map(([activity, count]) => ({ activity, count }))
    .sort((a, b) => b.count - a.count);
};
