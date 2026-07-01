import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Container,
  Box,
  Typography,
  Grid,
  TextField,
  Card,
  CardContent,
  List,
  ListItemButton,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Chip,
  IconButton,
  Alert,
} from '@mui/material';
import { Bookmark, Add, Group as GroupIcon, Delete } from '@mui/icons-material';
import { motion } from 'framer-motion';
import CategoryCard from '../components/CategoryCard';
import ContinueLearning from '../components/ContinueLearning';
import CreateGroupModal from '../components/CreateGroupModal';
import { LEARNING_CATEGORIES, getCategoryForNote } from '../data/categories';
import { fetchNotes } from '../services/notesApi';
import { getUserGroups, deleteGroup } from '../services/groupsApi';
import { createCustomCategory, getUserCustomCategories, deleteCustomCategory } from '../services/customCategoriesApi';
import { buildTreeFromNotes, countTopics, computeCategoryProgress, flattenNodes, findNodeById } from '../utils/roadmapTree';
import { getBookmarkedTopicIds, getAllTopicMeta, saveTopicMeta } from '../utils/topicStorage';
import type { JournalNote, Group, LearningCategory } from '../types';

export default function Journal() {
  const navigate = useNavigate();
  const { user } = useAuth0();
  const [notes, setNotes] = useState<JournalNote[]>([]);
  const [search, setSearch] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteGroupDialogOpen, setDeleteGroupDialogOpen] = useState(false);
  const [deletePathDialogOpen, setDeletePathDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const [pathToDelete, setPathToDelete] = useState<LearningCategory | null>(null);
  const [newPathName, setNewPathName] = useState('');
  const [newPathDescription, setNewPathDescription] = useState('');
  const [newPathColor, setNewPathColor] = useState('#6366f1');
  const [groups, setGroups] = useState<Group[]>([]);
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [customCategories, setCustomCategories] = useState<LearningCategory[]>([]);
  const [bookmarkRefresh, setBookmarkRefresh] = useState(0);
  const [bookmarkDialogOpen, setBookmarkDialogOpen] = useState(false);

  const colorOptions = [
    '#6366f1', // Indigo
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#ef4444', // Red
    '#f97316', // Orange
    '#eab308', // Yellow
    '#22c55e', // Green
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
  ];

  useEffect(() => {
    fetchNotes().then(setNotes).catch(console.error);
  }, []);

  useEffect(() => {
    if (user?.email) {
      getUserGroups(user.email, user.name, user.picture).then(setGroups).catch(console.error);
      getUserCustomCategories(user.email, user.name, user.picture).then((cats) => {
        const learningCats: LearningCategory[] = cats.map(cat => ({
          slug: cat.id,
          title: cat.name,
          description: cat.description || '',
          icon: 'School',
          color: cat.color,
          gradient: cat.gradient,
          aliases: [],
          isCustom: true,
          userId: cat.user_id,
        }));
        setCustomCategories(learningCats);
      }).catch(console.error);
    }
  }, [user]);

  const allCategories = [...LEARNING_CATEGORIES, ...customCategories];

  const categoryStats = useMemo(() => {
    const byCategory = new Map<string, JournalNote[]>();
    for (const n of notes) {
      const cat = getCategoryForNote(n.category);
      if (!cat) continue;
      const list = byCategory.get(cat.slug) ?? [];
      list.push(n);
      byCategory.set(cat.slug, list);
    }
    return allCategories.map((cat) => {
      const catNotes = byCategory.get(cat.slug) ?? [];
      const tree = buildTreeFromNotes(catNotes);
      const flat = flattenNodes(tree);
      const allMeta = getAllTopicMeta();
      
      let completedCount = 0;
      let learningCount = 0;
      let pendingCount = 0;
      let bookmarkedCount = 0;
      
      for (const node of flat) {
        const status = allMeta[node.id]?.status || 'not_started';
        if (status === 'completed') completedCount++;
        else if (status === 'learning') learningCount++;
        else pendingCount++;
        
        if (allMeta[node.id]?.isBookmarked) bookmarkedCount++;
      }
      
      const lastUpdated = catNotes.length > 0 
        ? catNotes.reduce((latest, note) => 
            (note.created_at && latest.created_at && new Date(note.created_at) > new Date(latest.created_at)) ? note : latest
          ).created_at
        : undefined;

      return {
        category: cat,
        topicCount: countTopics(tree),
        progress: computeCategoryProgress(tree),
        completedCount,
        learningCount,
        pendingCount,
        bookmarkedCount,
        lastUpdated,
      };
    });
  }, [notes, allCategories]);

  const filteredCategories = categoryStats.filter(
    (c) =>
      !search ||
      c.category.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.description.toLowerCase().includes(search.toLowerCase())
  );

  const bookmarkedTopics = useMemo(() => {
    const ids = getBookmarkedTopicIds();
    const allMeta = getAllTopicMeta();
    const results: { title: string; slug: string; id: string }[] = [];

    // Build trees for each category and search for bookmarked nodes
    const byCategory = new Map<string, JournalNote[]>();
    for (const n of notes) {
      const cat = getCategoryForNote(n.category);
      if (!cat) continue;
      const list = byCategory.get(cat.slug) ?? [];
      list.push(n);
      byCategory.set(cat.slug, list);
    }

    for (const id of ids) {
      if (allMeta[id]?.isBookmarked === false) continue;
      for (const [slug, catNotes] of byCategory) {
        const tree = buildTreeFromNotes(catNotes);
        const node = findNodeById(tree, id);
        if (node) {
          results.push({ title: node.title, slug, id: node.id });
          break;
        }
      }
    }
    
    return results;
  }, [notes, bookmarkRefresh]);

  const handleSharePath = async (category: string) => {
    try {
      const shareUrl = `${window.location.origin}/roadmap/${category}`;
      await navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    } catch (err: any) {
      console.error('Share error:', err);
      alert('Failed to copy share link');
    }
  };

  const handleBookmarkPath = (category: string) => {
    const allMeta = getAllTopicMeta();
    const catNotes = notes.filter(n => {
      const cat = getCategoryForNote(n.category);
      return cat?.slug === category;
    });
    
    if (catNotes.length === 0) return;
    
    const tree = buildTreeFromNotes(catNotes);
    const flat = flattenNodes(tree);
    
    const anyBookmarked = flat.some(node => allMeta[node.id]?.isBookmarked);
    
    flat.forEach(node => {
      saveTopicMeta(node.id, { isBookmarked: !anyBookmarked });
    });
    
    // Force re-render of bookmarks
    setBookmarkRefresh(prev => prev + 1);
  };

  const handleCreatePath = async () => {
    if (!newPathName.trim() || !user?.email) return;

    try {
      const newCategory = await createCustomCategory({
        name: newPathName.trim(),
        description: newPathDescription.trim() || undefined,
        color: newPathColor,
        userEmail: user.email,
        userName: user.name,
        avatarUrl: user.picture,
      });

      const learningCat: LearningCategory = {
        slug: newCategory.id,
        title: newCategory.name,
        description: newCategory.description || '',
        icon: 'School',
        color: newCategory.color,
        gradient: newCategory.gradient,
        aliases: [],
        isCustom: true,
        userId: newCategory.user_id,
      };

      setCustomCategories([...customCategories, learningCat]);
      setCreateModalOpen(false);
      setNewPathName('');
      setNewPathDescription('');
      setNewPathColor('#6366f1');
    } catch (error: any) {
      console.error('Failed to create learning path:', error);
      alert('Failed to create learning path. Please try again.');
    }
  };

  const handleGroupCreated = (group: Group) => {
    setGroups([...groups, group]);
  };

  const handleDeleteGroup = (group: Group) => {
    setGroupToDelete(group);
    setDeleteGroupDialogOpen(true);
  };

  const confirmDeleteGroup = async () => {
    if (!groupToDelete || !user?.email) return;
    try {
      await deleteGroup(groupToDelete.id, user.email);
      setGroups(groups.filter(g => g.id !== groupToDelete.id));
      setDeleteGroupDialogOpen(false);
      setGroupToDelete(null);
    } catch (error) {
      console.error('Failed to delete group:', error);
      alert('Failed to delete group. Please try again.');
    }
  };

  const handleDeletePath = (category: LearningCategory) => {
    setPathToDelete(category);
    setDeletePathDialogOpen(true);
  };

  const confirmDeletePath = async () => {
    if (!pathToDelete) return;
    try {
      await deleteCustomCategory(pathToDelete.slug);
      setCustomCategories(customCategories.filter(c => c.slug !== pathToDelete.slug));
      setDeletePathDialogOpen(false);
      setPathToDelete(null);
    } catch (error) {
      console.error('Failed to delete path:', error);
      alert('Failed to delete learning path. Please try again.');
    }
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default', pb: 6 }}>
      <Box
        sx={{
          background: (t) =>
            t.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1a1d27 100%)'
              : 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #f4f6fb 100%)',
          py: { xs: 4, md: 6 },
          mb: 3,
        }}
      >
        <Container maxWidth="xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Typography
              variant="h3"
              sx={{
                mb: 1,
                fontWeight: 800,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ed771d 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              My Learning Journal
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, fontWeight: 400 }}>
              Track your developer learning journey with personalized roadmaps
            </Typography>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="xl">
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <ContinueLearning notes={notes} />
          </Grid>
        </Grid>

       

        {groups.length > 0 && (
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            {groups.map((group) => (
              <Grid key={group.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      border: 1,
                      borderColor: 'divider',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: 3,
                        borderColor: 'primary.main',
                      },
                    }}
                    onClick={() => navigate(`/group/${group.id}`)}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {group.image_url ? (
                            <Avatar src={group.image_url} sx={{ width: 48, height: 48 }} />
                          ) : (
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                bgcolor: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <GroupIcon sx={{ fontSize: 24, color: 'white' }} />
                            </Box>
                          )}
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                              {group.name}
                            </Typography>
                            {group.description && (
                              <Typography variant="body2" color="text.secondary" sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}>
                                {group.description}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGroup(group);
                          }}
                          sx={{ color: 'error.main' }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip label={`${group.member_count} members`} size="small" />
                        <Chip label={`${group.topic_count} topics`} size="small" />
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <TextField
            placeholder="Search learning paths..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ maxWidth: 400, width: '100%' }}
          />
          <Button
            variant="outlined"
            startIcon={<Bookmark />}
            onClick={() => setBookmarkDialogOpen(true)}
            sx={{ ml: 2 }}
          >
            Bookmarks
          </Button>
        </Box>

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            My Learning Paths
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setCreateGroupModalOpen(true)}
            size="small"
          >
            Create Group
          </Button>
        </Box>

        <Grid container spacing={2.5}>
          {filteredCategories.map((item, index) => (
            <Grid key={item.category.slug} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <CategoryCard
                category={item.category}
                topicCount={item.topicCount}
                progress={item.progress}
                index={index}
                onClick={() => navigate(`/roadmap/${item.category.slug}`)}
                onShare={() => handleSharePath(item.category.slug)}
                onBookmark={() => handleBookmarkPath(item.category.slug)}
                isBookmarked={item.bookmarkedCount > 0}
                onDelete={item.category.isCustom ? () => handleDeletePath(item.category) : undefined}
              />
            </Grid>
          ))}
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                minHeight: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 3,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
                },
              }}
              onClick={() => setCreateModalOpen(true)}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Add sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Create New Path
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Create New Learning Path</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Learning Path Name"
            fullWidth
            variant="outlined"
            value={newPathName}
            onChange={(e) => setNewPathName(e.target.value)}
            sx={{ mb: 2 }}
            placeholder="e.g., Flutter, Python, Docker"
          />
          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newPathDescription}
            onChange={(e) => setNewPathDescription(e.target.value)}
            placeholder="Describe what this learning path covers..."
            sx={{ mb: 2 }}
          />
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Color (optional)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {colorOptions.map((color) => (
                <Box
                  key={color}
                  onClick={() => setNewPathColor(color)}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    bgcolor: color,
                    cursor: 'pointer',
                    border: newPathColor === color ? 3 : 2,
                    borderColor: newPathColor === color ? 'text.primary' : 'divider',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCreateModalOpen(false)}>Cancel</Button>
          <Button onClick={handleCreatePath} variant="contained" disabled={!newPathName.trim()}>
            Create Path
          </Button>
        </DialogActions>
      </Dialog>

      <CreateGroupModal
        open={createGroupModalOpen}
        onClose={() => setCreateGroupModalOpen(false)}
        onGroupCreated={handleGroupCreated}
      />

      <Dialog open={deleteGroupDialogOpen} onClose={() => setDeleteGroupDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Group</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to delete the group "{groupToDelete?.name}"? This action cannot be undone.
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This will permanently delete the group and all its data.
          </Alert>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Please confirm by typing "DELETE" to proceed:
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Type DELETE"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteGroupDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteGroup} color="error" variant="contained">
            Delete Group
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deletePathDialogOpen} onClose={() => setDeletePathDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Learning Path</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to delete the learning path "{pathToDelete?.title}"? This action cannot be undone.
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This will permanently delete the learning path and all its data.
          </Alert>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Please confirm by typing "DELETE" to proceed:
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Type DELETE"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletePathDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeletePath} color="error" variant="contained">
            Delete Path
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={bookmarkDialogOpen} onClose={() => setBookmarkDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bookmarked Topics</DialogTitle>
        <DialogContent>
          {bookmarkedTopics.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No bookmarked topics yet. Click the bookmark icon on topics to save them here.
            </Typography>
          ) : (
            <List disablePadding>
              {bookmarkedTopics.map((b) => (
                <ListItemButton
                  key={b.id}
                  onClick={() => {
                    navigate(`/roadmap/${b.slug}?topic=${b.id}`);
                    setBookmarkDialogOpen(false);
                  }}
                  sx={{ borderRadius: 2, mb: 0.5 }}
                >
                  <ListItemText primary={b.title} secondary={b.slug} />
                </ListItemButton>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookmarkDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
