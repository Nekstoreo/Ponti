"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  useWellnessStore, 
  getMoodEmoji, 
  getMoodLabel
} from "@/store/wellnessStore";
import { MoodLevel, StressLevel } from "@/data/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Heart,
  Zap,
  Focus,
  AlertTriangle,
  Clock,
  Save
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useHaptics } from "@/hooks/useHaptics";

const moodLevels: { level: MoodLevel; emoji: string; label: string; color: string }[] = [
  { level: 1, emoji: '😞', label: 'Muy mal', color: 'text-red-600' },
  { level: 2, emoji: '😔', label: 'Mal', color: 'text-orange-600' },
  { level: 3, emoji: '😐', label: 'Normal', color: 'text-yellow-600' },
  { level: 4, emoji: '😊', label: 'Bien', color: 'text-green-600' },
  { level: 5, emoji: '😄', label: 'Excelente', color: 'text-emerald-600' }
];

const stressLevels: { level: StressLevel; label: string; color: string }[] = [
  { level: 'low', label: 'Bajo', color: 'text-green-600' },
  { level: 'medium', label: 'Medio', color: 'text-yellow-600' },
  { level: 'high', label: 'Alto', color: 'text-red-600' }
];

const activities = [
  { id: 'ejercicio', label: 'Ejercicio', icon: '🏃‍♂️' },
  { id: 'estudio', label: 'Estudio', icon: '📚' },
  { id: 'socializar', label: 'Socializar', icon: '👥' },
  { id: 'relajacion', label: 'Relajación', icon: '🧘‍♀️' },
  { id: 'hobbies', label: 'Hobbies', icon: '🎨' },
  { id: 'trabajo', label: 'Trabajo', icon: '💼' },
  { id: 'familia', label: 'Familia', icon: '👨‍👩‍👧' },
  { id: 'naturaleza', label: 'Naturaleza', icon: '🌳' }
];

interface MoodTrackerProps {
  editingEntry?: { // Para futuras funcionalidades de edición
    id: string;
    mood: MoodLevel;
    stressLevel: StressLevel;
    sleepHours?: number;
    energy?: MoodLevel;
    focus?: MoodLevel;
    activities?: string[];
    notes?: string;
  };
  onSave?: () => void;
}

export default function MoodTracker({ editingEntry, onSave }: MoodTrackerProps) {
  const router = useRouter();
  const { hapticFeedback } = useHaptics();
  const { addMoodEntry, updateMoodEntry, getTodayMoodEntry } = useWellnessStore();
  
  const [selectedMood, setSelectedMood] = useState<MoodLevel>(3);
  const [selectedStress, setSelectedStress] = useState<StressLevel>('medium');
  const [sleepHours, setSleepHours] = useState<number[]>([7]);
  const [energy, setEnergy] = useState<number[]>([3]);
  const [focus, setFocus] = useState<number[]>([3]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const todayEntry = getTodayMoodEntry();
  const isEditing = !!editingEntry;
  const hasExistingEntry = !!todayEntry && !isEditing;

  useEffect(() => {
    if (editingEntry) {
      setSelectedMood(editingEntry.mood);
      setSelectedStress(editingEntry.stressLevel);
      setSleepHours([editingEntry.sleepHours || 7]);
      setEnergy([editingEntry.energy || 3]);
      setFocus([editingEntry.focus || 3]);
      setSelectedActivities(editingEntry.activities || []);
      setNotes(editingEntry.notes || '');
    } else if (hasExistingEntry) {
      setSelectedMood(todayEntry.mood);
      setSelectedStress(todayEntry.stressLevel);
      setSleepHours([todayEntry.sleepHours || 7]);
      setEnergy([todayEntry.energy || 3]);
      setFocus([todayEntry.focus || 3]);
      setSelectedActivities(todayEntry.activities || []);
      setNotes(todayEntry.notes || '');
    }
  }, [editingEntry, hasExistingEntry, todayEntry]);

  const handleMoodSelect = (mood: MoodLevel) => {
    setSelectedMood(mood);
    hapticFeedback.buttonPress();
  };

  const handleStressSelect = (stress: StressLevel) => {
    setSelectedStress(stress);
    hapticFeedback.buttonPress();
  };

  const handleActivityToggle = (activityId: string) => {
    setSelectedActivities(prev => 
      prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
    hapticFeedback.buttonPress();
  };

  const handleSave = async () => {
    setIsSaving(true);
    hapticFeedback.inputSubmit();

    try {
      const entryData = {
        date: new Date().toISOString(),
        mood: selectedMood,
        stressLevel: selectedStress,
        sleepHours: sleepHours[0],
        energy: energy[0] as MoodLevel,
        focus: focus[0] as MoodLevel,
        activities: selectedActivities,
        notes: notes.trim() || undefined
      };

      if (isEditing) {
        updateMoodEntry(editingEntry.id, entryData);
      } else if (hasExistingEntry) {
        updateMoodEntry(todayEntry.id, entryData);
      } else {
        addMoodEntry(entryData);
      }

      hapticFeedback.success();
      onSave?.();
      router.back();
    } catch (error) {
      console.error('Error saving mood entry:', error);
      hapticFeedback.error();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
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
        <div className="flex-1">
          <h1 className="text-lg font-bold">
            {isEditing ? 'Editar Estado' : hasExistingEntry ? 'Actualizar Estado' : 'Registrar Estado'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE, dd 'de' MMMM", { locale: es })}
          </p>
        </div>
        {hasExistingEntry && !isEditing && (
          <Badge variant="secondary" className="text-xs">
            Ya registrado
          </Badge>
        )}
      </div>

      {/* Mood Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="w-4 h-4" />
            ¿Cómo te sientes?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-5 gap-2">
            {moodLevels.map(({ level, emoji, label, color }) => (
              <button
                key={level}
                onClick={() => handleMoodSelect(level)}
                className={`
                  flex flex-col items-center p-3 rounded-lg transition-all duration-200
                  ${selectedMood === level 
                    ? 'bg-primary/10 border-2 border-primary scale-105' 
                    : 'bg-muted hover:bg-muted/80 border-2 border-transparent'
                  }
                `}
              >
                <span className="text-2xl mb-1">{emoji}</span>
                <span className={`text-xs font-medium ${selectedMood === level ? color : 'text-muted-foreground'}`}>
                  {label}
                </span>
              </button>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Estado seleccionado: <span className={moodLevels.find(m => m.level === selectedMood)?.color}>
                {getMoodEmoji(selectedMood)} {getMoodLabel(selectedMood)}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stress Level */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="w-4 h-4" />
            Nivel de Estrés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {stressLevels.map(({ level, label, color }) => (
              <button
                key={level}
                onClick={() => handleStressSelect(level)}
                className={`
                  p-3 rounded-lg text-center transition-all duration-200
                  ${selectedStress === level 
                    ? 'bg-primary/10 border-2 border-primary' 
                    : 'bg-muted hover:bg-muted/80 border-2 border-transparent'
                  }
                `}
              >
                <div className={`font-medium text-sm ${selectedStress === level ? color : 'text-muted-foreground'}`}>
                  {label}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Energy and Focus Levels */}
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="w-4 h-4" />
              Nivel de Energía: {energy[0]}/5
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Slider
              value={energy}
              onValueChange={setEnergy}
              max={5}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Muy baja</span>
              <span>Excelente</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Focus className="w-4 h-4" />
              Nivel de Concentración: {focus[0]}/5
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Slider
              value={focus}
              onValueChange={setFocus}
              max={5}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Muy baja</span>
              <span>Excelente</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sleep Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="w-4 h-4" />
            Horas de Sueño: {sleepHours[0]}h
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Slider
            value={sleepHours}
            onValueChange={setSleepHours}
            max={12}
            min={3}
            step={0.5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>3h</span>
            <span>12h</span>
          </div>
        </CardContent>
      </Card>

      {/* Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actividades del Día</CardTitle>
          <p className="text-sm text-muted-foreground">
            Selecciona las actividades que realizaste hoy
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {activities.map(activity => (
              <label
                key={activity.id}
                className={`
                  flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200
                  ${selectedActivities.includes(activity.id)
                    ? 'bg-primary/10 border-2 border-primary'
                    : 'bg-muted hover:bg-muted/80 border-2 border-transparent'
                  }
                `}
              >
                <Checkbox
                  checked={selectedActivities.includes(activity.id)}
                  onCheckedChange={() => handleActivityToggle(activity.id)}
                />
                <span className="text-lg">{activity.icon}</span>
                <span className="text-sm font-medium">{activity.label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notas Adicionales</CardTitle>
          <p className="text-sm text-muted-foreground">
            Agrega cualquier comentario sobre tu día (opcional)
          </p>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="¿Qué destacarías de tu día? ¿Algo específico que influyó en tu estado de ánimo?"
            value={notes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <div className="max-w-md mx-auto">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center gap-2"
            size="lg"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Guardando...' : isEditing ? 'Actualizar' : hasExistingEntry ? 'Actualizar Estado' : 'Registrar Estado'}
          </Button>
        </div>
      </div>
    </div>
  );
}
