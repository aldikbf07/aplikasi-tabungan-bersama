import React from 'react';
import { FaTrash, FaPlus, FaMinus, FaUser, FaUserFriends } from 'react-icons/fa';
import './TransactionItem.css';

function TransactionItem({ transaction, onDelete }) {
  const { id, description, amount, type, partner, dateDisplay } = transaction;
  const isIncome = type === 'income';
  const isPartner1 = partner === 'partner1';

  return (
    <div className={`transaction-item ${isIncome ? 'income' : 'expense'}`}>
      <div className="item-icon">
        {isIncome ? <FaPlus /> : <FaMinus />}
      </div>
      
      <div className="item-content">
        <div className="item-header">
          <div className="item-title">
            <span className="item-description">{description}</span>
            <span className={`item-partner ${isPartner1 ? 'partner1' : 'partner2'}`}>
              {isPartner1 ? <FaUser /> : <FaUserFriends />}
              {isPartner1 ? 'ayi' : 'oyun'}
            </span>
          </div>
          <span className={`item-amount ${isIncome ? 'income' : 'expense'}`}>
            {isIncome ? '+' : '-'}Rp {amount.toLocaleString('id-ID')}
          </span>
        </div>
        <div className="item-footer">
          <span className="item-date">{dateDisplay}</span>
          <button 
            className="delete-btn"
            onClick={() => onDelete(id)}
            aria-label="Hapus transaksi"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  );
}

export default TransactionItem;