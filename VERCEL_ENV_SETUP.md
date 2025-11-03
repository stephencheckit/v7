# Vercel Environment Variables Setup

## Critical: Add These to Vercel

Go to your Vercel project settings → Environment Variables and add:

### Required for Bot Analytics & AI Content:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

**Where to find these values:**
- Go to your Supabase project dashboard
- Settings → API
- Copy the "Project URL" (for `NEXT_PUBLIC_SUPABASE_URL`)
- Copy the "service_role" key (for `SUPABASE_SERVICE_ROLE_KEY`)

### Optional for Automated Log Sync (currently not working):

```bash
VERCEL_TOKEN=your_vercel_api_token
VERCEL_PROJECT_ID=your_project_id
VERCEL_TEAM_ID=your_team_id (if using team)
CRON_SECRET=any_random_string_for_security
```

## After Adding Variables

1. Save the environment variables
2. Redeploy your project (or wait for next automatic deploy)
3. The Supabase errors will disappear

## Note on Automated Log Sync

The automated Vercel log sync (cron job) **cannot work** because Vercel doesn't provide a REST API for HTTP request logs. 

**Two options:**

1. **Manual Import (Recommended)**: Continue exporting logs from Vercel dashboard periodically and use the import script
2. **Log Drains (Advanced)**: Set up Vercel Log Drains to stream logs to a custom endpoint in real-time

See AUTOMATED_BOT_LOG_SYNC.md for the Log Drains approach if you want fully automated syncing.

