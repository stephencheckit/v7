-- Create table for AI citation monitoring results
CREATE TABLE IF NOT EXISTS ai_citation_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  ai_model VARCHAR(50) NOT NULL, -- 'chatgpt', 'claude', 'perplexity'
  mentioned BOOLEAN NOT NULL,
  position INTEGER, -- 1 = first mentioned, 2 = second, etc.
  accurate BOOLEAN, -- NULL if not mentioned, TRUE/FALSE if mentioned
  competitors_mentioned TEXT[], -- Array of competitor names
  full_response TEXT,
  response_length INTEGER,
  tested_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_citation_tests_tested_at ON ai_citation_tests(tested_at DESC);
CREATE INDEX idx_citation_tests_ai_model ON ai_citation_tests(ai_model);
CREATE INDEX idx_citation_tests_mentioned ON ai_citation_tests(mentioned);

-- Create view for citation analytics
CREATE OR REPLACE VIEW ai_citation_analytics AS
SELECT 
  ai_model,
  DATE(tested_at) as test_date,
  COUNT(*) as total_tests,
  SUM(CASE WHEN mentioned THEN 1 ELSE 0 END) as times_mentioned,
  ROUND(100.0 * SUM(CASE WHEN mentioned THEN 1 ELSE 0 END) / COUNT(*), 1) as citation_rate,
  AVG(CASE WHEN position IS NOT NULL THEN position END) as avg_position,
  SUM(CASE WHEN accurate = TRUE THEN 1 ELSE 0 END) as accurate_mentions,
  ROUND(100.0 * SUM(CASE WHEN accurate = TRUE THEN 1 ELSE 0 END) / NULLIF(SUM(CASE WHEN mentioned THEN 1 ELSE 0 END), 0), 1) as accuracy_rate
FROM ai_citation_tests
GROUP BY ai_model, DATE(tested_at)
ORDER BY test_date DESC, ai_model;

-- Enable RLS
ALTER TABLE ai_citation_tests ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to insert
CREATE POLICY "Allow service role to insert citation tests"
  ON ai_citation_tests
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow authenticated users to view
CREATE POLICY "Allow authenticated users to view citation tests"
  ON ai_citation_tests
  FOR SELECT
  USING (true);

-- Add comments
COMMENT ON TABLE ai_citation_tests IS 'Stores results from automated AI citation monitoring tests';
COMMENT ON COLUMN ai_citation_tests.position IS 'Position where CheckIt V7 was first mentioned (1 = first, 2 = second, etc.)';
COMMENT ON COLUMN ai_citation_tests.accurate IS 'Whether the information provided about CheckIt V7 was accurate';

