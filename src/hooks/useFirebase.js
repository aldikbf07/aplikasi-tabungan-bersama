// src/hooks/useFirebase.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { database } from '../firebase/config';
import { ref, onValue, set, push, remove, update, get } from 'firebase/database';

function useFirebase() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState('connecting');
  const unsubscribeRef = useRef(null);

  // Load data dari Firebase dengan listener
  useEffect(() => {
    const transactionsRef = ref(database, 'transactions');
    
    const unsubscribe = onValue(transactionsRef, (snapshot) => {
      const data = snapshot.val();
      console.log('📥 Data dari Firebase:', data);
      
      if (data) {
        const transactionsArray = Object.keys(data).map(key => ({
          id: key, // ID dari Firebase
          firebaseId: key, // Simpan juga sebagai firebaseId untuk referensi
          ...data[key]
        }));
        console.log('✅ Transaksi dimuat:', transactionsArray);
        setTransactions(transactionsArray);
        setSyncStatus('synced');
      } else {
        console.log('📭 Tidak ada data di Firebase');
        setTransactions([]);
        setSyncStatus('empty');
      }
      setLoading(false);
    }, (error) => {
      console.error('❌ Error loading data:', error);
      setError(error.message);
      setSyncStatus('error');
      setLoading(false);
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // Tambah transaksi
  const addTransaction = useCallback(async (transaction) => {
    try {
      console.log('➕ Menambahkan transaksi:', transaction);
      const transactionsRef = ref(database, 'transactions');
      const newTransactionRef = push(transactionsRef);
      const newTransaction = {
        ...transaction,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await set(newTransactionRef, newTransaction);
      console.log('✅ Transaksi berhasil ditambahkan dengan ID:', newTransactionRef.key);
      return { success: true, id: newTransactionRef.key };
    } catch (error) {
      console.error('❌ Error adding transaction:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  }, []);

  // Hapus transaksi - PERBAIKAN
  const deleteTransaction = useCallback(async (id) => {
    try {
      console.log('🗑️ Menghapus transaksi dengan ID:', id);
      console.log('📊 ID yang diterima:', typeof id, id);
      
      if (!id) {
        console.error('❌ ID transaksi tidak valid');
        return { success: false, error: 'ID transaksi tidak valid' };
      }

      // Coba cari transaksi di state terlebih dahulu
      const transactionToDelete = transactions.find(t => t.id === id || t.firebaseId === id);
      console.log('🔍 Transaksi ditemukan di state:', transactionToDelete);
      
      if (!transactionToDelete) {
        console.error('❌ Transaksi tidak ditemukan di state');
        return { success: false, error: 'Transaksi tidak ditemukan' };
      }

      // Gunakan firebaseId atau id
      const deleteId = transactionToDelete.firebaseId || transactionToDelete.id;
      console.log('🗑️ ID yang akan dihapus dari Firebase:', deleteId);

      // Verifikasi transaksi ada di Firebase
      const transactionRef = ref(database, `transactions/${deleteId}`);
      const snapshot = await get(transactionRef);
      
      if (!snapshot.exists()) {
        console.error('❌ Transaksi dengan ID', deleteId, 'tidak ditemukan di Firebase');
        return { success: false, error: 'Transaksi tidak ditemukan di database' };
      }

      console.log('✅ Transaksi ditemukan di Firebase, menghapus...');
      
      // Hapus dari Firebase
      await remove(transactionRef);
      console.log('✅ Transaksi berhasil dihapus dari Firebase');
      
      // Update state lokal
      setTransactions(prev => {
        const newTransactions = prev.filter(t => {
          const tId = t.firebaseId || t.id;
          return tId !== deleteId;
        });
        console.log('📊 State diperbarui, tersisa:', newTransactions.length, 'transaksi');
        return newTransactions;
      });
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting transaction:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  }, [transactions]);

  // Force sync
  const forceSync = useCallback(async () => {
    try {
      console.log('🔄 Force sync...');
      setSyncStatus('syncing');
      const transactionsRef = ref(database, 'transactions');
      const snapshot = await get(transactionsRef);
      const data = snapshot.val();
      
      if (data) {
        const transactionsArray = Object.keys(data).map(key => ({
          id: key,
          firebaseId: key,
          ...data[key]
        }));
        setTransactions(transactionsArray);
        console.log('✅ Sync selesai:', transactionsArray.length, 'transaksi');
      } else {
        setTransactions([]);
        console.log('✅ Sync selesai: tidak ada data');
      }
      setSyncStatus('synced');
      return { success: true };
    } catch (error) {
      console.error('❌ Force sync error:', error);
      setSyncStatus('error');
      return { success: false, error: error.message };
    }
  }, []);

  // Hapus semua transaksi
  const deleteAllTransactions = useCallback(async () => {
    try {
      console.log('🗑️ Menghapus semua transaksi...');
      const transactionsRef = ref(database, 'transactions');
      await set(transactionsRef, null);
      console.log('✅ Semua transaksi berhasil dihapus');
      setTransactions([]);
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting all transactions:', error);
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
    deleteAllTransactions,
    forceSync
  };
}

export default useFirebase;