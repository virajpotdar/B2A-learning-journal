-- Create shared_paths table for sharing learning journeys
CREATE TABLE IF NOT EXISTS shared_paths (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  share_id VARCHAR(20) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  notes_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on share_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_shared_paths_share_id ON shared_paths(share_id);

-- Create index on user_id for user's shared paths
CREATE INDEX IF NOT EXISTS idx_shared_paths_user_id ON shared_paths(user_id);

-- Create index on category for category-based queries
CREATE INDEX IF NOT EXISTS idx_shared_paths_category ON shared_paths(category);

-- Enable RLS (Row Level Security)
ALTER TABLE shared_paths ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can read any shared path (for viewing shared links)
CREATE POLICY "Anyone can read shared paths"
  ON shared_paths FOR SELECT
  USING (true);

-- Create policy: Users can create shared paths
CREATE POLICY "Users can create shared paths"
  ON shared_paths FOR INSERT
  WITH CHECK (true);

-- Create policy: Users can update their own shared paths
CREATE POLICY "Users can update own shared paths"
  ON shared_paths FOR UPDATE
  USING (user_id = auth.uid()::text);

-- Create policy: Users can delete their own shared paths
CREATE POLICY "Users can delete own shared paths"
  ON shared_paths FOR DELETE
  USING (user_id = auth.uid()::text);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_shared_paths_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_shared_paths_updated_at
  BEFORE UPDATE ON shared_paths
  FOR EACH ROW
  EXECUTE FUNCTION update_shared_paths_updated_at();
