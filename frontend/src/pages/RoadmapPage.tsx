import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  LinearProgress,
  IconButton,
  TextField,
  Menu,
  MenuItem,
  Chip,
  Stack,
  Button,
  Collapse,
} from '@mui/material';
import {
  Bookmark,
  BookmarkBorder,
  FilterList,
  Add,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import RoadmapTree from '../components/RoadmapTree';
import TopicSidebar from '../components/TopicSidebar';
import NoteForm from '../components/NoteForm';
import { fetchNotes, updateNote, deleteNote } from '../services/notesApi';
import { getCategoryBySlug } from '../data/categories';
import {
  buildTreeFromNotes,
  computeCategoryProgress,
  filterNodes,
  findNodeById,
} from '../utils/roadmapTree';
import { getTopicMeta, toggleBookmark, saveTopicMeta } from '../utils/topicStorage';
import type { JournalNote, RoadmapNode } from '../types';

function applyMetaToTree(nodes: RoadmapNode[]): RoadmapNode[] {
  return nodes.map((node) => {
    const meta = getTopicMeta(node.id);
    return {
      ...node,
      status: meta.status,
      progress: meta.progress,
      isBookmarked: meta.isBookmarked,
      children: applyMetaToTree(node.children),
    };
  });
}

export default function RoadmapPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const category = getCategoryBySlug(slug ?? '');

  const [notes, setNotes] = useState<JournalNote[]>([]);
  const [treeData, setTreeData] = useState<RoadmapNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [categoryBookmarked, setCategoryBookmarked] = useState(false);

  const loadNotes = useCallback(async () => {
    if (!category) return;
    try {
      setLoading(true);
      const allNotes = await fetchNotes();
      const filtered = allNotes.filter(
        (n) => n.category.toLowerCase() === category.title.toLowerCase() ||
          category.aliases.some((a) => a.toLowerCase() === n.category.toLowerCase())
      );
      setNotes(filtered);
      const tree = applyMetaToTree(buildTreeFromNotes(filtered));
      setTreeData(tree);
    } catch (error) {
      console.error('Failed to load roadmap:', error);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    const topicId = searchParams.get('topic');
    if (topicId && treeData.length > 0) {
      const node = findNodeById(treeData, topicId);
      if (node) {
        setSelectedNode(node);
        setSidebarOpen(true);
        setTimeout(() => {
          document.querySelector(`[data-topic-id="${topicId}"]`)?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }, 300);
      }
    }
  }, [searchParams, treeData]);

  const progress = useMemo(() => computeCategoryProgress(treeData), [treeData]);

  const displayedTree = useMemo(
    () => filterNodes(treeData, searchQuery, statusFilter),
    [treeData, searchQuery, statusFilter]
  );

  const handleSelect = (node: RoadmapNode) => {
    setSelectedNode(node);
    setSidebarOpen(true);
    setSearchParams({ topic: node.id });
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setSelectedNode(null);
    setSearchParams({});
  };

  const handleToggleBookmark = (id: string) => {
    toggleBookmark(id);
    setTreeData(applyMetaToTree(buildTreeFromNotes(notes)));
    if (selectedNode?.id === id) {
      setSelectedNode({ ...selectedNode, isBookmarked: !selectedNode.isBookmarked });
    }
  };

  const handleUpdate = async (id: string, data: { title: string; content: string }) => {
    await updateNote(id, data);
    await loadNotes();
  };

  const handleDelete = async (id: string) => {
    await deleteNote(id);
    handleCloseSidebar();
    await loadNotes();
  };

  const toggleCategoryBookmark = () => {
    if (!category) return;
    const key = `category-${category.slug}`;
    const meta = getTopicMeta(key);
    saveTopicMeta(key, { isBookmarked: !meta.isBookmarked });
    setCategoryBookmarked(!meta.isBookmarked);
  };

  useEffect(() => {
    if (category) {
      setCategoryBookmarked(getTopicMeta(`category-${category.slug}`).isBookmarked);
    }
  }, [category]);

  if (!category) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5">Category not found</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default' }}>
      <Box
        sx={{
          background: category.gradient,
          py: { xs: 4, md: 5 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Box>
                <Typography
                  variant="h3"
                  sx={{ color: 'white', mb: 1, fontWeight: 800 }}
                >
                  {category.title}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.85)', maxWidth: 600 }}>
                  {category.description}
                </Typography>
              </Box>
              <IconButton
                onClick={toggleCategoryBookmark}
                sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.15)' }}
              >
                {categoryBookmarked ? <Bookmark /> : <BookmarkBorder />}
              </IconButton>
            </Stack>

            <Box sx={{ mt: 3, maxWidth: 400 }}>
              <Stack direction="row" sx={{ mb: 0.5, justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                  Progress
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 800 }}>
                  {progress}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '& .MuiLinearProgress-bar': { bgcolor: 'white', borderRadius: 4 },
                }}
              />
            </Box>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mb: 4, alignItems: { sm: 'center' } }}
        >
          <TextField
            placeholder="Search topics..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1, maxWidth: { sm: 400 } }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={(e) => setFilterAnchor(e.currentTarget)}
          >
            Filter
            {statusFilter && (
              <Chip label={statusFilter.replace('_', ' ')} size="small" sx={{ ml: 1, height: 20 }} />
            )}
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowAddForm((v) => !v)}
          >
            Add Topic
          </Button>
        </Stack>

        <Menu anchorEl={filterAnchor} open={Boolean(filterAnchor)} onClose={() => setFilterAnchor(null)}>
          <MenuItem onClick={() => { setStatusFilter(null); setFilterAnchor(null); }}>
            All
          </MenuItem>
          <MenuItem onClick={() => { setStatusFilter('not_started'); setFilterAnchor(null); }}>
            Not Started
          </MenuItem>
          <MenuItem onClick={() => { setStatusFilter('learning'); setFilterAnchor(null); }}>
            Learning
          </MenuItem>
          <MenuItem onClick={() => { setStatusFilter('completed'); setFilterAnchor(null); }}>
            Completed
          </MenuItem>
        </Menu>

        <Collapse in={showAddForm}>
          <Box sx={{ mb: 3 }}>
            <NoteForm
              category={category.title}
              onNoteAdded={() => {
                loadNotes();
                setShowAddForm(false);
              }}
            />
          </Box>
        </Collapse>

        <Box
          sx={{
            display: 'flex',
            gap: 0,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              flex: 1,
              transition: 'margin-right 0.3s',
              mr: sidebarOpen ? { md: '460px', lg: '500px' } : 0,
              minWidth: 0,
            }}
          >
            <RoadmapTree
              nodes={displayedTree}
              loading={loading}
              selectedId={selectedNode?.id ?? null}
              onSelect={handleSelect}
              onTreeChange={setTreeData}
              onToggleBookmark={handleToggleBookmark}
            />
          </Box>
        </Box>
      </Container>

      {selectedNode && (
        <TopicSidebar
          node={selectedNode}
          open={sidebarOpen}
          onClose={handleCloseSidebar}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onRefresh={loadNotes}
        />
      )}
    </Box>
  );
}
