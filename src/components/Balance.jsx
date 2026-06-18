import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import './Balance.css';

function Balance({ balance }) {
  const isPositive = balance.total >= 0;
  
  return (
    <div className="balance-card">
      <p className="balance-label">Total Saldo Kita beb :)</p>
      <div className="balance-amount">
        <span className="currency">Rp</span>
        <span className={isPositive ? 'positive' : 'negative'}>
          {balance.total.toLocaleString('id-ID')}
        </span>
      </div>
      <div className="balance-indicator">
        <span className={`indicator ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? <FaArrowUp /> : <FaArrowDown />}
          {isPositive ? ' alhamduliah' : ' astaghfirullah'}
        </span>
      </div>
    </div>
  );
}

export default Balance;