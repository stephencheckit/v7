-- =====================================================
-- ADD WORKSPACE_ID TO EXISTING TABLES
-- Enable multi-tenant data isolation
-- =====================================================

-- Add workspace_id to simple_forms if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'simple_forms' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE simple_forms ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
    CREATE INDEX idx_simple_forms_workspace_id ON simple_forms(workspace_id);
  END IF;
END $$;

-- Add workspace_id to simple_form_submissions if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'simple_form_submissions' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE simple_form_submissions ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
    CREATE INDEX idx_simple_form_submissions_workspace_id ON simple_form_submissions(workspace_id);
  END IF;
END $$;

-- Add workspace_id to ai_conversations if exists and doesn't have it
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_conversations') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'ai_conversations' AND column_name = 'workspace_id'
    ) THEN
      ALTER TABLE ai_conversations ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
      CREATE INDEX idx_ai_conversations_workspace_id ON ai_conversations(workspace_id);
    END IF;
  END IF;
END $$;

-- Add workspace_id to sensors if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sensors' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE sensors ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
    CREATE INDEX idx_sensors_workspace_id ON sensors(workspace_id);
  END IF;
END $$;

-- Add workspace_id to sensor_alerts if not exists
-- This will be populated from the sensor's workspace_id
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sensor_alerts' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE sensor_alerts ADD COLUMN workspace_id UUID;
    
    -- Populate workspace_id from sensors table
    UPDATE sensor_alerts sa 
    SET workspace_id = s.workspace_id
    FROM sensors s
    WHERE sa.sensor_id = s.id
    AND s.workspace_id IS NOT NULL;
    
    -- Make it NOT NULL and add foreign key
    ALTER TABLE sensor_alerts ALTER COLUMN workspace_id SET NOT NULL;
    ALTER TABLE sensor_alerts ADD FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
    CREATE INDEX idx_sensor_alerts_workspace_id ON sensor_alerts(workspace_id);
  END IF;
END $$;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON COLUMN simple_forms.workspace_id IS 'Links form to a workspace for multi-tenant isolation';
COMMENT ON COLUMN simple_form_submissions.workspace_id IS 'Links submission to a workspace for multi-tenant isolation';
COMMENT ON COLUMN sensors.workspace_id IS 'Links sensor to a workspace for multi-tenant isolation';
COMMENT ON COLUMN sensor_alerts.workspace_id IS 'Links alert to a workspace for multi-tenant isolation';

