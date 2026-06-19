// src/hooks/useNotification.js
import { useState, useEffect, useCallback } from 'react';

function useNotification() {
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  // Cek support dan status saat mount
  useEffect(() => {
    // Cek support notifikasi
    const hasNotification = 'Notification' in window;
    const hasServiceWorker = 'serviceWorker' in navigator;
    const hasPushManager = 'PushManager' in window;
    
    setIsSupported(hasNotification && hasServiceWorker && hasPushManager);
    
    if (!hasNotification) {
      console.log('ℹ️ Browser tidak mendukung Notification API');
      setError('Browser tidak mendukung notifikasi');
      return;
    }

    if (!hasServiceWorker) {
      console.log('ℹ️ Browser tidak mendukung Service Worker');
      setError('Browser tidak mendukung Service Worker');
      return;
    }

    // Cek status permission
    setPermission(Notification.permission);
    
    // Cek subscription
    checkSubscription();
  }, []);

  // Cek subscription
  const checkSubscription = async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return;
      }
      
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.pushManager) {
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  // Register Service Worker dengan error handling
  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      console.log('ℹ️ Service Worker tidak didukung');
      return false;
    }

    try {
      console.log('📦 Mendaftarkan Service Worker...');
      
      // Unregister service worker lama jika ada
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        if (registration.active && registration.active.scriptURL.includes('service-worker.js')) {
          await registration.unregister();
          console.log('🗑️ Service Worker lama di-unregister');
        }
      }

      // Register service worker baru
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });
      
      console.log('✅ Service Worker terdaftar:', registration);
      
      // Tunggu sampai aktif
      await navigator.serviceWorker.ready;
      console.log('✅ Service Worker siap digunakan');
      
      return true;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      setError('Gagal mendaftarkan Service Worker: ' + error.message);
      return false;
    }
  }, []);

  // Request permission dengan error handling
  const requestPermission = useCallback(async () => {
    // Cek support
    if (!isSupported) {
      alert('Browser Anda tidak mendukung notifikasi. Gunakan Chrome, Firefox, atau Edge terbaru.');
      return false;
    }

    // Cek adblocker
    if (Notification.permission === 'denied') {
      alert('Izin notifikasi ditolak. Mohon aktifkan notifikasi di pengaturan browser dan matikan AdBlocker untuk website ini.');
      return false;
    }

    try {
      console.log('🔔 Meminta izin notifikasi...');
      
      const result = await Notification.requestPermission();
      setPermission(result);
      console.log('📝 Status izin:', result);

      if (result === 'granted') {
        // Register service worker
        const swRegistered = await registerServiceWorker();
        
        if (swRegistered) {
          // Kirim notifikasi selamat datang
          setTimeout(() => {
            sendWelcomeNotification();
          }, 1000);
          
          // Setup reminder
          setupReminder();
          
          return true;
        } else {
          setError('Gagal mendaftarkan Service Worker');
          return false;
        }
      } else {
        alert('Anda perlu mengizinkan notifikasi untuk menggunakan fitur ini.');
        return false;
      }
    } catch (error) {
      console.error('❌ Error requesting permission:', error);
      setError(error.message);
      
      // Cek apakah error karena AdBlocker
      if (error.message.includes('blocked') || error.message.includes('denied')) {
        alert('Notifikasi diblokir. Mohon matikan AdBlocker dan izinkan notifikasi di pengaturan browser.');
      }
      
      return false;
    }
  }, [isSupported, registerServiceWorker]);

  // Kirim notifikasi dengan fallback
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
        tag: 'savings-reminder-' + Date.now(),
        silent: false,
        ...options
      });

      // Tutup notifikasi setelah 10 detik
      const timeoutId = setTimeout(() => {
        notification.close();
      }, 10000);

      // Event listener untuk klik notifikasi
      notification.onclick = function() {
        window.focus();
        this.close();
        clearTimeout(timeoutId);
      };

      notification.onclose = function() {
        clearTimeout(timeoutId);
      };

      return true;
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      return false;
    }
  }, [permission]);

  // Kirim notifikasi selamat datang
  const sendWelcomeNotification = useCallback(() => {
    sendNotification('Notifikasi Diaktifkan! ✅', {
      body: 'Kamu akan mendapat pengingat untuk menabung setiap hari Jumat.',
      requireInteraction: true,
      tag: 'welcome-notification'
    });
  }, [sendNotification]);

  // Setup reminder untuk Jumat
  const setupReminder = useCallback(() => {
    console.log('⏰ Setup reminder untuk hari Jumat...');
    
    // Cek hari ini
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Jika hari Jumat dan jam 07:00 - 21:00
    if (dayOfWeek === 5 && hours >= 7 && hours <= 21) {
      if (minutes === 0 || minutes === 30) {
        setTimeout(() => {
          sendFridayReminder();
        }, 5000);
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
    }, 30 * 60 * 1000);

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
      body: `Hari Jumat ${timeOfDay}! Jangan lupa sisihkan uang untuk tabungan bersama.`,
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
        body: 'Sudah catat tabungan hari ini? Yuk, konsisten menabung!',
        requireInteraction: true,
        tag: 'friday-reminder-2'
      });
    }, 5 * 60 * 1000);
  }, [sendNotification]);

  // Test notification
  const testNotification = useCallback(() => {
    if (permission !== 'granted') {
      alert('Mohon aktifkan notifikasi terlebih dahulu!');
      return false;
    }

    try {
      const success = sendNotification('🔔 Test Notifikasi', {
        body: 'Notifikasi berfungsi dengan baik!',
        requireInteraction: true,
        tag: 'test-notification'
      });

      if (success) {
        alert('✅ Notifikasi terkirim! Cek layar Anda.');
      } else {
        alert('❌ Gagal mengirim notifikasi. Coba matikan AdBlocker dan refresh halaman.');
      }
      
      return success;
    } catch (error) {
      console.error('Error testing notification:', error);
      alert('❌ Gagal mengirim notifikasi. Error: ' + error.message);
      return false;
    }
  }, [permission, sendNotification]);

  // Disable notifications
  const disableNotifications = useCallback(() => {
    setIsSubscribed(false);
    setPermission('denied');
    localStorage.setItem('notificationsEnabled', 'false');
    alert('Notifikasi dinonaktifkan. Untuk mengaktifkan kembali, atur ulang izin di pengaturan browser dan matikan AdBlocker.');
  }, []);

  return {
    permission,
    isSubscribed,
    error,
    isSupported,
    requestPermission,
    sendNotification,
    sendFridayReminder,
    testNotification,
    disableNotifications,
    registerServiceWorker
  };
}

export default useNotification;