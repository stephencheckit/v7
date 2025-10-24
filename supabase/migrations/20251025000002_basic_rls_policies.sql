-- =====================================================
-- BASIC RLS POLICIES FOR WORKSPACE ISOLATION
-- Loose policies - all workspace members have full access
-- =====================================================

-- =====================================================
-- FOOD_ITEMS TABLE
-- =====================================================

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'food_items') THEN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their workspace food items" ON food_items;
    DROP POLICY IF EXISTS "Users can create food items in their workspace" ON food_items;
    DROP POLICY IF EXISTS "Users can update their workspace food items" ON food_items;
    DROP POLICY IF EXISTS "Users can delete their workspace food items" ON food_items;

    -- Create new comprehensive policy (loose - all members can do everything)
    EXECUTE 'CREATE POLICY "workspace_members_all_access_food_items"
      ON food_items FOR ALL
      USING (
        workspace_id IN (
          SELECT workspace_id FROM workspace_members
          WHERE user_id = auth.uid()
        )
      )
      WITH CHECK (
        workspace_id IN (
          SELECT workspace_id FROM workspace_members
          WHERE user_id = auth.uid()
        )
      )';
  END IF;
END $$;

-- =====================================================
-- MENU_UPLOADS TABLE
-- =====================================================

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'menu_uploads') THEN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their workspace menu uploads" ON menu_uploads;
    DROP POLICY IF EXISTS "Users can create menu uploads in their workspace" ON menu_uploads;
    DROP POLICY IF EXISTS "Users can update their workspace menu uploads" ON menu_uploads;
    DROP POLICY IF EXISTS "Users can delete their workspace menu uploads" ON menu_uploads;

    -- Create new comprehensive policy
    EXECUTE 'CREATE POLICY "workspace_members_all_access_menu_uploads"
      ON menu_uploads FOR ALL
      USING (
        workspace_id IN (
          SELECT workspace_id FROM workspace_members
          WHERE user_id = auth.uid()
        )
      )
      WITH CHECK (
        workspace_id IN (
          SELECT workspace_id FROM workspace_members
          WHERE user_id = auth.uid()
        )
      )';
  END IF;
END $$;

-- =====================================================
-- SENSORS TABLE
-- =====================================================

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sensors') THEN
    -- Enable RLS if not already enabled
    ALTER TABLE sensors ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "workspace_members_all_access_sensors" ON sensors;

    -- Create new comprehensive policy
    EXECUTE 'CREATE POLICY "workspace_members_all_access_sensors"
      ON sensors FOR ALL
      USING (
        workspace_id IN (
          SELECT workspace_id FROM workspace_members
          WHERE user_id = auth.uid()
        )
      )
      WITH CHECK (
        workspace_id IN (
          SELECT workspace_id FROM workspace_members
          WHERE user_id = auth.uid()
        )
      )';
  END IF;
END $$;

-- =====================================================
-- SENSOR_READINGS TABLE
-- =====================================================

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sensor_readings') THEN
    -- Enable RLS if not already enabled
    ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "workspace_members_select_sensor_readings" ON sensor_readings;
    DROP POLICY IF EXISTS "service_role_insert_sensor_readings" ON sensor_readings;
    DROP POLICY IF EXISTS "authenticated_users_insert_sensor_readings" ON sensor_readings;

    -- Workspace members can view readings from their workspace's sensors
    EXECUTE 'CREATE POLICY "workspace_members_select_sensor_readings"
      ON sensor_readings FOR SELECT
      USING (
        sensor_id IN (
          SELECT id FROM sensors
          WHERE workspace_id IN (
            SELECT workspace_id FROM workspace_members
            WHERE user_id = auth.uid()
          )
        )
      )';

    -- Allow API/service role to insert readings (bypasses RLS anyway, but explicit is good)
    EXECUTE 'CREATE POLICY "authenticated_users_insert_sensor_readings"
      ON sensor_readings FOR INSERT
      WITH CHECK (true)';
  END IF;
END $$;

-- =====================================================
-- SENSOR_ALERTS TABLE
-- =====================================================

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sensor_alerts') THEN
    -- Enable RLS if not already enabled
    ALTER TABLE sensor_alerts ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "workspace_members_all_access_sensor_alerts" ON sensor_alerts;

    -- Create comprehensive policy
    EXECUTE 'CREATE POLICY "workspace_members_all_access_sensor_alerts"
      ON sensor_alerts FOR ALL
      USING (
        workspace_id IN (
          SELECT workspace_id FROM workspace_members
          WHERE user_id = auth.uid()
        )
      )
      WITH CHECK (
        workspace_id IN (
          SELECT workspace_id FROM workspace_members
          WHERE user_id = auth.uid()
        )
      )';
  END IF;
END $$;

-- =====================================================
-- SENSOR_TASKS TABLE
-- =====================================================

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sensor_tasks') THEN
    -- Enable RLS if not already enabled
    ALTER TABLE sensor_tasks ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "workspace_members_all_access_sensor_tasks" ON sensor_tasks;

    -- Create comprehensive policy via sensor relationship
    EXECUTE 'CREATE POLICY "workspace_members_all_access_sensor_tasks"
      ON sensor_tasks FOR ALL
      USING (
        sensor_id IN (
          SELECT id FROM sensors
          WHERE workspace_id IN (
            SELECT workspace_id FROM workspace_members
            WHERE user_id = auth.uid()
          )
        )
      )
      WITH CHECK (
        sensor_id IN (
          SELECT id FROM sensors
          WHERE workspace_id IN (
            SELECT workspace_id FROM workspace_members
            WHERE user_id = auth.uid()
          )
        )
      )';
  END IF;
END $$;

-- =====================================================
-- SIMPLE_FORMS TABLE
-- =====================================================

-- Enable RLS if not already enabled
ALTER TABLE simple_forms ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all for simple_forms" ON simple_forms;
DROP POLICY IF EXISTS "workspace_members_all_access_simple_forms" ON simple_forms;

-- Create new comprehensive policy (only if workspace_id exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'simple_forms' AND column_name = 'workspace_id'
  ) THEN
    EXECUTE 'CREATE POLICY "workspace_members_all_access_simple_forms"
      ON simple_forms FOR ALL
      USING (
        workspace_id IN (
          SELECT workspace_id FROM workspace_members
          WHERE user_id = auth.uid()
        )
      )
      WITH CHECK (
        workspace_id IN (
          SELECT workspace_id FROM workspace_members
          WHERE user_id = auth.uid()
        )
      )';
  END IF;
END $$;

-- =====================================================
-- SIMPLE_FORM_SUBMISSIONS TABLE
-- =====================================================

-- Enable RLS if not already enabled
ALTER TABLE simple_form_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all for simple_form_submissions" ON simple_form_submissions;
DROP POLICY IF EXISTS "workspace_members_all_access_simple_form_submissions" ON simple_form_submissions;

-- Create new policy (only if workspace_id exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'simple_form_submissions' AND column_name = 'workspace_id'
  ) THEN
    EXECUTE 'CREATE POLICY "workspace_members_all_access_simple_form_submissions"
      ON simple_form_submissions FOR ALL
      USING (
        workspace_id IN (
          SELECT workspace_id FROM workspace_members
          WHERE user_id = auth.uid()
        )
      )
      WITH CHECK (
        workspace_id IN (
          SELECT workspace_id FROM workspace_members
          WHERE user_id = auth.uid()
        )
      )';
  END IF;
END $$;

-- =====================================================
-- AI_CONVERSATIONS TABLE (if exists)
-- =====================================================

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_conversations') THEN
    -- Enable RLS
    ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if they exist
    EXECUTE 'DROP POLICY IF EXISTS "workspace_members_all_access_ai_conversations" ON ai_conversations';
    
    -- Create new policy if workspace_id exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'ai_conversations' AND column_name = 'workspace_id'
    ) THEN
      EXECUTE 'CREATE POLICY "workspace_members_all_access_ai_conversations"
        ON ai_conversations FOR ALL
        USING (
          workspace_id IN (
            SELECT workspace_id FROM workspace_members
            WHERE user_id = auth.uid()
          )
        )
        WITH CHECK (
          workspace_id IN (
            SELECT workspace_id FROM workspace_members
            WHERE user_id = auth.uid()
          )
        )';
    END IF;
  END IF;
END $$;

-- =====================================================
-- INGREDIENTS TABLE
-- =====================================================

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ingredients') THEN
    -- Enable RLS if not already enabled
    ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "workspace_members_all_access_ingredients" ON ingredients;

    -- Ingredients are accessed via food_items, so policy is based on food item's workspace
    EXECUTE 'CREATE POLICY "workspace_members_all_access_ingredients"
      ON ingredients FOR ALL
      USING (
        food_item_id IN (
          SELECT id FROM food_items
          WHERE workspace_id IN (
            SELECT workspace_id FROM workspace_members
            WHERE user_id = auth.uid()
          )
        )
      )
      WITH CHECK (
        food_item_id IN (
          SELECT id FROM food_items
          WHERE workspace_id IN (
            SELECT workspace_id FROM workspace_members
            WHERE user_id = auth.uid()
          )
        )
      )';
  END IF;
END $$;

-- =====================================================
-- MASTER_INGREDIENTS (SHARED/GLOBAL DATA)
-- =====================================================

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'master_ingredients') THEN
    -- Enable RLS
    ALTER TABLE master_ingredients ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "all_authenticated_users_select_master_ingredients" ON master_ingredients;
    DROP POLICY IF EXISTS "admins_manage_master_ingredients" ON master_ingredients;
    DROP POLICY IF EXISTS "service_role_manage_master_ingredients" ON master_ingredients;

    -- Everyone can read master ingredients (global shared data)
    EXECUTE 'CREATE POLICY "all_authenticated_users_select_master_ingredients"
      ON master_ingredients FOR SELECT
      TO authenticated
      USING (true)';

    -- Only authenticated users with special permission can modify
    -- (For now, use service role for modifications)
    EXECUTE 'CREATE POLICY "service_role_manage_master_ingredients"
      ON master_ingredients FOR ALL
      USING (auth.jwt() ->> ''role'' = ''service_role'')
      WITH CHECK (auth.jwt() ->> ''role'' = ''service_role'')';
  END IF;
END $$;

-- =====================================================
-- COMMENTS
-- =====================================================

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'food_items') THEN
    EXECUTE 'COMMENT ON POLICY "workspace_members_all_access_food_items" ON food_items IS ''Loose RLS - all workspace members have full access to food items''';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sensors') THEN
    EXECUTE 'COMMENT ON POLICY "workspace_members_all_access_sensors" ON sensors IS ''Loose RLS - all workspace members have full access to sensors''';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'master_ingredients') THEN
    EXECUTE 'COMMENT ON POLICY "all_authenticated_users_select_master_ingredients" ON master_ingredients IS ''Global shared data - all authenticated users can read''';
  END IF;
END $$;

