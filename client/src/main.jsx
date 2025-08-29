import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { NavigationProvider } from './components/NavigationContext.jsx'
import { HelmetProvider } from 'react-helmet-async'

createRoot(document.getElementById('root')).render(
  <HelmetProvider>
  <NavigationProvider>
  <StrictMode>
    <App />
  </StrictMode>
  </NavigationProvider>
  </HelmetProvider>
)
