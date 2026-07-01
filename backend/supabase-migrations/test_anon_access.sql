-- Test if anon key can access profiles table
-- Run this in Supabase SQL Editor to test permissions

-- Try to select from profiles (this should work with anon key if RLS is disabled)
SELECT * FROM profiles LIMIT 1;

-- Try to insert into profiles (this should work with anon key if RLS is disabled)
-- This is a test - you can delete it after
INSERT INTO profiles (email, full_name, auth_provider, auth_provider_id)
VALUES ('test@example.com', 'Test User', 'test', 'test-id')
ON CONFLICT (email) DO NOTHING;

-- Clean up test data
DELETE FROM profiles WHERE email = 'test@example.com';
