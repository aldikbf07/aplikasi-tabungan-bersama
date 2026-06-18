import { useState, useEffect, useCallback } from 'react';
import { database, ref, onValue, set, push, remove, update } from '../firebase/config';

function useFirebase() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState('connecting');

  // Load data dari Firebase
  useEffect(() => {
    const transactionsRef = ref(database, 'transactions');
    
    // Listen untuk perubahan realtime
    const unsubscribe = onValue(transactionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert object ke array
        const transactionsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setTransactions(transactionsArray);
        setSyncStatus('synced');
      } else {
        setTransactions([]);
        setSyncStatus('empty');
      }
      setLoading(false);
    }, (error) => {
      setError(error.message);
      setSyncStatus('error');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Tambah transaksi
  const addTransaction = useCallback(async (transaction) => {
    try {
      const transactionsRef = ref(database, 'transactions');
      const newTransactionRef = push(transactionsRef);
      await set(newTransactionRef, {
        ...transaction,
        createdAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  }, []);

  // Hapus transaksi
  const deleteTransaction = useCallback(async (id) => {
    try {
      const transactionRef = ref(database, `transactions/${id}`);
      await remove(transactionRef);
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  }, []);

  // Update transaksi
  const updateTransaction = useCallback(async (id, data) => {
    try {
      const transactionRef = ref(database, `transactions/${id}`);
      await update(transactionRef, data);
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  }, []);

  // Sync manual
  const syncData = useCallback(() => {
    setSyncStatus('syncing');
    const transactionsRef = ref(database, 'transactions');
    onValue(transactionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const transactionsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setTransactions(transactionsArray);
      }
      setSyncStatus('synced');
    });
  }, []);

  return {
    transactions,
    loading,
    error,
    syncStatus,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    syncData
  };
}

export default useFirebase;