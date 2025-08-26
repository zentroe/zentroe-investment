import { StrictMode } from 'react'
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { OnboardingProvider } from './context/OnboardingContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import OnboardingRouter from './components/OnboardingRouter.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <AuthProvider>
            <OnboardingProvider>
              <OnboardingRouter>
                <App />
              </OnboardingRouter>
            </OnboardingProvider>
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>,
)
