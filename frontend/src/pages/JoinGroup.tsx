import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Avatar,
  Chip,
} from '@mui/material';
import { Group as GroupIcon } from '@mui/icons-material';
import { getGroupByInviteCode, joinGroup } from '../services/groupsApi';
import type { Group } from '../types';

export default function JoinGroup() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, loginWithRedirect, user } = useAuth0();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inviteCode) return;

    const fetchGroup = async () => {
      try {
        setLoading(true);
        const groupData = await getGroupByInviteCode(inviteCode);
        if (!groupData) {
          setError('Invalid invite code or group not found');
        } else {
          setGroup(groupData);
        }
      } catch (err) {
        setError('Failed to load group information');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [inviteCode]);

  const handleJoin = async () => {
    if (!inviteCode || !isAuthenticated || !user?.email) return;

    try {
      setJoining(true);
      await joinGroup(inviteCode, user.email, user.name, user.picture);
      navigate(`/group/${group?.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to join group');
      console.error(err);
    } finally {
      setJoining(false);
    }
  };

  const handleLogin = async () => {
    await loginWithRedirect({
      appState: { returnTo: window.location.pathname },
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !group) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card elevation={0} sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h5" color="error" gutterBottom>
            {error || 'Group not found'}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            The invite link may be invalid or the group has been deleted.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/journal')}>
            Go to Dashboard
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card elevation={0} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            {group.image_url ? (
              <Avatar
                src={group.image_url}
                sx={{ width: 80, height: 80, mb: 2, mx: 'auto' }}
              />
            ) : (
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  mx: 'auto',
                }}
              >
                <GroupIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
            )}
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              {group.name}
            </Typography>
            {group.description && (
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {group.description}
              </Typography>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
              <Chip label={`${group.member_count} members`} size="small" />
              <Chip label={`${group.topic_count} topics`} size="small" />
            </Box>
          </Box>

          <Box sx={{ bgcolor: 'background.default', p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
              Join Group
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
              Join this group to collaborate on learning paths with other members.
            </Typography>
            {!isAuthenticated ? (
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleLogin}
                sx={{ fontWeight: 700 }}
              >
                Login to Join
              </Button>
            ) : (
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleJoin}
                disabled={joining}
                sx={{ fontWeight: 700 }}
              >
                {joining ? 'Joining...' : 'Join Group'}
              </Button>
            )}
          </Box>

          <Button
            variant="text"
            fullWidth
            onClick={() => navigate('/journal')}
            sx={{ mt: 2 }}
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}
