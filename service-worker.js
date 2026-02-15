const CACHE_NAME = 'zakupy-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.webmanifest'
];

// Instalacja - cache podstawowych plików
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache otwarty');
        return cache.addAll(urlsToCache);
      })
  );
});

// Pobieranie plików - najpierw cache, potem sieć
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - odpowiedź z cache
        if (response) {
          return response;
        }
        // Cache miss - pobierz z sieci
        return fetch(event.request).then(networkResponse => {
          // Zapisz w cache na przyszłość
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseClone);
              });
          }
          return networkResponse;
        });
      }).catch(() => {
        // Offline - pokaż cacheowaną stronę
        return caches.match('/index.html');
      })
  );
});
