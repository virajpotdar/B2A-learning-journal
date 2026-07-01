import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Auth0Provider } from '@auth0/auth0-react';
import AppThemeProvider from './theme/AppThemeProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppThemeProvider>
      <Auth0Provider
        domain="dev-74zy5hv4cgyeu07c.au.auth0.com"
        clientId="HAvnSllVE2WTHVbM5itCE3GVuPjclddZ"
        authorizationParams={{
          redirect_uri: window.location.origin
        }}
      >
        <App />
      </Auth0Provider>
    </AppThemeProvider>
  </StrictMode>,
)
