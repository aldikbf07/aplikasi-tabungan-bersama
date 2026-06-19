// src/components/NotificationSettings.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaBell, 
  FaBellSlash, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaClock,
  FaMobile,
  FaRegBell,
  FaRegCheckCircle,
  FaSpinner,
  FaSync,
  FaTimes
} from 'react-icons/fa';
import { MdNotificationsActive, MdNotificationsOff } from 'react-icons/md';
import { BiTime, BiMobile } from 'react-icons/bi';
import { HiOutlineBell, HiOutlineBellAlert } from 'react-icons/hi';
import useNotification from '../hooks/useNotification';
import './NotificationSettings.css';

function NotificationSettings({ onNotificationStatusChange }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTestResult, setShowTestResult] = useState(null);
  const {
    permission,
    requestPermission,
    testNotification,
    disableNotifications,
    error
  } = useNotification();

  useEffect(() => {
    const saved = localStorage.getItem('notificationsEnabled');
    const savedStatus = saved ? JSON.parse(saved) : false;
    
    if (permission === 'granted' && savedStatus) {
      setIsEnabled(true);
      onNotificationStatusChange(true);
    } else if (permission === 'denied') {
      setIsEnabled(false);
      onNotificationStatusChange(false);
    } else {
      setIsEnabled(savedStatus);
    }
  }, [permission, onNotificationStatusChange]);

  const handleEnableNotifications = async () => {
    setLoading(true);
    setShowTestResult(null);
    try {
      const success = await requestPermission();
      
      if (success) {
        setIsEnabled(true);
        localStorage.setItem('notificationsEnabled', 'true');
        onNotificationStatusChange(true);
        
        setTimeout(() => {
          const result = testNotification();
          setShowTestResult(result ? 'success' : 'error');
          setTimeout(() => setShowTestResult(null), 5000);
        }, 2000);
      } else {
        setIsEnabled(false);
        localStorage.setItem('notificationsEnabled', 'false');
        onNotificationStatusChange(false);
        setShowTestResult('error');
        setTimeout(() => setShowTestResult(null), 5000);
      }
    } catch (error) {
      console.error('❌ Error enabling notifications:', error);
      setShowTestResult('error');
      setTimeout(() => setShowTestResult(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDisableNotifications = () => {
    setIsEnabled(false);
    localStorage.setItem('notificationsEnabled', 'false');
    onNotificationStatusChange(false);
    disableNotifications();
    setShowTestResult(null);
  };

  const handleTestNotification = () => {
    if (isEnabled && permission === 'granted') {
      const result = testNotification();
      setShowTestResult(result ? 'success' : 'error');
      setTimeout(() => setShowTestResult(null), 5000);
    } else {
      setShowTestResult('error');
      setTimeout(() => setShowTestResult(null), 5000);
    }
  };

  return (
    <div className="notification-settings">
      <div className="notification-header">
        <div className="notification-icon-wrapper">
          {isEnabled ? (
            <MdNotificationsActive className="icon-enabled" />
          ) : (
            <MdNotificationsOff className="icon-disabled" />
          )}
        </div>
        <div className="notification-info">
          <h4 className="notification-title">Pengingat Menabung</h4>
          <p className="notification-subtitle">
            {isEnabled ? (
              <>
                <FaRegCheckCircle className="subtitle-icon success" />
                Notifikasi aktif - akan mengingatkan setiap hari Jumat
              </>
            ) : (
              <>
                <HiOutlineBell className="subtitle-icon" />
                Aktifkan notifikasi untuk pengingat menabung setiap hari Jumat
              </>
            )}
          </p>
          {error && (
            <p className="notification-error">
              <FaExclamationTriangle className="error-icon" />
              {error}
            </p>
          )}
          {permission === 'denied' && (
            <p className="notification-error">
              <FaExclamationTriangle className="error-icon" />
              Izin notifikasi ditolak. Atur ulang di pengaturan browser.
            </p>
          )}
          {showTestResult === 'success' && (
            <p className="notification-test-success">
              <FaCheckCircle className="success-icon" />
              Notifikasi berhasil dikirim! ✅
            </p>
          )}
          {showTestResult === 'error' && (
            <p className="notification-test-error">
              <FaTimes className="error-icon" />
              Gagal mengirim notifikasi. Periksa izin browser.
            </p>
          )}
        </div>
      </div>

      <div className="notification-actions">
        {!isEnabled ? (
          <button 
            className="btn-enable" 
            onClick={handleEnableNotifications}
            disabled={loading || permission === 'denied'}
          >
            {loading ? (
              <><FaSpinner className="spinning" /> Memproses...</>
            ) : (
              <><FaBell /> Aktifkan Notifikasi</>
            )}
          </button>
        ) : (
          <div className="notification-status">
            <span className="status-active">
              <FaCheckCircle className="status-icon" />
              Notifikasi Aktif
            </span>
            <div className="status-buttons">
              <button 
                className="btn-test" 
                onClick={handleTestNotification}
                disabled={loading}
              >
                <FaSync className={loading ? 'spinning' : ''} />
                Test
              </button>
              <button 
                className="btn-disable" 
                onClick={handleDisableNotifications}
              >
                <FaTimes />
                Nonaktifkan
              </button>
            </div>
          </div>
        )}
      </div>

      {isEnabled && (
        <div className="notification-info-box">
          <div className="info-item">
            <BiTime className="info-icon" />
            <span className="info-text">Pengingat muncul setiap Jumat pukul 07:00 - 21:00</span>
          </div>
          <div className="info-item">
            <BiMobile className="info-icon" />
            <span className="info-text">Notifikasi akan muncul meskipun aplikasi tertutup</span>
          </div>
          <div className="info-item">
            <FaRegBell className="info-icon" />
            <span className="info-text">Klik notifikasi untuk membuka aplikasi</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationSettings;