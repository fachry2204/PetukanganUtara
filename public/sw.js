// Enhanced Service Worker for SiPetut PWA
const CACHE_NAME = 'sipetut-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// PUSH NOTIFICATION HANDLER
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : { title: 'Notifikasi SiPetut', message: 'Ada pembaruan informasi.' };
    
    const options = {
        body: data.message,
        icon: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Coat_of_arms_of_Jakarta.svg',
        badge: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Coat_of_arms_of_Jakarta.svg',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
        },
        actions: [
            { action: 'explore', title: 'Buka Aplikasi' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// CLICK NOTIFICATION HANDLER
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});
