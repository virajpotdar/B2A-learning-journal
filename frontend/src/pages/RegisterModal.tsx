import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface RegisterModalProps {
  open?: boolean;
  onClose?: () => void;
}

export default function RegisterModal({ open = false, onClose }: RegisterModalProps) {
  const navigate = useNavigate();

  const handleRegister = () => {
    navigate('/register');
    onClose?.();
  };

  const handleLogin = () => {
    navigate('/login');
    onClose?.();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Account</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Start your learning journey today
        </Typography>
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Registration is handled by Auth0. Click below to proceed.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleLogin} color="primary">
          Already have an account?
        </Button>
        <Button onClick={handleRegister} variant="contained" color="primary">
          Sign Up
        </Button>
      </DialogActions>
    </Dialog>
  );
}
