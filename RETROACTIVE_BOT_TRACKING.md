# Retroactive Bot Traffic Population Guide

There are several ways to get **actual** bot traffic data instead of synthetic seed data.

---

## ⚠️ Important Context

The bot tracking middleware was deployed on **November 3, 2025** (commit `a130de1`). Before that, no bot visits were logged to the database. However, server logs may contain historical bot activity.

---

## Option 1: Parse Vercel Logs ⭐ RECOMMENDED

### Step 1: Export Vercel Logs

```bash
# Export last 24 hours (free tier limit)
vercel logs --output=logs.txt

# Or view in Vercel dashboard
# https://vercel.com/YOUR-PROJECT/deployments → Select deployment → Logs
```

### Step 2: Run Import Script

```bash
npx tsx scripts/import-bot-traffic-from-logs.ts logs.txt
```

This will:
- Parse Vercel logs for bot user agents
- Extract visits to `/ai/` paths
- Import them into `ai_bot_accesses` table

### Limitations:
- **Free tier:** Only 24 hours of logs
- **Pro tier:** 1-3 days of logs
- **Enterprise:** Longer retention

---

## Option 2: Manual Log Analysis (If Script Fails)

If the automated script doesn't work with your log format:

### Step 1: Get Raw Logs from Vercel Dashboard
1. Go to https://vercel.com/YOUR-PROJECT/deployments
2. Click on a recent deployment
3. Go to "Functions" tab → View logs
4. Look for requests with bot user agents

### Step 2: Manually Insert via Supabase

```sql
-- Insert a single bot visit
INSERT INTO ai_bot_accesses (bot_name, user_agent, path, ip_address, accessed_at)
VALUES (
  'GPTBot',
  'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.0)',
  '/ai/context.json',
  '35.185.123.45',
  '2025-11-02 14:23:00'
);
```

### Step 3: Repeat for Each Bot Visit

Look for these user agents in logs:
- `GPTBot`
- `ChatGPT-User`
- `ClaudeBot` or `Claude-Web`
- `PerplexityBot`
- `Google-Extended`
- `Bytespider`
- `Applebot-Extended`

---

## Option 3: Third-Party Analytics Integration

If you have analytics tools already tracking your site:

### Google Analytics 4
1. Go to GA4 dashboard
2. Filter by User-Agent contains "bot"
3. Export bot visits to CSV
4. Parse and import via script

### Cloudflare Analytics
1. Check Cloudflare dashboard → Analytics
2. Filter traffic by bot classification
3. Export and import

### Plausible/Fathom
Similar export → parse → import flow

---

## Option 4: Server Access Logs (If Self-Hosting)

If you have direct server access:

```bash
# Parse nginx/Apache logs
grep -E "GPTBot|Claude|Perplexity" /var/log/nginx/access.log > bot_traffic.txt
```

Then use the import script on the parsed file.

---

## Option 5: Keep Current Seed Data + Real Going Forward

**Simplest approach:** Keep the synthetic seed data for historical context, and let the middleware track real bot visits going forward.

### Pros:
- No extra work required
- Dashboard looks populated immediately
- Real data accumulates naturally over time

### Cons:
- Historical data is synthetic (not real bot behavior)

### When to Use:
- You need a demo-ready dashboard now
- Log retention expired (no historical data available)
- Real bot tracking is more important going forward

---

## Implementation Steps

### To Import Real Data (Option 1):

```bash
# 1. Install dependencies (if needed)
npm install -D tsx

# 2. Set environment variables
export NEXT_PUBLIC_SUPABASE_URL="your-url"
export SUPABASE_SERVICE_ROLE_KEY="your-key"

# 3. Export Vercel logs
vercel logs > logs.txt

# 4. Run import script
npx tsx scripts/import-bot-traffic-from-logs.ts logs.txt

# 5. Clear seed data (optional)
# If you want ONLY real data, delete synthetic records:
# DELETE FROM ai_bot_accesses WHERE accessed_at < '2025-11-03';
```

### To Keep Seed Data + Real (Option 5):

**Do nothing.** The middleware automatically tracks new bot visits starting November 3, 2025. Seed data provides historical context.

---

## Checking What You Have

### Query Current Bot Traffic:

```sql
-- Count total bot visits
SELECT COUNT(*) as total_visits FROM ai_bot_accesses;

-- Count by bot type
SELECT bot_name, COUNT(*) as visits
FROM ai_bot_accesses
GROUP BY bot_name
ORDER BY visits DESC;

-- Check date range
SELECT 
  MIN(accessed_at) as earliest_visit,
  MAX(accessed_at) as latest_visit
FROM ai_bot_accesses;
```

### Identify Seed vs Real Data:

Seed data was inserted on **November 3, 2025** with:
- Random timestamps spanning 90 days back
- Specific IP ranges: `35.185.*`, `35.247.*`, `34.98.*`, `66.249.*`, `104.198.*`

Real data will have:
- Timestamps starting November 3, 2025 (when middleware deployed)
- Actual bot IP addresses
- `response_time_ms` populated (seed data has this)

---

## Recommended Approach

**For immediate demos:** Keep seed data + track real going forward (Option 5)

**For authentic analytics:** Parse Vercel logs if within retention period (Option 1)

**For long-term:** Real tracking from November 3 onward is most valuable. Historical seed data provides visual context but won't affect analysis of actual bot behavior trends.

---

## Questions?

- Seed data is clearly marked with creation date in migration file
- Real data starts accumulating automatically via middleware
- You can mix both or clear seed data anytime
- Dashboard works identically with seed or real data

