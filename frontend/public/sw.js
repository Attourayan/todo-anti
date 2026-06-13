const CACHE_NAME = 'aesthetic-todo-v1';

// Static resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
  '/manifest.webmanifest',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/icon-maskable-192x192.png',
  '/icon-maskable-512x512.png',
];

// Install Event - cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline app shell');
      // Using cache.addAll with individual catch to avoid failure if some files aren't found immediately
      return Promise.allSettled(
        STATIC_ASSETS.map((asset) => 
          cache.add(asset).catch((err) => console.warn(`[Service Worker] Failed to pre-cache asset ${asset}:`, err))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - handle offline capabilities
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip caching for API requests, non-GET requests, chrome-extension requests, and hot module reloading
  if (
    request.method !== 'GET' || 
    url.pathname.startsWith('/api') || 
    url.pathname.includes('/_next/webpack-hmr') ||
    url.protocol === 'chrome-extension:' ||
    url.hostname === 'localhost' && url.port === '3000' && url.pathname.startsWith('/_next/data')
  ) {
    return;
  }

  // Caching strategy: Stale-While-Revalidate for JS, CSS, fonts, and static assets
  const isStaticAsset = 
    url.pathname.startsWith('/_next/static') || 
    url.pathname.startsWith('/static') ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/);

  if (isStaticAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch((err) => {
            console.warn('[Service Worker] Failed to fetch and cache asset:', err);
          });
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Caching strategy: Network-First with Cache Fallback for document routes/pages
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful page navigations
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails (offline mode)
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback to home page shell
          return caches.match('/');
        });
      })
  );
});

// Message listener for skipWaiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
