"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOffline, formatLastSync } from "@/hooks/useOffline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Wifi, WifiOff, Info, CheckCircle, Clock, Calendar, GraduationCap, MapPin, Heart, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface OfflineSettingsProps {
  className?: string;
  showTitle?: boolean;
}

// Datos que están disponibles offline
const OFFLINE_DATA = [
  {
    key: 'schedule',
    label: 'Tu Horario',
    icon: Calendar,
    description: 'Consulta tus clases y horarios'
  },
  {
    key: 'grades',
    label: 'Calificaciones',
    icon: GraduationCap,
    description: 'Revisa tus notas y promedios'
  },
  {
    key: 'map',
    label: 'Mapa del Campus',
    icon: MapPin,
    description: 'Navega por el campus universitario'
  },
  {
    key: 'wellness',
    label: 'Bienestar',
    icon: Heart,
    description: 'Recursos de bienestar estudiantil'
  }
];

export default function OfflineSettings({
  className,
  showTitle = true
}: OfflineSettingsProps) {
  const router = useRouter();
  const {
    isOnline,
    isOfflineCapable,
    lastSync,
    clearCache
  } = useOffline();

  const [loading, setLoading] = useState(false);
  const [operationResult, setOperationResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showResult = (type: 'success' | 'error', message: string) => {
    setOperationResult({ type, message });
    setTimeout(() => setOperationResult(null), 3000);
  };

  const handleClearCache = async () => {
    setLoading(true);
    try {
      await clearCache();
      showResult('success', 'Datos offline eliminados correctamente');
    } catch {
      showResult('error', 'Error al eliminar los datos');
    } finally {
      setLoading(false);
    }
  };

  if (!isOfflineCapable) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <WifiOff className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Modo offline no disponible</h3>
              <p className="text-sm text-gray-500 mt-1">
                Tu navegador no soporta las funciones necesarias para el modo offline.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {showTitle && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <WifiOff className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Uso Sin Conexión</h2>
        </div>
      )}

      {/* Estado de conexión */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <>
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <Wifi className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Conectado</p>
                  <p className="text-sm text-green-600">Tus datos se mantienen actualizados</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-orange-500 rounded-full" />
                <WifiOff className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">Sin conexión</p>
                  <p className="text-sm text-orange-600">Usando datos guardados</p>
                </div>
              </>
            )}
          </div>
          
          {lastSync && (
            <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Última actualización: {formatLastSync(lastSync)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Datos disponibles offline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Lo que puedes usar sin internet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {OFFLINE_DATA.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                <Icon className="w-5 h-5 text-green-600 shrink-0" />
                <div>
                  <p className="font-medium text-green-800">{item.label}</p>
                  <p className="text-sm text-green-600">{item.description}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Información sobre limitaciones */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 mb-2">
                ¿Qué necesita conexión a internet?
              </p>
              <ul className="text-blue-700 space-y-1">
                <li>• Anuncios y notificaciones nuevas</li>
                <li>• Actualizar información personal</li>
                <li>• Enviar formularios y solicitudes</li>
                <li>• Funciones de chat y mensajería</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gestión de datos (solo si es necesario) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Gestión de Datos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Si necesitas liberar espacio en tu dispositivo, puedes eliminar los datos guardados. 
              Se volverán a descargar automáticamente cuando tengas conexión.
            </p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  disabled={loading}
                  className="w-full justify-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Liberar espacio
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar datos guardados?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esto eliminará tu horario, calificaciones y mapa guardados. 
                    Se volverán a descargar cuando tengas conexión a internet.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearCache}>
                    Eliminar datos
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Resultado de operaciones */}
      {operationResult && (
        <Card className={cn(
          "border-l-4",
          operationResult.type === 'success' 
            ? "border-l-green-500 bg-green-50" 
            : "border-l-red-500 bg-red-50"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className={cn(
                "text-sm font-medium",
                operationResult.type === 'success' 
                  ? "text-green-800" 
                  : "text-red-800"
              )}>
                {operationResult.message}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
