import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { createGroup } from '../services/groupsApi';
import { useAuth0 } from '@auth0/auth0-react';

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
  onGroupCreated: (group: any) => void;
}

export default function CreateGroupModal({ open, onClose, onGroupCreated }: CreateGroupModalProps) {
  const { user } = useAuth0();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !user?.email) return;

    try {
      setLoading(true);
      const group = await createGroup({
        name: name.trim(),
        description: description.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
        userEmail: user.email,
        userName: user.name,
        avatarUrl: user.picture,
      });
      onGroupCreated(group);
      handleClose();
    } catch (error: any) {
      console.error('Failed to create group:', error);
      alert('Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setImageUrl('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography component="span" variant="h6" sx={{ fontWeight: 700 }}>
          Create Group
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Group Name"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Frontend Team, React Study Group"
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Description (optional)"
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the purpose of this group..."
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Group Image URL (optional)"
          fullWidth
          variant="outlined"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/group-image.jpg"
        />
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!name.trim() || loading}>
          {loading ? 'Creating...' : 'Create Group'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
