import React from 'react';
import TransactionItem from './TransactionItem';
import './TransactionList.css';

function TransactionList({ transactions, onDeleteTransaction }) {
  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-text">Belum ada transaksi</p>
        <p className="empty-subtext">Mulai catat pemasukan atau pengeluaranmu</p>
      </div>
    );
  }

  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  return (
    <div className="transaction-list">
      <h3 className="list-title">Semua Transaksi</h3>
      <div className="list-items">
        {sortedTransactions.map(transaction => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            onDelete={onDeleteTransaction}
          />
        ))}
      </div>
    </div>
  );
}

export default TransactionList;