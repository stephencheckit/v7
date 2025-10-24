# 🚀 Database Migration Instructions

## Quick Start

Follow these steps to set up database persistence and the master ingredient library.

---

## Step 1: Run SQL Migrations in Supabase

### Option A: Via Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy & Paste SQL**
   - Open the file: `RUN_THIS_IN_SUPABASE.sql`
   - Copy ALL the contents
   - Paste into the SQL Editor
   - Click "Run" (or press Cmd+Enter)

4. **Verify Success**
   - You should see: "Success. No rows returned"
   - Check the Tables section to see `master_ingredients` table
   - Check `food_items` table has new columns

### Option B: Via Supabase CLI (If Linked)

```bash
# If you have Supabase CLI and project linked:
cd /Users/stephennewman/v7
supabase db push
```

---

## Step 2: Sync Master Ingredients

After migrations are applied, sync the master ingredient library:

### Option A: Via Script (Easiest)

```bash
# If running locally:
./sync-master-library.sh

# If running on production:
./sync-master-library.sh https://your-app.vercel.app
```

### Option B: Via Browser

Simply visit this URL in your browser:
```
https://your-app.vercel.app/api/master-ingredients/sync
```

Or for local development:
```
http://localhost:3000/api/master-ingredients/sync
```

### Option C: Via curl

```bash
curl -X POST https://your-app.vercel.app/api/master-ingredients/sync
```

---

## Step 3: Verify Setup

### Check Sync Status

```bash
curl https://your-app.vercel.app/api/master-ingredients/sync
```

**Expected Response:**
```json
{
  "success": true,
  "inDatabase": 60,
  "inCode": 60,
  "synced": true,
  "needsSync": false
}
```

### Test the Food Library

1. Open your app: `https://your-app.vercel.app/labeling`
2. Upload a menu or add an item manually
3. Refresh the page
4. Your items should still be there! ✅

---

## What Gets Created

### Tables:
- ✅ `master_ingredients` - Global ingredient library (~500 items)
- ✅ `food_items` (enhanced) - User's food library with new columns
- ✅ `unified_food_library` (view) - Convenient view of all items

### New Columns on `food_items`:
- `item_type` - 'food_item' or 'ingredient'
- `source_type` - 'menu_upload', 'manual', 'extracted', 'integration'
- `storage_method` - How to store the item
- `print_history` - JSONB array of all print events

### Sample Data:
- 34 common ingredients pre-loaded
- Full library (60+) synced via API

---

## Troubleshooting

### "Table already exists" Error
This is OK! It means the table was already created. The SQL uses `IF NOT EXISTS` to prevent errors.

### "Permission denied" Error
Check that:
1. You're logged into Supabase Dashboard
2. You have admin access to the project
3. RLS policies are set correctly

### Sync Endpoint Returns 500
Check that:
1. Migrations ran successfully
2. `master_ingredients` table exists
3. Your app is running
4. ANTHROPIC_API_KEY is set

### Items Not Persisting
1. Check browser console for errors
2. Verify user is authenticated
3. Check Network tab for API calls
4. Verify workspace exists

---

## Success Checklist

- [ ] SQL migrations ran without errors
- [ ] `master_ingredients` table visible in Supabase
- [ ] `food_items` table has new columns
- [ ] Sync endpoint returns `"synced": true`
- [ ] Upload a menu and items persist after refresh
- [ ] Extract ingredients and they save to database
- [ ] Add item manually and it persists

---

## Next Steps

Once everything is working:

1. **Expand Master Library**
   - Add more ingredients to `/lib/master-ingredients.ts`
   - Re-run sync endpoint

2. **Monitor Usage**
   - Check which ingredients are most matched
   - Promote frequently-used items to master library

3. **Analytics**
   - Query `print_history` for insights
   - Track most printed items
   - Monitor library growth

4. **Backup**
   - Supabase automatically backs up your data
   - Consider exporting library periodically

---

## Files Reference

- **`RUN_THIS_IN_SUPABASE.sql`** - Complete migration SQL
- **`sync-master-library.sh`** - Sync script
- **`DATABASE_PERSISTENCE_SETUP.md`** - Full documentation
- **`MASTER_INGREDIENT_LIBRARY.md`** - Library documentation

---

## Need Help?

Check the console logs:
- Frontend: Browser DevTools → Console
- Backend: Vercel Logs or local terminal
- Database: Supabase Dashboard → Logs

---

**Ready to go!** 🎉

Once migrations are run, everything will persist to the database automatically.

