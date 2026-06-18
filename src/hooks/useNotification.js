import { useState, useEffect } from 'react';

function useNotification() {
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Request permission
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.log('Browser tidak mendukung notifikasi');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        setIsSubscribed(true);
        
        // Register service worker
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('Service Worker registered');
          } catch (error) {
            console.error('Service Worker registration failed:', error);
          }
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  // Send notification
  const sendNotification = (title, options = {}) => {
    if (notificationPermission === 'granted') {
      try {
        const notification = new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          ...options
        });
        
        setTimeout(() => notification.close(), 5000);
        return true;
      } catch (error) {
        console.error('Error sending notification:', error);
        return false;
      }
    }
    return false;
  };

  // Schedule daily notification for Friday
  const scheduleFridayReminder = () => {
    if (notificationPermission !== 'granted') return;

    const now = new Date();
    const dayOfWeek = now.getDay(); // 5 = Friday
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Check if it's Friday and between 7 AM - 9 PM
    if (dayOfWeek === 5 && hours >= 7 && hours <= 21) {
      // Send notification every 2 hours on Friday
      if (minutes === 0 || minutes === 30) {
        sendNotification('💰 Waktunya Menabung!', {
          body: 'Hari Jumat! Jangan lupa sisihkan uang untuk tabungan bersama.',
          requireInteraction: true
        });
      }
    }
  };

  // Check every 30 minutes
  useEffect(() => {
    if (notificationPermission !== 'granted') return;

    const interval = setInterval(() => {
      scheduleFridayReminder();
    }, 30 * 60 * 1000); // 30 minutes

    // Initial check
    scheduleFridayReminder();

    return () => clearInterval(interval);
  }, [notificationPermission]);

  return {
    notificationPermission,
    isSubscribed,
    requestPermission,
    sendNotification,
    scheduleFridayReminder
  };
}

export default useNotification;