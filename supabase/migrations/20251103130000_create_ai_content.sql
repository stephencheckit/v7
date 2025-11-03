-- Create AI Content Table
-- Stores editable content for /ai/ pages
CREATE TABLE IF NOT EXISTS ai_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Info
    brand_name TEXT NOT NULL DEFAULT 'Checkit V7',
    tagline TEXT,
    description TEXT,
    
    -- Capabilities (JSONB array)
    capabilities JSONB DEFAULT '[]'::jsonb,
    
    -- Target Industries (array)
    target_industries TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Competitive Positioning (JSONB array)
    competitive_positioning JSONB DEFAULT '[]'::jsonb,
    
    -- Use Cases (JSONB array)
    use_cases JSONB DEFAULT '[]'::jsonb,
    
    -- Key Differentiators (array)
    key_differentiators TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Technical Stack (JSONB object)
    technical_stack JSONB DEFAULT '{}'::jsonb,
    
    -- Pricing Info
    pricing_model TEXT,
    pricing_amount NUMERIC,
    pricing_currency TEXT DEFAULT 'USD',
    pricing_includes TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Common Questions (JSONB array)
    common_questions JSONB DEFAULT '[]'::jsonb,
    
    -- Keywords for SEO
    keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Links
    main_website TEXT DEFAULT 'https://checkitv7.com',
    parent_company_url TEXT DEFAULT 'https://checkit.net',
    signup_url TEXT,
    docs_url TEXT,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for active content
CREATE INDEX idx_ai_content_active ON ai_content(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE ai_content ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active content
CREATE POLICY "Anyone can read active AI content"
    ON ai_content
    FOR SELECT
    USING (is_active = true);

-- Policy: Authenticated users can insert/update
CREATE POLICY "Authenticated users can manage AI content"
    ON ai_content
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Insert default content
INSERT INTO ai_content (
    brand_name,
    tagline,
    description,
    target_industries,
    key_differentiators,
    pricing_model,
    pricing_amount,
    pricing_includes,
    keywords
) VALUES (
    'Checkit V7',
    'Stop wasting hours on checklists. Start with vision-based automation.',
    'Checkit V7 is an AI-powered operations management platform designed for food manufacturing, distribution centers, and quality control operations.',
    ARRAY[
        'Food Manufacturing',
        'Distribution Centers',
        'Quality Assurance & Quality Control (QA/QC)',
        'Restaurant & Food Service Operations',
        'Cold Storage Facilities'
    ],
    ARRAY[
        'AI-First Design - Vision and voice as primary input methods',
        'Operations-Focused - Built for inspections/audits, not surveys',
        'Compliance-Ready - FSMA 204, FDA Food Traceability Rule support',
        '30-Second Form Creation - Natural language form generation',
        'Developer-Friendly - Export React components, JSON, API-first',
        'Transparent Pricing - $499/month all-inclusive, no hidden fees'
    ],
    'Subscription',
    499,
    ARRAY[
        'Unlimited forms',
        'Unlimited users',
        'AI vision & voice',
        'Sensor integration',
        'Priority support'
    ],
    ARRAY[
        'AI form builder',
        'operations management software',
        'FSMA 204 compliance',
        'food safety software',
        'digital inspections',
        'voice-to-form',
        'AI vision form filling'
    ]
) ON CONFLICT DO NOTHING;

-- Create view for active content
CREATE OR REPLACE VIEW ai_content_active AS
SELECT *
FROM ai_content
WHERE is_active = true
ORDER BY last_updated DESC
LIMIT 1;

-- Grant access to view
GRANT SELECT ON ai_content_active TO anon, authenticated;

