-- Create table for tracking AI bot accesses
CREATE TABLE IF NOT EXISTS ai_bot_accesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_name VARCHAR(100) NOT NULL,
  user_agent TEXT NOT NULL,
  path VARCHAR(255) NOT NULL,
  ip_address INET,
  referer TEXT,
  accessed_at TIMESTAMP DEFAULT NOW(),
  response_time_ms INTEGER
);

-- Create indexes for efficient querying
CREATE INDEX idx_ai_bot_accesses_bot_name ON ai_bot_accesses(bot_name);
CREATE INDEX idx_ai_bot_accesses_accessed_at ON ai_bot_accesses(accessed_at DESC);
CREATE INDEX idx_ai_bot_accesses_path ON ai_bot_accesses(path);

-- Create view for analytics aggregation
CREATE OR REPLACE VIEW ai_bot_analytics AS
SELECT 
  bot_name,
  COUNT(*) as total_visits,
  COUNT(DISTINCT DATE(accessed_at)) as days_active,
  MAX(accessed_at) as last_visit,
  AVG(response_time_ms) as avg_response_time
FROM ai_bot_accesses
GROUP BY bot_name;

-- Enable RLS
ALTER TABLE ai_bot_accesses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to insert
CREATE POLICY "Allow service role to insert bot accesses"
  ON ai_bot_accesses
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow authenticated users to view bot accesses
CREATE POLICY "Allow authenticated users to view bot accesses"
  ON ai_bot_accesses
  FOR SELECT
  USING (true);

