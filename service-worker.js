const CACHE_NAME = 'gestionale-giorgio-v1';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icone/icona-192.png',
  './icone/icona-512.png'
];

// Install: salva i file base
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

// Attiva: rimuove cache vecchie
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: usa cache o rete
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(resp => 
      resp || fetch(event.request).then(r => {
        if (!r || r.status !== 200 || r.type !== 'basic') return r;
        const respClone = r.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, respClone));
        return r;
      })
    )
  );
});
