# ⚡ Quick Start: Rate Limiting Setup

**Time to Complete:** 5 minutes  
**Cost:** Free (Upstash free tier)  
**Impact:** Critical security protection

---

## 🚀 3-Step Setup

### Step 1: Create Upstash Account (2 minutes)

1. Go to **[upstash.com](https://upstash.com)**
2. Click **"Sign Up"** (use GitHub for fastest)
3. Click **"Create Database"**
4. Choose:
   - Name: `v7-ratelimit`
   - Type: **Global** (recommended) or Regional
   - Region: Choose closest to your Vercel deployment
5. Click **"Create"**

### Step 2: Get Your Credentials (1 minute)

1. In your new database dashboard, scroll to **"REST API"**
2. Copy these two values:
   ```
   UPSTASH_REDIS_REST_URL=https://your-endpoint.upstash.io
   UPSTASH_REDIS_REST_TOKEN=AX***************************
   ```

### Step 3: Add to Environment (2 minutes)

#### Local Development

Create/edit `.env.local`:

```bash
# Add these lines
UPSTASH_REDIS_REST_URL=https://your-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=AX***************************
```

Then restart your dev server:

```bash
npm run dev
```

#### Vercel Production

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project → **Settings** → **Environment Variables**
3. Add both variables:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Select all environments (Production, Preview, Development)
5. **Save** and **redeploy** your app

---

## ✅ Verify It's Working

### Check Console

In your terminal, you should **NOT** see this warning anymore:

```
⚠️  Rate limiting not configured. Set UPSTASH_REDIS_REST_URL to enable.
```

### Test Rate Limit

Try submitting a form 11 times in a row - the 11th should fail:

```bash
# Replace YOUR_FORM_ID with an actual form ID
for i in {1..11}; do
  curl -X POST http://localhost:3000/api/forms/YOUR_FORM_ID/submit \
    -H "Content-Type: application/json" \
    -d '{"data":{"test":"submission"}}'
  echo " - Attempt $i"
done

# Expected output:
# ✅ Attempts 1-10: {"success":true}
# ❌ Attempt 11: {"error":"Rate limit exceeded"}
```

### Check Response Headers

```bash
curl -I http://localhost:3000/api/forms/YOUR_FORM_ID/submit

# Look for these headers:
# X-RateLimit-Limit: 10
# X-RateLimit-Remaining: 9
# X-RateLimit-Reset: 1698765432
```

---

## 🎯 What You Get

✅ **10 form submissions per hour per IP** - Blocks spam bots  
✅ **100 API calls per minute per user** - Normal usage allowed  
✅ **Workspace authorization** - Users can't modify other workspaces' forms  
✅ **DoS protection** - Server won't be overwhelmed  
✅ **Cost control** - API usage capped automatically  

---

## 🆘 Troubleshooting

### Still seeing warning in console?

1. **Check environment variables are set:**
   ```bash
   echo $UPSTASH_REDIS_REST_URL
   ```
   
2. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C), then:
   npm run dev
   ```

3. **Check .env.local file exists:**
   ```bash
   cat .env.local | grep UPSTASH
   ```

### Rate limiting not working?

1. **Check Upstash database status:**
   - Go to Upstash dashboard
   - Database should show "Active" status

2. **Verify no typos in environment variables:**
   - URL should start with `https://`
   - Token should be long alphanumeric string

3. **Check for errors in terminal:**
   - Look for Redis connection errors
   - Check Upstash dashboard for API errors

---

## 📚 More Info

- **Full Documentation:** `RATE_LIMITING_SETUP.md`
- **Security Summary:** `SECURITY_IMPROVEMENTS_SUMMARY.md`
- **Upstash Docs:** [docs.upstash.com/redis](https://docs.upstash.com/redis)

---

## 🎉 Done!

Your forms are now protected from abuse. Next steps:

1. ✅ **Monitor Upstash dashboard** for usage
2. ⏭️ **Add security headers** (next priority)
3. ⏭️ **Implement CAPTCHA** for public forms

**Questions?** Check `RATE_LIMITING_SETUP.md`

