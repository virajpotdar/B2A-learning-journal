import { useState } from 'react';
import {
  Menu,
  MenuItem,
  Box,
  Avatar,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import {
  Person,
  Image,
  Edit,
  Email,
  Settings,
  Logout,
} from '@mui/icons-material';
import { useAuth0 } from '@auth0/auth0-react';

interface ProfileDropdownProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

export default function ProfileDropdown({ anchorEl, open, onClose }: ProfileDropdownProps) {
  const { user, logout } = useAuth0();
  const [editNameOpen, setEditNameOpen] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
    onClose();
  };

  const handleEditName = () => {
    // TODO: Implement backend API to update user name
    console.log('Updating name to:', newName);
    setEditNameOpen(false);
    onClose();
  };

  const handleUploadPicture = () => {
    // TODO: Implement profile picture upload
    console.log('Upload profile picture');
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 280,
              mt: 1.5,
              borderRadius: 2,
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 8px 32px rgba(0,0,0,0.4)'
                  : '0 8px 32px rgba(15,23,42,0.12)',
            },
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={user?.picture}
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'primary.main',
              fontSize: '1.25rem',
              fontWeight: 700,
            }}
          >
            {getInitials(user?.name)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.name || 'User'}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.email}
            </Typography>
          </Box>
        </Box>

        <Divider />

        <MenuItem onClick={() => { /* Navigate to profile */ onClose(); }}>
          <Person sx={{ mr: 2, fontSize: 20 }} />
          <Typography>View Profile</Typography>
        </MenuItem>

        <MenuItem onClick={handleUploadPicture}>
          <Image sx={{ mr: 2, fontSize: 20 }} />
          <Typography>Upload Profile Picture</Typography>
        </MenuItem>

        <MenuItem onClick={() => { setEditNameOpen(true); onClose(); }}>
          <Edit sx={{ mr: 2, fontSize: 20 }} />
          <Typography>Edit Name</Typography>
        </MenuItem>

        <MenuItem disabled>
          <Email sx={{ mr: 2, fontSize: 20 }} />
          <Box sx={{ flex: 1 }}>
            <Typography>Email Address</Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
        </MenuItem>

        <MenuItem disabled>
          <Settings sx={{ mr: 2, fontSize: 20 }} />
          <Typography>Settings</Typography>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <Logout sx={{ mr: 2, fontSize: 20 }} />
          <Typography>Logout</Typography>
        </MenuItem>
      </Menu>

      <Dialog open={editNameOpen} onClose={() => setEditNameOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Display Name"
            fullWidth
            variant="outlined"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditNameOpen(false)}>Cancel</Button>
          <Button onClick={handleEditName} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
