// src/hooks/useFirebase.js
import { useState, useEffect, useCallback } from 'react';
import { database } from '../firebase/config';
import { ref, onValue, set, push, remove, update } from 'firebase/database';

function useFirebase() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState('connecting');

  useEffect(() => {
    const transactionsRef = ref(database, 'transactions');
    
    // Listen untuk perubahan realtime
    const unsubscribe = onValue(transactionsRef, (snapshot) => {
      const data = snapshot.val();
      console.log('Data dari Firebase:', data); // Debug
      
      if (data) {
        // Convert object ke array
        const transactionsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        console.log('Transaksi yang diproses:', transactionsArray); // Debug
        setTransactions(transactionsArray);
        setSyncStatus('synced');
      } else {
        setTransactions([]);
        setSyncStatus('empty');
      }
      setLoading(false);
    }, (error) => {
      console.error('Error loading data:', error);
      setError(error.message);
      setSyncStatus('error');
      setLoading(false);
    });

    // Cleanup
    return () => unsubscribe();
  }, []);

  // Tambah transaksi
  const addTransaction = useCallback(async (transaction) => {
    try {
      const transactionsRef = ref(database, 'transactions');
      const newTransactionRef = push(transactionsRef);
      const newTransaction = {
        ...transaction,
        createdAt: new Date().toISOString()
      };
      await set(newTransactionRef, newTransaction);
      console.log('Transaksi berhasil ditambahkan:', newTransaction);
      return { success: true };
    } catch (error) {
      console.error('Error adding transaction:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  }, []);

  // Hapus transaksi - PERBAIKAN
  const deleteTransaction = useCallback(async (id) => {
    try {
      console.log('Menghapus transaksi dengan ID:', id); // Debug
      
      if (!id) {
        console.error('ID transaksi tidak valid');
        return { success: false, error: 'ID transaksi tidak valid' };
      }

      const transactionRef = ref(database, `transactions/${id}`);
      await remove(transactionRef);
      console.log('Transaksi berhasil dihapus:', id);
      
      // Update state lokal (opsional karena sudah realtime)
      setTransactions(prev => prev.filter(t => t.id !== id));
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  }, []);

  // Update transaksi
  const updateTransaction = useCallback(async (id, data) => {
    try {
      const transactionRef = ref(database, `transactions/${id}`);
      await update(transactionRef, data);
      console.log('Transaksi berhasil diupdate:', id);
      return { success: true };
    } catch (error) {
      console.error('Error updating transaction:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  }, []);

  // Hapus semua transaksi (opsional)
  const deleteAllTransactions = useCallback(async () => {
    try {
      const transactionsRef = ref(database, 'transactions');
      await set(transactionsRef, null);
      console.log('Semua transaksi berhasil dihapus');
      return { success: true };
    } catch (error) {
      console.error('Error deleting all transactions:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  }, []);

  return {
    transactions,
    loading,
    error,
    syncStatus,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    deleteAllTransactions
  };
}

export default useFirebase;