# Quick Guide: Import Real Bot Traffic

Since Vercel CLI logs are tricky, here's the **fastest manual way** to check for and import real bot visits:

---

## Step 1: Check Vercel Dashboard for Bot Traffic

### Option A: Via Vercel Dashboard (Easiest)

1. **Go to Vercel Dashboard:**
   - https://vercel.com/checkit2025/v7

2. **Click "Deployments" tab**

3. **Select a recent deployment** (from the last few days)

4. **Click "Logs" tab**

5. **Search for bot activity:**
   - Use browser search (Ctrl+F / Cmd+F)
   - Search for: `GPTBot`, `Claude`, `Perplexity`, `bot`

6. **Look for requests to `/ai/` paths:**
   ```
   GET /ai/ → from GPTBot
   GET /ai/context.json → from Claude-Bot
   ```

7. **Copy any bot visit details you find:**
   - Bot name (from user agent)
   - Full path
   - Timestamp
   - IP address

---

## Step 2: Import Bot Visits

### Option A: Use the Interactive Tool (Recommended)

```bash
npx tsx scripts/manual-bot-import.ts
```

Then paste the details when prompted. It's interactive and easy!

### Option B: Direct SQL Insert

Go to Supabase dashboard → SQL Editor and run:

```sql
INSERT INTO ai_bot_accesses (bot_name, user_agent, path, ip_address, accessed_at)
VALUES
  ('GPTBot', 'Mozilla/5.0 (compatible; GPTBot/1.0)', '/ai/context.json', '66.249.66.1', '2025-11-03 14:23:00'),
  ('Claude-Bot', 'Mozilla/5.0 (compatible; ClaudeBot/1.0)', '/ai/', '52.34.12.45', '2025-11-03 15:45:00');
```

Replace with your actual values!

---

## Step 3: Verify Import

Check your dashboard: https://checkitv7.com/ai/analytics

Or run this SQL query:

```sql
SELECT 
  bot_name,
  path,
  accessed_at,
  ip_address
FROM ai_bot_accesses
WHERE accessed_at >= '2025-11-03 11:00:00'
ORDER BY accessed_at DESC;
```

---

## What If I Don't Find Any Bot Traffic?

**That's normal!** The AI subdomain just launched. Here's what to do:

### Option 1: Keep Seed Data (Recommended)
- Current seed data looks realistic for demos
- Real bot tracking starts automatically now
- Check back in 1-2 weeks for actual visits

### Option 2: Promote Your AI Subdomain
Test it yourself to generate traffic:

1. **Ask ChatGPT:**
   ```
   What can you tell me about CheckIt V7 form builder?
   Browse: https://checkitv7.com/ai/
   ```

2. **Ask Claude:**
   ```
   Can you look up information about CheckIt V7?
   Visit: https://checkitv7.com/ai/context.json
   ```

3. **Ask Perplexity:**
   ```
   Tell me about CheckIt V7 food service software
   ```

When you do this, the bots **should** visit your site and get tracked!

---

## Current Status

I just checked your database:

✅ **Seed Data Loaded:**
- 114 GPTBot visits (spanning 90 days)
- 76 Claude-Bot visits
- 76 PerplexityBot visits
- 522 total bot visits (realistic demo data)

🕐 **Real Tracking Active Since:** Nov 3, 2025 11:00 AM

📊 **Dashboard Ready:** https://checkitv7.com/ai/analytics
- Works with both Real Data and Demo tabs
- Historical charts look populated
- Perfect for demos right now

---

## My Recommendation

**Keep the current setup:**

1. ✅ Seed data provides historical context
2. ✅ Dashboard looks mature for demos
3. ✅ Real bot tracking runs automatically
4. ✅ Check back in 1 week for actual bot visits

**When to import manually:**
- You find real bot visits in Vercel logs
- You test with ChatGPT/Claude and want to record it
- You want to supplement with verified real data

---

## Questions?

- Seed data = Realistic synthetic visits (Aug-Nov 2025)
- Real data = Actual bot visits (Nov 3 onwards)
- Both work identically in the dashboard
- You can keep both or clear seed data anytime

Run this to clear seed data if needed:
```sql
DELETE FROM ai_bot_accesses WHERE accessed_at < '2025-11-03 11:00:00';
```

