import React from 'react';
import { Box, Typography, IconButton, Button } from '@mui/material';
import { Bookmark, BookmarkBorder, Edit, Delete } from '@mui/icons-material';
import './RoadmapCard.css';

interface RoadmapCardProps {
  title: string;
  category: string;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onClick?: () => void;
  onToggleExpand?: () => void;
  onBookmark?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isBookmarked?: boolean;
}

const RoadmapCard: React.FC<RoadmapCardProps> = ({
  title,
  category,
  hasChildren = false,
  isExpanded = false,
  onClick,
  onToggleExpand,
  onBookmark,
  onEdit,
  onDelete,
  isBookmarked = false,
}) => {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      frontend: '#61DAFB',
      backend: '#68A063',
      devops: '#326CE5',
      database: '#4479A1',
      security: '#F7DF1E',
      testing: '#C21325',
      general: '#E34F26',
      other: '#ed771d'
    };
    return colors[category.toLowerCase()] || colors.other;
  };

  const categoryColor = getCategoryColor(category);

  return (
    <Box 
      className="roadmap-card"
      sx={{
        borderLeft: `3px solid ${categoryColor}`,
        bgcolor: 'background.paper',
        borderRadius: 1,
        p: 2,
        boxShadow: 1,
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
        '&:hover': {
          boxShadow: 3,
        },
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {onBookmark && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onBookmark();
              }}
              sx={{ color: isBookmarked ? 'warning.main' : 'text.secondary' }}
            >
              {isBookmarked ? <Bookmark fontSize="small" /> : <BookmarkBorder fontSize="small" />}
            </IconButton>
          )}
          {onEdit && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              sx={{ color: 'text.secondary' }}
            >
              <Edit fontSize="small" />
            </IconButton>
          )}
          {onDelete && (
            <Button
              size="small"
              color="error"
              variant="outlined"
              startIcon={<Delete fontSize="small" />}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              sx={{ minWidth: 'auto', px: 1, py: 0.25, fontSize: '0.75rem', height: 28 }}
            >
              Delete
            </Button>
          )}
        </Box>
      </Box>
      
      {hasChildren && (
        <Box
          component="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand?.();
          }}
          sx={{
            mt: 1,
            px: 1,
            py: 0.5,
            fontSize: '0.75rem',
            color: 'text.secondary',
            bgcolor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            '&:hover': {
              color: 'primary.main',
            },
          }}
        >
          {isExpanded ? '▼ Collapse' : '▶ Expand'}
        </Box>
      )}
    </Box>
  );
};

export default RoadmapCard;
