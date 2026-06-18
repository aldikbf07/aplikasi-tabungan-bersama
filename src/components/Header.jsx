import React from 'react';
import { FaWallet,FaHeart  } from 'react-icons/fa';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <FaHeart className="header-icon" />
        <h1 className="header-title">Tabungan Aldi & Dina</h1>
      </div>
      <p className="header-subtitle">Aplikasi tabungan bersama untuk masa depan eaaaaa</p>
    </header>
  );
}

export default Header;