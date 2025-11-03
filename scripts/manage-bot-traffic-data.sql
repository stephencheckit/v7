-- Manage Bot Traffic Data
-- Helper queries for working with seed vs real bot data

-- ============================================
-- INSPECTION QUERIES
-- ============================================

-- View all bot visits summary
SELECT 
  bot_name,
  COUNT(*) as total_visits,
  MIN(accessed_at) as earliest,
  MAX(accessed_at) as latest,
  COUNT(DISTINCT DATE(accessed_at)) as days_active
FROM ai_bot_accesses
GROUP BY bot_name
ORDER BY total_visits DESC;

-- Check date range of data
SELECT 
  DATE(accessed_at) as visit_date,
  COUNT(*) as visits,
  COUNT(DISTINCT bot_name) as unique_bots
FROM ai_bot_accesses
GROUP BY DATE(accessed_at)
ORDER BY visit_date DESC
LIMIT 30;

-- Identify potential seed data (specific IP ranges used in seed script)
SELECT 
  bot_name,
  COUNT(*) as visits,
  MIN(accessed_at) as earliest
FROM ai_bot_accesses
WHERE 
  ip_address::text LIKE '35.185%' OR
  ip_address::text LIKE '35.247%' OR
  ip_address::text LIKE '34.98%' OR
  ip_address::text LIKE '66.249%' OR
  ip_address::text LIKE '104.198%'
GROUP BY bot_name;

-- Check for real traffic (after Nov 3, 2025 deployment)
SELECT 
  bot_name,
  COUNT(*) as visits,
  MIN(accessed_at) as earliest,
  MAX(accessed_at) as latest
FROM ai_bot_accesses
WHERE accessed_at >= '2025-11-03 00:00:00'
GROUP BY bot_name
ORDER BY visits DESC;

-- ============================================
-- DATA MANAGEMENT QUERIES
-- ============================================

-- OPTION A: Clear ALL seed data (keep only real bot visits)
-- ⚠️ WARNING: This deletes synthetic data. Run inspection queries first!
-- DELETE FROM ai_bot_accesses 
-- WHERE accessed_at < '2025-11-03 00:00:00';

-- OPTION B: Clear specific bot's seed data
-- DELETE FROM ai_bot_accesses 
-- WHERE bot_name = 'GPTBot' 
-- AND accessed_at < '2025-11-03 00:00:00';

-- OPTION C: Clear data by IP range (likely seed data)
-- DELETE FROM ai_bot_accesses 
-- WHERE ip_address::text LIKE '35.185%';

-- OPTION D: Clear everything and start fresh
-- ⚠️ WARNING: Deletes ALL data including real bot visits!
-- TRUNCATE TABLE ai_bot_accesses;

-- ============================================
-- VERIFICATION QUERIES (Run after deletions)
-- ============================================

-- Verify deletion
SELECT COUNT(*) as remaining_records FROM ai_bot_accesses;

-- Check what's left
SELECT 
  bot_name,
  COUNT(*) as visits,
  MIN(accessed_at) as from_date,
  MAX(accessed_at) as to_date
FROM ai_bot_accesses
GROUP BY bot_name;

-- ============================================
-- RE-SEED QUERIES (If you cleared too much)
-- ============================================

-- Re-run the seed migration if needed:
-- Run: supabase/migrations/20251103000001_seed_ai_bot_historical_data.sql

-- Or manually insert a few sample records:
-- INSERT INTO ai_bot_accesses (bot_name, user_agent, path, ip_address, accessed_at)
-- VALUES
--   ('GPTBot', 'Mozilla/5.0 (compatible; GPTBot/1.0)', '/ai/', '35.185.10.20', NOW() - interval '7 days'),
--   ('Claude-Bot', 'Mozilla/5.0 (compatible; ClaudeBot/1.0)', '/ai/context.json', '35.247.15.30', NOW() - interval '5 days');

-- ============================================
-- ANALYTICS QUERIES
-- ============================================

-- Bot activity by day of week
SELECT 
  EXTRACT(DOW FROM accessed_at) as day_of_week,
  TO_CHAR(accessed_at, 'Day') as day_name,
  COUNT(*) as visits
FROM ai_bot_accesses
GROUP BY day_of_week, day_name
ORDER BY day_of_week;

-- Most visited paths
SELECT 
  path,
  COUNT(*) as visits,
  COUNT(DISTINCT bot_name) as unique_bots
FROM ai_bot_accesses
GROUP BY path
ORDER BY visits DESC;

-- Bot visit frequency by hour
SELECT 
  EXTRACT(HOUR FROM accessed_at) as hour,
  COUNT(*) as visits,
  COUNT(DISTINCT bot_name) as unique_bots
FROM ai_bot_accesses
GROUP BY hour
ORDER BY hour;

-- Average response time by bot
SELECT 
  bot_name,
  AVG(response_time_ms) as avg_response_ms,
  MIN(response_time_ms) as min_response_ms,
  MAX(response_time_ms) as max_response_ms
FROM ai_bot_accesses
WHERE response_time_ms IS NOT NULL
GROUP BY bot_name
ORDER BY avg_response_ms;

-- Recent bot activity (last 24 hours)
SELECT 
  bot_name,
  path,
  accessed_at,
  ip_address
FROM ai_bot_accesses
WHERE accessed_at >= NOW() - interval '24 hours'
ORDER BY accessed_at DESC;

