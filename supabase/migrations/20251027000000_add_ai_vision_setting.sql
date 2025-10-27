-- Add AI Vision setting to simple_forms table
-- Allows form creators to enable/disable AI vision data collection

ALTER TABLE simple_forms 
ADD COLUMN IF NOT EXISTS ai_vision_enabled BOOLEAN DEFAULT false;

-- Add index for querying forms by AI vision enabled status
CREATE INDEX IF NOT EXISTS idx_simple_forms_ai_vision ON simple_forms(ai_vision_enabled);

-- Add comment
COMMENT ON COLUMN simple_forms.ai_vision_enabled IS 'Enable AI vision data collection for this form';

