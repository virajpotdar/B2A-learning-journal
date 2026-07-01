import { Box, Container, Typography } from '@mui/material';

export default function RoadmapSection() {
  return (
    <Box sx={{ py: 12, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
          Sample Roadmap
        </Typography>
        <Typography variant="body1" sx={{ mb: 8, textAlign: 'center', color: 'text.secondary' }}>
          See how our interactive roadmaps guide your learning journey
        </Typography>
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 3,
            p: 4,
            minHeight: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Interactive roadmap preview coming soon...
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
