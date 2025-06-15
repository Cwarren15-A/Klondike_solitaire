// Aggressive cache busting service worker registration
if ('serviceWorker' in navigator) {
  // Clear all caches first
  if ('caches' in window) {
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          console.log('🗑️ Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      console.log('✅ Cleared all browser caches');
    });
  }
  
  // Unregister all existing service workers
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for (let registration of registrations) {
      console.log('🔄 Unregistering service worker');
      registration.unregister();
    }
    console.log('✅ Unregistered all service workers');
  });
  
  // Register new service worker with cache buster
  window.addEventListener('load', function() {
    const swUrl = './sw.js?v=' + Date.now();
    navigator.serviceWorker.register(swUrl, { scope: './' })
      .then(function(registration) {
        console.log('🔧 Service Worker registered with scope:', registration.scope);
        
        // Force update if there's a waiting worker
        if (registration.waiting) {
          registration.waiting.postMessage({type: 'SKIP_WAITING'});
        }
        
        // Check for updates every 5 seconds
        setInterval(function() {
          registration.update();
        }, 5000);
      })
      .catch(function(error) {
        console.error('❌ Service Worker registration failed:', error);
      });
  });
}