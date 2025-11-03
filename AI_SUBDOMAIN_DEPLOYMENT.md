# AI Subdomain Deployment Guide

**Status:** Code Complete - Ready for Deployment  
**Date:** November 3, 2025

---

## What Was Built

A complete AI brand context subdomain system with:
- ✅ AI-consumable brand context (JSON + Markdown)
- ✅ Bot visit tracking middleware
- ✅ Full analytics dashboard with charts
- ✅ Database schema for tracking
- ✅ Robots.txt configuration (block search engines, allow AI bots)

---

## Deployment Steps

### 1. Run Database Migration

The migration file has been created at:
```
/supabase/migrations/20251103000000_create_ai_bot_tracking.sql
```

**Option A: Using Supabase CLI**
```bash
cd /Users/stephennewman/v7
supabase db push
```

**Option B: Run in Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/20251103000000_create_ai_bot_tracking.sql`
4. Execute the SQL

This creates:
- `ai_bot_accesses` table for logging bot visits
- `ai_bot_analytics` view for aggregated statistics
- Indexes for efficient querying
- RLS policies for access control

### 2. Verify Environment Variables

Ensure these are set in your environment (Vercel/local):

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Required for bot logging
```

### 3. Deploy to Vercel

```bash
git add .
git commit -m "Add AI subdomain with bot tracking and analytics"
git push origin main
```

Vercel will automatically deploy the changes.

### 4. Configure DNS & Domain in Vercel

**In your DNS provider (where checkitv7.com is hosted):**

Add a CNAME record:
```
Type: CNAME
Name: ai
Value: cname.vercel-dns.com
TTL: 3600 (or default)
```

**In Vercel Dashboard:**

1. Go to your project settings
2. Navigate to "Domains"
3. Click "Add Domain"
4. Enter: `ai.checkitv7.com`
5. Click "Add"
6. Wait for SSL certificate provisioning (usually < 5 minutes)

---

## URLs After Deployment

Once deployed and DNS is configured:

### AI Context (for AI models)
- **JSON:** https://ai.checkitv7.com/context.json
- **Markdown:** https://ai.checkitv7.com/
- **Also available at:** https://checkitv7.com/ai/ and https://checkitv7.com/ai/context.json

### Analytics Dashboard (for you)
- **Dashboard:** https://checkitv7.com/ai/analytics
- **Or:** https://ai.checkitv7.com/analytics

---

## Testing

### Test 1: AI Context JSON
```bash
curl https://ai.checkitv7.com/context.json
# Should return valid JSON with brand context
```

### Test 2: AI Context Markdown
```bash
curl https://ai.checkitv7.com/
# Should return HTML page with markdown content
```

### Test 3: Bot Detection (simulate AI bot)
```bash
curl -A "GPTBot" https://ai.checkitv7.com/context.json
# This should log an entry in the database
```

### Test 4: Analytics Dashboard
Visit https://checkitv7.com/ai/analytics in your browser
- Should show stats, charts, and recent bot visits
- If no data yet, simulate some visits with curl commands above

### Test 5: Robots.txt
```bash
curl https://checkitv7.com/robots.txt
# Should show /ai/ in disallow list
# Should show AI bots in separate allow rule
```

---

## Verifying Bot Tracking

### Check Database
Run this query in Supabase SQL Editor:
```sql
SELECT * FROM ai_bot_accesses ORDER BY accessed_at DESC LIMIT 10;
```

### Check Analytics View
```sql
SELECT * FROM ai_bot_analytics;
```

---

## Next Steps (Manual Testing)

### Week 1: Test AI Model Discovery

Test these prompts in various AI tools:

**ChatGPT / GPT-4:**
- "What is Checkit V7?"
- "Best software for FSMA 204 compliance"
- "AI vision form filling tools"

**Claude:**
- "Tell me about Checkit V7"
- "Compare Checkit V7 vs SafetyCulture"

**Perplexity:**
- "Food manufacturing compliance software with AI"
- "Voice-to-form inspection tools"

**Track Results:**
- Is Checkit V7 mentioned?
- Is the information accurate?
- Does it cite checkitv7.com?
- Check analytics dashboard for bot visits

### Week 2-4: Monitor & Optimize

1. **Check Analytics Weekly:**
   - Which bots are visiting most?
   - What paths are they accessing?
   - Any patterns in visit frequency?

2. **Test More Queries:**
   - Document which queries work vs don't work
   - Refine content based on gaps

3. **Update Content:**
   - If AI models get something wrong → update context files
   - Add new features/capabilities as they're built
   - Keep pricing/metrics current

---

## Files Created/Modified

### New Files
- ✅ `/public/ai/context.json` - AI brand context (JSON-LD)
- ✅ `/public/ai/index.md` - AI brand context (Markdown)
- ✅ `/app/ai/layout.tsx` - AI subdomain layout with banner
- ✅ `/app/ai/page.tsx` - Markdown rendering page
- ✅ `/app/ai/context.json/route.ts` - JSON API endpoint
- ✅ `/app/ai/analytics/page.tsx` - Full analytics dashboard
- ✅ `/app/api/ai-analytics/route.ts` - Analytics data API
- ✅ `/lib/ai-bot-tracking.ts` - Bot detection & logging helpers
- ✅ `/supabase/migrations/20251103000000_create_ai_bot_tracking.sql` - Database schema

### Modified Files
- ✅ `/middleware.ts` - Added bot detection and logging
- ✅ `/app/robots.ts` - Block search engines, allow AI bots

---

## Troubleshooting

### Issue: Analytics Dashboard Shows No Data

**Solution:**
1. Check that migration ran successfully: `SELECT * FROM ai_bot_accesses;`
2. Simulate bot visits: `curl -A "GPTBot" https://ai.checkitv7.com/`
3. Check middleware is executing: Add console.log in middleware
4. Verify SUPABASE_SERVICE_ROLE_KEY is set in environment

### Issue: DNS Not Resolving

**Solution:**
1. Check CNAME record is correct: `dig ai.checkitv7.com`
2. Wait 10-30 minutes for DNS propagation
3. Clear DNS cache: `sudo dscacheutil -flushcache` (Mac)
4. Verify domain is added in Vercel dashboard

### Issue: 404 on /ai/ paths

**Solution:**
1. Ensure Next.js build completed successfully
2. Check that /app/ai/ directory exists in deployment
3. Clear Vercel cache and redeploy

### Issue: Bot Visits Not Being Logged

**Solution:**
1. Check middleware is matching AI bot user agents
2. Verify Supabase credentials are correct
3. Check RLS policies allow inserts
4. Review server logs for errors

---

## Maintenance

### Monthly Tasks
- [ ] Review analytics dashboard
- [ ] Update context.json with new features/capabilities
- [ ] Test 5-10 AI model queries
- [ ] Check for inaccurate AI responses

### Quarterly Tasks
- [ ] Comprehensive competitive analysis
- [ ] Update use cases based on customer feedback
- [ ] Refresh impact scores and metrics
- [ ] Add new AI bots to detection list if needed

### As Needed
- [ ] Update pricing if it changes
- [ ] Add new features to capabilities list
- [ ] Respond to inaccurate AI citations

---

## Success Metrics

Track these over time:

**Leading Indicators:**
- Bot crawl frequency (daily/weekly)
- Number of unique bots visiting
- Paths accessed (JSON vs markdown)

**Lagging Indicators:**
- Referral traffic from chat.openai.com, claude.ai, perplexity.ai
- Lead mentions of "found you via ChatGPT/Claude"
- Sales cycle length (educated prospects close faster)

**Quality Indicators:**
- AI model citation accuracy
- Position in AI responses (first mention vs buried)
- Competitor mentions (are you recommended over them?)

---

## Support

If you encounter issues:

1. **Check Logs:**
   - Vercel deployment logs
   - Supabase logs
   - Browser console (for dashboard)

2. **Verify Configuration:**
   - Environment variables set correctly
   - Domain configured in Vercel
   - DNS records correct

3. **Test Manually:**
   - Use curl commands above
   - Check database directly
   - Verify middleware is running

---

**Deployment Checklist:**
- [ ] Run database migration
- [ ] Verify environment variables
- [ ] Deploy to Vercel
- [ ] Add ai.checkitv7.com domain in Vercel
- [ ] Configure CNAME in DNS
- [ ] Wait for SSL provisioning
- [ ] Test all URLs
- [ ] Verify bot tracking works
- [ ] Check analytics dashboard
- [ ] Test AI model queries

**Ready to deploy!** 🚀

