// The Last-Mile Tutor Service Worker
const CACHE_NAME = 'lastmile-tutor-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/logo.svg',
  '/assets/index.js',
  '/assets/index.css'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static shell assets');
      return cache.addAll(STATIC_ASSETS).catch((e) => {
        console.warn('Some assets could not be pre-cached immediately:', e);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Evicting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. API calls: network first with offline fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (event.request.method === 'GET' && response.status === 200) {
            const respClone = response.clone();
            caches.open('lastmile-api-cache').then((cache) => {
              cache.put(event.request, respClone);
            });
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          return new Response(
            JSON.stringify({
              error: 'Offline mode active',
              offline: true,
              message: 'You are currently offline. Downloaded lessons work seamlessly.'
            }),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 503
            }
          );
        })
    );
    return;
  }

  // 2. HTML navigation documents: Network-First (prevents stale HTML serving old script hashes)
  if (event.request.mode === 'navigate' || event.request.destination === 'document' || url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          return caches.match('/');
        })
    );
    return;
  }

  // 3. Static assets: cache-first with network fallback
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchRes) => {
        if (fetchRes.status === 200) {
          const copy = fetchRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return fetchRes;
      });
    })
  );
});
