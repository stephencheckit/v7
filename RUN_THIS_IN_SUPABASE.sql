-- ============================================================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- ============================================================================
-- This consolidates all new migrations for easy copy/paste
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================================

-- ============================================================================
-- STEP 1: Create Master Ingredients Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS master_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Ingredient identification
  name VARCHAR(255) NOT NULL UNIQUE,
  canonical_name VARCHAR(255) NOT NULL,
  aliases TEXT[] DEFAULT '{}',
  
  -- Classification
  category VARCHAR(100) NOT NULL,
  
  -- Storage and shelf life
  storage_method VARCHAR(50) NOT NULL,
  shelf_life_refrigerated INTEGER,
  shelf_life_frozen INTEGER,
  shelf_life_pantry INTEGER,
  
  -- Temperature requirements
  optimal_temp_min DECIMAL(5,2),
  optimal_temp_max DECIMAL(5,2),
  
  -- Safety information
  allergen_type VARCHAR(100),
  safety_notes TEXT,
  
  -- Source & verification
  data_source VARCHAR(100) DEFAULT 'USDA FoodKeeper',
  verified BOOLEAN DEFAULT FALSE,
  
  -- Usage tracking
  match_count INTEGER DEFAULT 0,
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_master_ingredients_name ON master_ingredients(name);
CREATE INDEX IF NOT EXISTS idx_master_ingredients_canonical_name ON master_ingredients(canonical_name);
CREATE INDEX IF NOT EXISTS idx_master_ingredients_category ON master_ingredients(category);
CREATE INDEX IF NOT EXISTS idx_master_ingredients_aliases ON master_ingredients USING GIN (aliases);
CREATE INDEX IF NOT EXISTS idx_master_ingredients_allergen_type ON master_ingredients(allergen_type);
CREATE INDEX IF NOT EXISTS idx_master_ingredients_match_count ON master_ingredients(match_count DESC);

-- Trigger
CREATE OR REPLACE FUNCTION update_master_ingredients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_master_ingredients_updated_at ON master_ingredients;
CREATE TRIGGER update_master_ingredients_updated_at 
  BEFORE UPDATE ON master_ingredients
  FOR EACH ROW EXECUTE FUNCTION update_master_ingredients_updated_at();

-- RLS
ALTER TABLE master_ingredients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Master ingredients are publicly readable" ON master_ingredients;
CREATE POLICY "Master ingredients are publicly readable"
  ON master_ingredients FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Only authenticated users can insert master ingredients" ON master_ingredients;
CREATE POLICY "Only authenticated users can insert master ingredients"
  ON master_ingredients FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Only authenticated users can update master ingredients" ON master_ingredients;
CREATE POLICY "Only authenticated users can update master ingredients"
  ON master_ingredients FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- STEP 2: Enhance food_items Table
-- ============================================================================

-- Add new columns
ALTER TABLE food_items 
  ADD COLUMN IF NOT EXISTS item_type VARCHAR(50) DEFAULT 'food_item' CHECK (item_type IN ('food_item', 'ingredient')),
  ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) DEFAULT 'menu_upload' CHECK (source_type IN ('menu_upload', 'manual', 'extracted', 'integration')),
  ADD COLUMN IF NOT EXISTS storage_method VARCHAR(50),
  ADD COLUMN IF NOT EXISTS print_history JSONB DEFAULT '[]'::jsonb;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_food_items_item_type ON food_items(item_type);
CREATE INDEX IF NOT EXISTS idx_food_items_source_type ON food_items(source_type);
CREATE INDEX IF NOT EXISTS idx_food_items_print_history ON food_items USING GIN (print_history);

-- Function to track print events
CREATE OR REPLACE FUNCTION track_print_event()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.print_count > OLD.print_count THEN
    NEW.print_history = OLD.print_history || jsonb_build_object(
      'timestamp', NOW(),
      'count', NEW.print_count
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS track_food_item_prints ON food_items;
CREATE TRIGGER track_food_item_prints
  BEFORE UPDATE ON food_items
  FOR EACH ROW
  WHEN (NEW.print_count IS DISTINCT FROM OLD.print_count)
  EXECUTE FUNCTION track_print_event();

-- View
CREATE OR REPLACE VIEW unified_food_library AS
SELECT 
  id, name, item_type, category, source_type, storage_method,
  shelf_life_days, ingredients, allergens, print_count, last_printed_at,
  print_history, metadata, is_active, created_at, updated_at, workspace_id
FROM food_items
WHERE is_active = TRUE
ORDER BY name ASC;

-- ============================================================================
-- STEP 3: Seed Sample Master Ingredients
-- ============================================================================

INSERT INTO master_ingredients (name, canonical_name, aliases, category, storage_method, shelf_life_refrigerated, shelf_life_frozen, shelf_life_pantry, optimal_temp_min, optimal_temp_max, allergen_type, safety_notes, data_source, verified) VALUES
('Chicken Breast', 'Chicken Breast', ARRAY['chicken', 'chicken breast', 'raw chicken', 'chicken breasts'], 'protein', 'refrigerated', 2, 270, 0, 0, 4, 'none', 'Cook to 165°F internal temperature', 'USDA FoodKeeper', TRUE),
('Ground Beef', 'Ground Beef', ARRAY['ground beef', 'beef', 'hamburger meat', 'minced beef'], 'protein', 'refrigerated', 2, 120, 0, 0, 4, 'none', 'Cook to 160°F internal temperature', 'USDA FoodKeeper', TRUE),
('Salmon', 'Salmon', ARRAY['salmon', 'salmon fillet', 'fresh salmon'], 'protein', 'refrigerated', 2, 90, 0, 0, 4, 'fish', 'Cook to 145°F internal temperature', 'USDA FoodKeeper', TRUE),
('Shrimp', 'Shrimp', ARRAY['shrimp', 'prawns', 'raw shrimp'], 'protein', 'refrigerated', 2, 180, 0, 0, 4, 'shellfish', 'Cook until opaque', 'USDA FoodKeeper', TRUE),
('Eggs', 'Eggs', ARRAY['egg', 'eggs', 'whole eggs', 'fresh eggs'], 'protein', 'refrigerated', 35, 0, 0, 0, 4, 'eggs', 'Store in original carton', 'USDA FoodKeeper', TRUE),
('Bacon', 'Bacon', ARRAY['bacon', 'bacon strips'], 'protein', 'refrigerated', 7, 30, 0, 0, 4, 'none', 'Cook thoroughly', 'USDA FoodKeeper', TRUE),
('Pork Chops', 'Pork Chops', ARRAY['pork chop', 'pork chops', 'pork'], 'protein', 'refrigerated', 3, 180, 0, 0, 4, 'none', 'Cook to 145°F', 'USDA FoodKeeper', TRUE),
('Milk', 'Milk', ARRAY['milk', 'whole milk', '2% milk', 'skim milk'], 'dairy', 'refrigerated', 7, 90, 0, 0, 4, 'dairy', 'Keep refrigerated at all times', 'USDA FoodKeeper', TRUE),
('Cheddar Cheese', 'Cheddar Cheese', ARRAY['cheese', 'cheddar', 'sharp cheddar'], 'dairy', 'refrigerated', 21, 180, 0, 0, 4, 'dairy', 'Wrap tightly', 'USDA FoodKeeper', TRUE),
('Butter', 'Butter', ARRAY['butter', 'unsalted butter', 'salted butter'], 'dairy', 'refrigerated', 90, 270, 0, 0, 4, 'dairy', 'Can freeze for longer storage', 'USDA FoodKeeper', TRUE),
('Yogurt', 'Yogurt', ARRAY['yogurt', 'greek yogurt'], 'dairy', 'refrigerated', 14, 60, 0, 0, 4, 'dairy', 'Check expiration date', 'USDA FoodKeeper', TRUE),
('Cream Cheese', 'Cream Cheese', ARRAY['cream cheese', 'philadelphia'], 'dairy', 'refrigerated', 14, 60, 0, 0, 4, 'dairy', 'Keep tightly sealed', 'USDA FoodKeeper', TRUE),
('Heavy Cream', 'Heavy Cream', ARRAY['cream', 'heavy cream', 'whipping cream'], 'dairy', 'refrigerated', 7, 120, 0, 0, 4, 'dairy', 'Shake before use', 'USDA FoodKeeper', TRUE),
('Lettuce', 'Lettuce', ARRAY['lettuce', 'romaine', 'iceberg lettuce', 'green leaf'], 'produce', 'refrigerated', 7, 0, 0, 0, 4, 'none', 'Wash before use', 'USDA FoodKeeper', TRUE),
('Tomatoes', 'Tomatoes', ARRAY['tomato', 'tomatoes', 'roma tomatoes', 'cherry tomatoes'], 'produce', 'room_temp', 7, 60, 7, NULL, NULL, 'none', 'Store at room temp until ripe', 'USDA FoodKeeper', TRUE),
('Onions', 'Onions', ARRAY['onion', 'yellow onion', 'white onion', 'red onion'], 'produce', 'room_temp', 30, 180, 60, NULL, NULL, 'none', 'Store in cool, dry place', 'USDA FoodKeeper', TRUE),
('Garlic', 'Garlic', ARRAY['garlic', 'garlic cloves', 'fresh garlic'], 'produce', 'room_temp', 90, 365, 120, NULL, NULL, 'none', 'Store in cool, dry place', 'USDA FoodKeeper', TRUE),
('Carrots', 'Carrots', ARRAY['carrot', 'carrots', 'baby carrots'], 'produce', 'refrigerated', 21, 180, 0, 0, 4, 'none', 'Keep refrigerated', 'USDA FoodKeeper', TRUE),
('Potatoes', 'Potatoes', ARRAY['potato', 'potatoes', 'russet potatoes', 'red potatoes'], 'produce', 'room_temp', 0, 180, 90, NULL, NULL, 'none', 'Store in cool, dark place', 'USDA FoodKeeper', TRUE),
('Bell Peppers', 'Bell Peppers', ARRAY['bell pepper', 'peppers', 'red pepper', 'green pepper'], 'produce', 'refrigerated', 7, 180, 0, 0, 4, 'none', 'Keep refrigerated', 'USDA FoodKeeper', TRUE),
('Mushrooms', 'Mushrooms', ARRAY['mushroom', 'mushrooms', 'button mushrooms'], 'produce', 'refrigerated', 7, 180, 0, 0, 4, 'none', 'Keep refrigerated', 'USDA FoodKeeper', TRUE),
('Spinach', 'Spinach', ARRAY['spinach', 'fresh spinach', 'baby spinach'], 'produce', 'refrigerated', 7, 180, 0, 0, 4, 'none', 'Wash before use', 'USDA FoodKeeper', TRUE),
('Broccoli', 'Broccoli', ARRAY['broccoli', 'broccoli florets'], 'produce', 'refrigerated', 7, 365, 0, 0, 4, 'none', 'Keep refrigerated', 'USDA FoodKeeper', TRUE),
('Flour', 'Flour', ARRAY['flour', 'all-purpose flour', 'wheat flour'], 'dry_goods', 'room_temp', 0, 0, 365, NULL, NULL, 'gluten', 'Store in airtight container', 'USDA FoodKeeper', TRUE),
('Sugar', 'Sugar', ARRAY['sugar', 'granulated sugar', 'white sugar'], 'dry_goods', 'room_temp', 0, 0, 730, NULL, NULL, 'none', 'Keeps indefinitely', 'USDA FoodKeeper', TRUE),
('Rice', 'Rice', ARRAY['rice', 'white rice', 'long grain rice'], 'dry_goods', 'room_temp', 0, 0, 730, NULL, NULL, 'none', 'Store in airtight container', 'USDA FoodKeeper', TRUE),
('Pasta', 'Pasta', ARRAY['pasta', 'spaghetti', 'penne', 'noodles'], 'dry_goods', 'room_temp', 0, 0, 730, NULL, NULL, 'gluten', 'Store in dry place', 'USDA FoodKeeper', TRUE),
('Olive Oil', 'Olive Oil', ARRAY['olive oil', 'extra virgin olive oil', 'oil'], 'condiments', 'room_temp', 0, 0, 365, NULL, NULL, 'none', 'Store in dark place', 'USDA FoodKeeper', TRUE),
('Salt', 'Salt', ARRAY['salt', 'table salt', 'sea salt'], 'dry_goods', 'room_temp', 0, 0, 3650, NULL, NULL, 'none', 'Keeps indefinitely', 'USDA FoodKeeper', TRUE),
('Black Pepper', 'Black Pepper', ARRAY['pepper', 'black pepper', 'ground pepper'], 'dry_goods', 'room_temp', 0, 0, 1095, NULL, NULL, 'none', 'Store in dark place', 'USDA FoodKeeper', TRUE),
('Ketchup', 'Ketchup', ARRAY['ketchup', 'catsup', 'tomato ketchup'], 'condiments', 'refrigerated', 180, 0, 365, NULL, NULL, 'none', 'Refrigerate after opening', 'USDA FoodKeeper', TRUE),
('Mayonnaise', 'Mayonnaise', ARRAY['mayo', 'mayonnaise'], 'condiments', 'refrigerated', 60, 0, 0, 0, 4, 'eggs', 'Keep refrigerated after opening', 'USDA FoodKeeper', TRUE),
('Mustard', 'Mustard', ARRAY['mustard', 'yellow mustard', 'dijon mustard'], 'condiments', 'refrigerated', 365, 0, 365, NULL, NULL, 'none', 'Refrigerate for best quality', 'USDA FoodKeeper', TRUE),
('Soy Sauce', 'Soy Sauce', ARRAY['soy sauce', 'shoyu'], 'condiments', 'room_temp', 730, 0, 730, NULL, NULL, 'soy', 'Store at room temperature', 'USDA FoodKeeper', TRUE)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SUCCESS! 
-- ============================================================================
-- ✅ Master ingredients table created
-- ✅ Food items table enhanced  
-- ✅ 34 sample ingredients seeded
-- 
-- Next step: Sync the full master library via API
-- Visit: https://your-app.vercel.app/api/master-ingredients/sync
-- ============================================================================

