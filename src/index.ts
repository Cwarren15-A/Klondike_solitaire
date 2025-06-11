// Service Worker Registration
if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('✅ Service Worker registered:', registration);
    })
    .catch(error => {
      console.warn('⚠️ Service Worker registration failed:', error);
    });
} else {
  console.log('ℹ️ Service Worker not registered: Not in secure context');
} 