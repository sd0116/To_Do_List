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
