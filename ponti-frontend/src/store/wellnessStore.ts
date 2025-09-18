import { create } from "zustand";
import { 
  MoodEntry, 
  WellnessRecommendation, 
  WellnessInsight, 
  WellnessMetrics,
  MoodLevel 
} from "@/data/types";
import { 
  mockMoodEntries,
  mockWellnessRecommendations,
  mockWellnessInsights,
  mockWellnessMetrics 
} from "@/data/mockWellness";

interface WellnessState {
  // Data
  moodEntries: MoodEntry[];
  recommendations: WellnessRecommendation[];
  insights: WellnessInsight[];
  metrics: WellnessMetrics;
  
  // UI State
  selectedPeriod: 'week' | 'month' | 'all';
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setMoodEntries: (entries: MoodEntry[]) => void;
  addMoodEntry: (entry: Omit<MoodEntry, 'id'>) => void;
  updateMoodEntry: (id: string, updates: Partial<MoodEntry>) => void;
  deleteMoodEntry: (id: string) => void;
  
  setRecommendations: (recommendations: WellnessRecommendation[]) => void;
  completeRecommendation: (id: string) => void;
  uncompleteRecommendation: (id: string) => void;
  
  setInsights: (insights: WellnessInsight[]) => void;
  setMetrics: (metrics: WellnessMetrics) => void;
  
  setSelectedPeriod: (period: 'week' | 'month' | 'all') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed getters
  getRecentMoodEntries: (days: number) => MoodEntry[];
  getActiveRecommendations: () => WellnessRecommendation[];
  getCompletedRecommendations: () => WellnessRecommendation[];
  getTodayMoodEntry: () => MoodEntry | undefined;
  getAverageMoodForPeriod: (days: number) => number;
  getStreakDays: () => number;
  
  // Utils
  refreshData: () => Promise<void>;
  calculateMetrics: () => void;
  initializeData: () => void;
}

export const useWellnessStore = create<WellnessState>((set, get) => ({
  // Initial state
  moodEntries: [],
  recommendations: [],
  insights: [],
  metrics: {
    averageMood: 0,
    averageStress: 'medium',
    averageSleep: 0,
    averageEnergy: 0,
    averageFocus: 0,
    streakDays: 0,
    completedRecommendations: 0,
    weeklyTrend: 'stable'
  },
  selectedPeriod: 'week',
  isLoading: false,
  error: null,

  // Basic setters
  setMoodEntries: (entries) => {
    set({ moodEntries: entries });
    get().calculateMetrics();
  },

  addMoodEntry: (entryData) => {
    const newEntry: MoodEntry = {
      ...entryData,
      id: `mood_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    set((state) => ({
      moodEntries: [newEntry, ...state.moodEntries].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    }));
    
    get().calculateMetrics();
  },

  updateMoodEntry: (id, updates) => {
    set((state) => ({
      moodEntries: state.moodEntries.map(entry =>
        entry.id === id ? { ...entry, ...updates } : entry
      )
    }));
    get().calculateMetrics();
  },

  deleteMoodEntry: (id) => {
    set((state) => ({
      moodEntries: state.moodEntries.filter(entry => entry.id !== id)
    }));
    get().calculateMetrics();
  },

  setRecommendations: (recommendations) => set({ recommendations }),

  completeRecommendation: (id) => {
    set((state) => ({
      recommendations: state.recommendations.map(rec =>
        rec.id === id ? { ...rec, isCompleted: true } : rec
      )
    }));
    get().calculateMetrics();
  },

  uncompleteRecommendation: (id) => {
    set((state) => ({
      recommendations: state.recommendations.map(rec =>
        rec.id === id ? { ...rec, isCompleted: false } : rec
      )
    }));
    get().calculateMetrics();
  },

  setInsights: (insights) => set({ insights }),
  setMetrics: (metrics) => set({ metrics }),
  setSelectedPeriod: (period) => set({ selectedPeriod: period }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // Computed getters
  getRecentMoodEntries: (days) => {
    const { moodEntries } = get();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return moodEntries.filter(entry => 
      new Date(entry.date) >= cutoffDate
    );
  },

  getActiveRecommendations: () => {
    const { recommendations } = get();
    return recommendations.filter(rec => !rec.isCompleted);
  },

  getCompletedRecommendations: () => {
    const { recommendations } = get();
    return recommendations.filter(rec => rec.isCompleted);
  },

  getTodayMoodEntry: () => {
    const { moodEntries } = get();
    const today = new Date().toISOString().split('T')[0];
    
    return moodEntries.find(entry => 
      entry.date.split('T')[0] === today
    );
  },

  getAverageMoodForPeriod: (days) => {
    const recentEntries = get().getRecentMoodEntries(days);
    if (recentEntries.length === 0) return 0;
    
    const sum = recentEntries.reduce((acc, entry) => acc + entry.mood, 0);
    return sum / recentEntries.length;
  },

  getStreakDays: () => {
    const { moodEntries } = get();
    if (moodEntries.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const hasEntry = moodEntries.some(entry => 
        entry.date.split('T')[0] === dateStr
      );
      
      if (hasEntry) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  },

  // Data operations
  refreshData: async () => {
    const { setLoading, setError, setMoodEntries, setRecommendations, setInsights, setMetrics } = get();
    
    setLoading(true);
    setError(null);
    
    try {
      // En una implementación real, esto sería llamadas a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMoodEntries(mockMoodEntries);
      setRecommendations(mockWellnessRecommendations);
      setInsights(mockWellnessInsights);
      setMetrics(mockWellnessMetrics);
    } catch (error) {
      setError('Error al cargar los datos de bienestar. Inténtalo de nuevo.');
      console.error('Error loading wellness data:', error);
    } finally {
      setLoading(false);
    }
  },

  calculateMetrics: () => {
    const { moodEntries, recommendations } = get();
    
    if (moodEntries.length === 0) return;
    
    // Calcular promedios de los últimos 30 días
    const recentEntries = get().getRecentMoodEntries(30);
    
    const averageMood = recentEntries.length > 0 ? 
      recentEntries.reduce((acc, entry) => acc + entry.mood, 0) / recentEntries.length : 0;
    
    const averageEnergy = recentEntries.length > 0 ? 
      recentEntries.reduce((acc, entry) => acc + (entry.energy || 3), 0) / recentEntries.length : 0;
    
    const averageFocus = recentEntries.length > 0 ? 
      recentEntries.reduce((acc, entry) => acc + (entry.focus || 3), 0) / recentEntries.length : 0;
    
    const sleepEntries = recentEntries.filter(entry => entry.sleepHours);
    const averageSleep = sleepEntries.length > 0 ? 
      sleepEntries.reduce((acc, entry) => acc + (entry.sleepHours || 0), 0) / sleepEntries.length : 0;
    
    // Calcular nivel de estrés promedio
    const stressLevels = recentEntries.map(entry => entry.stressLevel);
    const stressCounts = stressLevels.reduce((acc, level) => {
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const averageStress = 
      (stressCounts.high || 0) > (stressCounts.low || 0) ? 'high' :
      (stressCounts.medium || 0) > (stressCounts.low || 0) ? 'medium' : 'low';
    
    // Calcular tendencia semanal
    const thisWeek = get().getRecentMoodEntries(7);
    const lastWeek = get().getRecentMoodEntries(14).slice(-7);
    
    const thisWeekAvg = thisWeek.length > 0 ? 
      thisWeek.reduce((acc, entry) => acc + entry.mood, 0) / thisWeek.length : 0;
    const lastWeekAvg = lastWeek.length > 0 ? 
      lastWeek.reduce((acc, entry) => acc + entry.mood, 0) / lastWeek.length : 0;
    
    const weeklyTrend = 
      thisWeekAvg > lastWeekAvg + 0.2 ? 'improving' :
      thisWeekAvg < lastWeekAvg - 0.2 ? 'declining' : 'stable';
    
    const completedRecommendations = recommendations.filter(rec => rec.isCompleted).length;
    const streakDays = get().getStreakDays();
    
    set({
      metrics: {
        averageMood: Math.round(averageMood * 10) / 10,
        averageStress,
        averageSleep: Math.round(averageSleep * 10) / 10,
        averageEnergy: Math.round(averageEnergy * 10) / 10,
        averageFocus: Math.round(averageFocus * 10) / 10,
        streakDays,
        completedRecommendations,
        weeklyTrend
      }
    });
  },

  initializeData: () => {
    const { setMoodEntries, setRecommendations, setInsights, setMetrics } = get();
    setMoodEntries(mockMoodEntries);
    setRecommendations(mockWellnessRecommendations);
    setInsights(mockWellnessInsights);
    setMetrics(mockWellnessMetrics);
  },
}));

// Helper functions for mood and stress level display
export const getMoodEmoji = (mood: MoodLevel): string => {
  const emojis = { 1: '😞', 2: '😔', 3: '😐', 4: '😊', 5: '😄' };
  return emojis[mood];
};

export const getMoodLabel = (mood: MoodLevel): string => {
  const labels = { 1: 'Muy mal', 2: 'Mal', 3: 'Normal', 4: 'Bien', 5: 'Excelente' };
  return labels[mood];
};
