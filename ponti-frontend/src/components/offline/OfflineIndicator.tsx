"use client";

import { useOffline, formatLastSync } from "@/hooks/useOffline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Download,
  Cloud,
  AlertTriangle 
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OfflineIndicatorProps {
  variant?: 'minimal' | 'full' | 'toast';
  className?: string;
  showSyncButton?: boolean;
}

export default function OfflineIndicator({ 
  variant = 'minimal', 
  className,
  showSyncButton = true 
}: OfflineIndicatorProps) {
  const { 
    isOnline, 
    isOfflineCapable, 
    lastSync, 
    forceSync 
  } = useOffline();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean | null>(null);

  const handleSync = async () => {
    if (!isOnline || isSyncing) return;
    
    setIsSyncing(true);
    setSyncSuccess(null);
    
    try {
      await forceSync();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(null), 3000);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncSuccess(false);
      setTimeout(() => setSyncSuccess(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {isOnline ? (
          <div className="flex items-center gap-1 text-green-600">
            <Wifi className="w-4 h-4" />
            {isOfflineCapable && (
              <Download className="w-3 h-3" />
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1 text-red-600">
            <WifiOff className="w-4 h-4" />
            {isOfflineCapable && (
              <Badge variant="secondary" className="text-xs px-1 py-0">
                Offline
              </Badge>
            )}
          </div>
        )}
        
        {showSyncButton && isOnline && !isSyncing && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSync}
            className="p-1 h-6 w-6"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        )}
        
        {isSyncing && (
          <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
        )}
      </div>
    );
  }

  if (variant === 'toast') {
    if (isOnline) return null;
    
    return (
      <div className={cn(
        "fixed top-4 left-4 right-4 z-50 mx-auto max-w-md",
        className
      )}>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <WifiOff className="w-5 h-5 text-orange-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-800">
                  Sin conexión a internet
                </p>
                <p className="text-xs text-orange-600">
                  {isOfflineCapable 
                    ? "Funcionalidad limitada disponible"
                    : "Algunas funciones no están disponibles"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Variant 'full'
  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Estado de conexión */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <>
                  <div className="flex items-center gap-2 text-green-600">
                    <Wifi className="w-5 h-5" />
                    <span className="font-medium">Conectado</span>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    Online
                  </Badge>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-red-600">
                    <WifiOff className="w-5 h-5" />
                    <span className="font-medium">Sin conexión</span>
                  </div>
                  <Badge variant="outline" className="text-red-600 border-red-200">
                    Offline
                  </Badge>
                </>
              )}
            </div>
            
            {isOfflineCapable && (
              <div className="flex items-center gap-1 text-blue-600">
                <Download className="w-4 h-4" />
                <span className="text-sm">PWA</span>
              </div>
            )}
          </div>

          {/* Capacidad offline */}
          {isOfflineCapable && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Cloud className="w-4 h-4" />
                <span>Modo offline habilitado</span>
              </div>
              
              {lastSync && (
                <div className="text-xs text-muted-foreground">
                  Última sincronización: {formatLastSync(lastSync)}
                </div>
              )}
            </div>
          )}

          {/* Botones de acción */}
          {isOnline && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={cn(
                  "w-4 h-4",
                  isSyncing && "animate-spin"
                )} />
                {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
              </Button>
              
              {syncSuccess === true && (
                <Badge variant="outline" className="text-green-600 border-green-200">
                  ✓ Sincronizado
                </Badge>
              )}
              
              {syncSuccess === false && (
                <Badge variant="outline" className="text-red-600 border-red-200">
                  ✗ Error
                </Badge>
              )}
            </div>
          )}

          {/* Advertencias offline */}
          {!isOnline && !isOfflineCapable && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">
                  Funcionalidad limitada
                </p>
                <p className="text-yellow-700">
                  Sin conexión, algunas funciones no están disponibles.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Hook para mostrar toast de conexión automáticamente
export function useOfflineToast() {
  const { isOnline } = useOffline();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(timer);
    } else {
      setShowToast(false);
    }
  }, [isOnline]);

  return showToast;
}

// Componente de estado para cachés de datos específicos
interface DataCacheStatusProps {
  cacheKey: string;
  label: string;
  lastFetch?: Date;
  className?: string;
}

export function DataCacheStatus({ 
  label, 
  lastFetch, 
  className 
}: DataCacheStatusProps) {
  const { isOnline } = useOffline();
  const [cacheStatus, setCacheStatus] = useState<'fresh' | 'stale' | 'missing'>('missing');

  useEffect(() => {
    // Verificar estado del caché específico
    if (lastFetch) {
      const now = new Date();
      const diff = now.getTime() - lastFetch.getTime();
      const isStale = diff > 3600000; // 1 hora
      setCacheStatus(isStale ? 'stale' : 'fresh');
    }
  }, [lastFetch]);

  const getStatusColor = () => {
    if (!isOnline) {
      return cacheStatus === 'missing' ? 'text-red-600' : 'text-orange-600';
    }
    return cacheStatus === 'fresh' ? 'text-green-600' : 'text-yellow-600';
  };

  const getStatusText = () => {
    if (!isOnline) {
      return cacheStatus === 'missing' ? 'No disponible' : 'Datos en caché';
    }
    return cacheStatus === 'fresh' ? 'Actualizado' : 'Necesita sync';
  };

  return (
    <div className={cn("flex items-center justify-between text-sm", className)}>
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className={getStatusColor()}>
          {getStatusText()}
        </span>
        <div className={cn(
          "w-2 h-2 rounded-full",
          getStatusColor().replace('text-', 'bg-')
        )} />
      </div>
    </div>
  );
}
