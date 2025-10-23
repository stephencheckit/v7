-- Add is_preview flag to submissions table
-- This allows preview submissions to be excluded from analytics

ALTER TABLE simple_form_submissions 
ADD COLUMN IF NOT EXISTS is_preview BOOLEAN DEFAULT false;

-- Add index for filtering out preview submissions in queries
CREATE INDEX IF NOT EXISTS idx_simple_form_submissions_is_preview ON simple_form_submissions(form_id, is_preview) WHERE is_preview = false;

-- Update the stats view to exclude preview submissions
DROP VIEW IF EXISTS simple_form_stats;
CREATE VIEW simple_form_stats AS
SELECT
  form_id,
  COUNT(id) FILTER (WHERE is_preview = false) AS total_submissions,
  MAX(submitted_at) FILTER (WHERE is_preview = false) AS last_submission_at
FROM simple_form_submissions
GROUP BY form_id;

