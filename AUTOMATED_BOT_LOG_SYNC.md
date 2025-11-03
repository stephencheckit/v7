# Automated Bot Log Sync

This document explains how to automatically sync AI bot traffic from Vercel logs to your database.

## Overview

We've implemented **two methods** for syncing bot traffic:

1. **Automated Daily Sync** (Vercel Cron) - Runs automatically every day
2. **Manual Import** (One-time) - Import historical logs you've already exported

---

## Method 1: Automated Daily Sync (Recommended)

### How It Works

- A Vercel Cron job runs **daily at 6:00 AM UTC**
- It fetches the last 24 hours of Vercel logs via API
- Filters for AI bot traffic (ChatGPT, Claude, etc.)
- Imports new visits to the database (skips duplicates)

### Setup Instructions

#### 1. Get Your Vercel API Token

```bash
# Generate a token at: https://vercel.com/account/tokens
# Or use Vercel CLI:
vercel token create
```

#### 2. Get Your Project ID

```bash
cd /Users/stephennewman/v7
vercel project ls
# Or check in: https://vercel.com/dashboard → Your Project → Settings → General
```

#### 3. Add Environment Variables to Vercel

Go to: `https://vercel.com/dashboard → Your Project → Settings → Environment Variables`

Add these:

| Variable | Value | Description |
|----------|-------|-------------|
| `VERCEL_TOKEN` | `your_token_here` | Vercel API token for fetching logs |
| `VERCEL_PROJECT_ID` | `prj_xxxxx` | Your project ID |
| `VERCEL_TEAM_ID` | `team_xxxxx` | (Optional) If using a team |
| `CRON_SECRET` | `random_string` | (Optional) Security for cron endpoint |

**Important:** Make sure to add these to **all environments** (Production, Preview, Development)

#### 4. Deploy

The cron job is already configured in `vercel.json`:

```json
{
  "path": "/api/cron/sync-bot-logs",
  "schedule": "0 6 * * *"  // Daily at 6 AM UTC
}
```

Just deploy and it will start running automatically:

```bash
git add .
git commit -m "Add automated bot log sync"
git push
```

#### 5. Test Manually

You can trigger the sync manually to test:

```bash
# Using curl (if CRON_SECRET is set):
curl -X GET https://checkitv7.com/api/cron/sync-bot-logs \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Or just visit in browser (if no secret):
https://checkitv7.com/api/cron/sync-bot-logs
```

### Monitoring

Check Vercel logs to see sync results:

```bash
vercel logs --follow
```

You'll see output like:

```
🔄 Starting bot log sync...
📥 Fetching Vercel logs from last 24 hours...
📊 Found 1532 total log entries
🤖 Found 17 bot visits
✅ Imported 17 new bot visits (0 duplicates skipped)
```

---

## Method 2: Manual Import (Historical Data)

Use this to import logs you've already exported from Vercel.

### Step 1: Export Logs from Vercel

#### Option A: Via Vercel Dashboard

1. Go to: `https://vercel.com/dashboard → Your Project → Logs`
2. Click "Export" (top right)
3. Select time range
4. Download JSON file

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Get recent logs (as JSON)
vercel logs --output json > ~/Downloads/logs_result.json

# Or for a specific deployment:
vercel logs https://your-deployment-url.vercel.app --output json > logs.json

# Or for a time range:
vercel logs --since "2025-11-01" --until "2025-11-03" --output json > logs.json
```

### Step 2: Import to Database

```bash
cd /Users/stephennewman/v7

# Import the logs
npx tsx scripts/import-json-logs.ts ~/Downloads/logs_result.json
```

You'll see output like:

```
📖 Reading JSON log file...
📊 Found 1532 total log entries
🤖 Found 17 bot visits

📈 Bot Breakdown:
   ChatGPT-User: 11 visits
   Claude-User: 4 visits
   GPTBot: 2 visits

📂 Path Breakdown:
   /ai: 8 visits
   /ai/context.json: 4 visits
   /: 3 visits
   /robots.txt: 2 visits

💾 Importing to database...
✅ Import Complete!
   Imported: 17
   Duplicates skipped: 0
   Errors: 0
```

### Step 3: Verify

Check your dashboard:

```
https://checkitv7.com/ai/analytics
```

You should now see the historical bot traffic!

---

## Troubleshooting

### "Missing Supabase credentials"

Make sure these are set in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
```

### "VERCEL_TOKEN not set"

The automated sync needs this to fetch logs. Add it to Vercel environment variables (see Setup Step 3 above).

### "No bot traffic found in logs"

This is normal if:
- Your `/ai/` pages were just deployed
- Bots haven't discovered your content yet
- The time range doesn't include bot visits

Try:
1. Wait a few days for bots to discover your content
2. Send the push emails (see `PUSH_TO_AI_BOTS.md`)
3. Check if bots are visiting but not being detected (update `BOT_PATTERNS` in the code)

### Cron Job Not Running

Check Vercel dashboard → Your Project → Logs → Cron Logs

Common issues:
- Environment variables not set
- Cron job not deployed (need to push `vercel.json` changes)
- Need to be on Pro plan for cron jobs (Hobby tier has limits)

---

## How It Detects Bots

The system looks for these user agents:

- `GPTBot` - OpenAI's training bot
- `ChatGPT-User` - When users ask ChatGPT questions
- `Claude-Bot` / `Claude-User` - Anthropic's bots
- `PerplexityBot` - Perplexity AI
- `Google-Extended` - Google's AI training
- `Bytespider` - ByteDance (TikTok) AI
- `Applebot-Extended` - Apple Intelligence
- `cohere-ai` - Cohere AI
- `YouBot` - You.com AI search

To add more bots, edit `BOT_PATTERNS` in:
- `/app/api/cron/sync-bot-logs/route.ts`
- `/scripts/import-json-logs.ts`

---

## Cost Considerations

### Vercel API Calls

- The cron job runs once per day
- Makes 1 API call to fetch logs
- This is well within free tier limits

### Database Storage

Each bot visit = ~500 bytes in database:
- 100 visits/day = ~50 KB/day = ~1.5 MB/month
- Negligible cost for Supabase free tier (500 MB included)

---

## Advanced Configuration

### Change Sync Frequency

Edit `vercel.json`:

```json
{
  "path": "/api/cron/sync-bot-logs",
  "schedule": "0 */6 * * *"  // Every 6 hours
}
```

Cron syntax:
- `0 6 * * *` = Daily at 6 AM UTC
- `0 */6 * * *` = Every 6 hours
- `0 0 * * 0` = Weekly on Sunday midnight

### Sync More/Less History

Edit `/app/api/cron/sync-bot-logs/route.ts`:

```typescript
// Change from 24 hours to 48 hours:
const logs = await fetchVercelLogs(48);
```

### Filter Specific Paths Only

Edit the sync function to filter paths:

```typescript
const botVisits = logs
  .filter(log => log.requestPath?.includes('/ai'))  // Only /ai paths
  .map(log => { ... })
```

---

## What's Next?

1. **Deploy** to activate automated sync
2. **Import historical logs** (one-time) using Method 2
3. **Monitor** your analytics dashboard at `/ai/analytics`
4. **Push to bots** using strategies in `PUSH_TO_AI_BOTS.md`

---

## Files Created/Modified

- ✅ `/app/api/cron/sync-bot-logs/route.ts` - Automated sync endpoint
- ✅ `/scripts/import-json-logs.ts` - Manual import script  
- ✅ `/vercel.json` - Added cron job configuration
- ✅ `AUTOMATED_BOT_LOG_SYNC.md` - This documentation

---

## Questions?

- Check Vercel logs: `vercel logs --follow`
- Check Supabase logs: Dashboard → Logs
- Check API response: `https://checkitv7.com/api/cron/sync-bot-logs`
- See bot patterns: `lib/ai-bot-tracking.ts`

