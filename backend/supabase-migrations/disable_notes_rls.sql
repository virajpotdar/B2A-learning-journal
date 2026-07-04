-- Disable RLS on notes table for Auth0 authentication
-- Since we're using Auth0 for authentication, Supabase RLS policies won't work
-- This allows the notes API to function properly
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies on notes table
DROP POLICY IF EXISTS "Users can read own notes" ON notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON notes;
DROP POLICY IF EXISTS "Users can update own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON notes;
