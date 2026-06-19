// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Cek manifest.json
console.log('📱 Checking manifest...');
fetch('/manifest.json')
  .then(res => res.json())
  .then(data => {
    console.log('✅ Manifest loaded:', data);
  })
  .catch(err => {
    console.warn('⚠️ Manifest not found:', err);
  });

const root = ReactDOM.createRoot(document.getElementById('root'));

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('✅ App rendered successfully');
} catch (error) {
  console.error('❌ Error rendering App:', error);
  root.render(
    <div style={{ padding: 20, textAlign: 'center', color: '#dc2626' }}>
      <h1>⚠️ Terjadi Error</h1>
      <p>{error.message}</p>
      <button onClick={() => window.location.reload()}>Refresh</button>
    </div>
  );
}