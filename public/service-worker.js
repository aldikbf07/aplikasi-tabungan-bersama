// public/service-worker.js
self.addEventListener('push', function(event) {
  const data = event.data.json();
  
  const options = {
    body: data.body || 'Jangan lupa menabung hari ini yeng!',
    icon: '/heart.png',
    badge: '/heart.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'Buka Aplikasi'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'tabungan kita', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});