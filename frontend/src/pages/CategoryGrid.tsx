import { Box, Container, Card, CardContent, Typography, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const categories = [
  { name: 'Frontend', icon: '🎨', count: 45, progress: 75 },
  { name: 'Backend', icon: '⚙️', count: 38, progress: 60 },
  { name: 'Database', icon: '🗄️', count: 25, progress: 45 },
  { name: 'DevOps', icon: '🚀', count: 30, progress: 55 },
  { name: 'Cloud', icon: '☁️', count: 22, progress: 40 },
  { name: 'AI/ML', icon: '🤖', count: 28, progress: 35 },
  { name: 'Data Structures', icon: '📊', count: 35, progress: 50 },
  { name: 'System Design', icon: '🏗️', count: 20, progress: 30 },
  { name: 'Security', icon: '🔒', count: 18, progress: 25 },
  { name: 'Python', icon: '🐍', count: 40, progress: 65 },
  { name: 'JavaScript', icon: '⚡', count: 50, progress: 80 },
  { name: 'React', icon: '⚛️', count: 35, progress: 70 },
];

export default function CategoryGrid() {
  const navigate = useNavigate();

  return (
    <Box sx={{ py: 12, bgcolor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
          Explore Categories
        </Typography>
        <Typography variant="body1" sx={{ mb: 8, textAlign: 'center', color: 'text.secondary' }}>
          Choose a learning path and start your journey
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {categories.map((category) => (
            <Box key={category.name} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(33.333% - 16px)' } }}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  },
                }}
                onClick={() => navigate(`/roadmap/${category.name.toLowerCase()}`)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h3" sx={{ mr: 2 }}>
                      {category.icon}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {category.name}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip label={`${category.count} topics`} size="small" variant="outlined" />
                    <Chip label={`${category.progress}% complete`} size="small" color="primary" />
                  </Box>
                  <Box
                    sx={{
                      height: 6,
                      bgcolor: 'grey.200',
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        bgcolor: 'primary.main',
                        width: `${category.progress}%`,
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
