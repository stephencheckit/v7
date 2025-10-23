-- AI Conversations table for form-scoped chat history
CREATE TABLE ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id text NOT NULL UNIQUE,  -- References simple_forms.id, but not FK to allow orphans. One conversation per form.
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Index for fast lookups by form_id (unique constraint already creates an index)
-- CREATE INDEX idx_ai_conversations_form_id ON ai_conversations(form_id);

-- Index for ordering by last update
CREATE INDEX idx_ai_conversations_updated_at ON ai_conversations(updated_at DESC);

-- Enable RLS
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations (will add user auth later)
CREATE POLICY "Allow all operations on ai_conversations"
  ON ai_conversations
  FOR ALL
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE ai_conversations IS 'Stores AI chat history per form. Messages preserved even if form is deleted (paper trail).';

