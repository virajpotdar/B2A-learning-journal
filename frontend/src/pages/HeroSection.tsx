import { Box, Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <Box sx={{ py: 16, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', color: 'white' }}>
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 3 }}>
            Visual Learning Platform
          </Typography>
          <Typography variant="h5" sx={{ mb: 6, opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
            Transform your knowledge into interactive roadmaps. Learn step by step with visual guides.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              size="large"
              sx={{ bgcolor: 'white', color: '#667eea', '&:hover': { bgcolor: '#f5f5f5' } }}
              onClick={() => navigate('/register')}
            >
              Get Started Free
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
