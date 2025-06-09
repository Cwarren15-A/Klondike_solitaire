const CACHE_NAME = 'klondike-solitaire-v1.0.0';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/tensorflow/4.15.0/tf.min.js'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for game statistics
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-stats') {
    console.log('📊 Syncing game statistics...');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Sync game statistics when online
  try {
    // In a real app, this would sync with a backend
    console.log('✅ Statistics synced');
  } catch (error) {
    console.error('❌ Failed to sync statistics:', error);
  }
}

// Push notifications (for daily challenges)
self.addEventListener('push', (event) => {
  console.log('📬 Push received');
  
  const options = {
    body: 'New daily challenge available! 🎯',
    icon: 'icon-192.png',
    badge: 'icon-72.png',
    vibrate: [200, 100, 200],
    data: {
      action: 'daily-challenge'
    },
    actions: [
      {
        action: 'play',
        title: 'Play Now'
      },
      {
        action: 'dismiss',
        title: 'Later'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Klondike Solitaire', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked');
  event.notification.close();

  if (event.action === 'play') {
    // Open app and navigate to daily challenge
    event.waitUntil(
      clients.openWindow('./?action=daily')
    );
  }
}); 