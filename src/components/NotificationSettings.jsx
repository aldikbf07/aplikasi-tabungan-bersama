import React, { useState, useEffect } from 'react';
import { FaBell, FaBellSlash, FaCheckCircle,FaCalendarAlt  } from 'react-icons/fa';
import { IoMdAlarm } from "react-icons/io";
import './NotificationSettings.css';

function NotificationSettings({ onNotificationStatusChange }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      setIsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) {
      alert('Browser Anda tidak mendukung notifikasi. Gunakan Chrome, Firefox, atau Edge terbaru.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        setIsEnabled(true);
        onNotificationStatusChange(true);
        
        // Register service worker
        if ('serviceWorker' in navigator) {
          try {
            await navigator.serviceWorker.register('/service-worker.js');
          } catch (error) {
            console.error('Service Worker registration failed:', error);
          }
        }

        // Send welcome notification
        new Notification('✅ Notifikasi Diaktifkan!', {
          body: 'Kamu akan mendapat pengingat untuk menabung setiap hari Jumat.',
          icon: '/favicon.ico'
        });
      } else {
        alert('Anda perlu mengizinkan notifikasi untuk menggunakan fitur ini.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  const handleDisableNotifications = () => {
    setIsEnabled(false);
    onNotificationStatusChange(false);
    alert('Notifikasi dinonaktifkan. Untuk mengaktifkan kembali, atur ulang izin notifikasi di pengaturan browser.');
  };

  return (
    <div className="notification-settings">
      <div className="notification-header">
        <div className="notification-icon-wrapper">
          {isEnabled ? <FaBell className="icon-enabled" /> : <FaBellSlash className="icon-disabled" />}
        </div>
        <div className="notification-info">
          <h4 className="notification-title">Pengingat Menabung</h4>
          <p className="notification-subtitle">
            {isEnabled 
              ? 'Notifikasi aktif - akan aku ingetin tiap jumat' 
              : 'kalo kamu mau diingetin buat nabung, aktifin notifikasi dulu yaa'}
          </p>
        </div>
      </div>

      <div className="notification-actions">
        {!isEnabled ? (
          <button 
            className="btn-enable" 
            onClick={handleEnableNotifications}
          >
            <FaBell /> Aktifkan Notifikasi
          </button>
        ) : (
          <div className="notification-status">
            <span className="status-active">
              <FaCheckCircle /> Notifikasi Aktif
            </span>
            <button 
              className="btn-disable" 
              onClick={handleDisableNotifications}
            >
              Nonaktifkan
            </button>
          </div>
        )}
      </div>

      {isEnabled && (
        <div className="notification-info-box">
          <p className="info-text">
            <IoMdAlarm /> Pengingat akan muncul setiap hari Jumat mulai pukul 07:00 - 21:00
          </p>
          <p className="info-text">
            <FaCalendarAlt /> Jangan lupa catat tabungan kita ya beb!
          </p>
        </div>
      )}
    </div>
  );
}

export default NotificationSettings;