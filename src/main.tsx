// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProvider } from './context/AppContext.tsx'
import { ToastProvider } from './context/ToastContext.tsx' // Add this
import App from './App.tsx'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
  <ToastProvider> {/* Wrap AppProvider inside ToastProvider */}
  <AppProvider>
  <App />
  {/* ToastContainer is rendered automatically by ToastProvider */}
  </AppProvider>
  </ToastProvider>
  </StrictMode>,
)
