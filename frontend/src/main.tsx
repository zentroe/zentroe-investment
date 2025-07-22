import { StrictMode } from 'react'
import { HelmetProvider } from "react-helmet-async";
import { OnboardingProvider } from './context/OnboardingContext.tsx';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <OnboardingProvider>
        <App />
      </OnboardingProvider>
    </HelmetProvider>
  </StrictMode>,
)
