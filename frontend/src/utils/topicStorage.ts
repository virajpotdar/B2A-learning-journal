import type { TopicMeta, TopicStatus } from '../types';

const META_KEY = 'learning_topic_meta';
const ACTIVITY_KEY = 'learning_activity';
const STREAK_KEY = 'learning_streak';

function readMeta(): Record<string, TopicMeta> {
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeMeta(meta: Record<string, TopicMeta>) {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

export function getTopicMeta(topicId: string): TopicMeta {
  const all = readMeta();
  return (
    all[topicId] ?? {
      status: 'not_started',
      progress: 0,
      isBookmarked: false,
      personalNotes: '',
    }
  );
}

export function saveTopicMeta(topicId: string, updates: Partial<TopicMeta>) {
  const all = readMeta();
  all[topicId] = { ...getTopicMeta(topicId), ...updates };
  writeMeta(all);
}

export function setTopicStatus(topicId: string, status: TopicStatus) {
  const progress = status === 'completed' ? 100 : status === 'not_started' ? 0 : getTopicMeta(topicId).progress || 25;
  saveTopicMeta(topicId, {
    status,
    progress,
    completedAt: status === 'completed' ? new Date().toISOString() : undefined,
  });
  recordActivity();
}

export function toggleBookmark(topicId: string): boolean {
  const current = getTopicMeta(topicId);
  const isBookmarked = !current.isBookmarked;
  saveTopicMeta(topicId, { isBookmarked });
  return isBookmarked;
}

export function recordTopicView(topicId: string) {
  saveTopicMeta(topicId, { lastViewedAt: new Date().toISOString() });
  recordActivity();
}

function recordActivity() {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    const activity: Record<string, number> = raw ? JSON.parse(raw) : {};
    activity[today] = (activity[today] ?? 0) + 1;
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity));
    updateStreak(today);
  } catch {
    /* ignore */
  }
}

function updateStreak(today: string) {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    const streak = raw ? JSON.parse(raw) : { count: 0, lastDate: '' };
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    if (streak.lastDate === today) return;

    if (streak.lastDate === yesterdayStr) {
      streak.count += 1;
    } else {
      streak.count = 1;
    }
    streak.lastDate = today;
    localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
  } catch {
    /* ignore */
  }
}

export function getDailyStreak(): number {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return 0;
    const streak = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    if (streak.lastDate === today || streak.lastDate === yesterdayStr) {
      return streak.count;
    }
    return 0;
  } catch {
    return 0;
  }
}

export function getWeeklyActivity(): { day: string; count: number }[] {
  const days: { day: string; count: number }[] = [];
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    const activity: Record<string, number> = raw ? JSON.parse(raw) : {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        count: activity[key] ?? 0,
      });
    }
  } catch {
    /* ignore */
  }
  return days;
}

export function getAllTopicMeta(): Record<string, TopicMeta> {
  return readMeta();
}

export function getRecentlyViewed(limit = 5): { topicId: string; lastViewedAt: string }[] {
  const all = readMeta();
  return Object.entries(all)
    .filter(([, m]) => m.lastViewedAt)
    .map(([topicId, m]) => ({ topicId, lastViewedAt: m.lastViewedAt! }))
    .sort((a, b) => new Date(b.lastViewedAt).getTime() - new Date(a.lastViewedAt).getTime())
    .slice(0, limit);
}

export function getBookmarkedTopicIds(): string[] {
  const all = readMeta();
  return Object.entries(all)
    .filter(([, m]) => m.isBookmarked)
    .map(([id]) => id);
}

export function getCompletedCount(): number {
  const all = readMeta();
  return Object.values(all).filter((m) => m.status === 'completed').length;
}
