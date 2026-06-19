// src/components/TransactionList.jsx
import React from 'react';
import TransactionItem from './TransactionItem';
import './TransactionList.css';

function TransactionList({ transactions, onDeleteTransaction }) {
  console.log('📊 TransactionList - Jumlah transaksi:', transactions.length);
  console.log('📊 TransactionList - Data:', transactions);

  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-text">Belum ada transaksi</p>
        <p className="empty-subtext">Mulai catat pemasukan atau pengeluaranmu</p>
      </div>
    );
  }

  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(b.date) - new Date(a.date);
  });

  const handleDelete = (id) => {
    console.log('🗑️ TransactionList - Menghapus ID:', id);
    console.log('📊 Transactions saat ini:', transactions.map(t => ({ id: t.id, firebaseId: t.firebaseId, desc: t.description })));
    onDeleteTransaction(id);
  };

  return (
    <div className="transaction-list">
      <h3 className="list-title">Semua Transaksi</h3>
      <div className="list-items">
        {sortedTransactions.map(transaction => (
          <TransactionItem
            key={transaction.id || transaction.firebaseId}
            transaction={transaction}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}

export default TransactionList;