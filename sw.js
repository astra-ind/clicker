// sw.js
const CACHE_NAME = 'pet-clicker-v1';
const ASSETS = [
  './',
  './index.html',
  './controller.html',
  './receiver.html',
  './style.css',
  './app.js',
  './controller.js',
  './receiver.js',
  './audio.js',
  './config.js',
  './store.js',
  './mqtt-client.js',
  './manifest.json',
  'https://unpkg.com/mqtt/dist/mqtt.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
