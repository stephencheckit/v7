-- Create summary_reports table for AI-generated compliance summaries
CREATE TABLE summary_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Configuration
  date_range_start TIMESTAMPTZ NOT NULL,
  date_range_end TIMESTAMPTZ NOT NULL,
  cadence_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  filter_config JSONB DEFAULT '{}'::jsonb, -- status filters, specific days, etc.
  
  -- Scheduling
  schedule_type VARCHAR(50) DEFAULT 'manual', -- manual, one_time, recurring
  schedule_config JSONB DEFAULT NULL, -- cron pattern, frequency
  next_run_at TIMESTAMPTZ,
  
  -- Generation
  status VARCHAR(50) DEFAULT 'draft', -- draft, generating, completed, failed, scheduled
  ai_content JSONB DEFAULT '{}'::jsonb, -- executive_summary, insights, recommendations
  metrics JSONB DEFAULT '{}'::jsonb, -- compliance rates, counts
  chart_data JSONB DEFAULT '{}'::jsonb,
  
  -- Recipients & Notifications
  recipients JSONB DEFAULT '[]'::jsonb,
  notify_users BOOLEAN DEFAULT true, -- notify form users about inclusion
  
  -- Derivative tracking
  parent_summary_id UUID REFERENCES summary_reports(id) ON DELETE SET NULL,
  user_commentary TEXT,
  
  -- Metadata
  generated_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_schedule_type CHECK (
    schedule_type IN ('manual', 'one_time', 'recurring')
  ),
  CONSTRAINT valid_status CHECK (
    status IN ('draft', 'generating', 'completed', 'failed', 'scheduled')
  )
);

-- Add indexes
CREATE INDEX idx_summary_reports_workspace ON summary_reports(workspace_id);
CREATE INDEX idx_summary_reports_status ON summary_reports(status);
CREATE INDEX idx_summary_reports_next_run ON summary_reports(next_run_at) WHERE next_run_at IS NOT NULL;
CREATE INDEX idx_summary_reports_created_by ON summary_reports(created_by);

-- Add updated_at trigger
CREATE TRIGGER update_summary_reports_updated_at
  BEFORE UPDATE ON summary_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE summary_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view workspace summaries"
  ON summary_reports FOR SELECT
  USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create workspace summaries"
  ON summary_reports FOR INSERT
  WITH CHECK (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update workspace summaries"
  ON summary_reports FOR UPDATE
  USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete workspace summaries"
  ON summary_reports FOR DELETE
  USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  ));

-- Update form_cadences to track summary inclusion
ALTER TABLE form_cadences 
ADD COLUMN IF NOT EXISTS included_in_summaries JSONB DEFAULT '[]'::jsonb;

COMMENT ON TABLE summary_reports IS 'AI-generated compliance summary reports aggregating form instance data';
COMMENT ON COLUMN summary_reports.cadence_ids IS 'Array of form_cadence IDs included in this summary';
COMMENT ON COLUMN summary_reports.filter_config IS 'Filters applied: status_filter, specific_days, etc.';
COMMENT ON COLUMN summary_reports.ai_content IS 'AI-generated content: executive_summary, insights, recommendations';
COMMENT ON COLUMN summary_reports.metrics IS 'Compliance metrics: total_instances, completed, missed, completion_rate, by_cadence breakdown';
COMMENT ON COLUMN form_cadences.included_in_summaries IS 'Array of summary_report IDs that include this cadence';

