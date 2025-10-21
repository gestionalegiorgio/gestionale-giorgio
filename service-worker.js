// service-worker.js — v3 (icona fix)
const CACHE = "giorgio-cache-v3";
const ASSETS = [
  "/gestionale-giorgio/",
  "/gestionale-giorgio/index.html",
  "/gestionale-giorgio/manifest.webmanifest",
  "/gestionale-giorgio/icons/icon-192.png",
  "/gestionale-giorgio/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
