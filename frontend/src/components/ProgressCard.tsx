import { Card, CardContent, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';

interface ProgressCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  progress?: number;
  icon?: React.ReactNode;
  color?: string;
  index?: number;
}

export default function ProgressCard({
  title,
  value,
  subtitle,
  icon,
  color = '#6366f1',
  index = 0,
}: ProgressCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card elevation={0} sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            {icon && (
              <Box sx={{ color, display: 'flex' }}>{icon}</Box>
            )}
          </Box>
          <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 800 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
