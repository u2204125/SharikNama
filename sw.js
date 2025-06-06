// sw.js - Service Worker for SharikNama Offline Support
const CACHE_NAME = 'shariknama-cache-v1';
const OFFLINE_URLS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './img/cow.png',
  './img/goat.png',
  // Add more assets if needed
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(response =>
      response || fetch(event.request)
    )
  );
});
