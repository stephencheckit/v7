# Automated AI Citation Monitoring - Setup Guide

Automatically test if AI models (ChatGPT, Claude) mention CheckIt V7 when users ask about food service software.

---

## 🎯 What This Does

**Automated Testing:**
- Sends 15-25 test queries to ChatGPT and Claude every week
- Tracks: Is CheckIt V7 mentioned? What position? Is info accurate?
- Stores results in database
- Calculates citation rate, average position, accuracy
- Alerts if citation rate drops below 50%

**Why It's Important:**
Bot visits ≠ citations. You need to know if AI models are actually recommending you.

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Run Database Migration

```bash
# Apply the migration (creates ai_citation_tests table)
npx supabase db push
```

Or manually run the SQL:
```sql
-- Run in Supabase SQL Editor
-- File: supabase/migrations/20251103120000_create_ai_citation_tests.sql
```

---

### Step 2: Test It Works (Quick Test)

```bash
# Set your OpenAI API key
export OPENAI_API_KEY="sk-your-key-here"

# Run quick test (5 queries, takes 1 minute)
npx tsx scripts/quick-citation-test.ts
```

**Expected Output:**
```
🚀 QUICK CITATION TEST

Testing 5 queries with ChatGPT...

1. "What's the best alternative to Jolt for food service?"
   ✅ CheckIt V7 MENTIONED
   📝 "CheckIt V7 is an AI-powered operations platform..."

2. "Software for FSMA 204 compliance?"
   ❌ Not mentioned

...

📊 RESULTS: 3/5 queries mentioned CheckIt V7
📈 Citation Rate: 60%
✅ EXCELLENT! Above 60% target
```

---

### Step 3: Run Full Automated Test

```bash
# Set API keys
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-ant-..."

# Run full test (15-25 queries, takes 5-10 minutes)
npx tsx scripts/automated-citation-monitor.ts
```

**What happens:**
1. Tests 15 queries with ChatGPT
2. Tests 10 queries with Claude
3. Saves results to `ai_citation_tests` table
4. Displays summary metrics
5. Alerts if citation rate is low

---

## 📊 View Results

### Option A: Query Database Directly

```sql
-- Recent citation tests
SELECT 
  tested_at,
  ai_model,
  query,
  mentioned,
  position,
  accurate
FROM ai_citation_tests
ORDER BY tested_at DESC
LIMIT 20;

-- Summary metrics
SELECT * FROM ai_citation_analytics
ORDER BY test_date DESC;
```

### Option B: Analytics Dashboard (Coming Soon)

Will add "Citations" tab to: `https://checkitv7.com/ai/analytics`

---

## ⏰ Schedule Automated Tests

### Option 1: Cron Job (Recommended)

```bash
# Edit crontab
crontab -e

# Add this line (runs every Monday at 9am)
0 9 * * 1 cd /path/to/v7 && export OPENAI_API_KEY="sk-..." && npx tsx scripts/automated-citation-monitor.ts >> /tmp/citation-monitor.log 2>&1
```

### Option 2: GitHub Actions (CI/CD)

```yaml
# .github/workflows/citation-monitor.yml
name: AI Citation Monitor

on:
  schedule:
    - cron: '0 9 * * 1' # Every Monday at 9am UTC
  workflow_dispatch: # Manual trigger

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install -g tsx
      - run: npx tsx scripts/automated-citation-monitor.ts
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

### Option 3: Vercel Cron (Serverless)

Create an API route and use Vercel Cron:

```typescript
// app/api/cron/citation-monitor/route.ts
import { NextRequest } from 'next/server';
import { runCitationMonitor } from '@/scripts/automated-citation-monitor';

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  await runCitationMonitor();
  return Response.json({ success: true });
}
```

Then in `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/citation-monitor",
    "schedule": "0 9 * * 1"
  }]
}
```

---

## 💰 Cost Estimate

### OpenAI GPT-4o
- ~$0.01 per query (input + output tokens)
- 15 queries/week = $0.15/week = **$7.80/year**

### Anthropic Claude
- ~$0.015 per query
- 10 queries/week = $0.15/week = **$7.80/year**

**Total: ~$15/year** for automated weekly monitoring

**ROI:** If this helps you track and improve your AI visibility, leading to even 1 extra lead/month, it pays for itself 100x over.

---

## 📈 Interpreting Results

### Citation Rate
```
80%+ = EXCELLENT - AI models frequently recommend you
60-79% = GOOD - Solid visibility, keep monitoring
40-59% = FAIR - Room for improvement
<40% = POOR - Update /ai/ content immediately
```

### Average Position
```
1-2 = EXCELLENT - Top recommendation
3-4 = GOOD - Mentioned among top options
5+ = FAIR - Mentioned but not prominent
```

### Accuracy Rate
```
95%+ = EXCELLENT - Information is correct
85-94% = GOOD - Minor inaccuracies
<85% = POOR - Update /ai/ content to fix errors
```

---

## 🔧 Customization

### Add More Test Queries

Edit `scripts/automated-citation-monitor.ts`:

```typescript
const TARGET_QUERIES = [
  "Your custom query here",
  "Another industry-specific question",
  "Competitor comparison query",
  // ... add as many as you want
];
```

### Test Different AI Models

Add Perplexity, Google Gemini, etc.:

```typescript
// In automated-citation-monitor.ts
async function testWithPerplexity(query: string) {
  // Use Perplexity API
  // https://docs.perplexity.ai/reference/post_chat_completions
}
```

### Adjust Test Frequency

- **Weekly** (recommended): Good balance of cost vs. insight
- **Daily**: For active optimization periods (expensive)
- **Bi-weekly**: Save costs if visibility is stable
- **Monthly**: Minimum recommended frequency

---

## 🚨 Alerts & Notifications

### Email Alert on Low Citation Rate

```typescript
// Add to automated-citation-monitor.ts
if (citationRate < 50) {
  await sendEmail({
    to: 'your@email.com',
    subject: '⚠️ AI Citation Rate Below 50%!',
    body: `
      CheckIt V7 citation rate dropped to ${citationRate}%.
      
      Action required:
      1. Review /ai/ content
      2. Check for outdated information
      3. Add new features/use cases
      4. Re-test in 1 week
    `,
  });
}
```

### Slack Notification

```typescript
// Post to Slack webhook
await fetch(process.env.SLACK_WEBHOOK_URL, {
  method: 'POST',
  body: JSON.stringify({
    text: `📊 Weekly Citation Report: ${citationRate}% (${mentioned}/${total})`,
  }),
});
```

---

## 📝 Best Practices

### 1. Run Baseline Test First
Before any content changes, run a test to establish baseline metrics.

### 2. Test After Content Updates
Every time you update `/ai/` content, re-test within 1-2 weeks to see if bots re-crawled.

### 3. Track Trends Over Time
Don't obsess over single tests. Look for trends:
- Is citation rate improving month-over-month?
- Are you moving up in position?
- Is accuracy improving?

### 4. Compare to Competitors
Periodically check:
```
"Compare Jolt vs SafetyCulture vs CheckIt V7"
```
See how often you're mentioned vs them.

### 5. Rotate Test Queries
Update your query list quarterly to reflect:
- New features you've launched
- Emerging search terms
- Competitor positioning changes

---

## 🐛 Troubleshooting

### "OpenAI API key not configured"
```bash
export OPENAI_API_KEY="sk-proj-..."
# Or add to .env.local
```

### "Rate limit exceeded"
Increase delays between requests:
```typescript
await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds
```

### "Database connection failed"
Check Supabase env vars:
```bash
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

### Results seem inconsistent
AI responses vary. Run tests 2-3 times and average the results.

---

## 🎯 Next Steps

1. **Now:** Run quick test to see current citation rate
2. **This week:** Run full test, establish baseline
3. **Set up cron:** Schedule weekly automated tests
4. **Month 1:** Build Citations dashboard tab
5. **Quarter 1:** Track trends, optimize content, prove ROI

---

## 📚 Related Docs

- `AI_BOT_ADVANCED_METRICS.md` - All metrics explained
- `PUSH_TO_AI_BOTS.md` - How to get indexed faster
- `scripts/email-templates-for-ai-companies.md` - Outreach emails

---

**Questions?** This is cutting-edge stuff. You're ahead of 99% of companies by doing this. 🚀

