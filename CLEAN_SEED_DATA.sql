-- Clean Seed Data from Production
-- This removes all fake historical data and keeps only real bot visits

-- Step 1: Check what we have now
SELECT 
  'BEFORE CLEANUP' as status,
  COUNT(*) as total_visits,
  COUNT(DISTINCT bot_name) as unique_bots,
  MIN(accessed_at) as earliest_visit,
  MAX(accessed_at) as latest_visit
FROM ai_bot_accesses;

-- Step 2: Delete all seed data (visits before Nov 3, 2025 when we started tracking REAL data)
-- This will remove the ~500+ fake visits from the seed migration
DELETE FROM ai_bot_accesses 
WHERE accessed_at < '2025-11-03 00:00:00'::timestamptz;

-- Step 3: Verify what remains (should be ~11 real visits from your Vercel logs)
SELECT 
  'AFTER CLEANUP' as status,
  COUNT(*) as total_visits,
  COUNT(DISTINCT bot_name) as unique_bots,
  MIN(accessed_at) as earliest_visit,
  MAX(accessed_at) as latest_visit
FROM ai_bot_accesses;

-- Step 4: Show remaining bot breakdown
SELECT 
  bot_name,
  COUNT(*) as visits,
  MIN(accessed_at) as first_visit,
  MAX(accessed_at) as last_visit
FROM ai_bot_accesses
GROUP BY bot_name
ORDER BY visits DESC;

