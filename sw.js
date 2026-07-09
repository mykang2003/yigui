const CACHE = 'yigui-v1';
const ASSETS = ['/yigui/', '/yigui/index.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  // Only handle same-origin requests
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) {
        // Return cache immediately, update in background
        const fetchPromise = fetch(e.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE).then((cache) => cache.put(e.request, clone));
          }
          return response;
        }).catch(() => cached);
        return cached;
      }

      // Not cached: fetch and cache for next time
      return fetch(e.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then((cache) => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline: return a fallback
        return caches.match('/yigui/index.html');
      });
    })
  );
});
