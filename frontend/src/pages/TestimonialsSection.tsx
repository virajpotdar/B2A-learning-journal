import { Box, Container, Typography, Card, CardContent, Avatar } from '@mui/material';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Frontend Developer',
    content: 'This platform transformed how I learn. The visual roadmaps make complex topics easy to understand.',
    avatar: 'S',
  },
  {
    name: 'Mike Chen',
    role: 'Full Stack Engineer',
    content: 'Best learning platform I have used. The structured approach keeps me motivated and on track.',
    avatar: 'M',
  },
  {
    name: 'Emily Davis',
    role: 'Software Engineer',
    content: 'The progress tracking feature is amazing. I can see exactly how far I have come and what is next.',
    avatar: 'E',
  },
];

export default function TestimonialsSection() {
  return (
    <Box sx={{ py: 12, bgcolor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
          What Our Users Say
        </Typography>
        <Typography variant="body1" sx={{ mb: 8, textAlign: 'center', color: 'text.secondary' }}>
          Join thousands of satisfied learners
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {testimonials.map((testimonial) => (
            <Box key={testimonial.name} sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' } }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      {testimonial.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    "{testimonial.content}"
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
