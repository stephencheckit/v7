-- Create courses table for AI-generated training content
-- Blocks stored as JSONB array for simplicity

CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  blocks JSONB NOT NULL, -- Array of course blocks (text, quizzes, etc.)
  total_points INTEGER DEFAULT 0,
  estimated_minutes INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster workspace queries
CREATE INDEX idx_courses_workspace_id ON courses(workspace_id);
CREATE INDEX idx_courses_created_at ON courses(created_at DESC);

-- RLS Policies
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Users can view courses in their workspace
CREATE POLICY "Users can view courses in workspace" 
  ON courses FOR SELECT 
  USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  ));

-- Users can create courses in their workspace
CREATE POLICY "Users can create courses in workspace" 
  ON courses FOR INSERT 
  WITH CHECK (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  ));

-- Users can update courses they created
CREATE POLICY "Users can update own courses" 
  ON courses FOR UPDATE 
  USING (creator_id = auth.uid());

-- Users can delete courses they created
CREATE POLICY "Users can delete own courses" 
  ON courses FOR DELETE 
  USING (creator_id = auth.uid());

