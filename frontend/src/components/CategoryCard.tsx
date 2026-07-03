import { Card, CardContent, Box, Typography, IconButton, Tooltip, Button } from '@mui/material';
import { Share, Bookmark, BookmarkBorder, Delete } from '@mui/icons-material';
import { motion } from 'framer-motion';
import type { LearningCategory } from '../types';

interface CategoryCardProps {
  category: LearningCategory;
  topicCount: number;
  progress: number;
  onClick: () => void;
  index?: number;
  onShare?: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
  onDelete?: () => void;
}

export default function CategoryCard({
  category,
  topicCount,
  onClick,
  index = 0,
  onShare,
  onBookmark,
  isBookmarked = false,
  onDelete,
}: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      whileHover={{ y: -4 }}
      style={{ height: '100%' }}
    >
      <Card
        elevation={0}
        sx={{
          height: '100%',
          overflow: 'hidden',
          transition: 'box-shadow 0.3s',
          borderRadius: 3,
          border: 1,
          borderColor: 'divider',
          '&:hover': {
            boxShadow: (t) =>
              t.palette.mode === 'dark'
                ? '0 12px 32px rgba(0,0,0,0.4)'
                : '0 12px 32px rgba(15,23,42,0.1)',
            borderColor: category.color,
          },
        }}
      >
        <Box onClick={onClick} sx={{ height: '100%', cursor: 'pointer' }}>
          <Box
            sx={{
              height: 4,
              background: category.gradient,
            }}
          />
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {category.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  {category.description}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                {onDelete && (
                  <Tooltip title="Delete Learning Path">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                      sx={{
                        color: 'error.main',
                        bgcolor: 'action.hover',
                        '&:hover': {
                          bgcolor: 'error.light',
                        },
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                {onBookmark && (
                  <Tooltip title={isBookmarked ? 'Remove Bookmark' : 'Bookmark'}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookmark();
                      }}
                      sx={{
                        color: isBookmarked ? 'warning.main' : 'text.secondary',
                        bgcolor: 'action.hover',
                        '&:hover': {
                          bgcolor: 'action.selected',
                        },
                      }}
                    >
                      {isBookmarked ? <Bookmark fontSize="small" /> : <BookmarkBorder fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                )}
                {onShare && (
                  <Tooltip title="Share Learning Path">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onShare();
                      }}
                      sx={{
                        color: 'text.secondary',
                        bgcolor: 'action.hover',
                        '&:hover': {
                          bgcolor: 'action.selected',
                        },
                      }}
                    >
                      <Share fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5, gap: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                {topicCount} topic{topicCount !== 1 ? 's' : ''}
              </Typography>
              {onDelete && (
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  sx={{ minWidth: 'auto', px: 1.25, py: 0.5, fontSize: '0.75rem' }}
                >
                  Delete
                </Button>
              )}
            </Box>
          </CardContent>
        </Box>
      </Card>
    </motion.div>
  );
}
