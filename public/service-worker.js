// public/service-worker.js
const CACHE_NAME = 'savings-app-v1';
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
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Service Worker installed');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Cache error:', error);
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', function(event) {
  console.log('🚀 Service Worker activating...');
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Hapus cache lama
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

// Handle push notifications
self.addEventListener('push', function(event) {
  console.log('🔔 Push notification received:', event);
  
  let data = {
    title: '💰 TabunganKu',
    body: 'Jangan lupa menabung hari ini yeng!',
    icon: '/heart.png',
    badge: '/heart.png',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  if (event.data) {
    try {
      const pushData = event.data.json();
      data = { ...data, ...pushData };
      console.log('📦 Push data:', data);
    } catch (error) {
      console.error('❌ Error parsing push data:', error);
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: data.vibrate || [200, 100, 200],
    requireInteraction: data.requireInteraction || true,
    data: data.data || {},
    actions: [
      {
        action: 'open',
        title: 'Buka Aplikasi'
      },
      {
        action: 'close',
        title: 'Tutup'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log('🖱️ Notification clicked:', event);
  
  const notification = event.notification;
  const action = event.action;
  
  notification.close();

  if (action === 'close') {
    return;
  }

  // Focus or open window
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then(function(clientList) {
      // Coba fokus ke window yang sudah ada
      for (let client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Jika tidak ada, buka window baru
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Handle fetch untuk offline support
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest)
          .then(function(response) {
            // Check valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone response
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(function() {
            // Offline fallback
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});