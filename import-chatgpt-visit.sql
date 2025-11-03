-- Import the ChatGPT-User visit found in Vercel logs
-- 
-- Instructions:
-- 1. Go to: https://supabase.com/dashboard
-- 2. Select your project
-- 3. Click "SQL Editor" in the left sidebar
-- 4. Paste this SQL and click "Run"
--
-- Before running, update the values below:
-- - Change '/ai/' to the actual path if different
-- - Change the timestamp to when you saw the visit (or leave as NOW() for current time)
-- - Add IP address if you have it (or remove the ip_address line)

INSERT INTO ai_bot_accesses (
  bot_name,
  user_agent,
  path,
  ip_address,
  accessed_at
) VALUES (
  'ChatGPT-User',
  'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot',
  '/ai/',                           -- ← UPDATE THIS: What path did it visit?
  NULL,                             -- ← UPDATE THIS: Add IP if you have it, or leave as NULL
  NOW()                             -- ← UPDATE THIS: Use actual timestamp like '2025-11-03 14:23:45' or leave as NOW()
);

-- Verify it was inserted
SELECT 
  bot_name,
  path,
  accessed_at,
  created_at
FROM ai_bot_accesses
WHERE bot_name = 'ChatGPT-User'
ORDER BY created_at DESC
LIMIT 5;

