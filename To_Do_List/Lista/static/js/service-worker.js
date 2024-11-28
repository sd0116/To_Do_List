const CACHE_NAME = 'task-manager-cache-v1';
const urlsToCache = [
  '/',
  '/static/styles.css',
  '/static/scripts.js',
  '/static/icons/icon-192x192.png',
  '/static/icons/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
