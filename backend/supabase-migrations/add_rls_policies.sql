-- Disable RLS for now since we're using Auth0 for authentication
-- RLS policies would need to be implemented with proper Auth0 integration
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE shared_topics DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_activity DISABLE ROW LEVEL SECURITY;
ALTER TABLE custom_categories DISABLE ROW LEVEL SECURITY;
