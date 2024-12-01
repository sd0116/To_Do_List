const archivosACachear = [
  '/',                                // Página principal
  '/index.html',                      // Archivo HTML principal
  '/static/icons/icon-192x192.png',   // Ícono
  '/static/css/styles.css',           // Hoja de estilos
  '/static/js/app.js',            // Archivo de JavaScript
];


// Instalar el Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
      caches.open(CACHE_NAME)
          .then(cache => {
              console.log('Archivos en caché');
              return cache.addAll(urlsToCache);
          })
  );
});

// Interceptar solicitudes y servir desde caché si es posible
self.addEventListener('fetch', event => {
  event.respondWith(
      caches.match(event.request)
          .then(response => {
              return response || fetch(event.request);
          })
  );
});