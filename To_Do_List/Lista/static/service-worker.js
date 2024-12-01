const archivosACachear = [
  '/',                                // Página principal
  '/index.html',                      // Archivo HTML principal
  '/static/icons/icon-192x192.png',   // Ícono
  '/static/css/styles.css',           // Hoja de estilos
  '/static/js/app.js',            // Archivo de JavaScript
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
