"use client";

import { useState } from "react";
import { useNotificationStore } from "@/store/notificationStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Bell, Clock, BookOpen, Calendar, Settings, Moon, Save } from "lucide-react";
import { NotificationSettings as NotificationSettingsType } from "@/data/types";

const notificationTypes = [
  {
    key: "classReminders" as const,
    title: "Recordatorios de Clases",
    description: "Recibe notificaciones antes de que comiencen tus clases",
    icon: Clock,
  },
  {
    key: "announcements" as const,
    title: "Anuncios",
    description: "Nuevos anuncios y noticias de la universidad",
    icon: Bell,
  },
  {
    key: "scheduleChanges" as const,
    title: "Cambios de Horario",
    description: "Modificaciones en tu horario académico",
    icon: Calendar,
  },
  {
    key: "serviceUpdates" as const,
    title: "Actualizaciones de Servicios",
    description: "Cambios en servicios universitarios",
    icon: Settings,
  },
  {
    key: "general" as const,
    title: "Notificaciones Generales",
    description: "Actualizaciones generales de la aplicación",
    icon: BookOpen,
  },
];

export function NotificationSettings() {
  const { settings, updateSettings } = useNotificationStore();
  const [localSettings, setLocalSettings] = useState<NotificationSettingsType>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleToggle = (key: keyof NotificationSettingsType, enabled: boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: typeof prev[key] === 'object' && prev[key] !== null
        ? { ...prev[key], enabled }
        : enabled
    }));
    setHasChanges(true);
  };

  const handleClassReminderMinutes = (minutes: number) => {
    setLocalSettings(prev => ({
      ...prev,
      classReminders: { ...prev.classReminders, minutesBefore: minutes }
    }));
    setHasChanges(true);
  };

  const handleAnnouncementImportantOnly = (importantOnly: boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      announcements: { ...prev.announcements, importantOnly }
    }));
    setHasChanges(true);
  };

  const handleQuietHoursToggle = (enabled: boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      quietHours: { ...prev.quietHours, enabled }
    }));
    setHasChanges(true);
  };

  const handleQuietHoursTime = (field: 'start' | 'end', value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      quietHours: { ...prev.quietHours, [field]: value }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateSettings(localSettings);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración de Notificaciones</h1>
        <p className="text-muted-foreground">
          Personaliza qué notificaciones quieres recibir y cuándo
        </p>
      </div>

      {/* Tipos de notificación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Tipos de Notificación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {notificationTypes.map(({ key, title, description, icon: Icon }) => (
            <div key={key} className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-muted rounded-lg mt-0.5">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <Label htmlFor={key} className="font-medium cursor-pointer">
                    {title}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {description}
                  </p>

                  {/* Configuración específica para recordatorios de clases */}
                  {key === 'classReminders' && localSettings.classReminders.enabled && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                      <Label className="text-sm font-medium">Minutos antes de la clase</Label>
                      <Select
                        value={localSettings.classReminders.minutesBefore.toString()}
                        onValueChange={(value) => handleClassReminderMinutes(parseInt(value))}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 minutos</SelectItem>
                          <SelectItem value="10">10 minutos</SelectItem>
                          <SelectItem value="15">15 minutos</SelectItem>
                          <SelectItem value="30">30 minutos</SelectItem>
                          <SelectItem value="60">1 hora</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Configuración específica para anuncios */}
                  {key === 'announcements' && localSettings.announcements.enabled && (
                    <div className="mt-3 flex items-center gap-2">
                      <Switch
                        id={`${key}-important-only`}
                        checked={localSettings.announcements.importantOnly}
                        onCheckedChange={handleAnnouncementImportantOnly}
                      />
                      <Label htmlFor={`${key}-important-only`} className="text-sm cursor-pointer">
                        Solo anuncios importantes
                      </Label>
                    </div>
                  )}
                </div>
              </div>
                <Switch
                  id={key}
                  checked={
                    typeof localSettings[key] === 'object' && localSettings[key] !== null
                      ? (localSettings[key] as { enabled: boolean }).enabled
                      : localSettings[key] as boolean
                  }
                  onCheckedChange={(checked) => handleToggle(key, checked)}
                />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Horas de silencio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Horas de Silencio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="quiet-hours" className="font-medium cursor-pointer">
                Activar horas de silencio
              </Label>
              <p className="text-sm text-muted-foreground">
                No recibir notificaciones durante las horas especificadas
              </p>
            </div>
            <Switch
              id="quiet-hours"
              checked={localSettings.quietHours.enabled}
              onCheckedChange={handleQuietHoursToggle}
            />
          </div>

          {localSettings.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <Label htmlFor="quiet-start" className="text-sm font-medium">
                  Hora de inicio
                </Label>
                <Input
                  id="quiet-start"
                  type="time"
                  value={localSettings.quietHours.start}
                  onChange={(e) => handleQuietHoursTime('start', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="quiet-end" className="text-sm font-medium">
                  Hora de fin
                </Label>
                <Input
                  id="quiet-end"
                  type="time"
                  value={localSettings.quietHours.end}
                  onChange={(e) => handleQuietHoursTime('end', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botones de acción */}
      {hasChanges && (
        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Guardar cambios
          </Button>
          <Button variant="outline" onClick={handleReset}>
            Restablecer
          </Button>
        </div>
      )}
    </div>
  );
}
