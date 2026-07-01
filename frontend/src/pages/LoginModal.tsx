import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface LoginModalProps {
  open?: boolean;
  onClose?: () => void;
}

export default function LoginModal({ open = false, onClose }: LoginModalProps) {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
    onClose?.();
  };

  const handleRegister = () => {
    navigate('/register');
    onClose?.();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Welcome Back</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Sign in to continue your learning journey
        </Typography>
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Login functionality is handled by Auth0. Click below to proceed.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleRegister} color="primary">
          Create Account
        </Button>
        <Button onClick={handleLogin} variant="contained" color="primary">
          Login
        </Button>
      </DialogActions>
    </Dialog>
  );
}
