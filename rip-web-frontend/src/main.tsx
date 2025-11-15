import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from "react-redux"
import { store } from "./store/store"
import App from './App.tsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'

import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    updateSW();
  },
  onOfflineReady() {
    console.log('App ready for offline use');
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter> {/* УБЕРИТЕ BASENAME */}
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)