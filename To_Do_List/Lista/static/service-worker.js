const CACHE_NAME = 'to-do-list-cache-v1';
const OFFLINE_URLS = [
  '/',
  '/index.html',
  '/static/css/styles.css',
  '/static/js/app.js',
  '/static/icons/icon-192x192.png',
];

// Almacenar recursos en caché al instalar
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Archivos en caché:');
      return cache.addAll(OFFLINE_URLS);
    })
  );
});

// Activar el Service Worker y limpiar cachés antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('Eliminando caché antigua:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Manejar solicitudes `GET` y `POST`
self.addEventListener('fetch', event => {
  if (event.request.method === 'POST') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return guardarSolicitudOffline(event.request);
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});

// Guardar solicitudes `POST` offline
function guardarSolicitudOffline(request) {
  return request.clone().text().then(body => {
    const offlineRequests = JSON.parse(localStorage.getItem('offlineRequests')) || [];
    offlineRequests.push({
      url: request.url,
      method: request.method,
      body: body,
    });
    localStorage.setItem('offlineRequests', JSON.stringify(offlineRequests));
    console.log('Solicitud guardada para sincronización offline:', request.url);

    return new Response(
      JSON.stringify({ status: 'offline', message: 'Solicitud almacenada para sincronización.' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  });
}

// Sincronizar solicitudes offline al recuperar conexión
self.addEventListener('sync', event => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(sincronizarSolicitudesOffline());
  }
});

// Sincronizar solicitudes almacenadas
function sincronizarSolicitudesOffline() {
  const offlineRequests = JSON.parse(localStorage.getItem('offlineRequests')) || [];
  const promesas = offlineRequests.map(request => {
    return fetch(request.url, {
      method: request.method,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: request.body,
    });
  });

  return Promise.all(promesas).then(() => {
    console.log('Sincronización completa.');
    localStorage.removeItem('offlineRequests');
  });
}
