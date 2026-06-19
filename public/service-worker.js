// public/service-worker.js
const CACHE_NAME = 'savings-app-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// Install Service Worker
self.addEventListener('install', function(event) {
  console.log('📦 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('📦 Cache opened');
        // Tambahkan error handling untuk setiap file
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(error => {
              console.warn('⚠️ Failed to cache:', url, error);
            });
          })
        );
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

// Handle fetch dengan error handling yang lebih baik
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
            // Cek response valid
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone response
            const responseToCache = response.clone();
            
            // Cache file
            try {
              caches.open(CACHE_NAME)
                .then(function(cache) {
                  cache.put(event.request, responseToCache);
                });
            } catch (error) {
              console.warn('⚠️ Failed to cache:', event.request.url, error);
            }
            
            return response;
          })
          .catch(function(error) {
            console.warn('⚠️ Fetch failed:', event.request.url, error);
            // Return offline page
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