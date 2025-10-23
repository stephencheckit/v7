-- Add thank you page settings to simple_forms table
-- This allows form creators to customize the post-submission experience

ALTER TABLE simple_forms 
ADD COLUMN IF NOT EXISTS thank_you_settings JSONB DEFAULT '{
  "message": "Thank you for your submission!",
  "allowAnotherSubmission": true,
  "showResponseSummary": true,
  "showCloseButton": false,
  "allowSocialShare": false,
  "redirectUrl": "",
  "redirectDelay": 0
}'::jsonb;

-- Add index for querying forms by thank you settings
CREATE INDEX IF NOT EXISTS idx_simple_forms_thankyou_settings ON simple_forms USING gin(thank_you_settings);

