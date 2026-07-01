import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  TextField,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Chip,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import {
  School,
  Topic,
  Link as LinkIcon,
  Notes,
} from '@mui/icons-material';
import { useSearch } from '../context/SearchContext';
import { fetchNotes } from '../services/notesApi';
import { LEARNING_CATEGORIES, getCategoryForNote } from '../data/categories';
import { buildTreeFromNotes, flattenNodes } from '../utils/roadmapTree';
import { parseNoteContent } from '../utils/contentParser';
import type { JournalNote, SearchResult } from '../types';

export default function SearchDialog() {
  const { open, closeSearch } = useSearch();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [notes, setNotes] = useState<JournalNote[]>([]);

  useEffect(() => {
    if (open) {
      fetchNotes().then(setNotes).catch(console.error);
      setQuery('');
    }
  }, [open]);

  const results = useMemo((): SearchResult[] => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const items: SearchResult[] = [];

    for (const cat of LEARNING_CATEGORIES) {
      if (
        cat.title.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q)
      ) {
        items.push({
          id: `cat-${cat.slug}`,
          title: cat.title,
          category: cat.title,
          categorySlug: cat.slug,
          type: 'category',
          snippet: cat.description,
        });
      }
    }

    const byCategory = new Map<string, JournalNote[]>();
    for (const n of notes) {
      const cat = getCategoryForNote(n.category);
      if (!cat) continue;
      const list = byCategory.get(cat.slug) ?? [];
      list.push(n);
      byCategory.set(cat.slug, list);
    }

    for (const [slug, catNotes] of byCategory) {
      const cat = LEARNING_CATEGORIES.find((c) => c.slug === slug);
      const tree = buildTreeFromNotes(catNotes);
      const flat = flattenNodes(tree);

      for (const node of flat) {
        if (node.title.toLowerCase().includes(q) || node.content.toLowerCase().includes(q)) {
          items.push({
            id: node.id,
            title: node.title,
            category: cat?.title ?? node.category,
            categorySlug: slug,
            type: 'topic',
            snippet: node.content.slice(0, 100),
            noteId: node.noteId,
          });
        }

        const parsed = parseNoteContent(node.content);
        for (const res of parsed.resources) {
          if (res.url !== '#' && (res.label.toLowerCase().includes(q) || res.url.toLowerCase().includes(q))) {
            items.push({
              id: `res-${node.id}-${res.url}`,
              title: res.label,
              category: cat?.title ?? node.category,
              categorySlug: slug,
              type: 'resource',
              snippet: res.url,
              noteId: node.noteId,
            });
          }
        }
      }
    }

    return items.slice(0, 20);
  }, [query, notes]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      closeSearch();
      setQuery('');
      if (result.type === 'category') {
        navigate(`/roadmap/${result.categorySlug}`);
      } else {
        navigate(`/roadmap/${result.categorySlug}?topic=${result.id}`);
      }
    },
    [closeSearch, navigate]
  );

  const typeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'category':
        return <School color="primary" />;
      case 'topic':
        return <Topic color="secondary" />;
      case 'resource':
        return <LinkIcon color="info" />;
      case 'note':
        return <Notes color="action" />;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={closeSearch}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            maxHeight: '80vh',
          },
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography component="span" variant="h6" sx={{ fontWeight: 700 }}>
          Search
        </Typography>
        <IconButton onClick={closeSearch} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <TextField
          autoFocus
          fullWidth
          placeholder="Search learning paths, topics, notes, bookmarks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ px: 2, pt: 1, mb: 2 }}
          size="small"
        />

        {query && (
          <List sx={{ maxHeight: 500, overflow: 'auto', py: 1 }}>
            {results.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">No results found</Typography>
              </Box>
            ) : (
              results.map((result) => (
                <ListItemButton
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  sx={{ mx: 1, borderRadius: 2 }}
                >
                  <ListItemIcon>{typeIcon(result.type)}</ListItemIcon>
                  <ListItemText
                    primary={result.title}
                    secondary={
                      <Box component="span" sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip label={result.type} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                        {result.category}
                      </Box>
                    }
                  />
                </ListItemButton>
              ))
            )}
          </List>
        )}

        {!query && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              Search across all learning paths
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Topics, notes, and bookmarks
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
