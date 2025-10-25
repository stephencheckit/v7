-- Migration: Add CFR-compliant signature support to form submissions
-- Date: October 25, 2025
-- Purpose: Enable 21 CFR Part 11 compliant electronic signatures

-- Add signature columns to simple_form_submissions table
ALTER TABLE simple_form_submissions 
ADD COLUMN IF NOT EXISTS signatures JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS signature_audit JSONB DEFAULT '[]';

-- Add indexes for efficient querying of signature data
CREATE INDEX IF NOT EXISTS idx_submissions_signatures 
ON simple_form_submissions USING GIN (signatures);

CREATE INDEX IF NOT EXISTS idx_submissions_audit 
ON simple_form_submissions USING GIN (signature_audit);

-- Add comment explaining the structure
COMMENT ON COLUMN simple_form_submissions.signatures IS 
'CFR-compliant signature data including: id, fieldId, signedBy, signedById, signedAt, signatureMeaning, signatureData (base64), ipAddress, userAgent, deviceType, certificateAcceptedAt, and metadata';

COMMENT ON COLUMN simple_form_submissions.signature_audit IS 
'Audit trail for signature actions including: timestamp, action, signatureId, userId, ipAddress';

