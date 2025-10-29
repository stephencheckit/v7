-- Workflows table
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  trigger_type VARCHAR(50) NOT NULL,
  trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  is_active BOOLEAN DEFAULT true,
  
  triggered_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_trigger_type CHECK (
    trigger_type IN ('sensor_temp_exceeds', 'sensor_temp_below', 'form_overdue', 'form_submitted', 'form_missed', 'schedule')
  )
);

CREATE INDEX idx_workflows_workspace_id ON workflows(workspace_id);
CREATE INDEX idx_workflows_trigger_type ON workflows(trigger_type);
CREATE INDEX idx_workflows_is_active ON workflows(is_active);

-- Workflow executions log
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  
  trigger_data JSONB NOT NULL,
  actions_executed JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  status VARCHAR(50) DEFAULT 'completed',
  error_log JSONB,
  
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_executed_at ON workflow_executions(executed_at DESC);

-- RLS Policies
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workflows in their workspace"
  ON workflows FOR SELECT
  USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create workflows in their workspace"
  ON workflows FOR INSERT
  WITH CHECK (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update workflows in their workspace"
  ON workflows FOR UPDATE
  USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete workflows in their workspace"
  ON workflows FOR DELETE
  USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can view workflow executions in their workspace"
  ON workflow_executions FOR SELECT
  USING (workflow_id IN (
    SELECT id FROM workflows WHERE workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  ));

