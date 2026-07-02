-- Create notes table for learning journal
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own notes
CREATE POLICY "Users can read own notes"
  ON notes FOR SELECT
  USING (auth.uid()::text = (SELECT id FROM profiles WHERE email = auth.email() LIMIT 1));

-- Policy: Users can insert their own notes
CREATE POLICY "Users can insert own notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid()::text = (SELECT id FROM profiles WHERE email = auth.email() LIMIT 1));

-- Policy: Users can update their own notes
CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  USING (auth.uid()::text = (SELECT id FROM profiles WHERE email = auth.email() LIMIT 1));

-- Policy: Users can delete their own notes
CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  USING (auth.uid()::text = (SELECT id FROM profiles WHERE email = auth.email() LIMIT 1));
