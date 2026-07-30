import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'
import App from './App.tsx'

const rootElement = document.getElementById('root')!;

// Global Error Handler for debugging
window.addEventListener('error', (e) => {
  rootElement.innerHTML = `
    <div style="padding: 20px; color: red; font-family: monospace;">
      <h2>Application Crashed</h2>
      <p><b>Message:</b> ${e.message}</p>
      <p><b>File:</b> ${e.filename}:${e.lineno}</p>
      <pre>${(e.error as any)?.stack || ''}</pre>
    </div>
  `;
});

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
