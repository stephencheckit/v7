-- Simple Backend Prototype Migration
-- Creates 3 tables: forms, submissions, form_stats
-- No RLS - all tables are public

-- Table 1: Forms
CREATE TABLE forms (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  schema JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 2: Submissions
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id TEXT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 3: Form Stats (optional - can compute on-the-fly)
CREATE TABLE form_stats (
  form_id TEXT PRIMARY KEY REFERENCES forms(id) ON DELETE CASCADE,
  total_submissions INTEGER DEFAULT 0,
  last_submission_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_submissions_form_id ON submissions(form_id);
CREATE INDEX idx_submissions_submitted_at ON submissions(submitted_at DESC);
CREATE INDEX idx_forms_created_at ON forms(created_at DESC);

-- Function to update form_stats automatically
CREATE OR REPLACE FUNCTION update_form_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO form_stats (form_id, total_submissions, last_submission_at, updated_at)
  VALUES (NEW.form_id, 1, NEW.submitted_at, NOW())
  ON CONFLICT (form_id) 
  DO UPDATE SET
    total_submissions = form_stats.total_submissions + 1,
    last_submission_at = NEW.submitted_at,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stats on new submission
CREATE TRIGGER update_stats_on_submission
  AFTER INSERT ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_form_stats();

-- Enable public access (no RLS for prototype)
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_stats ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anonymous users
CREATE POLICY "Allow all for forms" ON forms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for submissions" ON submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for form_stats" ON form_stats FOR ALL USING (true) WITH CHECK (true);


