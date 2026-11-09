const CACHE_NAME = "semt-sinyal-v2";

const FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./data.json",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// İlk kurulumda uygulamanın dosyalarını sakla.
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES))
  );
});

// Yeni sürüm etkinleşince eski önbellekleri temizle.
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names
          .filter(name =>
            name.startsWith("semt-sinyal-") &&
            name !== CACHE_NAME
          )
          .map(name => caches.delete(name))
      )
    )
  );
});

// API sonuçlarını ayrı sorgular olarak saklama; çevrimdışında veri dosyası kullanılır.
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

// Önce internetten güncel dosyayı iste.
// İnternet yoksa saklanan kopyayı kullan.
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  if (
    event.request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith(new URL("./api/", self.location).pathname)
  ) {
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      try {
        const response = await fetch(event.request);

        if (response.ok) {
          await cache.put(event.request, response.clone());
          return response;
        }

        const saved = await cache.match(event.request);
        return saved || response;
      } catch {
        const saved = await cache.match(event.request);

        if (saved) return saved;

        return new Response("Bu içerik çevrimdışı kullanılamıyor.", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" }
        });
      }
    })()
  );
});