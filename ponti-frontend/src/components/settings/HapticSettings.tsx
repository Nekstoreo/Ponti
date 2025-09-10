"use client";

import { useHaptics, HapticIntensity } from "@/hooks/useHaptics";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Vibrate, Volume2, VolumeX } from "lucide-react";

export default function HapticSettings() {
  const { settings, updateSettings, isSupported, hapticFeedback } = useHaptics();

  const intensityOptions: { value: HapticIntensity; label: string; description: string }[] = [
    { value: 'off', label: 'Desactivado', description: 'Sin vibración' },
    { value: 'light', label: 'Ligero', description: 'Vibración sutil' },
    { value: 'medium', label: 'Medio', description: 'Vibración estándar' },
    { value: 'strong', label: 'Fuerte', description: 'Vibración intensa' },
  ];

  const testHaptics = [
    { pattern: 'light', label: 'Ligero', description: 'Interacciones básicas' },
    { pattern: 'medium', label: 'Medio', description: 'Botones y navegación' },
    { pattern: 'heavy', label: 'Fuerte', description: 'Acciones importantes' },
    { pattern: 'success', label: 'Éxito', description: 'Confirmaciones' },
    { pattern: 'error', label: 'Error', description: 'Alertas y errores' },
  ] as const;

  const handleIntensityChange = (intensity: HapticIntensity) => {
    updateSettings({ intensity });
    // Test the new intensity immediately
    if (intensity !== 'off') {
      setTimeout(() => hapticFeedback.buttonPress(), 100);
    }
  };

  const handleToggleEnabled = (enabled: boolean) => {
    updateSettings({ enabled });
    if (enabled) {
      setTimeout(() => hapticFeedback.toggleSwitch(), 100);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Vibrate className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Feedback Háptico</h2>
          {!isSupported && (
            <Badge variant="secondary" className="text-xs">
              No compatible
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Configura la vibración para las interacciones con la aplicación
        </p>
      </div>

      {!isSupported ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3 text-muted-foreground">
              <Smartphone className="w-12 h-12" />
              <div className="text-center">
                <h3 className="font-medium">Feedback háptico no disponible</h3>
                <p className="text-sm">Tu dispositivo no es compatible con vibración</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Master switch */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Activar feedback háptico</CardTitle>
                  <CardDescription>
                    Vibración en botones y interacciones importantes
                  </CardDescription>
                </div>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={handleToggleEnabled}
                />
              </div>
            </CardHeader>
          </Card>

          {/* Intensity settings */}
          {settings.enabled && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Intensidad</CardTitle>
                <CardDescription>
                  Ajusta la fuerza de la vibración
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {intensityOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleIntensityChange(option.value)}
                      className={`
                        p-3 rounded-lg border text-left transition-all duration-200
                        ${settings.intensity === option.value
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border hover:bg-accent'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {option.value === 'off' ? (
                          <VolumeX className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                        <span className="font-medium text-sm">{option.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test haptics */}
          {settings.enabled && settings.intensity !== 'off' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Probar vibración</CardTitle>
                <CardDescription>
                  Toca los botones para sentir diferentes tipos de vibración
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  {testHaptics.map((test) => (
                    <Button
                      key={test.pattern}
                      variant="outline"
                      onClick={() => hapticFeedback[test.pattern as keyof typeof hapticFeedback]?.()}
                      className="justify-between h-12"
                    >
                      <div className="text-left">
                        <div className="font-medium">{test.label}</div>
                        <div className="text-xs text-muted-foreground">{test.description}</div>
                      </div>
                      <Vibrate className="w-4 h-4" />
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* System settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configuración del sistema</CardTitle>
              <CardDescription>
                La vibración también depende de la configuración de tu dispositivo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Respetar configuración del sistema</p>
                  <p className="text-xs text-muted-foreground">
                    Desactivar si el modo silencioso está activo
                  </p>
                </div>
                <Switch
                  checked={settings.respectSystemSettings}
                  onCheckedChange={(respectSystemSettings) => 
                    updateSettings({ respectSystemSettings })
                  }
                />
              </div>
              
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <Smartphone className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium mb-1">Consejo:</p>
                    <p>
                      Si no sientes vibración, verifica que la vibración esté activada 
                      en la configuración de tu dispositivo y que no esté en modo silencioso.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
