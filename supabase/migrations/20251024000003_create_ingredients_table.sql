-- Ingredients Table
-- For storing individual ingredients with their shelf life data

CREATE TABLE IF NOT EXISTS ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  food_item_id UUID REFERENCES food_items(id) ON DELETE CASCADE,
  
  -- Ingredient details
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100), -- dairy, produce, protein, dry goods, etc.
  
  -- Storage and shelf life
  storage_method VARCHAR(100), -- refrigerated, frozen, room_temp, etc.
  shelf_life_days INTEGER NOT NULL,
  optimal_temp_min DECIMAL(5,2), -- °C
  optimal_temp_max DECIMAL(5,2), -- °C
  
  -- Safety information
  allergen_type VARCHAR(100), -- dairy, gluten, nuts, etc.
  safety_notes TEXT,
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ingredients_workspace_id ON ingredients(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_food_item_id ON ingredients(food_item_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_name ON ingredients(name);
CREATE INDEX IF NOT EXISTS idx_ingredients_category ON ingredients(category);
CREATE INDEX IF NOT EXISTS idx_ingredients_allergen_type ON ingredients(allergen_type);
CREATE INDEX IF NOT EXISTS idx_ingredients_created_at ON ingredients(created_at DESC);

-- Trigger: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ingredients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_ingredients_updated_at ON ingredients;
CREATE TRIGGER update_ingredients_updated_at 
  BEFORE UPDATE ON ingredients
  FOR EACH ROW EXECUTE FUNCTION update_ingredients_updated_at();

-- Enable Row Level Security
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ingredients
DROP POLICY IF EXISTS "Users can view their workspace ingredients" ON ingredients;
CREATE POLICY "Users can view their workspace ingredients"
  ON ingredients FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create ingredients in their workspace" ON ingredients;
CREATE POLICY "Users can create ingredients in their workspace"
  ON ingredients FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their workspace ingredients" ON ingredients;
CREATE POLICY "Users can update their workspace ingredients"
  ON ingredients FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their workspace ingredients" ON ingredients;
CREATE POLICY "Users can delete their workspace ingredients"
  ON ingredients FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Comments
COMMENT ON TABLE ingredients IS 'Individual ingredients with shelf life and storage information';
COMMENT ON COLUMN ingredients.shelf_life_days IS 'Number of days this ingredient can be stored safely';
COMMENT ON COLUMN ingredients.storage_method IS 'How this ingredient should be stored (refrigerated, frozen, room_temp, etc.)';
COMMENT ON COLUMN ingredients.optimal_temp_min IS 'Minimum optimal storage temperature in Celsius';
COMMENT ON COLUMN ingredients.optimal_temp_max IS 'Maximum optimal storage temperature in Celsius';

