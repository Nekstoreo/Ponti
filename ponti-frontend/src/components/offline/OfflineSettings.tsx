"use client";

import { useState, useEffect } from "react";
import { useOffline, formatCacheSize, formatLastSync } from "@/hooks/useOffline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
import {
  HardDrive,
  Trash2,
  RefreshCw,
  Download,
  Wifi,
  Settings,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DataCacheStatus } from "./OfflineIndicator";

interface OfflineSettingsProps {
  className?: string;
  showTitle?: boolean;
}

export default function OfflineSettings({ 
  className, 
  showTitle = true 
}: OfflineSettingsProps) {
  const {
    isOnline,
    isOfflineCapable,
    cacheSize,
    lastSync,
    clearCache,
    forceSync,
    getCacheSize,
    updateServiceWorker
  } = useOffline();

  const [loading, setLoading] = useState<{
    clearCache: boolean;
    forceSync: boolean;
    updateSW: boolean;
    getCacheSize: boolean;
  }>({
    clearCache: false,
    forceSync: false,
    updateSW: false,
    getCacheSize: false
  });

  const [settings, setSettings] = useState({
    autoSync: true,
    backgroundSync: true,
    cacheImages: true,
    cacheData: true,
    maxCacheSize: 50 // MB
  });

  const [operationResult, setOperationResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    // Cargar configuraciones desde localStorage
    const savedSettings = localStorage.getItem('ponti-offline-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading offline settings:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Guardar configuraciones en localStorage
    localStorage.setItem('ponti-offline-settings', JSON.stringify(settings));
  }, [settings]);

  const showResult = (type: 'success' | 'error', message: string) => {
    setOperationResult({ type, message });
    setTimeout(() => setOperationResult(null), 3000);
  };

  const handleClearCache = async () => {
    setLoading(prev => ({ ...prev, clearCache: true }));
    try {
      await clearCache();
      showResult('success', 'Caché limpiado exitosamente');
    } catch {
      showResult('error', 'Error al limpiar el caché');
    } finally {
      setLoading(prev => ({ ...prev, clearCache: false }));
    }
  };

  const handleForceSync = async () => {
    setLoading(prev => ({ ...prev, forceSync: true }));
    try {
      await forceSync();
      showResult('success', 'Sincronización completada');
    } catch {
      showResult('error', 'Error en la sincronización');
    } finally {
      setLoading(prev => ({ ...prev, forceSync: false }));
    }
  };

  const handleUpdateCacheSize = async () => {
    setLoading(prev => ({ ...prev, getCacheSize: true }));
    try {
      await getCacheSize();
    } catch (error) {
      console.error('Error updating cache size:', error);
    } finally {
      setLoading(prev => ({ ...prev, getCacheSize: false }));
    }
  };

  const handleUpdateServiceWorker = async () => {
    setLoading(prev => ({ ...prev, updateSW: true }));
    try {
      await updateServiceWorker();
      showResult('success', 'Service Worker actualizado');
    } catch {
      showResult('error', 'Error al actualizar Service Worker');
    } finally {
      setLoading(prev => ({ ...prev, updateSW: false }));
    }
  };

  const cacheUsagePercentage = Math.min((cacheSize / (settings.maxCacheSize * 1024 * 1024)) * 100, 100);

  if (!isOfflineCapable) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Wifi className="w-6 h-6 text-gray-400" />
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
          <Settings className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Configuración Offline</h2>
        </div>
      )}

      {/* Estado actual */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="w-4 h-4" />
            Estado del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Conexión</Label>
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">Online</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-sm">Offline</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Service Worker</Label>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Activo</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Uso del caché</Label>
              <span className="text-sm text-muted-foreground">
                {formatCacheSize(cacheSize)} / {settings.maxCacheSize} MB
              </span>
            </div>
            <Progress value={cacheUsagePercentage} className="h-2" />
          </div>

          {lastSync && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Última sincronización: {formatLastSync(lastSync)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estado de cachés de datos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <HardDrive className="w-4 h-4" />
            Estado de Datos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <DataCacheStatus
            cacheKey="/api/schedule"
            label="Horarios"
            lastFetch={lastSync || undefined}
          />
          <DataCacheStatus
            cacheKey="/api/grades"
            label="Calificaciones"
            lastFetch={lastSync || undefined}
          />
          <DataCacheStatus
            cacheKey="/api/wellness"
            label="Bienestar"
            lastFetch={lastSync || undefined}
          />
          <DataCacheStatus
            cacheKey="/api/announcements"
            label="Anuncios"
            lastFetch={lastSync || undefined}
          />
        </CardContent>
      </Card>

      {/* Configuraciones */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Configuraciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Sincronización automática</Label>
                <p className="text-xs text-muted-foreground">
                  Sincronizar datos cuando se recupere la conexión
                </p>
              </div>
              <Switch
                checked={settings.autoSync}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, autoSync: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Sincronización en segundo plano</Label>
                <p className="text-xs text-muted-foreground">
                  Actualizar datos automáticamente en segundo plano
                </p>
              </div>
              <Switch
                checked={settings.backgroundSync}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, backgroundSync: checked }))
                }
                disabled={!isOnline}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Cachear imágenes</Label>
                <p className="text-xs text-muted-foreground">
                  Descargar imágenes para uso offline
                </p>
              </div>
              <Switch
                checked={settings.cacheImages}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, cacheImages: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Cachear datos</Label>
                <p className="text-xs text-muted-foreground">
                  Guardar datos para acceso offline
                </p>
              </div>
              <Switch
                checked={settings.cacheData}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, cacheData: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Acciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <Button
              variant="outline"
              onClick={handleForceSync}
              disabled={!isOnline || loading.forceSync}
              className="justify-start"
            >
              <RefreshCw className={cn(
                "w-4 h-4 mr-2",
                loading.forceSync && "animate-spin"
              )} />
              {loading.forceSync ? 'Sincronizando...' : 'Forzar sincronización'}
            </Button>

            <Button
              variant="outline"
              onClick={handleUpdateCacheSize}
              disabled={loading.getCacheSize}
              className="justify-start"
            >
              <HardDrive className={cn(
                "w-4 h-4 mr-2",
                loading.getCacheSize && "animate-spin"
              )} />
              {loading.getCacheSize ? 'Calculando...' : 'Actualizar tamaño de caché'}
            </Button>

            <Button
              variant="outline"
              onClick={handleUpdateServiceWorker}
              disabled={loading.updateSW}
              className="justify-start"
            >
              <Download className={cn(
                "w-4 h-4 mr-2",
                loading.updateSW && "animate-spin"
              )} />
              {loading.updateSW ? 'Actualizando...' : 'Actualizar Service Worker'}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={loading.clearCache}
                  className="justify-start"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpiar caché
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Limpiar todo el caché?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará todos los datos guardados offline. 
                    Tendrás que descargar los datos nuevamente cuando tengas conexión.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearCache}>
                    Limpiar caché
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
              {operationResult.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
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

      {/* Información adicional */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 mb-1">
                Modo Offline Habilitado
              </p>
              <p className="text-blue-700">
                Ponti puede funcionar sin conexión a internet. Los datos se sincronizarán 
                automáticamente cuando se recupere la conexión.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
