import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';

interface SharedPathData {
  category: string;
  notes: any[];
  topicCount: number;
  createdAt: string;
  sharedBy?: string;
}

export default function SharedPathPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const { isAuthenticated, user, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sharedData, setSharedData] = useState<SharedPathData | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (!shareId) {
      setError('Invalid share link');
      setLoading(false);
      return;
    }

    fetchSharedData();
  }, [shareId]);

  const fetchSharedData = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/share/${shareId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load shared path');
      }

      setSharedData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: window.location.origin + `/share/${shareId}`,
      },
    });
  };

  const handleImport = async () => {
    if (!user || !sharedData) return;

    setImporting(true);
    try {
      const response = await fetch(`http://localhost:4000/api/share/${shareId}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.sub,
          newCategory: sharedData.category,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import learning path');
      }

      setConfirmDialogOpen(false);
      navigate(`/roadmap/${data.category}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 3,
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 3,
        }}
      >
        <Card sx={{ maxWidth: 500, width: '100%' }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
              Login Required
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              You need to login to view and import this shared learning path.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleLogin}
              sx={{ minWidth: 200 }}
            >
              Login with Auth0
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 6 }}>
      <Container maxWidth="md">
        <Card>
          <CardContent sx={{ py: 6 }}>
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
              Shared Learning Path
            </Typography>
            
            {sharedData && (
              <>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  {sharedData.sharedBy || 'Someone'} shared a learning path with you.
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Chip
                    label={sharedData.category}
                    color="primary"
                    sx={{ fontSize: '1.1rem', py: 1, px: 2 }}
                  />
                </Box>

                <Typography variant="h6" sx={{ mb: 1 }}>
                  Topics: {sharedData.topicCount}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => setConfirmDialogOpen(true)}
                    sx={{ minWidth: 200 }}
                  >
                    Save to My Learning
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/journal')}
                    sx={{ minWidth: 150 }}
                  >
                    Cancel
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Container>

      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save to My Learning?</DialogTitle>
        <DialogContent>
          {sharedData && (
            <>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {sharedData.sharedBy || 'Someone'} shared a learning path with you.
              </Typography>
              <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {sharedData.category}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Topics: {sharedData.topicCount}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Do you want to save this learning path?
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} disabled={importing}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            variant="contained"
            disabled={importing}
            startIcon={importing ? <CircularProgress size={20} /> : null}
          >
            {importing ? 'Saving...' : 'Save to My Learning'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
