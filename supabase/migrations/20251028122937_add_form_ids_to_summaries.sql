-- Add support for regular form submissions in summary reports
-- This allows summaries to include both cadence-based instances and regular form submissions

ALTER TABLE summary_reports 
ADD COLUMN form_ids JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN summary_reports.form_ids IS 'Array of form IDs to include regular submissions (non-cadence) in summary';

-- Add included_in_summaries to forms table for visibility notices
ALTER TABLE forms 
ADD COLUMN IF NOT EXISTS included_in_summaries JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN forms.included_in_summaries IS 'Array of summary_report IDs that include this form';

