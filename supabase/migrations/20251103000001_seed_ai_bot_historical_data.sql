-- Seed historical AI bot access data for analytics dashboard
-- This creates realistic bot visit patterns over the last 90 days

-- Generate 500+ realistic bot visits over the past 90 days
INSERT INTO ai_bot_accesses (bot_name, user_agent, path, ip_address, accessed_at, response_time_ms)
SELECT 
  bot_info.name,
  bot_info.user_agent,
  path_info.path,
  ('35.185.' || floor(random() * 255) || '.' || floor(random() * 255))::inet,
  NOW() - (random() * interval '90 days'),
  (50 + random() * 200)::integer
FROM (
  -- Bot definitions with realistic user agents
  VALUES
    ('GPTBot', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.0; +https://openai.com/gptbot)'),
    ('GPTBot', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.0; +https://openai.com/gptbot)'),
    ('GPTBot', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.0; +https://openai.com/gptbot)'),
    ('ChatGPT-User', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ChatGPT-User/1.0; +https://openai.com/bot)'),
    ('ChatGPT-User', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ChatGPT-User/1.0; +https://openai.com/bot)'),
    ('Claude-Bot', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +https://www.anthropic.com)'),
    ('Claude-Bot', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +https://www.anthropic.com)'),
    ('Claude-Web', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-Web/1.0)'),
    ('PerplexityBot', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0)'),
    ('PerplexityBot', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0)'),
    ('Google-Extended', 'Mozilla/5.0 (compatible; Google-Extended/1.0)'),
    ('Bytespider', 'Mozilla/5.0 (compatible; Bytespider; https://zhanzhang.toutiao.com/)'),
    ('Applebot-Extended', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15 (Applebot/0.1; +http://www.apple.com/go/applebot)'),
    ('cohere-ai', 'Mozilla/5.0 (compatible; cohere-ai)'),
    ('YouBot', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; YouBot/1.0)')
) AS bot_info(name, user_agent)
CROSS JOIN (
  -- Paths that bots would visit
  VALUES
    ('/ai/'),
    ('/ai/'),
    ('/ai/'),
    ('/ai/'),
    ('/ai/context.json'),
    ('/ai/context.json'),
    ('/ai/context.json')
) AS path_info(path)
-- Generate multiple entries per combination
CROSS JOIN generate_series(1, 4) AS series;

-- Add some more concentrated recent activity (last 7 days) - OpenAI bots most active
INSERT INTO ai_bot_accesses (bot_name, user_agent, path, ip_address, accessed_at, response_time_ms)
SELECT 
  'GPTBot',
  'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.0; +https://openai.com/gptbot)',
  CASE WHEN random() < 0.5 THEN '/ai/' ELSE '/ai/context.json' END,
  ('35.185.' || floor(random() * 255) || '.' || floor(random() * 255))::inet,
  NOW() - (random() * interval '7 days'),
  (40 + random() * 150)::integer
FROM generate_series(1, 30);

-- Add Claude activity (second most active)
INSERT INTO ai_bot_accesses (bot_name, user_agent, path, ip_address, accessed_at, response_time_ms)
SELECT 
  CASE WHEN random() < 0.7 THEN 'Claude-Bot' ELSE 'Claude-Web' END,
  CASE 
    WHEN random() < 0.7 THEN 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +https://www.anthropic.com)'
    ELSE 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-Web/1.0)'
  END,
  CASE WHEN random() < 0.6 THEN '/ai/' ELSE '/ai/context.json' END,
  ('35.247.' || floor(random() * 255) || '.' || floor(random() * 255))::inet,
  NOW() - (random() * interval '14 days'),
  (45 + random() * 180)::integer
FROM generate_series(1, 25);

-- Add Perplexity activity
INSERT INTO ai_bot_accesses (bot_name, user_agent, path, ip_address, accessed_at, response_time_ms)
SELECT 
  'PerplexityBot',
  'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0)',
  CASE WHEN random() < 0.5 THEN '/ai/' ELSE '/ai/context.json' END,
  ('34.98.' || floor(random() * 255) || '.' || floor(random() * 255))::inet,
  NOW() - (random() * interval '30 days'),
  (55 + random() * 200)::integer
FROM generate_series(1, 20);

-- Add some Google Extended activity
INSERT INTO ai_bot_accesses (bot_name, user_agent, path, ip_address, accessed_at, response_time_ms)
SELECT 
  'Google-Extended',
  'Mozilla/5.0 (compatible; Google-Extended/1.0)',
  '/ai/context.json',
  ('66.249.' || floor(random() * 255) || '.' || floor(random() * 255))::inet,
  NOW() - (random() * interval '60 days'),
  (60 + random() * 150)::integer
FROM generate_series(1, 15);

-- Add occasional visits from other bots
INSERT INTO ai_bot_accesses (bot_name, user_agent, path, ip_address, accessed_at, response_time_ms)
SELECT 
  bot_name,
  user_agent,
  '/ai/',
  ('104.198.' || floor(random() * 255) || '.' || floor(random() * 255))::inet,
  NOW() - (random() * interval '90 days'),
  (70 + random() * 180)::integer
FROM (
  VALUES
    ('Bytespider', 'Mozilla/5.0 (compatible; Bytespider; https://zhanzhang.toutiao.com/)'),
    ('Applebot-Extended', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15 (Applebot/0.1)'),
    ('cohere-ai', 'Mozilla/5.0 (compatible; cohere-ai)'),
    ('YouBot', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; YouBot/1.0)')
) AS bots(bot_name, user_agent)
CROSS JOIN generate_series(1, 3);

