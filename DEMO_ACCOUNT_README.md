# Charlie Checkit Demo Account

## Demo Credentials

**Email:** `charlie@checkit.net`  
**Password:** `demo`

A demo account banner is now displayed on the signin page (`/signin`) showing these credentials.

---

## What's Included

### Charlie's Kitchen Workspace
- **Name:** Charlie's Kitchen
- **Plan:** Pro
- **Owner:** Charlie Checkit (charlie@checkit.net)

### Demo Data

#### 4 Temperature Sensors
1. **Walk-in Cooler #1** - Main Kitchen (Fridge, 1-4°C)
2. **Walk-in Cooler #2** - Prep Area (Fridge, 1-4°C)
3. **Freezer #1** - Back Storage (Freezer, -18 to -15°C)
4. **Freezer #2** - Main Kitchen (Freezer, -20 to -15°C)

#### 28 Sensor Readings
- 7 readings per sensor (last 30 minutes of data)
- Realistic temperature values within acceptable ranges
- All readings marked as "in range"

---

## How to Test

1. **Go to:** [http://localhost:3000/signin](http://localhost:3000/signin)
2. **See the demo banner** at the top of the signin form
3. **Enter credentials:**
   - Email: `charlie@checkit.net`
   - Password: `demo`
4. **Click "Sign In"**
5. **See loading overlay** (instant feedback)
6. **Redirected to dashboard** with Charlie's data

---

## What You'll See

### Dashboard
- **Sensors Tab:** 4 active sensors with recent readings
- **Real data:** Temperature charts and sensor status
- **Pro Plan Features:** Full access to all features

### Settings
- **Workspace Tab:** Shows "Charlie's Kitchen"
- **Workspace Info:** ID, plan (Pro), slug
- **Members:** Charlie Checkit (Owner)

### Other Pages
- **Forms:** Empty (ready for demo forms to be added)
- **Labeling:** Empty (ready for menu items to be added)

---

## Technical Details

### Database Setup
- User ID: `ccc11111-de00-4444-8888-aaaabbbbcccc`
- Workspace ID: `ddd22222-de00-4444-8888-bbbbbbbbbccc`
- Password: Hashed with bcrypt via Supabase's `crypt()` function
- Email Confirmed: Yes (no confirmation required)

### Migrations Applied
1. `create_demo_account_charlie_checkit_v5` - Created user, workspace, and membership
2. `add_workspace_isolation_to_all_tables` - Added workspace_id to all tables
3. Demo sensors and readings inserted via SQL

### Data Isolation
- All sensors belong to Charlie's workspace
- All readings are filtered by workspace_id
- RLS policies enforce data isolation
- Charlie cannot see other users' data

---

## Next Steps

### For Users
1. **Test the demo account** to see the app in action
2. **Share demo credentials** with stakeholders
3. **Use as a template** for onboarding new users

### For Developers
1. **Add more demo data:**
   - Sample forms
   - Sample food items
   - Sample menu uploads
2. **Create additional demo users** for testing multi-tenancy
3. **Populate AI conversation history** for Charlie

---

## Maintaining Demo Data

### Resetting Demo Account
If you need to reset Charlie's data:

```sql
-- Delete all sensor readings
DELETE FROM sensor_readings 
WHERE workspace_id = 'ddd22222-de00-4444-8888-bbbbbbbbbccc';

-- Delete all sensors
DELETE FROM sensors 
WHERE workspace_id = 'ddd22222-de00-4444-8888-bbbbbbbbbccc';

-- Then re-run the sensor creation queries
```

### Adding More Demo Data
```sql
-- Add demo forms
INSERT INTO simple_forms (workspace_id, title, description)
VALUES (
  'ddd22222-de00-4444-8888-bbbbbbbbbccc',
  'Daily Temperature Log',
  'Record temperatures for all refrigeration units'
);

-- Add demo food items
INSERT INTO food_items (workspace_id, name, category, storage_location)
VALUES 
  ('ddd22222-de00-4444-8888-bbbbbbbbbccc', 'Chicken Breast', 'Protein', 'Walk-in Cooler #1'),
  ('ddd22222-de00-4444-8888-bbbbbbbbbccc', 'Ice Cream', 'Dessert', 'Freezer #1');
```

---

## Security Notes

✅ **Safe for Demo:**
- Password is simple ("demo") - clearly a demo account
- Email domain (checkit.net) - obviously not a real user
- Banner on signin page - users know it's a demo
- Data is isolated - can't access real user data

⚠️ **Considerations:**
- Demo account has Pro plan features
- Demo data should be kept clean and realistic
- Consider rate limiting if demo account is public-facing
- Monitor for abuse if credentials are publicly shared

---

## UI Improvements

### Signin Page
- ✅ Demo account banner with credentials
- ✅ Full-page loading overlay during signin
- ✅ Instant visual feedback on button click
- ✅ Professional appearance with brand colors

### Future Enhancements
- [ ] "Quick Demo" button that auto-fills credentials
- [ ] Demo account badge on dashboard
- [ ] Reset demo data button (admin only)
- [ ] Demo tour/walkthrough on first login

---

**Created:** October 24, 2025  
**Last Updated:** October 24, 2025  
**Status:** ✅ Ready to use

