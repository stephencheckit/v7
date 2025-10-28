# Vercel Deployment Configuration

## 🔐 Required Environment Variables

Before deploying to Vercel, you **MUST** add these environment variables to enable rate limiting and security features.

---

## 📋 Environment Variables to Add

### 1. Upstash Redis (Rate Limiting)

```env
UPSTASH_REDIS_REST_URL="https://genuine-snipe-23898.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AV1aAAIncDI0ZGM4OTJiZGVhNmQ0NDllYWZmNWM4ZmYyYTY2ZGYxMXAyMjM4OTg"
```

**Purpose:** Powers rate limiting to protect against spam and DoS attacks

---

## 🚀 How to Add to Vercel

### Option 1: Via Dashboard (Recommended)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project (v7)
3. Click **"Settings"** → **"Environment Variables"**
4. Add each variable:
   
   **First Variable:**
   - Key: `UPSTASH_REDIS_REST_URL`
   - Value: `https://genuine-snipe-23898.upstash.io`
   - Environments: ✅ Production ✅ Preview ✅ Development
   
   **Second Variable:**
   - Key: `UPSTASH_REDIS_REST_TOKEN`
   - Value: `AV1aAAIncDI0ZGM4OTJiZGVhNmQ0NDllYWZmNWM4ZmYyYTY2ZGYxMXAyMjM4OTg`
   - Environments: ✅ Production ✅ Preview ✅ Development

5. Click **"Save"** for each variable
6. **Redeploy** your application

### Option 2: Via CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Add environment variables
vercel env add UPSTASH_REDIS_REST_URL
# Paste: https://genuine-snipe-23898.upstash.io
# Select: Production, Preview, Development

vercel env add UPSTASH_REDIS_REST_TOKEN
# Paste: AV1aAAIncDI0ZGM4OTJiZGVhNmQ0NDllYWZmNWM4ZmYyYTY2ZGYxMXAyMjM4OTg
# Select: Production, Preview, Development

# Redeploy
vercel --prod
```

---

## ✅ Verify Deployment

After deploying with environment variables:

### 1. Check Production Logs

```bash
vercel logs --prod
```

**Look for:**
- ✅ NO warning: `⚠️  Rate limiting not configured`
- ✅ Successful Redis connections

### 2. Test Rate Limiting

```bash
# Test form submission rate limit (should fail on 11th)
for i in {1..11}; do
  curl -X POST https://your-domain.vercel.app/api/forms/YOUR_FORM_ID/submit \
    -H "Content-Type: application/json" \
    -d '{"data":{"test":"value"}}'
  echo " - Attempt $i"
done

# Expected:
# Attempts 1-10: Success ✅
# Attempt 11: Rate limit exceeded ❌
```

### 3. Check Response Headers

```bash
curl -I https://your-domain.vercel.app/api/forms/test/submit

# Should include:
# X-RateLimit-Limit: 10
# X-RateLimit-Remaining: 9
# X-RateLimit-Reset: 1698765432
```

---

## 🔒 Security Notes

### ✅ Already Secured

- `.env.local` is gitignored ✅
- Credentials never committed to repository ✅
- Vercel environment variables are encrypted ✅

### ⚠️ Important Reminders

1. **Never commit `.env.local` to Git**
   - Already protected by `.gitignore`
   - Double-check before pushing

2. **Rotate tokens if exposed**
   - If token is accidentally committed, regenerate in Upstash dashboard
   - Update Vercel environment variables

3. **Use different tokens for different environments** (Optional)
   - Production: Main Upstash database
   - Preview/Dev: Separate test database
   - Currently using same for all (fine for MVP)

---

## 📊 Upstash Usage Monitoring

### Free Tier Limits

- **Commands:** 10,000 per day
- **Storage:** 256 MB
- **Bandwidth:** 1 GB per month

### Monitor Usage

1. Go to [console.upstash.com](https://console.upstash.com)
2. Select database: `genuine-snipe-23898`
3. View **Analytics** tab:
   - Daily request count
   - Rate limit hits
   - Peak usage times

### Expected Usage

- **Normal traffic:** 2,000-5,000 commands/day
- **High traffic:** 8,000-10,000 commands/day
- **Over limit:** Consider Pro plan ($10/month)

---

## 🐛 Troubleshooting

### Rate Limiting Not Working in Production

**Check:**
1. Environment variables set correctly in Vercel
2. All three environments selected (Prod, Preview, Dev)
3. Application redeployed after adding variables
4. No typos in variable names

**Fix:**
```bash
# View current environment variables
vercel env ls

# Pull latest environment
vercel env pull .env.local

# Redeploy
vercel --prod
```

### 429 Errors Too Frequent

If legitimate users are getting rate limited:

**Option 1: Increase Limits (Temporary)**
```typescript
// In lib/rate-limit.ts
export const submitRateLimit = redis
  ? new Ratelimit({
      limiter: Ratelimit.slidingWindow(20, "1 h"), // Increased from 10
    })
  : null;
```

**Option 2: Add CAPTCHA (Recommended)**
- Implement in Phase 3
- See `SECURITY_IMPROVEMENTS_SUMMARY.md`

---

## 🎯 Post-Deployment Checklist

After deploying with rate limiting:

- [ ] Verify no rate limiting warnings in logs
- [ ] Test form submission (should work)
- [ ] Test rate limit (11th submission should fail)
- [ ] Monitor Upstash dashboard for traffic
- [ ] Set up Upstash alerts (optional)
- [ ] Test workspace authorization (can't edit other workspaces)

---

## 🚨 Emergency: Disable Rate Limiting

If rate limiting causes issues in production:

**Quick Fix (via Vercel Dashboard):**
1. Go to Settings → Environment Variables
2. **Delete** `UPSTASH_REDIS_REST_URL` variable
3. Redeploy

**This will:**
- ✅ Disable rate limiting immediately
- ⚠️ Revert to unprotected state
- ⚠️ Make site vulnerable to spam/DoS

**Better Fix:**
- Increase rate limits instead of disabling
- Add CAPTCHA for public forms
- Investigate root cause of rate limit hits

---

## 📞 Support

- **Upstash Docs:** [docs.upstash.com](https://docs.upstash.com/redis)
- **Vercel Docs:** [vercel.com/docs/environment-variables](https://vercel.com/docs/environment-variables)
- **Rate Limiting Guide:** See `RATE_LIMITING_SETUP.md`

---

**Status:** ✅ Local setup complete  
**Next Step:** Add variables to Vercel and deploy  
**Deploy Command:** `vercel --prod`

