import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Auth0Provider } from '@auth0/auth0-react';
import AppThemeProvider from './theme/AppThemeProvider';
import { initializeFrontendTelemetry } from './telemetry';

// Initialize OpenTelemetry for logging and tracing
initializeFrontendTelemetry();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppThemeProvider>
      <Auth0Provider
        domain={import.meta.env.VITE_AUTH0_DOMAIN || 'dev-74zy5hv4cgyeu07c.au.auth0.com'}
        clientId={import.meta.env.VITE_AUTH0_CLIENT_ID || 'HAvnSllVE2WTHVbM5itCE3GVuPjclddZ'}
        authorizationParams={{
          redirect_uri: window.location.origin
        }}
      >
        <App />
      </Auth0Provider>
    </AppThemeProvider>
  </StrictMode>,
)
