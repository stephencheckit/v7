# Add These Environment Variables to Vercel

## Quick Steps

1. Go to: https://vercel.com/stephennewmans-projects (or your Vercel dashboard)
2. Select your CheckIt V7 project
3. Click **Settings** → **Environment Variables**
4. Add these **two** variables:

---

### Variable 1: NEXT_PUBLIC_SUPABASE_URL

**Name:**
```
NEXT_PUBLIC_SUPABASE_URL
```

**Value:**
```
https://xsncgdnctnbzvokmxlex.supabase.co
```

**Environments:** ✅ Production, ✅ Preview, ✅ Development

---

### Variable 2: SUPABASE_SERVICE_ROLE_KEY

**Name:**
```
SUPABASE_SERVICE_ROLE_KEY
```

**Value:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzbmNnZG5jdG5ienZva214bGV4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDYzMjQ2NCwiZXhwIjoyMDc2MjA4NDY0fQ.1nstS0qZoUPk-2-Ih_DHrEPIQoPF13tcAg2yN0-h-EQ
```

**Environments:** ✅ Production, ✅ Preview, ✅ Development

---

## After Adding

1. Click **Save** on each variable
2. **Redeploy** your project (or wait for the next automatic deploy from Git)
3. The errors should disappear:
   - ✅ No more "Invalid API key" errors
   - ✅ `/ai/analytics` will show real data
   - ✅ AI content editor will work
   - ✅ Citation analytics will load

---

## Verify It's Working

After redeployment, check your Vercel logs. You should see:
- ✅ No "Invalid API key" errors
- ✅ "Successfully fetched X bot accesses" messages

And visit: https://checkitv7.com/ai/analytics to see your bot traffic!

