# Advanced AI Bot Analytics - What Else to Track

Beyond basic bot visits, here are the **key metrics** that will help you measure ROI and optimize your AI discoverability strategy.

---

## 📊 Currently Tracking (What You Have Now)

✅ Bot visit counts by type (GPTBot, Claude, etc.)  
✅ Visit timestamps and frequency  
✅ Paths accessed (/ai/, /ai/context.json)  
✅ IP addresses  
✅ Response times  
✅ Time series trends (7/30/90 days)  

**Dashboard:** https://checkitv7.com/ai/analytics

---

## 🎯 Critical Metrics You Should Add

### 1. **Citation Tracking** ⭐⭐⭐ (HIGHEST VALUE)

**What:** Track when AI models actually mention/cite your product in responses

**Why:** Bot visits ≠ citations. You need to know if ChatGPT/Claude are actually recommending you.

**How to Track:**

#### Manual Testing (Do Weekly)
```
ChatGPT Queries:
- "What's a good alternative to Jolt for food service?"
- "Best FSMA 204 compliance software?"
- "AI-powered inspection tools for restaurants"
- "Food service checklist software comparison"

Record:
✅ Was CheckIt V7 mentioned?
✅ Position (1st, 2nd, 3rd recommendation?)
✅ Accuracy of information
✅ Citation link provided?
```

#### Automated Citation Monitoring
**Tools:**
- **BrandMentions.io** - Monitors AI model responses ($99/mo)
- **Talkwalker** - Tracks brand mentions including AI sources
- **Custom script** - Query APIs daily, log mentions

**Metrics to Track:**
- Citation frequency (mentions per 100 queries)
- Citation position (1st vs 5th mentioned)
- Citation accuracy score (0-100)
- Competitor comparison (you vs. Jolt, SafetyCulture)

---

### 2. **Lead Attribution** ⭐⭐⭐ (ROI PROOF)

**What:** Track leads that discovered you via AI models

**Why:** Proves ROI of your AI subdomain investment

**How to Track:**

#### Add to Your Sign-Up Flow
```tsx
// In sign-up form, add optional field:
"How did you hear about us?"
- [ ] Google Search
- [ ] ChatGPT / AI Assistant ← NEW
- [ ] Referral
- [ ] LinkedIn/Social
- [ ] Other
```

#### UTM Tracking
If AI models link to your site, use UTM parameters:
```
https://checkitv7.com/?utm_source=chatgpt&utm_medium=ai&utm_campaign=organic
```

#### Demo Request Form Question
```
"Where did you first learn about CheckIt V7?"
(If they say "ChatGPT" or "Claude" → tag in CRM)
```

**Metrics to Track:**
- Leads from AI discovery (count per month)
- Conversion rate (AI leads vs other sources)
- Deal size (are AI leads higher quality?)
- Sales cycle (faster/slower than avg?)

---

### 3. **Content Performance Deep Dive** ⭐⭐

**What:** Track which content bots access most + dwell time

**Why:** Optimize what bots care about most

**Currently tracking:** Path accessed (/ai/ vs /ai/context.json)

**Add:**
- **Scroll depth** - How far down the page bots read
- **Time on page** - How long bots spend (vs. bounce)
- **Click tracking** - Which links bots follow
- **JSON field access** - Which fields in context.json are read most
- **Re-crawl frequency** - How often same bot returns

**Implementation:**
```typescript
// In middleware.ts, enhance tracking:
await logBotAccess({
  bot_name: botMatch.name,
  path: pathname,
  query_params: request.nextUrl.searchParams.toString(), // NEW
  section_accessed: extractSection(pathname), // NEW: e.g., "capabilities"
  visit_duration_estimate: responseTime, // Approximate
});
```

**New Metrics to Track:**
- Most accessed sections (capabilities vs use-cases vs pricing)
- Least accessed (indicates content gaps)
- Path sequences (do bots visit JSON after markdown?)
- Download events (if bots save files)

---

### 4. **Competitive Intelligence** ⭐⭐⭐

**What:** Track how often you're mentioned vs competitors

**Why:** Benchmark your AI visibility

**How to Track:**

#### Manual Competitive Testing
```
Weekly queries (rotate through AI models):

"Compare Jolt vs CheckIt V7 vs SafetyCulture"
"Best food service inspection software"
"FSMA compliance tools comparison"

Record:
- Who's mentioned first?
- How many competitors mentioned?
- What differentiators are highlighted?
- Pricing mentioned correctly?
```

#### Share of Voice
- **Your mentions:** 15 per week
- **Jolt mentions:** 45 per week
- **Share of voice:** 15 / (15+45) = 25%

**Target:** 40%+ share of voice in your category

---

### 5. **Query Intent Analysis** ⭐⭐

**What:** Understand WHY bots are crawling you

**Why:** Optimize content for actual user queries

**How to Track:**

You can't see the original queries, but you can infer:

#### Reverse Engineer from Access Patterns
```
If bot accesses:
- /ai/ → General product discovery
- /ai/context.json → Detailed feature comparison
- /ai/ multiple times → Deep research / comparison

If bot accesses pricing section:
→ User likely asked "how much does CheckIt V7 cost?"

If bot accesses FSMA section:
→ User likely asked about compliance tools
```

#### Correlate with Your Own ChatGPT Usage
Track what YOU search for about competitors:
- "Jolt pricing" → Do users search "CheckIt V7 pricing"?
- "SafetyCulture alternatives" → Are you positioned as alternative?

**Action:** Create content targeting high-intent queries

---

### 6. **Freshness & Re-Crawl Rate** ⭐⭐

**What:** How often bots re-visit to check for updates

**Why:** High re-crawl rate = high trust/importance

**Currently tracking:** accessed_at timestamps

**Add:**
- **Unique bot ID** (if possible from IP patterns)
- **Re-crawl interval** (days between visits)
- **Content version** (track when you update /ai/ content)

**Metrics:**
- Average re-crawl frequency: Every 7 days? 30 days?
- Which bots re-crawl most often?
- Do updates trigger immediate re-crawls?

**Best Practice:**
- Update /ai/ content monthly → Triggers re-crawls
- Add "Last Updated: [Date]" to /ai/ page
- Signal freshness to bots

---

### 7. **Error Rate & Quality Monitoring** ⭐

**What:** Track 404s, timeouts, malformed requests from bots

**Why:** Errors = poor indexing = lower visibility

**Add to tracking:**
```typescript
// Log errors separately
if (error) {
  await logBotError({
    bot_name: botMatch.name,
    path: pathname,
    error_type: '404' | 'timeout' | 'malformed',
    status_code: 404,
  });
}
```

**Metrics:**
- Error rate per bot (should be <1%)
- Most common error types
- Paths causing errors
- Response time outliers (>2 seconds = slow)

**Target:** 99%+ success rate for bot requests

---

### 8. **Geographic & Network Analysis** ⭐

**What:** Where are bots crawling from?

**Why:** Understand bot infrastructure, detect patterns

**Currently tracking:** IP addresses

**Add:**
- **Country/Region** (from IP lookup)
- **ASN** (Autonomous System Number)
- **Cloud provider** (AWS, GCP, Azure)
- **IP reputation** (is it really a bot?)

**Metrics:**
- Top countries (US, Europe, Asia?)
- Primary cloud providers (OpenAI uses AWS, Anthropic uses GCP)
- Suspicious IPs (potential scrapers masquerading as bots)

**Use Cases:**
- Geo-target content if certain regions crawl more
- Identify fake bot traffic
- Understand bot infrastructure costs

---

### 9. **User Feedback on AI Responses** ⭐⭐⭐

**What:** Ask users: "Did you find us via AI? Was it accurate?"

**Why:** Validate that AI models provide correct info

**How to Implement:**

#### Post-Demo Survey
```
After demo calls, ask:
1. "How did you first hear about CheckIt V7?"
2. If AI: "What did ChatGPT/Claude say about us?"
3. "Was the information accurate?"
4. "What were you originally searching for?"
```

#### In-App Survey (After Sign-Up)
```
"We noticed many users discover us via AI assistants.
Did you learn about CheckIt V7 from ChatGPT, Claude, or Perplexity?

[Yes] → "What did it tell you about us?" (open text)
[No] → "How did you find us?" (dropdown)
```

**Metrics:**
- % of users who found you via AI
- Accuracy rating (1-5 scale)
- Most common queries that led to you
- Misinformation rate (incorrect facts stated)

---

### 10. **Content Gap Analysis** ⭐⭐

**What:** Questions AI can't answer about you (indicates missing content)

**Why:** Fill gaps = better AI responses = more leads

**How to Find Gaps:**

#### Test Questions AI Can't Answer
```
Ask ChatGPT (without browsing):
1. "What integrations does CheckIt V7 support?"
   → If wrong/missing: Add to /ai/context.json

2. "Does CheckIt V7 work offline?"
   → If it says "I don't know": Add to capabilities

3. "CheckIt V7 pricing for enterprise?"
   → If incorrect: Update pricing section

4. "CheckIt V7 vs Jolt comparison?"
   → If missing: Add competitive comparison
```

#### Track "Unknown" Responses
When you test AI models, log:
- Questions they couldn't answer
- Incorrect information provided
- Outdated information (old pricing, deprecated features)

**Action Plan:**
Update /ai/ content monthly with:
- New features launched
- Updated pricing
- New integrations
- Case studies / results

---

## 📈 Advanced Tracking Implementation

### Phase 1: Manual Tracking (Start This Week)

**Spreadsheet Template:**

| Date | AI Model | Query | Mentioned? | Position | Accurate? | Competitor Mentioned | Notes |
|------|----------|-------|------------|----------|-----------|---------------------|-------|
| 11/3 | ChatGPT | "Best Jolt alternative" | Yes | 2nd | Yes | Jolt, SafetyCulture | Good description |
| 11/3 | Claude | "FSMA compliance tools" | No | N/A | N/A | ComplianceAI, Jolt | Not mentioned |
| 11/5 | Perplexity | "Food service software" | Yes | 1st | Yes | None | Great positioning! |

**Weekly Goals:**
- 10 test queries across 3 AI models (30 total/week)
- Track citation rate, position, accuracy
- Monitor competitor mentions

---

### Phase 2: Automated Tracking (Next Month)

**Tools to Build/Buy:**

#### 1. Citation Monitor Script
```typescript
// scripts/monitor-ai-citations.ts
// Query ChatGPT/Claude APIs daily with test queries
// Log if CheckIt V7 is mentioned
// Alert if citation rate drops <50%
```

#### 2. Enhanced Analytics Dashboard
Add new tabs to `/ai/analytics`:
- **Citations** - Track mention frequency over time
- **Competitors** - Compare mention rates
- **Attribution** - Leads from AI discovery
- **Content Performance** - Most accessed sections
- **Errors** - 404s, slow responses

#### 3. Lead Tracking Integration
```typescript
// When lead signs up:
if (leadSource === 'chatgpt' || leadSource === 'claude') {
  await trackAILead({
    lead_id: lead.id,
    ai_source: leadSource,
    query: lead.discovery_query, // How they searched
    accuracy_rating: lead.info_accuracy, // Was info correct?
  });
}
```

---

### Phase 3: Advanced Analytics (Quarter 2)

#### A/B Test Content Formats
- Version A: JSON-LD format
- Version B: Markdown prose
- Version C: FAQ format

**Track:** Which gets more citations?

#### Sentiment Analysis
- Are AI mentions positive, neutral, negative?
- Do they recommend you or just mention you?
- What concerns do they raise?

#### Predictive Analytics
- Forecast bot visit trends
- Predict when re-crawls will happen
- Estimate leads from AI discovery

---

## 🎯 Key Performance Indicators (KPIs)

### Primary KPIs (Track Weekly)
1. **Citation Rate:** % of queries where you're mentioned (Target: 60%+)
2. **Citation Position:** Average rank when mentioned (Target: Top 3)
3. **Lead Attribution:** Leads from AI per month (Target: 10% of total)
4. **Bot Visit Frequency:** Crawls per week (Target: 5+ across all bots)

### Secondary KPIs (Track Monthly)
5. **Share of Voice:** Your mentions vs competitors (Target: 30%+)
6. **Content Accuracy:** % of accurate AI responses (Target: 95%+)
7. **Re-Crawl Rate:** Days between bot visits (Target: <14 days)
8. **Conversion Rate:** AI leads → customers (Target: 20%+)

### Tertiary KPIs (Track Quarterly)
9. **ROI:** Revenue from AI leads vs investment (Target: 10x)
10. **Brand Awareness:** Searches for "CheckIt V7" increase (Target: +50%)
11. **Competitive Position:** Mentions vs Jolt/SafetyCulture (Target: #2)
12. **Content Coverage:** Questions AI can answer (Target: 90%+)

---

## 🛠️ Quick Wins You Can Implement Today

### 1. Create Citation Tracking Spreadsheet (10 minutes)
- Copy template above
- Test 5 queries in ChatGPT
- Log results

### 2. Add "How Did You Hear About Us?" to Forms (30 minutes)
- Update sign-up form
- Add "ChatGPT/AI Assistant" option
- Tag in CRM

### 3. Schedule Weekly AI Testing (5 minutes)
- Calendar reminder: Every Monday 10am
- Test 10 queries across ChatGPT, Claude, Perplexity
- Log results in spreadsheet

### 4. Create Competitive Query List (15 minutes)
```
Your target queries:
1. "Best Jolt alternative"
2. "FSMA 204 compliance software"
3. "AI-powered inspection tools"
4. "Food service checklist app"
5. "Vision-based form filling"
... (add 20 more)
```

---

## 📊 Example: What Success Looks Like

### Month 1 (Now)
- Bot visits: 5-10 per week
- Citations: 20% of queries
- AI-attributed leads: 0-1

### Month 3 (After optimization)
- Bot visits: 20-30 per week
- Citations: 60% of queries
- AI-attributed leads: 5-8 per month
- Position: Top 3 recommendations

### Month 6 (Mature strategy)
- Bot visits: 50+ per week
- Citations: 80% of queries
- AI-attributed leads: 15-20 per month
- Position: #1 or #2 recommendation
- ROI: 15x (attribution tracking proves value)

---

## 🚀 Next Steps

**This Week:**
1. Create citation tracking spreadsheet
2. Test 10 queries, log results
3. Add AI source to sign-up form

**This Month:**
1. Build basic citation monitor script
2. Track 100+ queries across models
3. Interview 3 leads about AI discovery

**This Quarter:**
1. Add Citations tab to analytics dashboard
2. Implement automated monitoring
3. Optimize content based on data
4. Publish case study on AI SEO ROI

---

## 💡 Pro Tip: The "Citation Audit"

**Do this monthly:**

1. **Query 20 target keywords** in ChatGPT/Claude
2. **Grade each response:**
   - ✅ CheckIt V7 mentioned accurately
   - ⚠️ Mentioned but wrong info
   - ❌ Not mentioned at all
   - 🏆 Top recommendation

3. **Calculate scores:**
   - Citation rate: 12/20 = 60%
   - Accuracy rate: 10/12 = 83%
   - Top position rate: 4/12 = 33%

4. **Identify gaps:**
   - 8 queries where not mentioned → Why?
   - 2 queries with wrong info → Fix in /ai/ content
   - 8 queries where not #1 → What do competitors have?

5. **Optimize & re-test** next month

---

Want me to help you set up any of these tracking systems?

