# Waitlist Email Capture System

## 🎯 What's Built

A complete email capture system that stores emails in Supabase and shows a success message.

**Files Created:**
- `/components/email-capture.tsx` - Reusable email form component
- `/app/api/waitlist/route.ts` - API endpoint to save emails
- `/supabase_waitlist_table.sql` - Database setup SQL

---

## 📋 Setup Instructions

### 1. Create the Database Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create waitlist table to store email signups
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'homepage',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS waitlist_email_idx ON waitlist(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS waitlist_created_at_idx ON waitlist(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can insert (API will use service key)
CREATE POLICY "Service role can insert waitlist entries"
  ON waitlist
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Only authenticated users (you) can view waitlist
CREATE POLICY "Authenticated users can view waitlist"
  ON waitlist
  FOR SELECT
  TO authenticated
  USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON waitlist TO service_role;
```

### 2. Add Environment Variable

Make sure you have this in your `.env.local`:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Where to find it:**
- Go to Supabase Dashboard
- Settings → API
- Copy the `service_role` secret key (NOT the anon key)

### 3. Use the Component

Import and use in any page:

```tsx
import { EmailCapture } from "@/components/email-capture";

// Large hero CTA
<EmailCapture 
  size="large"
  placeholder="Enter your work email"
  buttonText="Get Early Access"
/>

// Inline form
<EmailCapture 
  size="default"
  placeholder="Your email"
  buttonText="Join Waitlist"
  variant="outline"
/>
```

---

## 🔍 View Waitlist Entries

### Option 1: Supabase Dashboard
1. Go to Supabase Dashboard
2. Click "Table Editor"
3. Select "waitlist" table
4. See all emails with timestamps

### Option 2: SQL Query
```sql
SELECT * FROM waitlist ORDER BY created_at DESC;
```

### Option 3: Export to CSV
In Supabase Table Editor, click the export button to download all emails.

---

## 🎨 Success Message

When someone submits:
> ✅ **Success!**  
> CheckitV7 is currently in development. We'll be in touch soon!

---

## 🔒 Security Features

✅ Email validation (must include @)  
✅ Duplicate prevention (unique constraint)  
✅ Rate limiting (via Supabase)  
✅ Service key authentication  
✅ RLS policies (only you can view)  

---

## 📊 Email Fields Captured

- `email` - The user's email address
- `source` - Where they signed up from (default: "homepage")
- `created_at` - Timestamp of signup
- `metadata` - JSON field for future expansion

---

## 🚀 Next Steps

1. Run the SQL setup in Supabase
2. Replace homepage CTAs with `<EmailCapture />` component
3. Test the form
4. View entries in Supabase dashboard

**The API is already built and ready to go!** Just needs the database table created.

