/**
 * Master Ingredient Library
 * Hybrid approach combining FoodKeeper data + AI-enhanced common ingredients
 */

export interface MasterIngredient {
  name: string;
  category: string;
  storageMethod: 'refrigerated' | 'frozen' | 'room_temp';
  shelfLifeDays: {
    refrigerated?: number;
    frozen?: number;
    pantry?: number;
  };
  allergenType?: string;
  safetyNotes?: string;
  aliases?: string[]; // Alternative names
  optimalTempMin?: number;
  optimalTempMax?: number;
}

/**
 * Master Ingredient Database
 * Based on USDA FoodKeeper data + common restaurant ingredients
 */
export const MASTER_INGREDIENTS: MasterIngredient[] = [
  // PROTEINS
  {
    name: 'Chicken Breast',
    category: 'protein',
    storageMethod: 'refrigerated',
    shelfLifeDays: { refrigerated: 2, frozen: 270, pantry: 0 },
    allergenType: 'none',
    optimalTempMin: 0,
    optimalTempMax: 4,
    safetyNotes: 'Cook to 165°F internal temperature',
    aliases: ['chicken', 'chicken breast', 'raw chicken'],
  },
  {
    name: 'Ground Beef',
    category: 'protein',
    storageMethod: 'refrigerated',
    shelfLifeDays: { refrigerated: 2, frozen: 120, pantry: 0 },
    allergenType: 'none',
    optimalTempMin: 0,
    optimalTempMax: 4,
    safetyNotes: 'Cook to 160°F internal temperature',
    aliases: ['beef', 'ground beef', 'hamburger meat'],
  },
  {
    name: 'Salmon',
    category: 'protein',
    storageMethod: 'refrigerated',
    shelfLifeDays: { refrigerated: 2, frozen: 90, pantry: 0 },
    allergenType: 'fish',
    optimalTempMin: 0,
    optimalTempMax: 4,
    safetyNotes: 'Cook to 145°F internal temperature',
    aliases: ['salmon fillet', 'fresh salmon', 'salmon'],
  },
  {
    name: 'Shrimp',
    category: 'protein',
    storageMethod: 'refrigerated',
    shelfLifeDays: { refrigerated: 2, frozen: 180, pantry: 0 },
    allergenType: 'shellfish',
    optimalTempMin: 0,
    optimalTempMax: 4,
    safetyNotes: 'Cook until opaque',
    aliases: ['prawns', 'shrimp', 'raw shrimp'],
  },
  {
    name: 'Eggs',
    category: 'protein',
    storageMethod: 'refrigerated',
    shelfLifeDays: { refrigerated: 35, frozen: 0, pantry: 0 },
    allergenType: 'eggs',
    optimalTempMin: 0,
    optimalTempMax: 4,
    safetyNotes: 'Store in original carton',
    aliases: ['egg', 'eggs', 'whole eggs'],
  },
  {
    name: 'Bacon',
    category: 'protein',
    storageMethod: 'refrigerated',
    shelfLifeDays: { refrigerated: 7, frozen: 30, pantry: 0 },
    allergenType: 'none',
    aliases: ['bacon strips', 'bacon'],
  },
  {
    name: 'Pork Chops',
    category: 'protein',
    storageMethod: 'refrigerated',
    shelfLifeDays: { refrigerated: 3, frozen: 180, pantry: 0 },
    allergenType: 'none',
    safetyNotes: 'Cook to 145°F',
    aliases: ['pork', 'pork chop'],
  },

  // DAIRY
  {
    name: 'Milk',
    category: 'dairy',
    storageMethod: 'refrigerated',
    shelfLifeDays: { refrigerated: 7, frozen: 90, pantry: 0 },
    allergenType: 'dairy',
    optimalTempMin: 0,
    optimalTempMax: 4,
    safetyNotes: 'Keep refrigerated at all times',
    aliases: ['whole milk', 'milk', '2% milk'],
  },
  {
    name: 'Cheddar Cheese',
    category: 'dairy',
    storageMethod: 'refrigerated',
    shelfLifeDays: { refrigerated: 21, frozen: 180, pantry: 0 },
    allergenType: 'dairy',
    aliases: ['cheese', 'cheddar', 'sharp cheddar'],
  },
  {
    name: 'Butter',
    category: 'dairy',
    storageMethod: 'refrigerated',
    shelfLifeDays: { refrigerated: 90, frozen: 270, pantry: 0 },
    allergenType: 'dairy',
    aliases: ['butter', 'unsalted butter', 'salted butter'],
  },
  {
    name: 'Yogurt',
    category: 'dairy',
    storageMethod: 'refrigerated',
    shelfLifeDays: { refrigerated: 14, frozen: 60, pantry: 0 },
    allergenType: 'dairy',
    aliases: ['yogurt', 'greek yogurt'],
  },
  {
    name: 'Cream Cheese',
    category: 'dairy',
    storageMethod: 'refrigerated',
    shelfLifeDays: { refrigerated: 14, frozen: 60, pantry: 0 },
    allergenType: 'dairy',
    aliases: ['cream cheese', 'philadelphia'],
  },
  {
    name: 'Heavy Cream',
    category: 'dairy',
    storageMethod: 'refrigerated',
    shelfLifeDays: { refrigerated: 7, frozen: 120, pantry: 0 },
    allergenType: 'dairy',
    aliases: ['cream', 'heavy cream', 'whipping cream'],
  },

  // PRODUCE
  {
    name: 'Lettuce',
    category: 'produce',
    storageMethod: 'refrigerated',
    shelfLifeDays: { refrigerated: 7, frozen: 0, pantry: 0 },
    allergenType: 'none',
    optimalTempMin: 0,
    optimalTempMax: 4,
    safetyNotes: 'Wash before use',
    aliases: ['lettuce', 'romaine', 'iceberg lettuce', 'green leaf'],
  },
  {
    name: 'Tomatoes',
    category: 'produce',
    storageMethod: 'room_temp',
    shelfLifeDays: { refrigerated: 7, frozen: 60, pantry: 7 },
    allergenType: 'none',
    safetyNotes: 'Store at room temp until ripe',
    aliases: ['tomato', 'tomatoes', 'roma tomatoes', 'cherry tomatoes'],
  },
  {
    name: 'Onions',
    category: 'produce',
    storageMethod: 'room_temp',
    shelfLifeDays: { refrigerated: 30, frozen: 180, pantry: 60 },
    allergenType: 'none',
    safetyNotes: 'Store in cool, dry place',
    aliases: ['onion', 'yellow onion', 'white onion', 'red onion'],
  },
  {
    name: 'Garlic',
    category: 'produce',
    storageMethod: 'room_temp',
    shelfLifeDays: { refrigerated: 90, frozen: 365, pantry: 120 },
    allergenType: 'none',
    aliases: ['garlic', 'garlic cloves', 'fresh garlic'],
  },
  {
    name: 'Carrots',
    category: 'produce',
    storageMethod: 'refrigerated',
    shelfLifeDays: { refrigerated: 21, frozen: 180, pantry: 0 },
    allergenType: 'none',
    aliases: ['carrot', 'carrots', 'baby carrots'],
  },
  {
    name: 'Potatoes',
    category: 'produce',
    storageMethod: 'room_temp',
    shelfLifeDays: { refrigerated: 0, frozen: 180, pantry: 90 },
    allergenType: 'none',
    safetyNotes: 'Store in cool, dark place',
    aliases: ['potato', 'potatoes', 'russet potatoes', 'red potatoes'],
  },
  {
    name: 'Bell Peppers',
    category: 'produce',
    storageMethod: 'refrigerated',
    shelfLifeDays: { refrigerated: 7, frozen: 180, pantry: 0 },
    allergenType: 'none',
    aliases: ['bell pepper', 'peppers', 'red pepper', 'green pepper'],
  },
  {
    name: 'Mushrooms',
    category: 'produce',
    storageMethod: 'refrigerated',
    shelfLifeDays: { refrigerated: 7, frozen: 180, pantry: 0 },
    allergenType: 'none',
    aliases: ['mushroom', 'mushrooms', 'button mushrooms'],
  },
  {
    name: 'Spinach',
    category: 'produce',
    storageMethod: 'refrigerated',
    shelfLifeDays: { refrigerated: 7, frozen: 180, pantry: 0 },
    allergenType: 'none',
    aliases: ['spinach', 'fresh spinach', 'baby spinach'],
  },
  {
    name: 'Broccoli',
    category: 'produce',
    storageMethod: 'refrigerated',
    shelfLifeDays: { refrigerated: 7, frozen: 365, pantry: 0 },
    allergenType: 'none',
    aliases: ['broccoli', 'broccoli florets'],
  },

  // DRY GOODS / PANTRY
  {
    name: 'Flour',
    category: 'dry_goods',
    storageMethod: 'room_temp',
    shelfLifeDays: { refrigerated: 0, frozen: 0, pantry: 365 },
    allergenType: 'gluten',
    safetyNotes: 'Store in airtight container',
    aliases: ['flour', 'all-purpose flour', 'wheat flour'],
  },
  {
    name: 'Sugar',
    category: 'dry_goods',
    storageMethod: 'room_temp',
    shelfLifeDays: { refrigerated: 0, frozen: 0, pantry: 730 },
    allergenType: 'none',
    aliases: ['sugar', 'granulated sugar', 'white sugar'],
  },
  {
    name: 'Rice',
    category: 'dry_goods',
    storageMethod: 'room_temp',
    shelfLifeDays: { refrigerated: 0, frozen: 0, pantry: 730 },
    allergenType: 'none',
    aliases: ['rice', 'white rice', 'long grain rice'],
  },
  {
    name: 'Pasta',
    category: 'dry_goods',
    storageMethod: 'room_temp',
    shelfLifeDays: { refrigerated: 0, frozen: 0, pantry: 730 },
    allergenType: 'gluten',
    aliases: ['pasta', 'spaghetti', 'penne', 'noodles'],
  },
  {
    name: 'Olive Oil',
    category: 'condiments',
    storageMethod: 'room_temp',
    shelfLifeDays: { refrigerated: 0, frozen: 0, pantry: 365 },
    allergenType: 'none',
    aliases: ['olive oil', 'extra virgin olive oil', 'oil'],
  },
  {
    name: 'Salt',
    category: 'dry_goods',
    storageMethod: 'room_temp',
    shelfLifeDays: { refrigerated: 0, frozen: 0, pantry: 3650 },
    allergenType: 'none',
    aliases: ['salt', 'table salt', 'sea salt'],
  },
  {
    name: 'Black Pepper',
    category: 'dry_goods',
    storageMethod: 'room_temp',
    shelfLifeDays: { refrigerated: 0, frozen: 0, pantry: 1095 },
    allergenType: 'none',
    aliases: ['pepper', 'black pepper', 'ground pepper'],
  },

  // CONDIMENTS
  {
    name: 'Ketchup',
    category: 'condiments',
    storageMethod: 'refrigerated',
    shelfLifeDays: { refrigerated: 180, frozen: 0, pantry: 365 },
    allergenType: 'none',
    aliases: ['ketchup', 'catsup', 'tomato ketchup'],
  },
  {
    name: 'Mayonnaise',
    category: 'condiments',
    storageMethod: 'refrigerated',
    shelfLifeDays: { refrigerated: 60, frozen: 0, pantry: 0 },
    allergenType: 'eggs',
    safetyNotes: 'Keep refrigerated after opening',
    aliases: ['mayo', 'mayonnaise'],
  },
  {
    name: 'Mustard',
    category: 'condiments',
    storageMethod: 'refrigerated',
    shelfLifeDays: { refrigerated: 365, frozen: 0, pantry: 365 },
    allergenType: 'none',
    aliases: ['mustard', 'yellow mustard', 'dijon mustard'],
  },
  {
    name: 'Soy Sauce',
    category: 'condiments',
    storageMethod: 'room_temp',
    shelfLifeDays: { refrigerated: 730, frozen: 0, pantry: 730 },
    allergenType: 'soy',
    aliases: ['soy sauce', 'shoyu'],
  },
];

/**
 * Search master ingredient library by name
 */
export function findMasterIngredient(searchName: string): MasterIngredient | null {
  const normalized = searchName.toLowerCase().trim();
  
  // Try exact match first
  let match = MASTER_INGREDIENTS.find(
    ing => ing.name.toLowerCase() === normalized
  );
  
  if (match) return match;
  
  // Try alias match
  match = MASTER_INGREDIENTS.find(
    ing => ing.aliases?.some(alias => alias.toLowerCase() === normalized)
  );
  
  if (match) return match;
  
  // Try partial match
  match = MASTER_INGREDIENTS.find(
    ing => ing.name.toLowerCase().includes(normalized) || 
           ing.aliases?.some(alias => alias.toLowerCase().includes(normalized))
  );
  
  return match || null;
}

/**
 * Get all ingredients in a category
 */
export function getIngredientsByCategory(category: string): MasterIngredient[] {
  return MASTER_INGREDIENTS.filter(ing => ing.category === category);
}

/**
 * Get suggested ingredients based on partial input
 */
export function suggestIngredients(partial: string, limit: number = 5): MasterIngredient[] {
  const normalized = partial.toLowerCase().trim();
  
  if (!normalized) return [];
  
  const matches = MASTER_INGREDIENTS.filter(
    ing => ing.name.toLowerCase().includes(normalized) ||
           ing.aliases?.some(alias => alias.toLowerCase().includes(normalized))
  );
  
  return matches.slice(0, limit);
}

