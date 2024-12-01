importScripts('https://cdnjs.cloudflare.com/ajax/libs/idb/7.0.1/idb.min.js');

const CACHE_NAME = 'to-do-list-cache-v1';
const OFFLINE_URLS = [
    '/',
    '/index.html',
    '/static/css/styles.css',
    '/static/js/app.js',
    '/static/icons/icon-192x192.png',
];

const dbPromise = idb.openDB('offline-requests', 1, {
    upgrade(db) {
        db.createObjectStore('requests', { keyPath: 'id', autoIncrement: true });
    },
});

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
            fetch(event.request).catch(() => guardarSolicitudOffline(event.request))
        );
    } else {
        event.respondWith(
            caches.match(event.request).then(response => response || fetch(event.request))
        );
    }
});

// Guardar solicitudes `POST` offline
async function guardarSolicitudOffline(request) {
    const db = await dbPromise;
    const clonedRequest = request.clone();
    const body = await clonedRequest.text();
    await db.add('requests', {
        url: clonedRequest.url,
        method: clonedRequest.method,
        headers: [...clonedRequest.headers],
        body,
    });
    console.log('Solicitud guardada en IndexedDB:', clonedRequest.url);

    return new Response(
        JSON.stringify({ status: 'offline', message: 'Solicitud almacenada para sincronización.' }),
        { headers: { 'Content-Type': 'application/json' } }
    );
}

async function sincronizarSolicitudesOffline() {
  const db = await dbPromise;
  const requests = await db.getAll('requests');

  const promesas = requests.map(request => {
      const headers = new Headers();
      request.headers.forEach(([key, value]) => headers.append(key, value));

      return fetch(request.url, {
          method: request.method,
          headers: headers,
          body: request.body,
      })
          .then(() => {
              console.log('Solicitud sincronizada:', request.url);
              // Eliminar solicitud de IndexedDB después de sincronizar
              return db.delete('requests', request.id);
          })
          .catch(error => {
              console.error('Error al sincronizar solicitud:', error);
          });
  });

  // Esperar a que todas las promesas terminen
  return Promise.all(promesas).then(() => {
      console.log('Sincronización completa.');
  });
}


// Manejar evento de sincronización
self.addEventListener('sync', event => {
    if (event.tag === 'sync-tasks') {
        event.waitUntil(sincronizarSolicitudesOffline());
    }
});
