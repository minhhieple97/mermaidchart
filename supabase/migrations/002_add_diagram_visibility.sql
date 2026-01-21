-- Migration: Add diagram visibility (public/private) support
-- This migration adds the is_public column and updates RLS policies for public sharing

-- Add is_public column to diagrams table
ALTER TABLE diagrams
ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT false;

-- Create partial index for efficient public diagram queries
CREATE INDEX idx_diagrams_is_public ON diagrams(id) WHERE is_public = true;

-- Add RLS policy for public diagram viewing (unauthenticated access)
CREATE POLICY "Anyone can view public diagrams" ON diagrams
  FOR SELECT USING (is_public = true);
