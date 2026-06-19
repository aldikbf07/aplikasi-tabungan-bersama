import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FaPlus, FaMinus, FaUser, FaUserFriends } from 'react-icons/fa';
import './TransactionForm.css';

function TransactionForm({ onAddTransaction }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');
  const [partner, setPartner] = useState('partner1');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!description.trim() || !amount || parseFloat(amount) <= 0) {
      alert('Mohon isi deskripsi dan nominal yang valid!');
      return;
    }

    const transaction = {
      id: uuidv4(),
      description: description.trim(),
      amount: parseFloat(amount),
      type: type,
      partner: partner,
      date: date,
      dateDisplay: new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    };

    onAddTransaction(transaction);
    setDescription('');
    setAmount('');
    setType('income');
    setPartner('partner1');
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <input
          type="text"
          className="form-input"
          placeholder="Deskripsi transaksi..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <input
            type="number"
            className="form-input"
            placeholder="Nominal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="1000"
          />
        </div>
        
        <div className="form-group">
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group type-selector">
          <button
            type="button"
            className={`type-btn ${type === 'income' ? 'active-income' : ''}`}
            onClick={() => setType('income')}
          >
            <FaPlus /> Pemasukan
          </button>
          <button
            type="button"
            className={`type-btn ${type === 'expense' ? 'active-expense' : ''}`}
            onClick={() => setType('expense')}
          >
            <FaMinus /> Pengeluaran
          </button>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group partner-selector">
          <button
            type="button"
            className={`partner-btn ${partner === 'partner1' ? 'active-partner1' : ''}`}
            onClick={() => setPartner('partner1')}
          >
            <FaUser /> Aldi Ganteng 
          </button>
          <button
            type="button"
            className={`partner-btn ${partner === 'partner2' ? 'active-partner2' : ''}`}
            onClick={() => setPartner('partner2')}
          >
            <FaUser /> Dina cantik
          </button>
        </div>
      </div>

      <button type="submit" className="submit-btn">
        Tambahkan Transaksi
      </button>
    </form>
  );
}

export default TransactionForm;