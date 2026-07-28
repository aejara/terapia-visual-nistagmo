// sw.js - Service Worker v6.01
const CACHE_NAME = 'terapia-visual-v6.01';
const urlsToCache = [
  './index.html',
  './styles.css',
  './app.js',
  './juegos.js',
  './manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Obliga al Service Worker a instalarse inmediatamente
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // Borra las cachés antiguas
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});