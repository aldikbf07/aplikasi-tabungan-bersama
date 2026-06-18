// src/App.jsx
import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import Header from './components/Header';
import Balance from './components/Balance';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import MonthlySummary from './components/MonthlySummary';
import PartnerBalance from './components/PartnerBalance';
import NotificationSettings from './components/NotificationSettings';
import SyncStatus from './components/SyncStatus';
import useFirebase from './hooks/useFirebase';
import useNotification from './hooks/useNotification';

function App() {
  const {
    transactions,
    loading,
    error,
    syncStatus,
    addTransaction,
    deleteTransaction
  } = useFirebase();

  const [balance, setBalance] = useState({ total: 0, partner1: 0, partner2: 0 });
  const { requestPermission } = useNotification();

  // Debug log
  useEffect(() => {
    console.log('Transaksi di App:', transactions);
  }, [transactions]);

  // Hitung saldo
  useEffect(() => {
    if (transactions.length === 0) {
      setBalance({ total: 0, partner1: 0, partner2: 0 });
      return;
    }

    const totals = transactions.reduce((acc, transaction) => {
      const amount = transaction.type === 'income' ? transaction.amount : -transaction.amount;
      
      if (transaction.partner === 'partner1') {
        acc.partner1 += amount;
      } else if (transaction.partner === 'partner2') {
        acc.partner2 += amount;
      }
      acc.total += amount;
      
      return acc;
    }, { total: 0, partner1: 0, partner2: 0 });

    setBalance(totals);
  }, [transactions]);

  // Group transactions by month
  const monthlyData = useMemo(() => {
    const grouped = {};
    
    transactions.forEach(transaction => {
      if (!transaction.date) {
        console.warn('Transaksi tanpa tanggal:', transaction);
        return;
      }
      
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          month: monthName,
          transactions: [],
          total: 0,
          partner1Total: 0,
          partner2Total: 0
        };
      }
      
      grouped[monthKey].transactions.push(transaction);
      
      const amount = transaction.type === 'income' ? transaction.amount : -transaction.amount;
      grouped[monthKey].total += amount;
      
      if (transaction.partner === 'partner1') {
        grouped[monthKey].partner1Total += amount;
      } else if (transaction.partner === 'partner2') {
        grouped[monthKey].partner2Total += amount;
      }
    });

    return Object.keys(grouped).sort((a, b) => b.localeCompare(a)).map(key => grouped[key]);
  }, [transactions]);

  // Fungsi hapus dengan logging
  const handleDelete = async (id) => {
    console.log('App - Menghapus transaksi dengan ID:', id);
    const result = await deleteTransaction(id);
    if (result.success) {
      console.log('Transaksi berhasil dihapus');
    } else {
      console.error('Gagal menghapus transaksi:', result.error);
      alert('Gagal menghapus transaksi. Silakan coba lagi.');
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="container">
          <div className="loading-screen">
            <div className="loading-spinner"></div>
            <p>Menghubungkan ke database...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="container">
          <div className="error-screen">
            <h3>⚠️ Koneksi Gagal</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Coba Lagi</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        <Header />
        <SyncStatus status={syncStatus} />
        <Balance balance={balance} />
        <PartnerBalance balance={balance} />
        <NotificationSettings onNotificationStatusChange={() => requestPermission()} />
        <TransactionForm onAddTransaction={addTransaction} />
        <MonthlySummary monthlyData={monthlyData} />
        <TransactionList 
          transactions={transactions} 
          onDeleteTransaction={handleDelete}
        />
      </div>
    </div>
  );
}

export default App;