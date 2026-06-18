import React from 'react';
import { FaUser, FaUserFriends } from 'react-icons/fa';
import './PartnerBalance.css';

function PartnerBalance({ balance }) {
  return (
    <div className="partner-balance">
      <div className="partner-card partner1">
        <div className="partner-header">
          <FaUser className="partner-icon" />
          <span className="partner-name">Aldi Ganteng</span>
        </div>
        <div className="partner-amount">
          <span className="currency">Rp</span>
          <span className={balance.partner1 >= 0 ? 'positive' : 'negative'}>
            {balance.partner1.toLocaleString('id-ID')}
          </span>
        </div>
      </div>
      
      <div className="partner-divider">
        <FaUserFriends />
      </div>
      
      <div className="partner-card partner2">
        <div className="partner-header">
          <FaUser className="partner-icon" />
          <span className="partner-name">Dina cantik</span>
        </div>
        <div className="partner-amount">
          <span className="currency">Rp</span>
          <span className={balance.partner2 >= 0 ? 'positive' : 'negative'}>
            {balance.partner2.toLocaleString('id-ID')}
          </span>
        </div>
      </div>
    </div>
  );
}

export default PartnerBalance;