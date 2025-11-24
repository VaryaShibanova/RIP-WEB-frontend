// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from "react-redux"
import { store } from "./store/store"
import App from './App.tsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'

import { registerSW } from 'virtual:pwa-register'

// Автоматическая очистка кэша при разработке
if (import.meta.env.DEV) {
  localStorage.removeItem('debug');
  sessionStorage.clear();
  
  // Очистка service worker кэша
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
}

const updateSW = registerSW({
  onNeedRefresh() {
    // Автоматическое обновление когда доступно
    updateSW();
  },
  onOfflineReady() {
    console.log('App ready for offline use');
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter> {/* УБРАЛИ basename */}
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)