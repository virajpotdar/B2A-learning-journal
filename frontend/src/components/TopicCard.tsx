import { Card, CardContent, Box, Typography, IconButton, Chip, Stack } from '@mui/material';
import {
  ExpandMore,
  ChevronRight,
  Bookmark,
  BookmarkBorder,
  CheckCircle,
  AccessTime,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import ProgressRing from './ProgressRing';
import DifficultyBadge from './DifficultyBadge';
import StatusBadge from './StatusBadge';
import { getCategoryColor } from '../data/categories';
import type { RoadmapNode } from '../types';

interface TopicCardProps {
  node: RoadmapNode;
  isActive?: boolean;
  onClick: () => void;
  onToggleExpand: () => void;
  onToggleBookmark: () => void;
}

export default function TopicCard({
  node,
  isActive,
  onClick,
  onToggleExpand,
  onToggleBookmark,
}: TopicCardProps) {
  const categoryColor = getCategoryColor(node.category);
  const hasChildren = node.children.length > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ width: '100%', maxWidth: 480 }}
    >
      <Card
        onClick={onClick}
        elevation={0}
        sx={{
          cursor: 'pointer',
          borderLeft: `4px solid ${categoryColor}`,
          transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
          outline: isActive ? `2px solid ${categoryColor}` : 'none',
          outlineOffset: 2,
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: (t) =>
              t.palette.mode === 'dark'
                ? '0 12px 32px rgba(0,0,0,0.4)'
                : '0 12px 32px rgba(15,23,42,0.1)',
          },
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" spacing={0.5} sx={{ mb: 0.5, alignItems: 'center' }}>
                {node.status === 'completed' && (
                  <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
                )}
                <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700 }}>
                  {node.title}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={0.75} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.75 }}>
                <StatusBadge status={node.status} />
                <DifficultyBadge difficulty={node.difficulty} />
                <Chip
                  icon={<AccessTime sx={{ fontSize: '14px !important' }} />}
                  label={`${node.estimatedMinutes}m`}
                  size="small"
                  variant="outlined"
                  sx={{ height: 24, fontSize: '0.7rem' }}
                />
              </Stack>
            </Box>

            <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
              <Box sx={{ position: 'relative' }}>
                <ProgressRing progress={node.progress} size={36} strokeWidth={3} color={categoryColor} />
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%,-50%)',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                  }}
                >
                  {node.progress}%
                </Typography>
              </Box>

              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark();
                }}
                sx={{ color: node.isBookmarked ? 'warning.main' : 'text.secondary' }}
              >
                {node.isBookmarked ? <Bookmark fontSize="small" /> : <BookmarkBorder fontSize="small" />}
              </IconButton>
            </Stack>
          </Stack>

          {hasChildren && (
            <Box
              component="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              sx={{
                mt: 1,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                py: 0.75,
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: 'action.hover',
                color: 'text.secondary',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                fontFamily: 'inherit',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'action.selected', color: 'text.primary' },
              }}
            >
              {node.isExpanded ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}
              {node.isExpanded ? 'Collapse' : 'Expand'} ({node.children.length})
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
