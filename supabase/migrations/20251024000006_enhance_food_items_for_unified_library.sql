-- Enhance food_items table to support unified library structure
-- Adds source tracking, type distinction, and print history

-- Add new columns to food_items
ALTER TABLE food_items 
  ADD COLUMN IF NOT EXISTS item_type VARCHAR(50) DEFAULT 'food_item' CHECK (item_type IN ('food_item', 'ingredient')),
  ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) DEFAULT 'menu_upload' CHECK (source_type IN ('menu_upload', 'manual', 'extracted', 'integration')),
  ADD COLUMN IF NOT EXISTS storage_method VARCHAR(50),
  ADD COLUMN IF NOT EXISTS print_history JSONB DEFAULT '[]'::jsonb;

-- Create index on new columns
CREATE INDEX IF NOT EXISTS idx_food_items_item_type ON food_items(item_type);
CREATE INDEX IF NOT EXISTS idx_food_items_source_type ON food_items(source_type);
CREATE INDEX IF NOT EXISTS idx_food_items_print_history ON food_items USING GIN (print_history);

-- Add comments for new columns
COMMENT ON COLUMN food_items.item_type IS 'Whether this is a food_item or extracted ingredient';
COMMENT ON COLUMN food_items.source_type IS 'How this item was added: menu_upload, manual, extracted, or integration';
COMMENT ON COLUMN food_items.storage_method IS 'Storage method: refrigerated, frozen, room_temp';
COMMENT ON COLUMN food_items.print_history IS 'Array of print events with timestamps';

-- Function to track print events
CREATE OR REPLACE FUNCTION track_print_event()
RETURNS TRIGGER AS $$
BEGIN
  -- If print_count increased, add to print_history
  IF NEW.print_count > OLD.print_count THEN
    NEW.print_history = OLD.print_history || jsonb_build_object(
      'timestamp', NOW(),
      'count', NEW.print_count
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically track prints
DROP TRIGGER IF EXISTS track_food_item_prints ON food_items;
CREATE TRIGGER track_food_item_prints
  BEFORE UPDATE ON food_items
  FOR EACH ROW
  WHEN (NEW.print_count IS DISTINCT FROM OLD.print_count)
  EXECUTE FUNCTION track_print_event();

-- View: Unified Library (combines food_items from all sources)
CREATE OR REPLACE VIEW unified_food_library AS
SELECT 
  id,
  name,
  item_type,
  category,
  source_type,
  storage_method,
  shelf_life_days,
  ingredients,
  allergens,
  print_count,
  last_printed_at,
  print_history,
  metadata,
  is_active,
  created_at,
  updated_at,
  workspace_id
FROM food_items
WHERE is_active = TRUE
ORDER BY name ASC;

COMMENT ON VIEW unified_food_library IS 'Unified view of all food items and ingredients from all sources';

