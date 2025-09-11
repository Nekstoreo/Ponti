"use client";

import { useState, useEffect } from "react";
import { useOffline, formatLastSync } from "@/hooks/useOffline";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Wifi, WifiOff, Clock, CheckCircle } from "lucide-react";

interface OfflineIndicatorProps {
  variant?: 'minimal' | 'detailed' | 'toast';
  className?: string;
  showSyncButton?: boolean; // Mantenido para compatibilidad pero no se usa
}

export default function OfflineIndicator({ 
  variant = 'minimal', 
  className 
}: OfflineIndicatorProps) {
  const { 
    isOnline, 
    isOfflineCapable, 
    lastSync
  } = useOffline();

  if (!isOfflineCapable) {
    return null; // No mostrar nada si no tiene capacidades offline
  }

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {isOnline ? (
          <>
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <Wifi className="w-4 h-4 text-green-600" />
          </>
        ) : (
          <>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <WifiOff className="w-4 h-4 text-orange-600" />
          </>
        )}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <>
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <Wifi className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Conectado</p>
                  <p className="text-sm text-green-600">Datos actualizados</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
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
    );
  }

  if (variant === 'toast') {
    if (isOnline) return null; // Solo mostrar cuando está offline
    
    return (
      <div className={cn(
        "fixed bottom-4 left-4 right-4 mx-auto max-w-sm z-50",
        "bg-orange-100 border border-orange-200 rounded-lg p-3",
        "shadow-lg animate-in slide-in-from-bottom-2",
        className
      )}>
        <div className="flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-orange-600" />
          <div>
            <p className="font-medium text-orange-800">Sin conexión</p>
            <p className="text-sm text-orange-600">
              Tus datos siguen disponibles
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Hook simplificado para mostrar toast offline
export function useOfflineToast() {
  const { isOnline, isOfflineCapable } = useOffline();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!isOfflineCapable) return;
    
    if (!isOnline) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(timer);
    } else {
      setShowToast(false);
    }
  }, [isOnline, isOfflineCapable]);

  return showToast;
}

// Componente para mostrar estado de datos específicos (usado en configuración)
export function DataCacheStatus({ 
  label, 
  lastFetch 
}: { 
  cacheKey: string; 
  label: string; 
  lastFetch?: Date; 
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span className="font-medium">{label}</span>
      </div>
      <div className="text-sm text-gray-500">
        {lastFetch ? formatLastSync(lastFetch) : 'No sincronizado'}
      </div>
    </div>
  );
}
