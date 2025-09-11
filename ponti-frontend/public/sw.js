// Service Worker para Ponti
const CACHE_NAME = 'ponti-v1.0.0';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 horas en ms

// Recursos a cachear inicialmente
const INITIAL_CACHE_URLS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Función para calcular el tamaño aproximado del caché
async function getCacheSize() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    let totalSize = 0;

    for (const request of keys) {
      try {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      } catch (error) {
        console.warn('[SW] Error calculating cache size for:', request.url, error);
      }
    }

    return totalSize;
  } catch (error) {
    console.error('[SW] Error getting cache size:', error);
    return 0;
  }
}

// Función para limpiar caché expirado
async function cleanExpiredCache() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();

    for (const request of keys) {
      try {
        const response = await cache.match(request);
        if (response) {
          const cacheDate = new Date(response.headers.get('sw-cache-date') || 0);
          const now = new Date();

          // Si el caché tiene más de 24 horas, eliminarlo
          if (now.getTime() - cacheDate.getTime() > CACHE_EXPIRY) {
            await cache.delete(request);
            console.log('[SW] Cache expired, removed:', request.url);
          }
        }
      } catch (error) {
        console.warn('[SW] Error cleaning expired cache for:', request.url, error);
      }
    }
  } catch (error) {
    console.error('[SW] Error cleaning expired cache:', error);
  }
}

// Evento de instalación
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker');

  event.waitUntil(
    Promise.all([
      // Cachear recursos iniciales
      caches.open(CACHE_NAME).then(cache => {
        console.log('[SW] Caching initial resources');
        return cache.addAll(INITIAL_CACHE_URLS.filter(url =>
          !url.includes('bundle.js') && !url.includes('main.css')
        ).map(url => new Request(url, {
          headers: { 'sw-cache-date': new Date().toISOString() }
        })));
      }),
      // Forzar activación inmediata
      self.skipWaiting()
    ])
  );
});

// Evento de activación
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');

  event.waitUntil(
    Promise.all([
      // Limpiar cachés antiguos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar control de todas las páginas abiertas
      self.clients.claim(),
      // Limpiar caché expirado
      cleanExpiredCache()
    ])
  );
});

// Evento de fetch (manejo de solicitudes)
self.addEventListener('fetch', (event) => {
  // Solo interceptar solicitudes GET
  if (event.request.method !== 'GET') return;

  // No cachear solicitudes de API por ahora
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    caches.match(event.request).then(response => {
      // Si encontramos en caché, devolverlo
      if (response) {
        return response;
      }

      // Si no está en caché, hacer la petición normal
      return fetch(event.request).then(networkResponse => {
        // Solo cachear respuestas exitosas
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Clonar la respuesta para cachearla
        const responseToCache = networkResponse.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, new Response(responseToCache.body, {
            status: responseToCache.status,
            statusText: responseToCache.statusText,
            headers: {
              ...Object.fromEntries(responseToCache.headers.entries()),
              'sw-cache-date': new Date().toISOString()
            }
          }));
        });

        return networkResponse;
      }).catch(() => {
        // Si falla la red y no hay caché, devolver página offline básica
        if (event.request.destination === 'document') {
          return caches.match('/').then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }

            // Respuesta básica si no hay nada en caché
            return new Response(
              `<html><body><h1>Ponti - Modo Offline</h1><p>Estás desconectado. Conecta a internet para continuar.</p></body></html>`,
              {
                headers: { 'Content-Type': 'text/html' }
              }
            );
          });
        }
      });
    })
  );
});

// Evento de mensajes (comunicación con la aplicación principal)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        console.log('[SW] Skipping waiting, activating immediately');
        self.skipWaiting();
        break;

      case 'GET_CACHE_SIZE':
        getCacheSize().then(size => {
          event.ports[0].postMessage({ size });
        }).catch(error => {
          console.error('[SW] Error getting cache size:', error);
          event.ports[0].postMessage({ error: error.message });
        });
        break;

      case 'CLEAR_CACHE':
        caches.open(CACHE_NAME).then(cache => {
          return cache.keys().then(requests => {
            return Promise.all(requests.map(request => cache.delete(request)));
          });
        }).then(() => {
          console.log('[SW] Cache cleared successfully');
          event.ports[0].postMessage({ success: true });
        }).catch(error => {
          console.error('[SW] Error clearing cache:', error);
          event.ports[0].postMessage({ error: error.message });
        });
        break;

      case 'CACHE_DATA':
        if (event.data.payload && event.data.payload.key && event.data.payload.data) {
          const { key, data } = event.data.payload;

          caches.open(CACHE_NAME).then(cache => {
            const response = new Response(JSON.stringify(data), {
              headers: {
                'Content-Type': 'application/json',
                'sw-cache-date': new Date().toISOString()
              }
            });

            return cache.put(new Request(key), response);
          }).then(() => {
            console.log('[SW] Data cached successfully:', key);
            event.ports[0].postMessage({ success: true });
          }).catch(error => {
            console.error('[SW] Error caching data:', error);
            event.ports[0].postMessage({ error: error.message });
          });
        } else {
          event.ports[0].postMessage({ error: 'Invalid payload for CACHE_DATA' });
        }
        break;

      default:
        console.log('[SW] Unknown message type:', event.data.type);
        event.ports[0].postMessage({ error: 'Unknown message type' });
    }
  }
});

// Evento de sincronización en segundo plano (si está disponible)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(
      // Aquí iría la lógica de sincronización en segundo plano
      Promise.resolve()
    );
  }
});
