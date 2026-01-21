-- Initial Database Schema for Mermaid Chart Preview Application
-- This migration creates the projects and diagrams tables with Row Level Security

-- Users table (managed by Supabase Auth)
-- Supabase automatically creates auth.users

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diagrams table
CREATE TABLE diagrams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code TEXT NOT NULL DEFAULT 'graph TD\n    A[Start] --> B[End]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagrams ENABLE ROW LEVEL SECURITY;

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

-- Indexes for performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX idx_diagrams_project_id ON diagrams(project_id);
CREATE INDEX idx_diagrams_updated_at ON diagrams(updated_at DESC);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER diagrams_updated_at
  BEFORE UPDATE ON diagrams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
