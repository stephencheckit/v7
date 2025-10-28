-- Add status column to simple_forms table
ALTER TABLE simple_forms 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published'));

-- Set existing forms to published (backward compatibility)
UPDATE simple_forms SET status = 'published' WHERE status IS NULL;

-- Add index for querying forms by status
CREATE INDEX IF NOT EXISTS idx_simple_forms_status ON simple_forms(status);

-- Add comment
COMMENT ON COLUMN simple_forms.status IS 'Form publication status: draft or published';

