-- =====================================================
-- FIX FORM_INSTANCES CASCADE DELETE
-- Date: October 29, 2025
-- Purpose: Allow forms to be deleted even when they have instances
-- =====================================================

-- Drop the existing foreign key constraint
ALTER TABLE form_instances 
DROP CONSTRAINT IF EXISTS form_instances_form_id_fkey;

-- Re-add it with CASCADE DELETE
ALTER TABLE form_instances
ADD CONSTRAINT form_instances_form_id_fkey
FOREIGN KEY (form_id) 
REFERENCES simple_forms(id) 
ON DELETE CASCADE;

-- Add comment explaining the change
COMMENT ON CONSTRAINT form_instances_form_id_fkey ON form_instances IS 
'Cascade delete: When a form is deleted, all its instances are automatically deleted';

