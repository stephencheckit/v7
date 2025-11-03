# Bot Log Sync: Manual vs Automated Options

## ❌ What Doesn't Work

**Vercel REST API for HTTP Logs**: Vercel does not provide a simple REST API endpoint to fetch HTTP request logs programmatically. The cron job approach we tried will not work.

---

## ✅ Option 1: Manual Import (Current, Working)

**Status**: ✅ **Currently Working & Recommended**

### How It Works
1. Export logs from Vercel dashboard periodically (weekly/monthly)
2. Run the import script to sync to database
3. View analytics on `/ai/analytics` dashboard

### Steps

```bash
# 1. Export logs from Vercel (via dashboard or CLI)
vercel logs <your-deployment-url> --output=json > logs.json

# 2. Import to database
npx tsx scripts/import-json-logs.ts logs.json

# 3. View analytics
# Go to https://checkitv7.com/ai/analytics
```

### Pros
- ✅ Simple, reliable
- ✅ No ongoing costs
- ✅ Full control over when you sync

### Cons
- ❌ Manual process (requires action every X days/weeks)
- ❌ Not real-time

---

## ✅ Option 2: Vercel Log Drains (Fully Automated)

**Status**: 🔧 **Not Yet Implemented (Future)**

### How It Works
Vercel can **push logs in real-time** to a custom endpoint you create. Every HTTP request would trigger a webhook to your API.

### Implementation Steps

1. **Create Log Drain Endpoint**: `/api/log-drain`
   - Receives JSON logs from Vercel
   - Filters for AI bots
   - Inserts directly to `ai_bot_accesses` table

2. **Configure Vercel Log Drain** (via CLI):
   ```bash
   vercel integration add log-drain \
     --url https://checkitv7.com/api/log-drain \
     --sources deployment,build,static,lambda
   ```

3. **Secure the endpoint** with a secret token

### Pros
- ✅ Fully automated, real-time
- ✅ No manual exports needed
- ✅ Always up-to-date analytics

### Cons
- ❌ More complex setup
- ❌ Higher database writes (every request = write)
- ❌ Need to implement `/api/log-drain` endpoint
- ❌ Vercel charges for log drains on Pro/Enterprise plans

---

## 📊 Recommendation

**For now, use Option 1 (Manual Import)**

You already have:
- ✅ Working import script
- ✅ 17 real bot visits imported
- ✅ Dashboard showing real data

**When to upgrade to Log Drains:**
- If you need real-time analytics
- If manual exports become too tedious (e.g., daily monitoring)
- If you're on a Vercel plan that includes log drains

---

## 🚀 Quick Import Workflow

```bash
# Every week or month:
vercel logs $(vercel ls | head -2 | tail -1) --output=json > logs_$(date +%Y%m%d).json
npx tsx scripts/import-json-logs.ts logs_$(date +%Y%m%d).json
```

This exports logs and imports them in one go.

---

## Files Reference

- **Manual Import Script**: `scripts/import-json-logs.ts`
- **Placeholder Cron (disabled)**: `app/api/cron/sync-bot-logs/route.ts`
- **Dashboard**: `app/ai/analytics/page.tsx`

