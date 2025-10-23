-- Food Items and Menu Uploads Tables
-- For AI-powered menu scanning and label printing

-- Table: menu_uploads
-- Stores uploaded menu images and metadata
CREATE TABLE IF NOT EXISTS menu_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Image data
  image_url TEXT NOT NULL,
  image_size INTEGER, -- bytes
  
  -- Analysis metadata
  analyzed_at TIMESTAMPTZ,
  analysis_duration INTEGER, -- seconds
  items_found INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: food_items
-- Stores individual food items extracted from menus
CREATE TABLE IF NOT EXISTS food_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_upload_id UUID REFERENCES menu_uploads(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Food item details
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  day VARCHAR(50), -- Monday, Tuesday, etc.
  meal VARCHAR(50), -- Breakfast, Lunch, Dinner
  
  -- Ingredients and allergens
  ingredients TEXT[] DEFAULT '{}',
  allergens TEXT[] DEFAULT '{}',
  
  -- Shelf life
  shelf_life_days INTEGER NOT NULL,
  
  -- Print tracking
  print_count INTEGER DEFAULT 0,
  last_printed_at TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_menu_uploads_workspace_id ON menu_uploads(workspace_id);
CREATE INDEX idx_menu_uploads_uploaded_by ON menu_uploads(uploaded_by);
CREATE INDEX idx_menu_uploads_created_at ON menu_uploads(created_at DESC);

CREATE INDEX idx_food_items_menu_upload_id ON food_items(menu_upload_id);
CREATE INDEX idx_food_items_workspace_id ON food_items(workspace_id);
CREATE INDEX idx_food_items_category ON food_items(category);
CREATE INDEX idx_food_items_created_at ON food_items(created_at DESC);
CREATE INDEX idx_food_items_name ON food_items(name);
CREATE INDEX idx_food_items_ingredients ON food_items USING GIN (ingredients);
CREATE INDEX idx_food_items_allergens ON food_items USING GIN (allergens);

-- Trigger: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_food_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_menu_uploads_updated_at 
  BEFORE UPDATE ON menu_uploads
  FOR EACH ROW EXECUTE FUNCTION update_food_items_updated_at();

CREATE TRIGGER update_food_items_updated_at 
  BEFORE UPDATE ON food_items
  FOR EACH ROW EXECUTE FUNCTION update_food_items_updated_at();

-- Enable Row Level Security
ALTER TABLE menu_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for menu_uploads
CREATE POLICY "Users can view their workspace menu uploads"
  ON menu_uploads FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create menu uploads in their workspace"
  ON menu_uploads FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their workspace menu uploads"
  ON menu_uploads FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their workspace menu uploads"
  ON menu_uploads FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for food_items
CREATE POLICY "Users can view their workspace food items"
  ON food_items FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create food items in their workspace"
  ON food_items FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their workspace food items"
  ON food_items FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their workspace food items"
  ON food_items FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Comments
COMMENT ON TABLE menu_uploads IS 'Stores uploaded menu images and AI analysis metadata';
COMMENT ON TABLE food_items IS 'Individual food items extracted from menus with ingredients, allergens, and shelf life';
COMMENT ON COLUMN food_items.shelf_life_days IS 'Number of days the food item can be stored safely';
COMMENT ON COLUMN food_items.print_count IS 'Number of times a label has been printed for this item';

