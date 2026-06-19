// src/hooks/useNotification.js
import { useState, useEffect, useCallback } from 'react';

function useNotification() {
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState(null);

  // Cek status notifikasi saat mount
  useEffect(() => {
    if (!('Notification' in window)) {
      console.log('ℹ️ Browser tidak mendukung notifikasi');
      setError('Browser tidak mendukung notifikasi');
      return;
    }

    setPermission(Notification.permission);
    
    // Cek apakah sudah subscribe
    checkSubscription();
  }, []);

  // Cek subscription
  const checkSubscription = async () => {
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  // Request permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      alert('Browser Anda tidak mendukung notifikasi. Gunakan Chrome, Firefox, atau Edge terbaru.');
      return false;
    }

    try {
      console.log('🔔 Meminta izin notifikasi...');
      const result = await Notification.requestPermission();
      setPermission(result);
      console.log('📝 Status izin:', result);

      if (result === 'granted') {
        // Register service worker
        await registerServiceWorker();
        
        // Kirim notifikasi selamat datang
        sendWelcomeNotification();
        
        // Setup reminder
        setupReminder();
        
        return true;
      } else {
        alert('Anda perlu mengizinkan notifikasi untuk menggunakan fitur ini.');
        return false;
      }
    } catch (error) {
      console.error('❌ Error requesting permission:', error);
      setError(error.message);
      return false;
    }
  }, []);

  // Register Service Worker
  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      console.log('ℹ️ Service Worker tidak didukung');
      return false;
    }

    try {
      console.log('📦 Mendaftarkan Service Worker...');
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('✅ Service Worker terdaftar:', registration);
      
      // Cek apakah ada update
      registration.update();
      
      return true;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      setError(error.message);
      return false;
    }
  }, []);

  // Kirim notifikasi
  const sendNotification = useCallback((title, options = {}) => {
    if (permission !== 'granted') {
      console.log('⚠️ Izin notifikasi belum diberikan');
      return false;
    }

    try {
      console.log('🔔 Mengirim notifikasi:', title);
      const notification = new Notification(title, {
        icon: '/heart.png',
        badge: '/heart.png',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        tag: 'savings-reminder',
        ...options
      });

      // Tutup notifikasi setelah 10 detik
      setTimeout(() => {
        notification.close();
      }, 10000);

      // Event listener untuk klik notifikasi
      notification.onclick = function() {
        window.focus();
        this.close();
      };

      return true;
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      return false;
    }
  }, [permission]);

  // Kirim notifikasi selamat datang
  const sendWelcomeNotification = useCallback(() => {
    sendNotification('✅ Notifikasi Diaktifkan!', {
      body: 'Kamu akan mendapat pengingat untuk menabung setiap hari Jumat.',
      requireInteraction: true
    });
  }, [sendNotification]);

  // Setup reminder untuk Jumat
  const setupReminder = useCallback(() => {
    console.log('⏰ Setup reminder untuk hari Jumat...');
    
    // Cek hari ini
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sunday, 5=Friday
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Jika hari Jumat dan jam 07:00 - 21:00
    if (dayOfWeek === 5 && hours >= 7 && hours <= 21) {
      // Kirim notifikasi setiap jam
      if (minutes === 0 || minutes === 30) {
        sendFridayReminder();
      }
    }

    // Schedule interval untuk cek setiap 30 menit
    const interval = setInterval(() => {
      const current = new Date();
      const currentDay = current.getDay();
      const currentHours = current.getHours();
      const currentMinutes = current.getMinutes();

      if (currentDay === 5 && currentHours >= 7 && currentHours <= 21) {
        if (currentMinutes === 0 || currentMinutes === 30) {
          sendFridayReminder();
        }
      }
    }, 30 * 60 * 1000); // 30 menit

    return () => clearInterval(interval);
  }, []);

  // Kirim reminder Jumat
  const sendFridayReminder = useCallback(() => {
    const now = new Date();
    const hours = now.getHours();
    
    let timeOfDay = 'pagi';
    if (hours >= 12 && hours < 15) timeOfDay = 'siang';
    else if (hours >= 15 && hours < 18) timeOfDay = 'sore';
    else if (hours >= 18) timeOfDay = 'malam';

    sendNotification('💰 Waktunya Menabung!', {
      body: `Hari Jumat ${timeOfDay}! Jangan lupa sisihkan uang untuk tabungan bersama. 💪`,
      requireInteraction: true,
      tag: 'friday-reminder',
      data: {
        type: 'savings-reminder',
        day: 'friday'
      }
    });

    // Kirim notifikasi kedua 5 menit kemudian
    setTimeout(() => {
      sendNotification('📊 Update Tabungan', {
        body: 'Sudah catat tabungan hari ini? Yuk, konsisten menabung! 💰',
        requireInteraction: true,
        tag: 'friday-reminder-2'
      });
    }, 5 * 60 * 1000);
  }, [sendNotification]);

  // Force notification test
  const testNotification = useCallback(() => {
    if (permission !== 'granted') {
      alert('Mohon aktifkan notifikasi terlebih dahulu!');
      return false;
    }

    const success = sendNotification('🔔 Test Notifikasi', {
      body: 'Notifikasi berfungsi dengan baik! ✅',
      requireInteraction: true
    });

    if (success) {
      alert('✅ Notifikasi terkirim! Cek layar Anda.');
    } else {
      alert('❌ Gagal mengirim notifikasi. Cek console untuk detail.');
    }
    
    return success;
  }, [permission, sendNotification]);

  // Disable notifications
  const disableNotifications = useCallback(() => {
    setIsSubscribed(false);
    setPermission('denied');
    localStorage.setItem('notificationsEnabled', 'false');
    alert('Notifikasi dinonaktifkan. Untuk mengaktifkan kembali, atur ulang izin di pengaturan browser.');
  }, []);

  return {
    permission,
    isSubscribed,
    error,
    requestPermission,
    sendNotification,
    sendFridayReminder,
    testNotification,
    disableNotifications,
    registerServiceWorker
  };
}

export default useNotification;