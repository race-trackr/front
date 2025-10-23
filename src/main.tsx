"use client";

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './globals.css';
import { ThemeProvider } from './components/theme-provider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider 
      attribute="class" // Indique explicitement à next-themes d'utiliser l'attribut 'class'
      defaultTheme="system" 
      enableSystem // Active explicitement la détection du thème système
      storageKey="vite-ui-theme"
    >
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);