import { Box, Container, Typography, Card, CardContent } from '@mui/material';

const features = [
  {
    title: 'Interactive Roadmaps',
    description: 'Visual learning paths that guide you step by step through complex topics.',
    icon: '🗺️',
  },
  {
    title: 'Progress Tracking',
    description: 'Track your learning journey with detailed progress indicators and milestones.',
    icon: '📈',
  },
  {
    title: 'Rich Content',
    description: 'Access markdown notes, code examples, videos, and documentation in one place.',
    icon: '📚',
  },
  {
    title: 'Smart Search',
    description: 'Find any topic instantly with our powerful search across all categories.',
    icon: '🔍',
  },
];

export default function FeatureSection() {
  return (
    <Box sx={{ py: 12, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
          Why Choose Us
        </Typography>
        <Typography variant="body1" sx={{ mb: 8, textAlign: 'center', color: 'text.secondary' }}>
          Everything you need to accelerate your learning
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {features.map((feature) => (
            <Box key={feature.title} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 16px)' } }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h3" sx={{ mb: 2 }}>
                    {feature.icon}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
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
