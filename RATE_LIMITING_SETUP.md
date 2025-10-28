# Rate Limiting Setup Guide

## 🎯 Overview

Rate limiting has been implemented to protect your form endpoints from abuse, spam, and DoS attacks. This document explains how to set up and configure rate limiting.

---

## 📦 What's Been Implemented

### ✅ Protected Endpoints

1. **Form Submission** (`/api/forms/[id]/submit`)
   - **Limit:** 10 submissions per hour per IP address
   - **Protection:** Prevents spam submissions

2. **Form Creation** (`/api/forms`)
   - **Limit:** 100 requests per minute per user
   - **Protection:** Prevents bulk form creation abuse

3. **Form Updates** (`/api/forms/[id]` - PUT/PATCH)
   - **Limit:** 100 requests per minute per user
   - **Protection:** Prevents rapid modification attacks
   - **✅ SECURITY FIX:** Added workspace ownership verification

4. **Form Deletion** (`/api/forms/[id]` - DELETE)
   - **Limit:** 100 requests per minute per user
   - **Protection:** Prevents bulk deletion
   - **✅ SECURITY FIX:** Added workspace ownership verification

5. **Form Submissions Retrieval** (`/api/forms/[id]/submissions`)
   - **Limit:** 100 requests per minute per IP
   - **Protection:** Prevents data scraping

---

## 🔧 Setup Instructions

### 1. Sign Up for Upstash Redis (Free Tier)

Upstash provides serverless Redis with a generous free tier:

1. Go to [https://upstash.com](https://upstash.com)
2. Sign up with GitHub or email
3. Click **"Create Database"**
4. Choose:
   - **Type:** Global (for multi-region) or Regional (for single region)
   - **Name:** `v7-ratelimit` (or any name)
   - **Region:** Choose closest to your Vercel deployment
   - **TLS:** Enable (recommended)
5. Click **"Create"**

### 2. Get Your Credentials

After creating the database:

1. Go to your database dashboard
2. Scroll to **"REST API"** section
3. Copy the following values:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### 3. Add Environment Variables

#### Local Development (.env.local)

Create or update `.env.local`:

```env
# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

#### Vercel Production

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add both variables:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Select all environments (Production, Preview, Development)
5. Click **Save**
6. Redeploy your application

---

## 🧪 Testing Rate Limiting

### Test Form Submission Rate Limit (10/hour)

```bash
# Submit same form 11 times in a row
for i in {1..11}; do
  curl -X POST http://localhost:3000/api/forms/YOUR_FORM_ID/submit \
    -H "Content-Type: application/json" \
    -d '{"data":{"test":"value"}}'
  echo "Submission $i"
done

# Expected: First 10 succeed, 11th returns 429
```

### Test API Rate Limit (100/minute)

```bash
# Make 101 authenticated requests
for i in {1..101}; do
  curl -X GET http://localhost:3000/api/forms \
    -H "Cookie: your-session-cookie"
  echo "Request $i"
done

# Expected: First 100 succeed, 101st returns 429
```

### Check Rate Limit Headers

```bash
curl -I http://localhost:3000/api/forms/test/submit \
  -X POST \
  -H "Content-Type: application/json"

# Look for headers:
# X-RateLimit-Limit: 10
# X-RateLimit-Remaining: 9
# X-RateLimit-Reset: 1635724800
```

---

## 🔒 Security Improvements Included

### ✅ Workspace Authorization (CRITICAL FIX)

**Before:** Users could update/delete forms in ANY workspace  
**After:** Users can only modify forms in their own workspace

**Implementation:**
- All PUT/PATCH/DELETE requests now verify workspace ownership
- Returns `403 Forbidden` if user tries to modify another workspace's form
- Prevents data breaches and unauthorized modifications

### Rate Limit Strategy

| Endpoint Type | Limit | Identifier | Reasoning |
|--------------|-------|------------|-----------|
| Public Submissions | 10/hour | IP Address | Prevent spam bots |
| Authenticated API | 100/min | User ID | Allow normal usage, block abuse |
| Strict Operations | 5/hour | IP Address | High-risk operations |

---

## 🎛️ Configuration Options

### Adjust Rate Limits

Edit `/lib/rate-limit.ts`:

```typescript
// Increase submission limit to 20/hour
export const submitRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1 h"), // Changed from 10
      prefix: "ratelimit:submit",
    })
  : null;

// Decrease API limit to 50/min (more strict)
export const apiRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(50, "1 m"), // Changed from 100
      prefix: "ratelimit:api",
    })
  : null;
```

### Add Custom Rate Limits

```typescript
// Example: 3 AI vision requests per minute
export const aiVisionRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1 m"),
      prefix: "ratelimit:ai-vision",
    })
  : null;
```

---

## 🚨 Fallback Behavior

**If Upstash is not configured:**
- Rate limiting is **disabled** (dev mode)
- Console warning appears: `⚠️  Rate limiting not configured`
- Application continues to work normally
- **⚠️ NOT RECOMMENDED FOR PRODUCTION**

---

## 📊 Monitoring Rate Limits

### Upstash Dashboard

1. Go to your database dashboard
2. View **Analytics** tab
3. Monitor:
   - Request count
   - Rate limit hits
   - Peak usage times

### Application Logs

Rate limit events are logged:

```
⚠️  Rate limit exceeded: ip:123.45.67.89 (form submission)
✅ Rate limit check passed: user:abc123 (9 remaining)
```

---

## 🔄 Rate Limit Reset Times

- **Hourly limits:** Reset at the top of each hour
- **Per-minute limits:** Sliding window (60 seconds from first request)
- **Reset time:** Provided in `X-RateLimit-Reset` header (Unix timestamp)

---

## 💰 Upstash Pricing

**Free Tier:**
- 10,000 commands per day
- 256 MB storage
- Single region

**Pro Plan ($10/month):**
- 100,000 commands per day
- 1 GB storage
- Multi-region

**For most applications, the free tier is sufficient.**

---

## 🐛 Troubleshooting

### Rate Limiting Not Working

1. **Check environment variables:**
   ```bash
   echo $UPSTASH_REDIS_REST_URL
   echo $UPSTASH_REDIS_REST_TOKEN
   ```

2. **Check logs for warnings:**
   ```
   ⚠️  Rate limiting not configured. Set UPSTASH_REDIS_REST_URL to enable.
   ```

3. **Verify Upstash database is active:**
   - Go to Upstash dashboard
   - Check database status (should be "Active")

### 429 Errors in Development

If you're getting rate limited during development:

1. **Temporarily disable rate limiting:**
   ```typescript
   // In lib/rate-limit.ts, set redis to undefined
   const redis = undefined; // Forces dev mode
   ```

2. **Or increase limits:**
   ```typescript
   limiter: Ratelimit.slidingWindow(1000, "1 m") // Very high limit
   ```

### Rate Limits Too Strict/Loose

Adjust based on your usage patterns:
- **Too many false positives?** Increase limits
- **Still seeing spam?** Decrease limits or add CAPTCHA

---

## 📈 Next Steps

After rate limiting is working:

1. ✅ Monitor Upstash dashboard for usage patterns
2. ✅ Adjust limits based on real traffic
3. ⏭️ Implement security headers (Phase 2)
4. ⏭️ Add CAPTCHA for public forms (Phase 3)

---

## 📞 Support

- **Upstash Docs:** [https://docs.upstash.com/redis](https://docs.upstash.com/redis)
- **Rate Limit Library:** [https://github.com/upstash/ratelimit](https://github.com/upstash/ratelimit)

---

**Status:** ✅ Rate limiting implemented  
**Security Level:** 🔒 Significantly improved  
**Production Ready:** ⚠️ Yes, but requires Upstash configuration

