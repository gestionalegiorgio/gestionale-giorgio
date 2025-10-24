// sw.js — Service Worker per Gestionale Giorgio (PWA)
const VERSION = 'gg-v1.0.0';
const CACHE = `gg-cache-${VERSION}`;

// Costruisce URL assoluti a partire dallo scope (utile su GitHub Pages)
const u = (path) => new URL(path, self.registration.scope).toString();

// App Shell da mettere in cache per lavorare offline
const APP_SHELL = [
  u('./'),                    // /gestionale-giorgio/
  u('./index.html'),
  u('./manifest.webmanifest'),
  u('./icons/icon-192.png'),
  u('./icons/icon-512.png'),
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Strategia:
// - Pagine (navigate): network-first con fallback cache (così prendi subito aggiornamenti).
// - Asset GET: cache-first con aggiornamento in background.
self.addEventListener('fetch', (e) => {
  const req = e.request;

  // Solo GET
  if (req.method !== 'GET') return;

  // Richieste di navigazione (pagina)
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          // metto in cache l'ultima versione della pagina
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(u('./'), copy));
          return res;
        })
        .catch(() => caches.match(u('./')))
    );
    return;
  }

  // Altri asset: cache-first
  e.respondWith(
    caches.match(req).then((cached) => {
      const fetchAndCache = fetch(req)
        .then((res) => {
          // metto in cache solo risposte valide (status 200, tipo base)
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached); // se offline torna cache (se c'è)

      return cached || fetchAndCache;
    })
  );
});

// Messaggi opzionali da pagina per controllare l’SW
self.addEventListener('message', (e) => {
  const { type } = e.data || {};
  if (type === 'SKIP_WAITING') self.skipWaiting();
  if (type === 'CLEAR_CACHE') {
    e.waitUntil(
      caches.keys().then((keys) =>
        Promise.all(keys.map((k) => caches.delete(k))).then(() => self.skipWaiting())
      )
    );
  }
});
