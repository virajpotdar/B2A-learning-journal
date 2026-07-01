import { Box, Container, Typography, Stepper, Step, StepLabel, StepContent } from '@mui/material';

const steps = [
  {
    label: 'Choose a Category',
    description: 'Browse through our extensive collection of learning categories and pick one that interests you.',
  },
  {
    label: 'Follow the Roadmap',
    description: 'Navigate through the interactive roadmap, learning topics in a logical, structured order.',
  },
  {
    label: 'Track Progress',
    description: 'Mark topics as complete, bookmark important sections, and watch your progress grow.',
  },
];

export default function HowItWorksSection() {
  return (
    <Box sx={{ py: 12, bgcolor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
          How It Works
        </Typography>
        <Typography variant="body1" sx={{ mb: 8, textAlign: 'center', color: 'text.secondary' }}>
          Start learning in three simple steps
        </Typography>
        <Stepper orientation="vertical">
          {steps.map((step) => (
            <Step key={step.label} active>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Container>
    </Box>
  );
}
