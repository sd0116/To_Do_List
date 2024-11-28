const archivosACachear = [
  '/',
  '/index.html',
  '/static/icons/icon-192x192.png',  // Verifica que esta ruta sea correcta
  '/styles.css',
  '/scripts.js',
];

self.addEventListener('install', evento => {
  evento.waitUntil(
    caches.open('nombreCache')
      .then(cache => {
        return cache.addAll(archivosACachear);
      })
      .catch(error => {
        console.error('Error al agregar archivos al caché:', error);
      })
  );
});
