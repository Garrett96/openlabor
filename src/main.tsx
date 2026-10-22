// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ToastProvider } from './context/ToastContext.tsx'
import { TeamProvider } from './context/TeamContext.tsx'
import { AppProvider } from './context/AppContext.tsx'
import App from './App.tsx'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
  <ToastProvider>
  <TeamProvider>
  <AppProvider>
  <App />
  </AppProvider>
  </TeamProvider>
  </ToastProvider>
  </StrictMode>,
)
