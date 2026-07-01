import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import {
  LocalFireDepartment,
  CheckCircle,
  Bookmark,
  TrendingUp,
} from '@mui/icons-material';
import ProgressCard from './ProgressCard';
import { getDailyStreak, getWeeklyActivity, getCompletedCount, getBookmarkedTopicIds } from '../utils/topicStorage';
import type { JournalNote } from '../types';
import { getCategoryForNote } from '../data/categories';
import { buildTreeFromNotes, countTopics } from '../utils/roadmapTree';

interface DashboardStatsProps {
  notes: JournalNote[];
}

export default function DashboardStats({ notes }: DashboardStatsProps) {
  const totalTopics = useMemo(() => {
    const byCategory = new Map<string, JournalNote[]>();
    for (const n of notes) {
      const cat = getCategoryForNote(n.category);
      if (!cat) continue;
      const list = byCategory.get(cat.slug) ?? [];
      list.push(n);
      byCategory.set(cat.slug, list);
    }
    let total = 0;
    for (const catNotes of byCategory.values()) {
      total += countTopics(buildTreeFromNotes(catNotes));
    }
    return total;
  }, [notes]);

  const completed = getCompletedCount();
  const bookmarks = getBookmarkedTopicIds().length;
  const streak = getDailyStreak();
  const weekly = getWeeklyActivity();
  const weeklyTotal = weekly.reduce((s, d) => s + d.count, 0);
  const progressPct = totalTopics > 0 ? Math.round((completed / totalTopics) * 100) : 0;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Learning Progress
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <ProgressCard
          title="Overall Progress"
          value={`${progressPct}%`}
          subtitle={`${completed} of ${totalTopics} topics`}
          progress={progressPct}
          icon={<TrendingUp />}
          color="#6366f1"
          index={0}
        />
        <ProgressCard
          title="Daily Streak"
          value={streak}
          subtitle="days in a row"
          icon={<LocalFireDepartment />}
          color="#f59e0b"
          index={1}
        />
        <ProgressCard
          title="Completed"
          value={completed}
          subtitle="topics finished"
          icon={<CheckCircle />}
          color="#10b981"
          index={2}
        />
        <ProgressCard
          title="Bookmarks"
          value={bookmarks}
          subtitle={`${weeklyTotal} actions this week`}
          icon={<Bookmark />}
          color="#8b5cf6"
          index={3}
        />
      </Box>

      <Box
        sx={{
          p: 2,
          borderRadius: 3,
          border: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
          Weekly Activity
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 80 }}>
          {weekly.map((day) => (
            <Box key={day.day} sx={{ flex: 1, textAlign: 'center' }}>
              <Box
                sx={{
                  height: `${Math.max(8, day.count * 12)}px`,
                  maxHeight: 64,
                  borderRadius: 1,
                  bgcolor: day.count > 0 ? 'primary.main' : 'action.hover',
                  mb: 0.5,
                  transition: 'height 0.3s',
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {day.day}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
