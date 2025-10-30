-- Voice Commentary System for Inspection Insights
-- Captures unstructured voice notes during inspections and reverse-engineers form questions

-- Table: inspection_commentary
-- Stores raw voice transcriptions and AI-extracted insights from inspections
CREATE TABLE IF NOT EXISTS inspection_commentary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  form_id TEXT NOT NULL REFERENCES simple_forms(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES simple_form_submissions(id) ON DELETE SET NULL,
  inspector_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location TEXT, -- Physical location (e.g., "Claysburg DC - Production Line 2")
  raw_transcription TEXT NOT NULL, -- Full voice transcription
  extracted_insights JSONB, -- AI-parsed themes, tags, key phrases
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_commentary_workspace ON inspection_commentary(workspace_id);
CREATE INDEX idx_commentary_form ON inspection_commentary(form_id);
CREATE INDEX idx_commentary_created ON inspection_commentary(created_at DESC);
CREATE INDEX idx_commentary_insights ON inspection_commentary USING gin(extracted_insights);

-- RLS Policies for workspace isolation
ALTER TABLE inspection_commentary ENABLE ROW LEVEL SECURITY;

-- Users can insert commentary for their workspace
CREATE POLICY "Users can insert commentary in their workspace"
  ON inspection_commentary
  FOR INSERT
  TO authenticated
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- Users can view commentary in their workspace
CREATE POLICY "Users can view commentary in their workspace"
  ON inspection_commentary
  FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- Table: suggested_form_questions
-- AI-generated question suggestions based on commentary patterns
CREATE TABLE IF NOT EXISTS suggested_form_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  suggested_question TEXT NOT NULL, -- The question text
  suggested_type TEXT NOT NULL, -- Field type (single-text, multiple-choice, etc.)
  suggested_options JSONB, -- For multiple-choice/dropdown fields
  pattern_source TEXT, -- Description of what commentary triggered this
  occurrence_count INTEGER DEFAULT 1, -- How many times this pattern was seen
  status TEXT DEFAULT 'pending', -- pending, approved, dismissed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_suggestions_workspace ON suggested_form_questions(workspace_id);
CREATE INDEX idx_suggestions_status ON suggested_form_questions(status);
CREATE INDEX idx_suggestions_count ON suggested_form_questions(occurrence_count DESC);

-- RLS Policies
ALTER TABLE suggested_form_questions ENABLE ROW LEVEL SECURITY;

-- Users can view suggestions for their workspace
CREATE POLICY "Users can view suggestions in their workspace"
  ON suggested_form_questions
  FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- Users can insert suggestions for their workspace
CREATE POLICY "Users can insert suggestions in their workspace"
  ON suggested_form_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- Users can update suggestions in their workspace
CREATE POLICY "Users can update suggestions in their workspace"
  ON suggested_form_questions
  FOR UPDATE
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_suggested_questions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_suggested_questions_timestamp
  BEFORE UPDATE ON suggested_form_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_suggested_questions_updated_at();

