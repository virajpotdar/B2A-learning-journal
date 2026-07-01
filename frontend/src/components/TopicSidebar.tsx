import { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Stack,
  Chip,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Close,
  Bookmark,
  BookmarkBorder,
  Edit,
  Delete,
  OpenInNew,
  Share,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { getCategoryColor } from '../data/categories';
import { parseNoteContent } from '../utils/contentParser';
import {
  getTopicMeta,
  saveTopicMeta,
  toggleBookmark,
  recordTopicView,
} from '../utils/topicStorage';
import type { RoadmapNode } from '../types';

interface TopicSidebarProps {
  node: RoadmapNode;
  open: boolean;
  onClose: () => void;
  onUpdate?: (id: string, data: { title: string; content: string }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onRefresh?: () => void;
}

export default function TopicSidebar({
  node,
  open,
  onClose,
  onUpdate,
  onDelete,
  onRefresh,
}: TopicSidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const categoryColor = getCategoryColor(node.category);

  const [bookmarked, setBookmarked] = useState(node.isBookmarked);
  const [personalNotes, setPersonalNotes] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(node.title);
  const [editContent, setEditContent] = useState(node.content);
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [newResourceLabel, setNewResourceLabel] = useState('');
  const [resources, setResources] = useState<Array<{ label: string; url: string; type: string }>>([]);

  useEffect(() => {
    if (open) {
      recordTopicView(node.id);
      const meta = getTopicMeta(node.id);
      setBookmarked(meta.isBookmarked);
      setPersonalNotes(meta.personalNotes);
      setEditTitle(node.title);
      setEditContent(node.content);
      setResources(meta.resources || []);
    }
  }, [open, node.id, node.title, node.content]);

  const parsed = parseNoteContent(node.content);

  const handleBookmark = () => {
    const next = toggleBookmark(node.id);
    setBookmarked(next);
    onRefresh?.();
  };

  const handleSavePersonalNotes = () => {
    saveTopicMeta(node.id, { personalNotes });
  };

  const handleAddResource = () => {
    if (!newResourceUrl.trim() || !newResourceLabel.trim()) return;
    
    const newResource = {
      label: newResourceLabel,
      url: newResourceUrl,
      type: 'Link'
    };
    
    const updatedResources = [...resources, newResource];
    setResources(updatedResources);
    saveTopicMeta(node.id, { resources: updatedResources });
    setNewResourceUrl('');
    setNewResourceLabel('');
  };

  const handleDeleteResource = (index: number) => {
    const updatedResources = resources.filter((_, i) => i !== index);
    setResources(updatedResources);
    saveTopicMeta(node.id, { resources: updatedResources });
  };

  const handleEditSave = async () => {
    if (node.noteId && onUpdate) {
      await onUpdate(node.noteId, { title: editTitle, content: editContent });
      setEditOpen(false);
      onRefresh?.();
    }
  };

  const handleDelete = async () => {
    if (node.noteId && onDelete) {
      setDeleteOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (node.noteId && onDelete) {
      await onDelete(node.noteId);
      setDeleteOpen(false);
      onClose();
      onRefresh?.();
    }
  };

  const handleShare = async () => {
    if (!node.noteId) return;
    
    try {
      const shareUrl = `${window.location.origin}/share/${node.noteId}`;
      await navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    } catch (err) {
      console.error('Share error:', err);
      alert('Failed to copy share link');
    }
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          p: 2.5,
          borderBottom: 1,
          borderColor: 'divider',
          background: (t) =>
            t.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #1a1d27 0%, #252836 100%)'
              : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        }}
      >
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1, pr: 1 }}>
            <Chip
              label={node.category}
              size="small"
              sx={{ bgcolor: `${categoryColor}18`, color: categoryColor, fontWeight: 700, mb: 1 }}
            />
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {node.title}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton onClick={handleShare} size="small" title="Share">
              <Share fontSize="small" />
            </IconButton>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
          Notes
        </Typography>
        <Box
          className="markdown-content"
          sx={{
            mt: 1,
            mb: 3,
            '& p': { mb: 1.5, lineHeight: 1.7 },
            '& code': {
              bgcolor: 'action.hover',
              px: 0.75,
              py: 0.25,
              borderRadius: 1,
              fontSize: '0.85em',
            },
            '& pre': {
              bgcolor: 'grey.900',
              color: 'grey.100',
              p: 2,
              borderRadius: 2,
              overflow: 'auto',
              '& code': { bgcolor: 'transparent', p: 0 },
            },
          }}
        >
          <ReactMarkdown>{parsed.markdown || 'No notes available for this topic.'}</ReactMarkdown>
        </Box>

        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
          Resources
        </Typography>
        <Stack spacing={1} sx={{ mt: 1, mb: 3 }}>
          {resources.map((res, i) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Typography>🔗</Typography>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {res.label}
                </Typography>
              </Box>
              <Link href={res.url} target="_blank" rel="noopener">
                <IconButton size="small">
                  <OpenInNew fontSize="small" color="primary" />
                </IconButton>
              </Link>
              <IconButton size="small" onClick={() => handleDeleteResource(i)} sx={{ color: 'error.main' }}>
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <TextField
              size="small"
              placeholder="Resource URL"
              fullWidth
              value={newResourceUrl}
              onChange={(e) => setNewResourceUrl(e.target.value)}
            />
            <TextField
              size="small"
              placeholder="Label"
              sx={{ width: 120 }}
              value={newResourceLabel}
              onChange={(e) => setNewResourceLabel(e.target.value)}
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleAddResource}
              disabled={!newResourceUrl.trim() || !newResourceLabel.trim()}
            >
              Add
            </Button>
          </Box>
        </Stack>

        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
          Personal Notes
        </Typography>
        <TextField
          multiline
          minRows={3}
          fullWidth
          placeholder="Add your own notes here..."
          value={personalNotes}
          onChange={(e) => setPersonalNotes(e.target.value)}
          onBlur={handleSavePersonalNotes}
          sx={{ mt: 1, mb: 3 }}
        />
      </Box>

      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Button
          variant="outlined"
          startIcon={bookmarked ? <Bookmark /> : <BookmarkBorder />}
          onClick={handleBookmark}
        >
          Bookmark
        </Button>
        {node.noteId && onUpdate && (
          <Button variant="outlined" startIcon={<Edit />} onClick={() => setEditOpen(true)}>
            Edit
          </Button>
        )}
        {node.noteId && onDelete && (
          <Button variant="outlined" color="error" startIcon={<Delete />} onClick={handleDelete}>
            Delete
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        variant={isMobile ? 'temporary' : 'persistent'}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 420, md: 460, lg: 500 },
            boxShadow: '-8px 0 32px rgba(0,0,0,0.15)',
            maxWidth: '100vw',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Topic</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            fullWidth
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            label="Content"
            fullWidth
            multiline
            minRows={6}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Topic</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this topic? This action cannot be undone.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Topic: {node.title}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
