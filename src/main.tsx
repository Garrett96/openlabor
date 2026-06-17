// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ToastProvider } from './context/ToastContext.tsx'
import { EmployeeProvider } from './context/EmployeeContext.tsx' // Added
import { AppProvider } from './context/AppContext.tsx'
import App from './App.tsx'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
  <ToastProvider>
  <EmployeeProvider> {/* Added */}
  <AppProvider>
  <App />
  </AppProvider>
  </EmployeeProvider>
  </ToastProvider>
  </StrictMode>,
)
