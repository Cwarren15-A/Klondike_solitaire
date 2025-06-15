// Service Worker with NetworkFirst strategy for better updates
self.addEventListener('install', (event) => {
  console.log('🔄 Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activating...');
  event.waitUntil(
    Promise.all([
      // Take control of all clients as soon as it activates
      self.clients.claim(),
      // Clear all caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            console.log('🗑️ Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
    ])
  );
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⚡ Skipping waiting and activating new service worker');
    self.skipWaiting();
  }
});

// NetworkFirst strategy for all requests
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // For HTML requests, always go to network first
  if (event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the response for offline use
          const responseClone = response.clone();
          caches.open('html-cache').then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try the cache
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // For other resources, try network first, then cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache the response for offline use
        const responseClone = response.clone();
        caches.open('resource-cache').then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // If network fails, try the cache
        return caches.match(event.request);
      })
  );
});

//# sourceMappingURL=sw.js.map
