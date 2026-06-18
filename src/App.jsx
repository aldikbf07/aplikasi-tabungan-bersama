import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import Header from './components/Header';
import Balance from './components/Balance';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import MonthlySummary from './components/MonthlySummary';
import PartnerBalance from './components/PartnerBalance';
import NotificationSettings from './components/NotificationSettings';
import useLocalStorage from './hooks/useLocalStorage';
import useNotification from './hooks/useNotification';

function App() {
  const [transactions, setTransactions] = useLocalStorage('transactions', []);
  const [balance, setBalance] = useState({ total: 0, partner1: 0, partner2: 0 });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { requestPermission, isSubscribed } = useNotification();

  // Load notification preference
  useEffect(() => {
    const saved = localStorage.getItem('notificationsEnabled');
    if (saved) {
      setNotificationsEnabled(JSON.parse(saved));
    }
  }, []);

  // Handle notification status change
  const handleNotificationStatusChange = (enabled) => {
    setNotificationsEnabled(enabled);
    localStorage.setItem('notificationsEnabled', JSON.stringify(enabled));
    
    if (enabled) {
      requestPermission();
    }
  };

  // Hitung saldo total dan per partner
  useEffect(() => {
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

  const addTransaction = (transaction) => {
    setTransactions([...transactions, transaction]);
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  return (
    <div className="app">
      <div className="container">
        <Header />
        <Balance balance={balance} />
        <PartnerBalance balance={balance} />
        <NotificationSettings onNotificationStatusChange={handleNotificationStatusChange} />
        <TransactionForm onAddTransaction={addTransaction} />
        <MonthlySummary monthlyData={monthlyData} />
        <TransactionList 
          transactions={transactions} 
          onDeleteTransaction={deleteTransaction}
        />
      </div>
    </div>
  );
}

export default App;