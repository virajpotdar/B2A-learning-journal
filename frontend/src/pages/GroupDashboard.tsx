import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Avatar,
  Chip,
  Grid,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Group as GroupIcon,
  Share,
  PersonAdd,
  ExitToApp,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  getGroupDetails,
  getGroupMembers,
  getGroupTopics,
  getGroupActivity,
  leaveGroup,
  createSharedTopic,
} from '../services/groupsApi';
import type { Group, GroupMember, SharedTopic, GroupActivity } from '../types';

export default function GroupDashboard() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [topics, setTopics] = useState<SharedTopic[]>([]);
  const [activities, setActivities] = useState<GroupActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [addTopicDialogOpen, setAddTopicDialogOpen] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [newTopicCategory, setNewTopicCategory] = useState('');

  useEffect(() => {
    if (!groupId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [groupData, membersData, topicsData, activitiesData] = await Promise.all([
          getGroupDetails(groupId),
          getGroupMembers(groupId),
          getGroupTopics(groupId),
          getGroupActivity(groupId, 10),
        ]);
        setGroup(groupData);
        setMembers(membersData);
        setTopics(topicsData);
        setActivities(activitiesData);
      } catch (error) {
        console.error('Failed to load group data:', error);
        navigate('/journal');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [groupId, navigate]);

  const handleShare = () => {
    if (group) {
      const shareUrl = `${window.location.origin}/group/join/${group.invite_code}`;
      navigator.clipboard.writeText(shareUrl);
      alert('Invite link copied to clipboard!');
    }
  };

  const handleLeaveGroup = async () => {
    if (!groupId) return;
    if (!confirm('Are you sure you want to leave this group?')) return;

    try {
      await leaveGroup(groupId);
      navigate('/journal');
    } catch (error) {
      console.error('Failed to leave group:', error);
      alert('Failed to leave group');
    }
  };

  const handleAddTopic = async () => {
    if (!groupId || !newTopicTitle.trim()) return;

    try {
      await createSharedTopic({
        group_id: groupId,
        title: newTopicTitle.trim(),
        content: newTopicContent.trim() || undefined,
        category: newTopicCategory.trim() || undefined,
      });
      setNewTopicTitle('');
      setNewTopicContent('');
      setNewTopicCategory('');
      setAddTopicDialogOpen(false);
      // Reload topics
      const topicsData = await getGroupTopics(groupId);
      setTopics(topicsData);
    } catch (error) {
      console.error('Failed to create topic:', error);
      alert('Failed to create topic');
    }
  };

  const getActivityMessage = (activity: GroupActivity) => {
    const userName = activity.user?.full_name || activity.user?.email || 'Someone';
    switch (activity.action) {
      case 'created_group':
        return `${userName} created the group`;
      case 'joined_group':
        return `${userName} joined the group`;
      case 'created_topic':
        return `${userName} added "${activity.details?.topic_title}"`;
      case 'updated_topic':
        return `${userName} updated "${activity.details?.topic_title}"`;
      case 'deleted_topic':
        return `${userName} deleted "${activity.details?.topic_title}"`;
      case 'left_group':
        return `${userName} left the group`;
      default:
        return `${userName} performed an action`;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!group) {
    return null;
  }

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default', pb: 6 }}>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
          py: { xs: 4, md: 6 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
              {group.image_url ? (
                <Avatar src={group.image_url} sx={{ width: 80, height: 80 }} />
              ) : (
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <GroupIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
              )}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3" sx={{ color: 'white', mb: 1, fontWeight: 800 }}>
                  {group.name}
                </Typography>
                {group.description && (
                  <Typography sx={{ color: 'rgba(255,255,255,0.9)', maxWidth: 600 }}>
                    {group.description}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Share Invite Link">
                  <IconButton onClick={() => setShareDialogOpen(true)} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.15)' }}>
                    <Share />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Leave Group">
                  <IconButton onClick={handleLeaveGroup} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.15)' }}>
                    <ExitToApp />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip label={`${group.member_count} members`} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              <Chip label={`${group.topic_count} topics`} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
            </Box>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Learning Paths
              </Typography>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => setAddTopicDialogOpen(true)}
              >
                Add Topic
              </Button>
            </Box>

            {topics.length === 0 ? (
              <Card elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No topics yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Be the first to add a learning topic to this group!
                </Typography>
              </Card>
            ) : (
              <Grid container spacing={2}>
                {topics.map((topic) => (
                  <Grid key={topic.id} size={{ xs: 12, sm: 6, md: 4 }}>
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
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2.5 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                            {topic.title}
                          </Typography>
                          {topic.category && (
                            <Chip label={topic.category} size="small" sx={{ mb: 1 }} />
                          )}
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                            {topic.content?.substring(0, 100) || 'No description'}
                            {topic.content && topic.content.length > 100 ? '...' : ''}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                            Added by {topic.created_by_user?.full_name || topic.created_by_user?.email || 'Unknown'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Activity
            </Typography>
            <Card elevation={0} sx={{ borderRadius: 3, border: 1, borderColor: 'divider' }}>
              <CardContent sx={{ p: 2 }}>
                {activities.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No recent activity
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {activities.map((activity) => (
                      <Box key={activity.id} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                          {activity.user?.full_name?.[0] || activity.user?.email?.[0] || '?'}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getActivityMessage(activity)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(activity.created_at).toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>

            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, mt: 4 }}>
              Members ({members.length})
            </Typography>
            <Card elevation={0} sx={{ borderRadius: 3, border: 1, borderColor: 'divider' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {members.map((member) => (
                    <Box key={member.id} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Avatar
                        src={member.user?.avatar_url}
                        sx={{ width: 36, height: 36 }}
                      >
                        {member.user?.full_name?.[0] || member.user?.email?.[0] || '?'}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {member.user?.full_name || member.user?.email || 'Unknown'}
                        </Typography>
                        <Chip
                          label={member.role}
                          size="small"
                          sx={{ height: 20, fontSize: '0.65rem', mt: 0.5 }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Share Group</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Share this invite link with others to let them join this group:
          </Typography>
          <TextField
            fullWidth
            value={`${window.location.origin}/group/join/${group.invite_code}`}
            slotProps={{
              input: {
                readOnly: true
              }
            }}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" fullWidth onClick={handleShare}>
            Copy Invite Link
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addTopicDialogOpen} onClose={() => setAddTopicDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Topic</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Topic Title"
            fullWidth
            variant="outlined"
            value={newTopicTitle}
            onChange={(e) => setNewTopicTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Category (optional)"
            fullWidth
            variant="outlined"
            value={newTopicCategory}
            onChange={(e) => setNewTopicCategory(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Content (optional)"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newTopicContent}
            onChange={(e) => setNewTopicContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddTopicDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddTopic} variant="contained" disabled={!newTopicTitle.trim()}>
            Add Topic
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
