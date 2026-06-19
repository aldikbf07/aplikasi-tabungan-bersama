// public/service-worker.js
const CACHE_NAME = 'savings-app-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Install Service Worker
self.addEventListener('install', function(event) {
  console.log('📦 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('📦 Cache opened');
        return cache.addAll(urlsToCache).catch(error => {
          console.warn('⚠️ Some files failed to cache:', error);
        });
      })
      .then(() => {
        console.log('✅ Service Worker installed');
        return self.skipWaiting();
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', function(event) {
  console.log('🚀 Service Worker activating...');
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
    .then(() => {
      console.log('✅ Service Worker activated');
    })
  );
});

// Handle fetch
self.addEventListener('fetch', function(event) {
  // Skip chrome-extension requests
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        
        return fetch(event.request)
          .then(function(response) {
            if (!response || response.status !== 200) {
              return response;
            }
            
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                try {
                  cache.put(event.request, responseToCache);
                } catch (error) {
                  console.warn('⚠️ Failed to cache:', event.request.url);
                }
              });
            
            return response;
          })
          .catch(function() {
            return caches.match('/index.html');
          });
      })
  );
});

// Handle push notifications
self.addEventListener('push', function(event) {
  let data = {
    title: '💰 TabunganKu',
    body: 'Jangan lupa menabung hari ini!',
    icon: '/logo192.png',
    badge: '/favicon.ico'
  };

  if (event.data) {
    try {
      const pushData = event.data.json();
      data = { ...data, ...pushData };
    } catch (error) {
      console.error('❌ Error parsing push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      vibrate: [200, 100, 200],
      requireInteraction: true
    })
  );
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        for (let client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});