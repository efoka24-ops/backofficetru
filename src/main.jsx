import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './admin.css'

// Cache buster - Force rebuild: 2026-01-04_13:45:00
console.log('✅ main.jsx: All imports successful');

try {
  console.log('📦 Mounting React app...');
  const rootElement = document.getElementById('root');
  console.log('🎯 Root element found:', rootElement);
  
  if (!rootElement) {
    throw new Error('Root element not found in HTML!');
  }
  
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log('✅ React app mounted successfully');
} catch (error) {
  console.error('❌ Error mounting app:', error);
  document.body.innerHTML = `<div style="padding: 20px; color: red; font-family: monospace;">
    <h1>Erreur d'initialisation</h1>
    <pre>${error.message}</pre>
    <pre>${error.stack}</pre>
  </div>`;
}
