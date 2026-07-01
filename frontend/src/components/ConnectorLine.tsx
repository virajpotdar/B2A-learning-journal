import { Box } from '@mui/material';

interface ConnectorLineProps {
  hasSiblingBelow?: boolean;
  isLast?: boolean;
  color?: string;
}

export default function ConnectorLine({
  hasSiblingBelow = true,
  isLast = false,
  color,
}: ConnectorLineProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        height: 32,
        position: 'relative',
        '& svg': { overflow: 'visible' },
      }}
    >
      <svg width="40" height="32" viewBox="0 0 40 32">
        <line
          x1="20"
          y1="0"
          x2="20"
          y2="32"
          stroke={color ?? 'currentColor'}
          strokeWidth="2"
          strokeOpacity={0.25}
        />
        {!isLast && hasSiblingBelow && (
          <line
            x1="20"
            y1="16"
            x2="40"
            y2="16"
            stroke={color ?? 'currentColor'}
            strokeWidth="2"
            strokeOpacity={0.25}
          />
        )}
      </svg>
    </Box>
  );
}
