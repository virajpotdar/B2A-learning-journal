import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItemButton,
  ListItemText,
  Chip,
} from '@mui/material';
import { PlayArrow } from '@mui/icons-material';
import type { JournalNote } from '../types';
import { getRecentlyViewed } from '../utils/topicStorage';
import { getCategoryForNote } from '../data/categories';
import { buildTreeFromNotes, findNodeById, flattenNodes } from '../utils/roadmapTree';

interface ContinueLearningProps {
  notes: JournalNote[];
}

export default function ContinueLearning({ notes }: ContinueLearningProps) {
  const navigate = useNavigate();

  const byCategory = useMemo(() => {
    const map = new Map<string, JournalNote[]>();
    for (const n of notes) {
      const cat = getCategoryForNote(n.category);
      if (!cat) continue;
      const list = map.get(cat.slug) ?? [];
      list.push(n);
      map.set(cat.slug, list);
    }
    return map;
  }, [notes]);

  const items = useMemo(() => {
    const recent = getRecentlyViewed(4);
    const results: { title: string; slug: string; id: string; status: string }[] = [];

    for (const { topicId } of recent) {
      for (const [slug, catNotes] of byCategory) {
        const tree = buildTreeFromNotes(catNotes);
        const node = findNodeById(tree, topicId);
        if (node) {
          results.push({ title: node.title, slug, id: node.id, status: node.status });
          break;
        }
      }
    }
    return results;
  }, [byCategory]);

  const fallback = useMemo(() => {
    if (items.length > 0) return [];
    const result: { title: string; slug: string; id: string; status: string }[] = [];
    for (const [slug, catNotes] of byCategory) {
      const tree = buildTreeFromNotes(catNotes);
      const flat = flattenNodes(tree).filter((n) => n.noteId);
      if (flat[0]) {
        result.push({ title: flat[0].title, slug, id: flat[0].id, status: flat[0].status });
      }
    }
    return result.slice(0, 3);
  }, [byCategory, items.length]);

  const displayItems = items.length > 0 ? items : fallback;

  if (displayItems.length === 0) return null;

  return (
    <Card elevation={0}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <PlayArrow color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Continue Learning
          </Typography>
        </Box>
        <List disablePadding>
          {displayItems.map((item) => (
            <ListItemButton
              key={item.id}
              onClick={() => navigate(`/roadmap/${item.slug}?topic=${item.id}`)}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemText
                primary={item.title}
                secondary={`${item.slug} roadmap`}
              />
              <Chip label="Resume" size="small" color="primary" variant="outlined" />
            </ListItemButton>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
