-- Master Ingredients Library Table
-- Stores authoritative ingredient data (USDA-based) for ~500 common ingredients

CREATE TABLE IF NOT EXISTS master_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Ingredient identification
  name VARCHAR(255) NOT NULL UNIQUE,
  canonical_name VARCHAR(255) NOT NULL, -- Standard name for deduplication
  aliases TEXT[] DEFAULT '{}', -- Alternative names (e.g., ["tomato", "tomatoes", "roma tomato"])
  
  -- Classification
  category VARCHAR(100) NOT NULL, -- protein, dairy, produce, dry_goods, condiments, etc.
  
  -- Storage and shelf life
  storage_method VARCHAR(50) NOT NULL, -- refrigerated, frozen, room_temp
  shelf_life_refrigerated INTEGER, -- days
  shelf_life_frozen INTEGER, -- days
  shelf_life_pantry INTEGER, -- days
  
  -- Temperature requirements
  optimal_temp_min DECIMAL(5,2), -- °C
  optimal_temp_max DECIMAL(5,2), -- °C
  
  -- Safety information
  allergen_type VARCHAR(100), -- dairy, gluten, nuts, soy, eggs, fish, shellfish, or none
  safety_notes TEXT,
  
  -- Source & verification
  data_source VARCHAR(100) DEFAULT 'USDA FoodKeeper', -- USDA, AI, Custom, etc.
  verified BOOLEAN DEFAULT FALSE,
  
  -- Usage tracking
  match_count INTEGER DEFAULT 0, -- How many times this ingredient was matched
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_master_ingredients_name ON master_ingredients(name);
CREATE INDEX idx_master_ingredients_canonical_name ON master_ingredients(canonical_name);
CREATE INDEX idx_master_ingredients_category ON master_ingredients(category);
CREATE INDEX idx_master_ingredients_aliases ON master_ingredients USING GIN (aliases);
CREATE INDEX idx_master_ingredients_allergen_type ON master_ingredients(allergen_type);
CREATE INDEX idx_master_ingredients_match_count ON master_ingredients(match_count DESC);

-- Trigger: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_master_ingredients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_master_ingredients_updated_at 
  BEFORE UPDATE ON master_ingredients
  FOR EACH ROW EXECUTE FUNCTION update_master_ingredients_updated_at();

-- Enable Row Level Security
ALTER TABLE master_ingredients ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Master ingredients are publicly readable
CREATE POLICY "Master ingredients are publicly readable"
  ON master_ingredients FOR SELECT
  USING (TRUE); -- Anyone can read

CREATE POLICY "Only authenticated users can insert master ingredients"
  ON master_ingredients FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Only authenticated users can update master ingredients"
  ON master_ingredients FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Comments
COMMENT ON TABLE master_ingredients IS 'Master library of ~500 common ingredients with authoritative USDA data';
COMMENT ON COLUMN master_ingredients.canonical_name IS 'Standard name used for deduplication (e.g., "Chicken Breast")';
COMMENT ON COLUMN master_ingredients.aliases IS 'Array of alternative names that map to this ingredient';
COMMENT ON COLUMN master_ingredients.match_count IS 'Tracks usage frequency for analytics';
COMMENT ON COLUMN master_ingredients.data_source IS 'Where the data came from (USDA, AI, Custom, etc.)';

