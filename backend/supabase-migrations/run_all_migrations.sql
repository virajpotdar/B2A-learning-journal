-- Combined SQL Migration File
-- Run this in Supabase SQL Editor to set up all tables at once
-- Order matters for foreign key dependencies

-- 1. Create users table (base authentication)
-- From: create_users_table.sql
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create profiles table (user metadata)
-- From: create_profiles_table.sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create groups table
-- From: create_groups_table.sql
CREATE TABLE IF NOT EXISTS groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create group_members table
-- From: create_groups_table.sql (part of same file)
CREATE TABLE IF NOT EXISTS group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create group_activity table
-- From: create_groups_table.sql (part of same file)
CREATE TABLE IF NOT EXISTS group_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create shared_paths table
-- From: create_shared_paths_table.sql
CREATE TABLE IF NOT EXISTS shared_paths (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  share_id TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  notes_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create custom_categories table
-- From: create_custom_categories_table.sql
CREATE TABLE IF NOT EXISTS custom_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create notes table
-- From: create_notes_table.sql
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Create password_resets table
-- From: create_password_resets_table.sql
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups(created_by);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_paths_share_id ON shared_paths(share_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);

-- 11. Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;

-- 12. RLS Policies for users
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 13. RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- 14. RLS Policies for groups
CREATE POLICY "Users can view groups they are in" ON groups
  FOR SELECT USING (
    id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
    OR created_by = auth.uid()
  );

CREATE POLICY "Users can create groups" ON groups
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Group creators can update groups" ON groups
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Group creators can delete groups" ON groups
  FOR DELETE USING (created_by = auth.uid());

-- 15. RLS Policies for group_members
CREATE POLICY "Users can view group memberships" ON group_members
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can join groups" ON group_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave groups" ON group_members
  FOR DELETE USING (user_id = auth.uid());

-- 16. RLS Policies for group_activity
CREATE POLICY "Group members can view activity" ON group_activity
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Group members can create activity" ON group_activity
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

-- 17. RLS Policies for shared_paths
CREATE POLICY "Users can view shared paths" ON shared_paths
  FOR SELECT USING (true);

CREATE POLICY "Users can create shared paths" ON shared_paths
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own shared paths" ON shared_paths
  FOR DELETE USING (user_id = auth.uid());

-- 18. RLS Policies for custom_categories
CREATE POLICY "Users can view own categories" ON custom_categories
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create categories" ON custom_categories
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own categories" ON custom_categories
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own categories" ON custom_categories
  FOR DELETE USING (user_id = auth.uid());

-- 19. RLS Policies for notes
CREATE POLICY "Users can read own notes" ON notes
  FOR SELECT USING (auth.uid() = (SELECT id FROM profiles WHERE email = auth.email() LIMIT 1));

CREATE POLICY "Users can insert own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = (SELECT id FROM profiles WHERE email = auth.email() LIMIT 1));

CREATE POLICY "Users can update own notes" ON notes
  FOR UPDATE USING (auth.uid() = (SELECT id FROM profiles WHERE email = auth.email() LIMIT 1));

CREATE POLICY "Users can delete own notes" ON notes
  FOR DELETE USING (auth.uid() = (SELECT id FROM profiles WHERE email = auth.email() LIMIT 1));

-- 20. RLS Policies for password_resets
CREATE POLICY "Users can create password resets" ON password_resets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can verify password resets" ON password_resets
  FOR SELECT USING (true);

CREATE POLICY "Users can update password resets" ON password_resets
  FOR UPDATE USING (true);

-- Migration complete!
