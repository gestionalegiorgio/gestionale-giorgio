self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("giorgio-cache").then((cache) => {
      return cache.addAll([
        "/gestionale-giorgio/index.html",
        "/gestionale-giorgio/logo.png"
      ]);
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
