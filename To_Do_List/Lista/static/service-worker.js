const CACHE_NAME = 'to-do-list-cache-v1'; // Nombre del caché
const archivosACachear = [
  '/',                                // Página principal
  '/index.html',                      // Archivo HTML principal
  '/static/icons/icon-192x192.png',   // Ícono
  '/static/icons/icon-512x512.png',   // Ícono adicional
  '/static/css/styles.css',           // Hoja de estilos
  '/static/js/app.js'                 // Archivo de JavaScript
];

// Instalar el Service Worker y cachear archivos necesarios
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Archivos en caché durante la instalación:', archivosACachear);
        return cache.addAll(archivosACachear); // Agregar todos los archivos al caché
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

// Interceptar solicitudes y servir desde caché si es posible
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si el archivo está en caché, se devuelve desde allí, de lo contrario, se realiza una solicitud normal
        return response || fetch(event.request);
      })
      .catch(() => {
        // Manejo opcional para recursos que no están disponibles en caché ni en red
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});
