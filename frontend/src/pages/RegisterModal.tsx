import { useEffect } from "react";
import { Dialog, DialogContent, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from 'react-router-dom';

interface RegisterModalProps {
  open?: boolean;
  onClose?: () => void;
}

export default function RegisterModal({ open = false, onClose }: RegisterModalProps) {
  const { isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/journal');
      onClose?.();
    }
  }, [isAuthenticated, navigate, onClose]);

  const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN || 'dev-virajpotdar10.us.auth0.com';
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const redirectUri = window.location.origin + '/journal';
  const auth0Url = `https://${auth0Domain}/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20profile%20email&screen_hint=signup&prompt=login`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen>
      <IconButton
        onClick={onClose}
        sx={{ position: 'absolute', right: 16, top: 16, zIndex: 1 }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent sx={{ p: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundImage: 'url(/image.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
        <div className="auth-card" style={{ boxShadow: 'none', borderRadius: 0, width: '100%', maxWidth: '420px' }}>
          {/* Header with icon and brand name */}
          <div className="auth-header">
            <div className="auth-brand-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#FF6B00" strokeWidth="2"/>
                <path d="M12 6V12L16 16" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="auth-brand-name">B2A Learning Journal</span>
          </div>

          {/* Welcome section */}
          <h1 className="auth-welcome">Create Account</h1>
          <p className="auth-subtitle">Sign up to start your learning journey</p>

          {/* Embedded Auth0 iframe */}
          <iframe
            src={auth0Url}
            style={{
              width: '100%',
              height: '500px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: 'white'
            }}
            title="Auth0 Registration"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
