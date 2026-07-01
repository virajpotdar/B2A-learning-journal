 # Roadmap.sh-Style Learning Platform - Production Architecture

## System Overview
Transform the existing Knowledge Journal into a comprehensive visual learning platform with interactive roadmaps, hierarchical topic structures, and rich content management.

## Database Schema

### Core Tables

#### Topics Table (Replaces Notes)
```sql
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  detailed_content TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  difficulty TEXT DEFAULT 'beginner', -- beginner, intermediate, advanced
  status TEXT DEFAULT 'not_started', -- not_started, learning, completed
  priority INTEGER DEFAULT 5, -- 1-10
  estimated_hours INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Full-text search
  search_vector tsvector,
  
  -- Tree structure helpers
  path TEXT, -- Materialized path for tree queries
  level INTEGER DEFAULT 0 -- Depth in tree
);

-- Indexes
CREATE INDEX topics_parent_id_idx ON topics(parent_id);
CREATE INDEX topics_category_id_idx ON topics(category_id);
CREATE INDEX topics_status_idx ON topics(status);
CREATE INDEX topics_slug_idx ON topics(slug);
CREATE INDEX topics_path_idx ON topics(path);
CREATE INDEX topics_search_vector_idx ON topics USING GIN(search_vector);

-- Search vector trigger
CREATE OR REPLACE FUNCTION topics_search_vector_trigger()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.short_description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.detailed_content, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER topics_search_vector_update
  BEFORE INSERT OR UPDATE ON topics
  FOR EACH ROW
  EXECUTE FUNCTION topics_search_vector_trigger();

-- Tree path trigger
CREATE OR REPLACE FUNCTION topics_path_trigger()
RETURNS trigger AS $$
DECLARE
  parent_path TEXT;
BEGIN
  IF NEW.parent_id IS NULL THEN
    NEW.path := NEW.id::TEXT;
    NEW.level := 0;
  ELSE
    SELECT path INTO parent_path FROM topics WHERE id = NEW.parent_id;
    NEW.path := parent_path || '.' || NEW.id::TEXT;
    NEW.level := (SELECT level FROM topics WHERE id = NEW.parent_id) + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER topics_path_update
  BEFORE INSERT OR UPDATE ON topics
  FOR EACH ROW
  EXECUTE FUNCTION topics_path_trigger();
```

#### Categories Table
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  color TEXT DEFAULT '#ed771d',
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed data
INSERT INTO categories (name, slug, icon, color, order_index) VALUES
('Frontend', 'frontend', '⚛️', '#61DAFB', 1),
('Backend', 'backend', '🖥️', '#68A063', 2),
('DevOps', 'devops', '🔧', '#326CE5', 3),
('Database', 'database', '🗄️', '#4479A1', 4),
('Security', 'security', '🔒', '#F7DF1E', 5),
('Testing', 'testing', '🧪', '#C21325', 6),
('General', 'general', '📚', '#E34F26', 7);
```

#### Resources Table
```sql
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT,
  type TEXT NOT NULL, -- official_docs, youtube, github, pdf, blog, course, leetcode, mdn, stackoverflow, book
  description TEXT,
  difficulty TEXT DEFAULT 'beginner',
  duration TEXT,
  is_free BOOLEAN DEFAULT true,
  language TEXT DEFAULT 'en',
  order_index INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX resources_topic_id_idx ON resources(topic_id);
CREATE INDEX resources_type_idx ON resources(type);
```

#### User Notes Table
```sql
CREATE TABLE user_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, topic_id)
);

CREATE INDEX user_notes_user_idx ON user_notes(user_id);
CREATE INDEX user_notes_topic_idx ON user_notes(topic_id);
CREATE INDEX user_notes_public_idx ON user_notes(is_public);
```

#### User Progress Table
```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started',
  progress INTEGER DEFAULT 0,
  hours_spent DECIMAL(5,2) DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, topic_id)
);

CREATE INDEX user_progress_user_idx ON user_progress(user_id);
CREATE INDEX user_progress_topic_idx ON user_progress(topic_id);
CREATE INDEX user_progress_status_idx ON user_progress(status);
```

#### Bookmarks Table
```sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, topic_id),
  UNIQUE(user_id, resource_id)
);

CREATE INDEX bookmarks_user_idx ON bookmarks(user_id);
CREATE INDEX bookmarks_topic_idx ON bookmarks(topic_id);
```

#### Comments Table
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX comments_user_idx ON comments(user_id);
CREATE INDEX comments_topic_idx ON comments(topic_id);
CREATE INDEX comments_parent_idx ON comments(parent_comment_id);
```

#### Tags Table
```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#ed771d',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE topic_tags (
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (topic_id, tag_id)
);

CREATE INDEX topic_tags_topic_idx ON topic_tags(topic_id);
CREATE INDEX topic_tags_tag_idx ON topic_tags(tag_id);
```

#### Attachments Table
```sql
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  size INTEGER,
  type TEXT,
  uploaded_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX attachments_topic_idx ON attachments(topic_id);
CREATE INDEX attachments_comment_idx ON attachments(comment_id);
```

#### Quizzes Table
```sql
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT DEFAULT 'beginner',
  time_limit INTEGER,
  passing_score INTEGER DEFAULT 70,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  order_index INTEGER DEFAULT 0
);

CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Backend Architecture

### Folder Structure
```
backend/
├── src/
│   ├── controllers/
│   │   ├── topicController.ts
│   │   ├── resourceController.ts
│   │   ├── progressController.ts
│   │   ├── bookmarkController.ts
│   │   ├── commentController.ts
│   │   ├── searchController.ts
│   │   ├── authController.ts
│   │   └── adminController.ts
│   ├── services/
│   │   ├── topicService.ts
│   │   ├── resourceService.ts
│   │   ├── progressService.ts
│   │   ├── bookmarkService.ts
│   │   ├── commentService.ts
│   │   ├── searchService.ts
│   │   ├── authService.ts
│   │   └── treeService.ts
│   ├── repositories/
│   │   ├── topicRepository.ts
│   │   ├── resourceRepository.ts
│   │   ├── progressRepository.ts
│   │   ├── bookmarkRepository.ts
│   │   └── commentRepository.ts
│   ├── middleware/
│   │   ├── authMiddleware.ts
│   │   ├── adminMiddleware.ts
│   │   ├── validationMiddleware.ts
│   │   └── errorMiddleware.ts
│   ├── routes/
│   │   ├── topicRoutes.ts
│   │   ├── resourceRoutes.ts
│   │   ├── progressRoutes.ts
│   │   ├── bookmarkRoutes.ts
│   │   ├── commentRoutes.ts
│   │   ├── searchRoutes.ts
│   │   ├── authRoutes.ts
│   │   └── adminRoutes.ts
│   ├── validators/
│   │   ├── topicValidator.ts
│   │   ├── resourceValidator.ts
│   │   └── authValidator.ts
│   ├── types/
│   │   ├── topic.types.ts
│   │   ├── resource.types.ts
│   │   ├── auth.types.ts
│   │   └── api.types.ts
│   ├── utils/
│   │   ├── supabaseClient.ts
│   │   ├── treeUtils.ts
│   │   ├── searchUtils.ts
│   │   └── errorHandlers.ts
│   └── server.ts
├── .env
└── package.json
```

### API Endpoints

#### Topics
```
GET    /api/topics                    - Get all topics (with tree structure)
GET    /api/topics/:id                - Get single topic with details
GET    /api/topics/:slug              - Get topic by slug
GET    /api/topics/tree               - Get complete tree structure
GET    /api/topics/:id/children       - Get children of a topic
GET    /api/topics/:id/ancestors      - Get ancestors of a topic
POST   /api/topics                    - Create new topic (admin)
PUT    /api/topics/:id                - Update topic (admin)
DELETE /api/topics/:id                - Delete topic (admin)
PATCH  /api/topics/:id/move          - Move topic in tree (admin)
PATCH  /api/topics/:id/reorder       - Reorder topic siblings (admin)
```

#### Resources
```
GET    /api/topics/:id/resources      - Get resources for topic
POST   /api/topics/:id/resources      - Add resource to topic
PUT    /api/resources/:id             - Update resource
DELETE /api/resources/:id             - Delete resource
```

#### User Notes
```
GET    /api/topics/:id/notes          - Get user notes for topic
POST   /api/topics/:id/notes          - Create user note
PUT    /api/notes/:id                 - Update user note
DELETE /api/notes/:id                 - Delete user note
```

#### Progress
```
GET    /api/progress                  - Get user progress
GET    /api/progress/:topicId         - Get progress for topic
PATCH  /api/progress/:topicId         - Update progress
POST   /api/progress/:topicId/complete - Mark topic complete
GET    /api/progress/stats            - Get progress statistics
```

#### Bookmarks
```
GET    /api/bookmarks                 - Get user bookmarks
POST   /api/bookmarks                 - Add bookmark
DELETE /api/bookmarks/:id             - Remove bookmark
```

#### Comments
```
GET    /api/topics/:id/comments       - Get comments for topic
POST   /api/topics/:id/comments       - Add comment
PUT    /api/comments/:id              - Update comment
DELETE /api/comments/:id              - Delete comment
POST   /api/comments/:id/like         - Like comment
```

#### Search
```
GET    /api/search                    - Global search
GET    /api/search/topics             - Search topics
GET    /api/search/resources          - Search resources
GET    /api/search/notes              - Search user notes
GET    /api/suggestions               - Get search suggestions
```

#### Admin
```
GET    /api/admin/topics              - Get all topics (admin)
GET    /api/admin/users               - Get all users (admin)
GET    /api/admin/categories          - Get all categories (admin)
POST   /api/admin/categories          - Create category (admin)
PUT    /api/admin/categories/:id      - Update category (admin)
DELETE /api/admin/categories/:id      - Delete category (admin)
GET    /api/admin/pending             - Get pending content (admin)
PATCH  /api/admin/approve/:id         - Approve content (admin)
```

## Frontend Architecture

### Folder Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── roadmap/
│   │   │   ├── RoadmapView.tsx          # Main roadmap container
│   │   │   ├── TopicNode.tsx            # Custom node component
│   │   │   ├── ConnectionLine.tsx       # Custom edge component
│   │   │   ├── RoadmapControls.tsx      # Zoom, pan, expand controls
│   │   │   ├── MiniMap.tsx              # Roadmap minimap
│   │   │   └── RoadmapBackground.tsx    # Grid background
│   │   ├── sidebar/
│   │   │   ├── TopicSidebar.tsx         # Right sidebar container
│   │   │   ├── SidebarHeader.tsx        # Header with actions
│   │   │   ├── SidebarContent.tsx       # Topic content section
│   │   │   ├── ResourceList.tsx         # Resources list
│   │   │   ├── ResourceCard.tsx         # Single resource
│   │   │   ├── CommentSection.tsx       # Comments section
│   │   │   ├── CommentItem.tsx          # Single comment
│   │   │   ├── QuizSection.tsx          # Quiz section
│   │   │   ├── AttachmentList.tsx       # File attachments
│   │   │   └── UserNoteEditor.tsx      # User note editor
│   │   ├── search/
│   │   │   ├── SearchModal.tsx          # Global search modal
│   │   │   ├── SearchInput.tsx          # Search input with Ctrl+K
│   │   │   └── SearchResults.tsx        # Search results list
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx            # Main dashboard
│   │   │   ├── ProgressOverview.tsx     # Progress overview
│   │   │   ├── StatsCard.tsx            # Statistics card
│   │   │   ├── ActivityFeed.tsx         # Recent activity
│   │   │   ├── RecommendedTopics.tsx    # Recommended topics
│   │   │   ├── LearningStreak.tsx       # Learning streak
│   │   │   └── CategoryProgress.tsx     # Category-wise progress
│   │   ├── admin/
│   │   │   ├── AdminPanel.tsx           # Admin panel
│   │   │   ├── TopicManager.tsx         # Topic management
│   │   │   ├── CategoryManager.tsx      # Category management
│   │   │   ├── UserManager.tsx          # User management
│   │   │   ├── ContentApproval.tsx      # Content approval
│   │   │   └── TreeEditor.tsx           # Tree structure editor
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── ProgressRing.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── DifficultyBadge.tsx
│   │   └── navigation/
│   │       ├── Navbar.tsx
│   │       ├── Sidebar.tsx
│   │       ├── CategoryNav.tsx
│   │       ├── ThemeToggle.tsx
│   │       └── UserMenu.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTopics.ts
│   │   ├── useTopic.ts
│   │   ├── useResources.ts
│   │   ├── useProgress.ts
│   │   ├── useBookmarks.ts
│   │   ├── useComments.ts
│   │   ├── useSearch.ts
│   │   ├── useRoadmap.ts
│   │   ├── useUserNotes.ts
│   │   └── useKeyboard.ts
│   ├── store/
│   │   ├── authStore.ts                # Zustand auth store
│   │   ├── topicStore.ts               # Zustand topic store
│   │   ├── roadmapStore.ts             # Zustand roadmap state
│   │   ├── uiStore.ts                  # Zustand UI state
│   │   ├── searchStore.ts              # Zustand search state
│   │   └── userStore.ts                # Zustand user preferences
│   ├── lib/
│   │   ├── api/
│   │   │   ├── topics.ts
│   │   │   ├── resources.ts
│   │   │   ├── progress.ts
│   │   │   ├── auth.ts
│   │   │   └── search.ts
│   │   ├── utils/
│   │   │   ├── treeLayout.ts           # Tree layout algorithms
│   │   │   ├── treeTraversal.ts        # Tree traversal utilities
│   │   │   ├── searchUtils.ts
│   │   │   └── formatUtils.ts
│   │   ├── constants/
│   │   │   ├── categories.ts
│   │   │   ├── difficulties.ts
│   │   │   ├── statuses.ts
│   │   │   └── resourceTypes.ts
│   │   └── types/
│   │       ├── topic.ts
│   │       ├── resource.ts
│   │       ├── roadmap.ts
│   │       └── api.ts
│   ├── pages/
│   │   ├── Roadmap.tsx                 # Main roadmap page
│   │   ├── Dashboard.tsx               # Dashboard page
│   │   ├── CategoryView.tsx            # Category-specific view
│   │   ├── TopicView.tsx               # Single topic view
│   │   ├── SearchResults.tsx           # Search results page
│   │   ├── Profile.tsx                # User profile
│   │   ├── Settings.tsx               # Settings page
│   │   ├── Login.tsx                   # Login page
│   │   ├── Register.tsx                # Registration page
│   │   └── Admin.tsx                   # Admin panel
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
```

## Implementation Plan

### Phase 1: Database Migration (Week 1)
- Create new database schema
- Migrate existing notes to topics
- Set up parent-child relationships
- Create seed data for categories
- Implement tree triggers

### Phase 2: Backend API (Week 2-3)
- Set up backend folder structure
- Implement repository layer
- Create service layer
- Build controllers
- Set up middleware
- Create API routes
- Implement tree service for hierarchy

### Phase 3: Frontend Structure (Week 3-4)
- Set up frontend folder structure
- Install required libraries
- Create Zustand stores
- Set up API client
- Implement custom hooks
- Create base components

### Phase 4: Roadmap UI (Week 4-5)
- Implement React Flow integration
- Create custom node component
- Build roadmap controls
- Implement tree layout
- Add zoom/pan functionality
- Style with roadmap.sh aesthetic

### Phase 5: Sidebar & Content (Week 5-6)
- Build sidebar component
- Implement markdown editor
- Create resource manager
- Add comment system
- Implement user notes
- Add quiz functionality

### Phase 6: Search & Progress (Week 6-7)
- Implement global search
- Add Ctrl+K shortcut
- Create search modal
- Build progress tracking
- Implement dashboard
- Add statistics

### Phase 7: Admin Features (Week 7-8)
- Create admin panel
- Implement topic management
- Build tree editor
- Add content approval
- Create user management
- Implement category management

### Phase 8: Polish & Launch (Week 8-9)
- Performance optimization
- Accessibility improvements
- Mobile responsiveness
- Testing and bug fixes
- Documentation
- Deployment

## Required Libraries

### Frontend
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "reactflow": "^11.10.0",
    "framer-motion": "^10.16.0",
    "@tanstack/react-query": "^5.0.0",
    "react-hook-form": "^7.48.0",
    "zustand": "^4.4.0",
    "@mui/material": "^5.14.0",
    "@mui/icons-material": "^5.14.0",
    "react-markdown": "^9.0.0",
    "@monaco-editor/react": "^4.6.0",
    "react-hotkeys-hook": "^4.4.0",
    "date-fns": "^2.30.0",
    "recharts": "^2.10.0",
    "cmdk": "^0.2.0"
  }
}
```

### Backend
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "@supabase/supabase-js": "^2.38.0",
    "dotenv": "^16.3.0",
    "zod": "^3.22.0",
    "express-rate-limit": "^7.0.0"
  }
}
```

## Best Practices

### Backend
- Use repository pattern for data access
- Implement service layer for business logic
- Use middleware for cross-cutting concerns
- Implement proper error handling
- Use Zod for input validation
- Implement rate limiting
- Use environment variables for configuration
- Follow REST principles

### Frontend
- Use Zustand for state management
- Implement custom hooks for reusable logic
- Use TanStack Query for data fetching
- Implement proper error boundaries
- Use TypeScript for type safety
- Follow component composition patterns
- Implement proper loading states
- Use optimistic updates where appropriate

### Database
- Use proper indexing for performance
- Implement RLS policies for security
- Use materialized paths for tree queries
- Implement full-text search
- Use proper foreign key constraints
- Implement proper cascading deletes
- Use triggers for computed fields

This architecture provides a production-ready foundation for a roadmap.sh-style learning platform with proper separation of concerns, scalability, and maintainability.
