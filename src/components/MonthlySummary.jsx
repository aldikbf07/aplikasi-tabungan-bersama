import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaUser, FaUserFriends } from 'react-icons/fa';
import './MonthlySummary.css';

function MonthlySummary({ monthlyData }) {
  const [expandedMonth, setExpandedMonth] = useState(null);

  const toggleMonth = (index) => {
    setExpandedMonth(expandedMonth === index ? null : index);
  };

  if (monthlyData.length === 0) {
    return null;
  }

  return (
    <div className="monthly-summary">
      <h3 className="summary-title">Rekapan Per Bulan</h3>
      
      {monthlyData.map((data, index) => {
        const isExpanded = expandedMonth === index;
        const isPositive = data.total >= 0;
        
        return (
          <div key={index} className="month-card">
            <div className="month-header" onClick={() => toggleMonth(index)}>
              <div className="month-info">
                <span className="month-name">{data.month}</span>
                <span className={`month-total ${isPositive ? 'positive' : 'negative'}`}>
                  {isPositive ? '+' : ''}Rp {data.total.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="month-toggle">
                <span className="transaction-count">
                  {data.transactions.length} transaksi
                </span>
                {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            </div>
            
            {isExpanded && (
              <div className="month-details">
                <div className="partner-breakdown">
                  <div className="breakdown-item">
                    <FaUser className="breakdown-icon partner1-icon" />
                    <span className="breakdown-label">Aldi Ganteng</span>
                    <span className={`breakdown-amount ${data.partner1Total >= 0 ? 'positive' : 'negative'}`}>
                      Rp {data.partner1Total.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="breakdown-item">
                    <FaUserFriends className="breakdown-icon partner2-icon" />
                    <span className="breakdown-label">Dina cantik</span>
                    <span className={`breakdown-amount ${data.partner2Total >= 0 ? 'positive' : 'negative'}`}>
                      Rp {data.partner2Total.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
                
                <div className="month-transactions">
                  {data.transactions.map(transaction => (
                    <div key={transaction.id} className="month-transaction-item">
                      <span className="month-trans-desc">{transaction.description}</span>
                      <span className={`month-trans-amount ${transaction.type === 'income' ? 'income' : 'expense'}`}>
                        {transaction.type === 'income' ? '+' : '-'}Rp {transaction.amount.toLocaleString('id-ID')}
                      </span>
                      <span className="month-trans-partner">
                        {transaction.partner === 'partner1' ? 'ayi' : 'oyun'}
                      </span>
                      {transaction.date}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default MonthlySummary;