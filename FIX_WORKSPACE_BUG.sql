-- =====================================================
-- IMMEDIATE FIX: Backfill workspaces for existing users
-- =====================================================
-- 
-- PROBLEM: "Failed to create form" error when clicking "Build from Scratch"
-- CAUSE: Existing users don't have workspaces assigned
-- SOLUTION: Run this script in Supabase SQL Editor
--
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Copy and paste this entire script
-- 3. Click "Run"
-- 4. Refresh your app and try creating a form again
-- =====================================================

DO $$
DECLARE
  user_record RECORD;
  workspace_uuid UUID;
  workspace_name TEXT;
  workspace_slug TEXT;
  user_count INTEGER := 0;
BEGIN
  -- Loop through all users who don't have a workspace
  FOR user_record IN 
    SELECT u.id, u.email, u.raw_user_meta_data
    FROM auth.users u
    WHERE NOT EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.user_id = u.id
    )
  LOOP
    user_count := user_count + 1;
    
    -- Generate workspace name from email or metadata
    workspace_name := COALESCE(
      user_record.raw_user_meta_data->>'full_name',
      split_part(user_record.email, '@', 1)
    ) || '''s Workspace';
    
    -- Generate unique slug
    workspace_slug := lower(regexp_replace(
      split_part(user_record.email, '@', 1), 
      '[^a-z0-9]', 
      '-', 
      'g'
    )) || '-' || substring(user_record.id::text, 1, 8);
    
    -- Create workspace
    INSERT INTO workspaces (owner_id, name, slug)
    VALUES (user_record.id, workspace_name, workspace_slug)
    RETURNING id INTO workspace_uuid;
    
    -- Add user as owner in workspace_members
    INSERT INTO workspace_members (workspace_id, user_id, role, joined_at)
    VALUES (workspace_uuid, user_record.id, 'owner', NOW());
    
    RAISE NOTICE 'Created workspace for user: % (ID: %)', user_record.email, user_record.id;
  END LOOP;
  
  RAISE NOTICE 'Backfill complete. Created workspaces for % users.', user_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VERIFICATION: Check if your user has a workspace now
-- =====================================================
SELECT 
  u.email,
  w.name as workspace_name,
  wm.role
FROM auth.users u
JOIN workspace_members wm ON wm.user_id = u.id
JOIN workspaces w ON w.id = wm.workspace_id
ORDER BY u.created_at DESC;

