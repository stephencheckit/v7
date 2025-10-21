-- Simple Backend Prototype Migration
-- Creates 3 tables: simple_forms, simple_form_submissions, simple_form_stats
-- No RLS - all tables are public

-- Table 1: Forms
CREATE TABLE simple_forms (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  schema JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 2: Submissions
CREATE TABLE simple_form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id TEXT NOT NULL REFERENCES simple_forms(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 3: Form Stats View (computed from submissions)
CREATE VIEW simple_form_stats AS
SELECT
  form_id,
  COUNT(id) AS total_submissions,
  MAX(submitted_at) AS last_submission_at
FROM simple_form_submissions
GROUP BY form_id;

-- Indexes for performance
CREATE INDEX idx_simple_form_submissions_form_id ON simple_form_submissions(form_id);
CREATE INDEX idx_simple_form_submissions_submitted_at ON simple_form_submissions(submitted_at DESC);
CREATE INDEX idx_simple_forms_created_at ON simple_forms(created_at DESC);

-- Enable public access (no RLS for prototype)
ALTER TABLE simple_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE simple_form_submissions ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anonymous users
CREATE POLICY "Allow all for simple_forms" ON simple_forms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for simple_form_submissions" ON simple_form_submissions FOR ALL USING (true) WITH CHECK (true);


