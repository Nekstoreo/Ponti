// Service Worker para Ponti - Modo Offline
const CACHE_NAME = 'ponti-cache-v1';
const STATIC_CACHE = 'ponti-static-v1';
const DATA_CACHE = 'ponti-data-v1';

// Recursos críticos para caché estático
const STATIC_FILES = [
  '/',
  '/horario',
  '/mapa',
  '/bienestar',
  '/calificaciones',
  '/mas',
  '/manifest.json',
  '/_next/static/css/app/layout.css',
];

// Rutas de datos críticos para caché dinámico
const DATA_ROUTES = [
  '/api/schedule',
  '/api/grades',
  '/api/wellness',
  '/api/announcements',
  '/api/notifications',
  '/api/poi'
];

// Estrategias de caché
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only'
};

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    Promise.all([
      // Caché estático
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES.map(url => new Request(url, {
          credentials: 'same-origin'
        })));
      }),
      // Caché de datos
      caches.open(DATA_CACHE).then((cache) => {
        console.log('[SW] Data cache initialized');
        return cache;
      })
    ]).then(() => {
      console.log('[SW] Installation completed');
      return self.skipWaiting();
    })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    Promise.all([
      // Limpiar cachés obsoletos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DATA_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar control de todas las pestañas
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Activation completed');
    })
  );
});

// Interceptar peticiones de red
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo manejar peticiones HTTP/HTTPS del mismo origen
  if (!url.protocol.startsWith('http') || url.origin !== self.location.origin) {
    return;
  }

  // Determinar estrategia de caché
  if (isStaticFile(request)) {
    event.respondWith(handleStaticFile(request));
  } else if (isDataRequest(request)) {
    event.respondWith(handleDataRequest(request));
  } else if (isPageRequest(request)) {
    event.respondWith(handlePageRequest(request));
  }
});

// Verificar si es un archivo estático
function isStaticFile(request) {
  return request.destination === 'script' ||
         request.destination === 'style' ||
         request.destination === 'image' ||
         request.destination === 'font' ||
         request.url.includes('/_next/static/');
}

// Verificar si es una petición de datos
function isDataRequest(request) {
  return DATA_ROUTES.some(route => request.url.includes(route)) ||
         request.url.includes('/api/');
}

// Verificar si es una petición de página
function isPageRequest(request) {
  return request.mode === 'navigate';
}

// Manejar archivos estáticos - Cache First
async function handleStaticFile(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Static file fetch failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Manejar peticiones de datos - Network First con fallback a caché
async function handleDataRequest(request) {
  const cache = await caches.open(DATA_CACHE);
  const cacheKey = getCacheKey(request);
  
  try {
    // Intentar red primero
    const networkResponse = await fetch(request, {
      timeout: 3000 // 3 segundos timeout
    });
    
    if (networkResponse.status === 200) {
      // Guardar en caché con timestamp
      const responseToCache = networkResponse.clone();
      const cachedData = {
        data: await responseToCache.json(),
        timestamp: Date.now(),
        url: request.url
      };
      
      cache.put(cacheKey, new Response(JSON.stringify(cachedData), {
        headers: {
          'Content-Type': 'application/json',
          'X-Cache-Status': 'fresh'
        }
      }));
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network request failed, trying cache:', error);
    
    // Fallback a caché
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      const cachedData = await cachedResponse.json();
      
      // Verificar si los datos están frescos (menos de 1 hora)
      const isStale = Date.now() - cachedData.timestamp > 3600000; // 1 hora
      
      return new Response(JSON.stringify(cachedData.data), {
        headers: {
          'Content-Type': 'application/json',
          'X-Cache-Status': isStale ? 'stale' : 'fresh',
          'X-Cache-Date': new Date(cachedData.timestamp).toISOString()
        }
      });
    }
    
    // No hay datos en caché
    return new Response(JSON.stringify({
      error: 'Sin conexión y no hay datos en caché',
      offline: true,
      timestamp: Date.now()
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'X-Cache-Status': 'miss'
      }
    });
  }
}

// Manejar peticiones de páginas - Cache First con fallback
async function handlePageRequest(request) {
  try {
    // Intentar red primero para páginas
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Page fetch failed, trying cache:', error);
    
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback a página principal si no hay caché
    const indexResponse = await cache.match('/');
    if (indexResponse) {
      return indexResponse;
    }
    
    // Respuesta offline por defecto
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ponti - Sin Conexión</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: system-ui, sans-serif; 
              text-align: center; 
              padding: 2rem;
              background: #f3f4f6;
            }
            .offline-container {
              background: white;
              border-radius: 12px;
              padding: 2rem;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              max-width: 400px;
              margin: 0 auto;
            }
            .offline-icon { font-size: 3rem; margin-bottom: 1rem; }
            .offline-title { color: #374151; margin-bottom: 0.5rem; }
            .offline-message { color: #6b7280; margin-bottom: 1.5rem; }
            .retry-button {
              background: #3b82f6;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 8px;
              cursor: pointer;
              font-size: 1rem;
            }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <div class="offline-icon">📱</div>
            <h1 class="offline-title">Sin Conexión</h1>
            <p class="offline-message">
              No hay conexión a internet. Algunas funciones pueden estar limitadas.
            </p>
            <button class="retry-button" onclick="location.reload()">
              Reintentar
            </button>
          </div>
        </body>
      </html>
    `, {
      status: 503,
      headers: {
        'Content-Type': 'text/html'
      }
    });
  }
}

// Generar clave de caché para peticiones de datos
function getCacheKey(request) {
  const url = new URL(request.url);
  return `${url.pathname}${url.search}`;
}

// Manejar mensajes desde la aplicación
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_SIZE':
      getCacheSize().then(size => {
        event.ports[0].postMessage({ size });
      });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    case 'CACHE_DATA':
      cacheData(payload.key, payload.data).then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
  }
});

// Obtener tamaño del caché
async function getCacheSize() {
  try {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      
      for (const key of keys) {
        const response = await cache.match(key);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }
    
    return totalSize;
  } catch (error) {
    console.error('[SW] Error calculating cache size:', error);
    return 0;
  }
}

// Limpiar todos los cachés
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('[SW] All caches cleared');
  } catch (error) {
    console.error('[SW] Error clearing caches:', error);
  }
}

// Cachear datos específicos
async function cacheData(key, data) {
  try {
    const cache = await caches.open(DATA_CACHE);
    const cacheData = {
      data,
      timestamp: Date.now(),
      manual: true
    };
    
    await cache.put(key, new Response(JSON.stringify(cacheData), {
      headers: { 'Content-Type': 'application/json' }
    }));
  } catch (error) {
    console.error('[SW] Error caching data:', error);
  }
}

// Sincronización en segundo plano
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Sincronizar datos críticos cuando se recupere la conexión
    const cache = await caches.open(DATA_CACHE);
    const keys = await cache.keys();
    
    for (const key of keys) {
      try {
        const response = await fetch(key.url);
        if (response.status === 200) {
          const data = await response.json();
          await cacheData(key.url, data);
        }
      } catch (error) {
        console.log('[SW] Sync failed for:', key.url);
      }
    }
    
    console.log('[SW] Background sync completed');
  } catch (error) {
    console.error('[SW] Background sync error:', error);
  }
}
