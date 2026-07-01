-- Custom learning categories table (user-created learning paths)
CREATE TABLE IF NOT EXISTS custom_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#6366f1',
  gradient VARCHAR(100) DEFAULT 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_custom_categories_user_id ON custom_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_categories_created_at ON custom_categories(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_custom_categories_updated_at BEFORE UPDATE ON custom_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
