const CACHE_NAME = 'to-do-list-cache-v1';
const OFFLINE_URLS = [
  '/',
  '/index.html',
  '/static/css/styles.css',
  '/static/js/app.js',
  '/static/icons/icon-192x192.png',
];

// Instalar el Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caché cargado:', OFFLINE_URLS);
      return cache.addAll(OFFLINE_URLS);
    })
  );
});

// Activar el Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Eliminando caché antiguo:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Interceptar solicitudes para manejar offline
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

// Guardar solicitudes `POST` fallidas
function guardarSolicitudOffline(request) {
  return request.clone().text().then(body => {
    const offlineRequests = JSON.parse(localStorage.getItem('offlineRequests')) || [];
    offlineRequests.push({
      url: request.url,
      method: request.method,
      body: body,
    });
    localStorage.setItem('offlineRequests', JSON.stringify(offlineRequests));
    console.log('Solicitud guardada localmente:', request.url);
    return new Response(
      JSON.stringify({ status: 'offline', message: 'Solicitud almacenada para sincronización.' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  });
}

// Sincronizar solicitudes offline al volver la conexión
self.addEventListener('sync', event => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(
      sincronizarSolicitudesOffline()
    );
  }
});

// Función para sincronizar solicitudes offline
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
    console.log('Todas las solicitudes offline han sido sincronizadas.');
    localStorage.removeItem('offlineRequests');
  });
}
