# Quick Start: Automated Bot Log Sync

## What You Have Now

✅ **17 AI bot visits detected** in your recent logs:
- ChatGPT-User: 11 visits
- Claude-User: 4 visits  
- GPTBot: 2 visits

They visited:
- `/ai` - 8 times
- `/ai/context.json` - 4 times
- `/` - 3 times
- `/robots.txt` - 2 times

**This proves your AI-optimized content strategy is working!** 🎉

---

## Step 1: Deploy the Automation (5 minutes)

```bash
cd /Users/stephennewman/v7

# Install dependencies (adds tsx for running scripts)
npm install

# Commit and deploy
git add .
git commit -m "Add automated bot log sync system"
git push
```

---

## Step 2: Configure Vercel Environment Variables (2 minutes)

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

### Required Variables:

| Variable | How to Get It | Description |
|----------|--------------|-------------|
| `VERCEL_TOKEN` | [Create token](https://vercel.com/account/tokens) | API access to fetch logs |
| `VERCEL_PROJECT_ID` | Dashboard → Settings → General | Your project ID (e.g., `prj_xxxxx`) |

### Optional Variables:

| Variable | Value | Purpose |
|----------|-------|---------|
| `VERCEL_TEAM_ID` | Your team ID | Only if using team account |
| `CRON_SECRET` | Random string | Secure the cron endpoint |

**Important:** Add to **all environments** (Production, Preview, Development)

---

## Step 3: Import Your Historical Bot Data (30 seconds)

You have bot traffic in your exported logs. Import it now:

```bash
cd /Users/stephennewman/v7

# Import the logs you already exported
npx tsx scripts/import-json-logs.ts ~/Downloads/"logs_result (1).json"
```

You should see:

```
📊 Found 1532 total log entries
🤖 Found 17 bot visits
✅ Import Complete!
   Imported: 17
```

---

## Step 4: Verify It's Working

### Check Your Dashboard

Visit: `https://checkitv7.com/ai/analytics`

You should now see:
- **17 bot visits** in the charts
- **ChatGPT-User, Claude-User, GPTBot** in the breakdown
- Visits to `/ai` and `/ai/context.json`

### Test the Automated Sync

```bash
# Trigger manually (or wait for daily cron at 6 AM UTC)
curl https://checkitv7.com/api/cron/sync-bot-logs
```

---

## How It Works Going Forward

### Automated Daily Sync

- **Runs**: Every day at 6:00 AM UTC
- **Fetches**: Last 24 hours of Vercel logs via API
- **Filters**: Only AI bot traffic (ChatGPT, Claude, etc.)
- **Imports**: New visits to database (skips duplicates)
- **Zero maintenance**: Just works automatically

### Monitor It

```bash
# Watch cron job logs
vercel logs --follow

# Or check Vercel Dashboard → Logs → Cron Logs
```

---

## What's Next?

### 1. Push Your Content to AI Bots

Your content is live, but bots need to discover it. See: `PUSH_TO_AI_BOTS.md`

Quick wins:
- Email OpenAI, Anthropic, Perplexity about your `/ai/` page
- Share on social media to get backlinks
- Submit to search engines

### 2. Monitor Citation Tests

The automated citation tests will start running soon. Check:

```bash
# Run a quick test now
npx tsx scripts/quick-citation-test.ts
```

### 3. Track Your Progress

Dashboard at `/ai/analytics` shows:
- **Bot Visits Over Time** - Is discovery growing?
- **Most Active Bots** - Which AI is interested?
- **Citation Rate** - Are you being mentioned?
- **Recent Tests** - Live results from AI queries

---

## Troubleshooting

### "No bot traffic showing"

1. **Did you import historical logs?**
   ```bash
   npx tsx scripts/import-json-logs.ts ~/Downloads/"logs_result (1).json"
   ```

2. **Check if sync is running:**
   - Vercel Dashboard → Logs → Filter for "sync-bot-logs"
   - Should see: "✅ Imported X new bot visits"

3. **Verify environment variables are set:**
   - `VERCEL_TOKEN` and `VERCEL_PROJECT_ID` must be in Vercel env vars

### "Import script failed"

```bash
# Make sure dependencies are installed
npm install

# Try again
npx tsx scripts/import-json-logs.ts ~/Downloads/"logs_result (1).json"
```

### "Cron job not running"

- Check Vercel plan (Hobby tier has cron limitations)
- Verify `vercel.json` was deployed
- Check Vercel Dashboard → Cron → Should see `/api/cron/sync-bot-logs`

---

## Files Created

- ✅ `/app/api/cron/sync-bot-logs/route.ts` - Automated sync endpoint
- ✅ `/scripts/import-json-logs.ts` - Import script for exported logs
- ✅ `/vercel.json` - Added cron job (daily at 6 AM UTC)
- ✅ `AUTOMATED_BOT_LOG_SYNC.md` - Full documentation
- ✅ `QUICK_START_BOT_SYNC.md` - This guide

---

## Summary

You now have:
1. ✅ **Real bot traffic detected** (17 visits from ChatGPT, Claude, GPTBot)
2. ✅ **Automated daily sync** (fetches & imports new bot visits)
3. ✅ **Historical import tool** (import logs you've already exported)
4. ✅ **Analytics dashboard** (visualize bot activity over time)

Next: **Deploy**, **configure env vars**, and **import your historical data**! 🚀

