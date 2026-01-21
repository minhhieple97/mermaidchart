-- Migration: Ensure RLS policies are properly configured
-- This migration re-applies RLS policies to fix any issues with users seeing other users' data

-- Ensure RLS is enabled on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagrams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to recreate them cleanly)
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can create own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

DROP POLICY IF EXISTS "Users can view diagrams in own projects" ON diagrams;
DROP POLICY IF EXISTS "Users can create diagrams in own projects" ON diagrams;
DROP POLICY IF EXISTS "Users can update diagrams in own projects" ON diagrams;
DROP POLICY IF EXISTS "Users can delete diagrams in own projects" ON diagrams;
DROP POLICY IF EXISTS "Public diagrams are viewable" ON diagrams;

DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
DROP POLICY IF EXISTS "Users can view own transactions" ON credit_transactions;

-- Projects: Users can only access their own projects
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Diagrams: Users can access diagrams in their projects
CREATE POLICY "Users can view diagrams in own projects" ON diagrams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = diagrams.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create diagrams in own projects" ON diagrams
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = diagrams.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update diagrams in own projects" ON diagrams
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = diagrams.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete diagrams in own projects" ON diagrams
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = diagrams.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Public diagrams are viewable by anyone (for sharing feature)
CREATE POLICY "Public diagrams are viewable" ON diagrams
  FOR SELECT USING (is_public = true);

-- User credits: Users can only view their own credit data
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Add trigger to auto-initialize credits for new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_credits (user_id, balance)
  VALUES (NEW.id, 50)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create initial transaction record
  INSERT INTO credit_transactions (user_id, amount, balance_after, transaction_type)
  VALUES (NEW.id, 50, 50, 'initial')
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users (if not exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
