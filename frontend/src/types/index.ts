export interface JournalNote {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at?: string;
}

export type TopicStatus = 'not_started' | 'learning' | 'completed';
export type TopicDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface RoadmapNode {
  id: string;
  title: string;
  category: string;
  content: string;
  created_at?: string;
  status: TopicStatus;
  difficulty: TopicDifficulty;
  progress: number;
  estimatedMinutes: number;
  children: RoadmapNode[];
  isExpanded: boolean;
  isBookmarked: boolean;
  noteId?: string;
}

export interface TopicMeta {
  status: TopicStatus;
  progress: number;
  isBookmarked: boolean;
  personalNotes: string;
  resources?: Array<{ label: string; url: string; type: string }>;
  lastViewedAt?: string;
  completedAt?: string;
}

export interface LearningCategory {
  slug: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  aliases: string[];
  isCustom?: boolean;
  userId?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  category: string;
  categorySlug: string;
  type: 'category' | 'topic' | 'resource' | 'note';
  snippet?: string;
  noteId?: string;
}

export interface ParsedContent {
  markdown: string;
  codeExamples: { language: string; code: string }[];
  resources: { type: string; label: string; url: string }[];
  practiceQuestions: string[];
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  invite_code: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
  topic_count?: number;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
  user?: {
    id: string;
    full_name?: string;
    email?: string;
    avatar_url?: string;
  };
}

export interface SharedTopic {
  id: string;
  group_id: string;
  title: string;
  content?: string;
  category?: string;
  parent_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  created_by_user?: {
    id: string;
    full_name?: string;
    email?: string;
  };
}

export interface GroupActivity {
  id: string;
  group_id: string;
  user_id: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: any;
  created_at: string;
  user?: {
    id: string;
    full_name?: string;
    email?: string;
  };
}
