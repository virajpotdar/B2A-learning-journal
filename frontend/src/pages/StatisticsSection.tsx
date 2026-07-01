import { Box, Container, Typography, Card, CardContent } from '@mui/material';

const stats = [
  { value: '10K+', label: 'Active Learners' },
  { value: '500+', label: 'Learning Paths' },
  { value: '50K+', label: 'Topics Covered' },
  { value: '95%', label: 'Satisfaction Rate' },
];

export default function StatisticsSection() {
  return (
    <Box sx={{ py: 12, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {stats.map((stat) => (
            <Box key={stat.label} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 16px)', md: '1 1 calc(25% - 24px)' } }}>
              <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                <CardContent sx={{ textAlign: 'center', color: 'white' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
