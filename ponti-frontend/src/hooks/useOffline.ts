"use client";

import { useState, useEffect, useCallback } from 'react';

export interface OfflineState {
  isOnline: boolean;
  isOfflineCapable: boolean;
  cacheSize: number;
  lastSync: Date | null;
  serviceWorkerRegistration: ServiceWorkerRegistration | null;
}

export interface OfflineActions {
  clearCache: () => Promise<void>;
  forceSync: () => Promise<void>;
  cacheData: (key: string, data: unknown) => Promise<void>;
  getCacheSize: () => Promise<number>;
  updateServiceWorker: () => Promise<void>;
}

interface UseOfflineReturn extends OfflineState, OfflineActions {}

export function useOffline(): UseOfflineReturn {
  const [state, setState] = useState<OfflineState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isOfflineCapable: false,
    cacheSize: 0,
    lastSync: null,
    serviceWorkerRegistration: null
  });

  // Registrar Service Worker
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('[Offline] Service Worker registered:', registration);

        setState(prev => ({
          ...prev,
          isOfflineCapable: true,
          serviceWorkerRegistration: registration
        }));

        // Escuchar actualizaciones del SW
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[Offline] New Service Worker available');
                // Notificar al usuario que hay una actualización disponible
                dispatchEvent(new CustomEvent('sw-update-available'));
              }
            });
          }
        });

      } catch (error) {
        console.error('[Offline] Service Worker registration failed:', error);
      }
    };

    registerServiceWorker();
  }, []);


  // Monitorear estado de conexión
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      console.log('[Offline] Connection restored');
      setState(prev => ({ ...prev, isOnline: true, lastSync: new Date() }));
      
      // Trigger background sync
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then(registration => {
          const syncManager = (registration as unknown as { sync: { register: (tag: string) => Promise<void> } }).sync;
          return syncManager.register('background-sync');
        }).catch(error => {
          console.error('[Offline] Background sync registration failed:', error);
        });
      }
    };

    const handleOffline = () => {
      console.log('[Offline] Connection lost');
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Comunicación con Service Worker
  const sendMessageToSW = useCallback(async (message: Record<string, unknown>): Promise<Record<string, unknown>> => {
    if (!state.serviceWorkerRegistration?.active) {
      throw new Error('Service Worker not available');
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data);
        }
      };

      state.serviceWorkerRegistration!.active!.postMessage(message, [messageChannel.port2]);
    });
  }, [state.serviceWorkerRegistration]);

  // Actualizar tamaño del caché
  const updateCacheSize = useCallback(async () => {
    try {
      const response = await sendMessageToSW({ type: 'GET_CACHE_SIZE' });
      const size = typeof response.size === 'number' ? response.size : 0;
      setState(prev => ({ ...prev, cacheSize: size }));
      return size;
    } catch (error) {
      console.error('[Offline] Error getting cache size:', error);
      return 0;
    }
  }, [sendMessageToSW]);

  // Obtener tamaño inicial del caché después de registrar SW
  useEffect(() => {
    if (state.serviceWorkerRegistration?.active) {
      updateCacheSize().catch(console.error);
    }
  }, [state.serviceWorkerRegistration, updateCacheSize]);

  // Limpiar caché
  const clearCache = useCallback(async () => {
    try {
      await sendMessageToSW({ type: 'CLEAR_CACHE' });
      setState(prev => ({ ...prev, cacheSize: 0 }));
      console.log('[Offline] Cache cleared successfully');
    } catch (error) {
      console.error('[Offline] Error clearing cache:', error);
      throw error;
    }
  }, [sendMessageToSW]);

  // Forzar sincronización
  const forceSync = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      throw new Error('Background sync not supported');
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const syncManager = (registration as unknown as { sync: { register: (tag: string) => Promise<void> } }).sync;
      await syncManager.register('background-sync');
      setState(prev => ({ ...prev, lastSync: new Date() }));
      console.log('[Offline] Sync triggered successfully');
    } catch (error) {
      console.error('[Offline] Error triggering sync:', error);
      throw error;
    }
  }, []);

  // Cachear datos manualmente
  const cacheData = useCallback(async (key: string, data: unknown) => {
    try {
      await sendMessageToSW({
        type: 'CACHE_DATA',
        payload: { key, data }
      });
      await updateCacheSize();
      console.log('[Offline] Data cached successfully:', key);
    } catch (error) {
      console.error('[Offline] Error caching data:', error);
      throw error;
    }
  }, [sendMessageToSW, updateCacheSize]);

  // Obtener tamaño del caché
  const getCacheSize = useCallback(async () => {
    return await updateCacheSize();
  }, [updateCacheSize]);

  // Actualizar Service Worker
  const updateServiceWorker = useCallback(async () => {
    if (!state.serviceWorkerRegistration) {
      throw new Error('Service Worker not registered');
    }

    try {
      await state.serviceWorkerRegistration.update();
      
      // Skip waiting if there's a waiting worker
      if (state.serviceWorkerRegistration.waiting) {
        state.serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      
      console.log('[Offline] Service Worker updated');
    } catch (error) {
      console.error('[Offline] Error updating Service Worker:', error);
      throw error;
    }
  }, [state.serviceWorkerRegistration]);

  return {
    // State
    isOnline: state.isOnline,
    isOfflineCapable: state.isOfflineCapable,
    cacheSize: state.cacheSize,
    lastSync: state.lastSync,
    serviceWorkerRegistration: state.serviceWorkerRegistration,
    
    // Actions
    clearCache,
    forceSync,
    cacheData,
    getCacheSize,
    updateServiceWorker
  };
}

// Hook para detectar si una petición viene del caché
export function useOfflineData<T>(
  fetchFn: () => Promise<T>,
  cacheKey?: string,
  options?: {
    staleTime?: number; // Tiempo en ms antes de considerar datos obsoletos
    refetchOnReconnect?: boolean;
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const [cacheDate, setCacheDate] = useState<Date | null>(null);
  const { isOnline, cacheData } = useOffline();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchFn();
      setData(response);
      setIsFromCache(false);
      setCacheDate(null);

      // Cachear datos si hay una clave
      if (cacheKey && 'cacheData' in window) {
        await cacheData(cacheKey, response);
      }
    } catch (fetchError) {
      console.error('[OfflineData] Fetch error:', fetchError);
      setError(fetchError as Error);
      setIsFromCache(true);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, cacheKey, cacheData]);

  // Fetch inicial
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch cuando se recupera la conexión
  useEffect(() => {
    if (isOnline && options?.refetchOnReconnect && isFromCache) {
      fetchData();
    }
  }, [isOnline, options?.refetchOnReconnect, isFromCache, fetchData]);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    isFromCache,
    cacheDate,
    refetch
  };
}

// Utilidades para formatear
export function formatCacheSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  
  return `${size.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

export function formatLastSync(date: Date | null): string {
  if (!date) return 'Nunca';
  
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (minutes < 1) return 'Ahora mismo';
  if (minutes < 60) return `Hace ${minutes} min`;
  if (hours < 24) return `Hace ${hours} hora${hours !== 1 ? 's' : ''}`;
  return `Hace ${days} día${days !== 1 ? 's' : ''}`;
}
