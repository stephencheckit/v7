-- =====================================================
-- WORKSPACES & WORKSPACE MEMBERS TABLES
-- Multi-tenant organization structure with auto-creation
-- =====================================================

-- 1. Workspaces Table
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  plan VARCHAR(50) DEFAULT 'free', -- free, pro, enterprise
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT slug_format CHECK (slug ~* '^[a-z0-9-]+$')
);

-- 2. Workspace Members Table
CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'owner', -- owner, admin, editor, viewer
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(workspace_id, user_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_workspaces_owner_id ON workspaces(owner_id);
CREATE INDEX idx_workspaces_slug ON workspaces(slug);
CREATE INDEX idx_workspaces_created_at ON workspaces(created_at DESC);

CREATE INDEX idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user_id ON workspace_members(user_id);

-- =====================================================
-- ENABLE RLS
-- =====================================================

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES (LOOSE - all members can do everything)
-- =====================================================

-- Workspaces: Users can view workspaces they're members of
CREATE POLICY "workspace_members_select_workspaces"
  ON workspaces FOR SELECT
  USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Workspaces: Users can create their own workspaces
CREATE POLICY "users_insert_workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Workspaces: All workspace members can update (loose)
CREATE POLICY "workspace_members_update_workspaces"
  ON workspaces FOR UPDATE
  USING (
    id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Workspaces: Only owners can delete
CREATE POLICY "owners_delete_workspaces"
  ON workspaces FOR DELETE
  USING (owner_id = auth.uid());

-- Workspace Members: Can view members in their workspaces
CREATE POLICY "workspace_members_select_members"
  ON workspace_members FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Workspace Members: All members can add members (loose)
CREATE POLICY "workspace_members_insert_members"
  ON workspace_members FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Workspace Members: All members can update members (loose)
CREATE POLICY "workspace_members_update_members"
  ON workspace_members FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Workspace Members: Can remove yourself or any member (loose)
CREATE POLICY "workspace_members_delete_members"
  ON workspace_members FOR DELETE
  USING (
    user_id = auth.uid() OR
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- TRIGGER: Auto-create workspace on user signup
-- =====================================================

CREATE OR REPLACE FUNCTION create_default_workspace()
RETURNS TRIGGER AS $$
DECLARE
  workspace_uuid UUID;
  user_email TEXT;
  workspace_name TEXT;
  workspace_slug TEXT;
BEGIN
  -- Get user email
  user_email := NEW.email;
  
  -- Generate workspace name from email or metadata
  workspace_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(user_email, '@', 1)
  ) || '''s Workspace';
  
  -- Generate unique slug
  workspace_slug := lower(regexp_replace(
    split_part(user_email, '@', 1), 
    '[^a-z0-9]', 
    '-', 
    'g'
  )) || '-' || substring(NEW.id::text, 1, 8);
  
  -- Create workspace
  INSERT INTO workspaces (owner_id, name, slug)
  VALUES (NEW.id, workspace_name, workspace_slug)
  RETURNING id INTO workspace_uuid;
  
  -- Add user as owner in workspace_members
  INSERT INTO workspace_members (workspace_id, user_id, role, joined_at)
  VALUES (workspace_uuid, NEW.id, 'owner', NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_workspace();

-- =====================================================
-- TRIGGER: Auto-update updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_workspaces_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workspaces_updated_at_trigger
  BEFORE UPDATE ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION update_workspaces_updated_at();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE workspaces IS 'Organizations/companies - primary tenant boundary';
COMMENT ON TABLE workspace_members IS 'Users belonging to workspaces with role-based access (currently loose - all members have full access)';
COMMENT ON COLUMN workspaces.slug IS 'URL-friendly unique identifier for the workspace';
COMMENT ON COLUMN workspace_members.role IS 'User role: owner, admin, editor, viewer (currently all treated equally)';

