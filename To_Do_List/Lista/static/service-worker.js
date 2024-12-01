const CACHE_NAME = 'to-do-list-cache-v1';
const archivosACachear = [
  '/',
  '/index.html',
  '/static/icons/icon-192x192.png',
  '/static/icons/icon-512x512.png',
  '/static/css/styles.css',
  '/static/js/app.js'
];

// Instalar el Service Worker y cachear archivos necesarios
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Archivos en caché durante la instalación:', archivosACachear);
      return cache.addAll(archivosACachear);
    })
  );
});

// Activar el Service Worker y limpiar cachés antiguos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Borrando caché antiguo:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Interceptar solicitudes y manejar `GET` y `POST`
self.addEventListener('fetch', event => {
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  } else if (event.request.method === 'POST') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return guardarSolicitudOffline(event.request);
      })
    );
  }
});

// Guardar solicitudes `POST` fallidas en IndexedDB o localStorage
function guardarSolicitudOffline(request) {
  return request.clone().text().then(body => {
    const offlineRequests = JSON.parse(localStorage.getItem('offlineRequests')) || [];
    offlineRequests.push({
      url: request.url,
      method: request.method,
      body: body
    });
    localStorage.setItem('offlineRequests', JSON.stringify(offlineRequests));
    console.log('Solicitud guardada para sincronización offline:', request.url);
    return new Response(
      JSON.stringify({ status: 'offline', message: 'Solicitud almacenada para sincronización.' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  });
}

// Sincronizar solicitudes cuando vuelva la conexión
self.addEventListener('sync', event => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(
      sincronizarSolicitudesOffline()
    );
  }
});

// Función para sincronizar solicitudes guardadas
function sincronizarSolicitudesOffline() {
  const offlineRequests = JSON.parse(localStorage.getItem('offlineRequests')) || [];
  const promesas = offlineRequests.map(request => {
    return fetch(request.url, {
      method: request.method,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: request.body
    });
  });

  return Promise.all(promesas).then(() => {
    console.log('Todas las solicitudes offline han sido sincronizadas.');
    localStorage.removeItem('offlineRequests');
  });
}
