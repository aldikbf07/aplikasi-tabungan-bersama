import React from 'react';
import { FaCloud, FaCloudUploadAlt, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import './SyncStatus.css';

function SyncStatus({ status }) {
  const getStatusInfo = () => {
    switch(status) {
      case 'synced':
        return {
          icon: <FaCheckCircle />,
          text: 'Data tersinkronisasi',
          className: 'synced'
        };
      case 'syncing':
        return {
          icon: <FaCloudUploadAlt className="spinning" />,
          text: 'Menyinkronkan...',
          className: 'syncing'
        };
      case 'connecting':
        return {
          icon: <FaCloud className="pulsing" />,
          text: 'Menghubungkan...',
          className: 'connecting'
        };
      case 'error':
        return {
          icon: <FaExclamationTriangle />,
          text: 'Gagal sinkronisasi',
          className: 'error'
        };
      case 'empty':
        return {
          icon: <FaCloud />,
          text: 'Belum ada data',
          className: 'empty'
        };
      default:
        return {
          icon: <FaCloud />,
          text: 'Menyiapkan...',
          className: 'default'
        };
    }
  };

  const info = getStatusInfo();

  return (
    <div className={`sync-status ${info.className}`}>
      <span className="sync-icon">{info.icon}</span>
      <span className="sync-text">{info.text}</span>
    </div>
  );
}

export default SyncStatus;