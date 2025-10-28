-- =====================================================
-- FORM CADENCES & SCHEDULING SYSTEM
-- Date: October 28, 2025
-- Purpose: Enable recurring and event-based form scheduling
-- =====================================================

-- =====================================================
-- 1. FORM_CADENCES TABLE
-- Defines recurring schedules for forms
-- =====================================================
CREATE TABLE form_cadences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  form_id TEXT NOT NULL REFERENCES simple_forms(id) ON DELETE CASCADE,
  
  -- Cadence Details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Schedule Configuration (flexible JSONB)
  schedule_config JSONB NOT NULL DEFAULT '{
    "type": "recurring",
    "pattern": "daily",
    "time": "09:00",
    "timezone": "America/New_York",
    "days_of_week": [1,2,3,4,5,6,7],
    "completion_window_hours": 2,
    "start_date": null,
    "end_date": null
  }'::jsonb,
  
  -- Event Triggers (for reactive scheduling)
  trigger_config JSONB DEFAULT NULL,
  
  -- Notification Settings
  notification_config JSONB NOT NULL DEFAULT '{
    "recipients": [],
    "notify_on_ready": true,
    "notify_on_missed": true,
    "reminder_minutes_before_deadline": [60, 15]
  }'::jsonb,
  
  -- Assignment (who should complete)
  assigned_to JSONB DEFAULT '[]'::jsonb,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_schedule_type CHECK (
    schedule_config->>'type' IN ('recurring', 'one_time', 'event_based')
  )
);

-- =====================================================
-- 2. FORM_INSTANCES TABLE
-- Individual occurrences that need completion
-- =====================================================
CREATE TABLE form_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  cadence_id UUID REFERENCES form_cadences(id) ON DELETE SET NULL,
  form_id TEXT NOT NULL REFERENCES simple_forms(id),
  
  -- Instance Details
  instance_name VARCHAR(255) NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  due_at TIMESTAMPTZ NOT NULL,
  
  -- Status Tracking
  status VARCHAR(50) DEFAULT 'pending',
  
  -- Completion Info
  submission_id UUID REFERENCES simple_form_submissions(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id),
  
  -- Assignment
  assigned_to JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata (location, priority, trigger source, etc.)
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_instance_status CHECK (
    status IN ('pending', 'ready', 'in_progress', 'completed', 'missed', 'skipped')
  ),
  CONSTRAINT valid_due_date CHECK (due_at > scheduled_for)
);

-- =====================================================
-- 3. INSTANCE_NOTIFICATIONS TABLE
-- Track all notifications sent for instances
-- =====================================================
CREATE TABLE instance_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES form_instances(id) ON DELETE CASCADE,
  
  -- Notification Details
  notification_type VARCHAR(50) NOT NULL,
  channel VARCHAR(50) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  
  -- Status
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'sent',
  error_message TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_notification_type CHECK (
    notification_type IN ('ready', 'reminder', 'missed', 'escalation')
  ),
  CONSTRAINT valid_channel CHECK (
    channel IN ('email', 'sms', 'in_app', 'webhook')
  ),
  CONSTRAINT valid_notification_status CHECK (
    status IN ('sent', 'delivered', 'failed', 'bounced')
  )
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Cadences
CREATE INDEX idx_form_cadences_workspace ON form_cadences(workspace_id);
CREATE INDEX idx_form_cadences_form ON form_cadences(form_id);
CREATE INDEX idx_form_cadences_active ON form_cadences(is_active) WHERE is_active = true;
CREATE INDEX idx_form_cadences_workspace_active ON form_cadences(workspace_id, is_active);

-- Instances
CREATE INDEX idx_form_instances_workspace ON form_instances(workspace_id);
CREATE INDEX idx_form_instances_cadence ON form_instances(cadence_id);
CREATE INDEX idx_form_instances_form ON form_instances(form_id);
CREATE INDEX idx_form_instances_status ON form_instances(status);
CREATE INDEX idx_form_instances_scheduled ON form_instances(scheduled_for);
CREATE INDEX idx_form_instances_due ON form_instances(due_at);
CREATE INDEX idx_form_instances_completed ON form_instances(completed_at) WHERE completed_at IS NOT NULL;

-- Composite indexes for common queries
CREATE INDEX idx_form_instances_workspace_status ON form_instances(workspace_id, status);
CREATE INDEX idx_form_instances_ready_due ON form_instances(status, due_at) 
  WHERE status IN ('pending', 'ready', 'in_progress');
CREATE INDEX idx_form_instances_calendar ON form_instances(workspace_id, scheduled_for, status);

-- Notifications
CREATE INDEX idx_instance_notifications_instance ON instance_notifications(instance_id);
CREATE INDEX idx_instance_notifications_sent ON instance_notifications(sent_at);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_cadence_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_form_cadences_updated_at 
  BEFORE UPDATE ON form_cadences
  FOR EACH ROW EXECUTE FUNCTION update_cadence_updated_at();

CREATE TRIGGER update_form_instances_updated_at 
  BEFORE UPDATE ON form_instances
  FOR EACH ROW EXECUTE FUNCTION update_cadence_updated_at();

-- =====================================================
-- VIEWS (for easier querying)
-- =====================================================

-- Active instances by status
CREATE VIEW v_active_instances AS
SELECT 
  fi.*,
  fc.name as cadence_name,
  sf.title as form_title,
  w.name as workspace_name,
  EXTRACT(EPOCH FROM (fi.due_at - NOW())) / 3600 as hours_until_due
FROM form_instances fi
LEFT JOIN form_cadences fc ON fc.id = fi.cadence_id
LEFT JOIN simple_forms sf ON sf.id = fi.form_id
LEFT JOIN workspaces w ON w.id = fi.workspace_id
WHERE fi.status IN ('pending', 'ready', 'in_progress')
ORDER BY fi.scheduled_for ASC;

-- Cadence health metrics
CREATE VIEW v_cadence_stats AS
SELECT 
  fc.id as cadence_id,
  fc.name as cadence_name,
  fc.workspace_id,
  COUNT(fi.id) as total_instances,
  COUNT(fi.id) FILTER (WHERE fi.status = 'completed') as completed_count,
  COUNT(fi.id) FILTER (WHERE fi.status = 'missed') as missed_count,
  COUNT(fi.id) FILTER (WHERE fi.status = 'ready') as ready_count,
  ROUND(
    COUNT(fi.id) FILTER (WHERE fi.status = 'completed')::numeric / 
    NULLIF(COUNT(fi.id), 0) * 100, 
    2
  ) as completion_rate
FROM form_cadences fc
LEFT JOIN form_instances fi ON fi.cadence_id = fc.id
WHERE fc.is_active = true
GROUP BY fc.id, fc.name, fc.workspace_id;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE form_cadences ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE instance_notifications ENABLE ROW LEVEL SECURITY;

-- Cadences: users can access cadences in their workspaces
CREATE POLICY "Users can view workspace cadences"
  ON form_cadences FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create cadences in their workspaces"
  ON form_cadences FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Users can update workspace cadences"
  ON form_cadences FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Users can delete workspace cadences"
  ON form_cadences FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'editor')
    )
  );

-- Instances: same pattern
CREATE POLICY "Users can view workspace instances"
  ON form_instances FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update instances in their workspaces"
  ON form_instances FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert instances"
  ON form_instances FOR INSERT
  WITH CHECK (true);

-- Notifications: read-only for users
CREATE POLICY "Users can view instance notifications"
  ON instance_notifications FOR SELECT
  USING (
    instance_id IN (
      SELECT id FROM form_instances
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "System can insert notifications"
  ON instance_notifications FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE form_cadences IS 'Recurring schedules and event triggers for forms';
COMMENT ON TABLE form_instances IS 'Individual occurrences of forms that need completion';
COMMENT ON TABLE instance_notifications IS 'Notification delivery tracking';

COMMENT ON COLUMN form_cadences.schedule_config IS 'JSONB: type, pattern, time, timezone, days_of_week, completion_window_hours';
COMMENT ON COLUMN form_cadences.trigger_config IS 'JSONB: Event-based triggers (sensor alerts, missed forms, etc.)';
COMMENT ON COLUMN form_instances.status IS 'pending → ready → in_progress → completed | missed | skipped';

