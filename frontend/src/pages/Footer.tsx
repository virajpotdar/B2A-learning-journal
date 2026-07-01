import { Box, Container, Typography, Link } from '@mui/material';

export default function Footer() {
  return (
    <Box sx={{ bgcolor: 'background.default', py: 8, borderTop: 1, borderColor: 'divider' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
          <Box sx={{ maxWidth: 300 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Knowledge Journal
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Transform your knowledge into interactive roadmaps. Learn step by step with visual guides.
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Product
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" color="text.secondary" underline="hover">Features</Link>
              <Link href="#" color="text.secondary" underline="hover">Pricing</Link>
              <Link href="#" color="text.secondary" underline="hover">Roadmaps</Link>
            </Box>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Company
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" color="text.secondary" underline="hover">About</Link>
              <Link href="#" color="text.secondary" underline="hover">Blog</Link>
              <Link href="#" color="text.secondary" underline="hover">Careers</Link>
            </Box>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Legal
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" color="text.secondary" underline="hover">Privacy</Link>
              <Link href="#" color="text.secondary" underline="hover">Terms</Link>
              <Link href="#" color="text.secondary" underline="hover">Contact</Link>
            </Box>
          </Box>
        </Box>
        <Box sx={{ mt: 6, pt: 4, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            © 2024 Knowledge Journal. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
