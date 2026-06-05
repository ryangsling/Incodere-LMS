import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SmoothScrollProvider } from './context/SmoothScrollProvider'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SmoothScrollProvider>
          <App />
        </SmoothScrollProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
