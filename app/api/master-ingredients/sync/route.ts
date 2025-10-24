import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MASTER_INGREDIENTS } from '@/lib/master-ingredients';

/**
 * POST /api/master-ingredients/sync
 * Syncs the TypeScript master ingredients to the database
 * Run this once to populate the database
 */
export async function POST() {
  try {
    const supabase = await createClient();
    
    console.log(`🔄 Starting sync of ${MASTER_INGREDIENTS.length} master ingredients...`);

    // Transform TypeScript format to database format
    const dbIngredients = MASTER_INGREDIENTS.map(ing => ({
      name: ing.name,
      canonical_name: ing.name,
      aliases: ing.aliases || [],
      category: ing.category,
      storage_method: ing.storageMethod,
      shelf_life_refrigerated: ing.shelfLifeDays.refrigerated || null,
      shelf_life_frozen: ing.shelfLifeDays.frozen || null,
      shelf_life_pantry: ing.shelfLifeDays.pantry || null,
      optimal_temp_min: ing.optimalTempMin || null,
      optimal_temp_max: ing.optimalTempMax || null,
      allergen_type: ing.allergenType || 'none',
      safety_notes: ing.safetyNotes || null,
      data_source: 'USDA FoodKeeper',
      verified: true,
      match_count: 0,
    }));

    // Use upsert to avoid duplicates
    const { data, error } = await supabase
      .from('master_ingredients')
      .upsert(dbIngredients, {
        onConflict: 'name',
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      console.error('❌ Error syncing master ingredients:', error);
      return NextResponse.json(
        { error: 'Failed to sync master ingredients', details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ Successfully synced ${data?.length || 0} master ingredients to database`);

    return NextResponse.json({
      success: true,
      synced: data?.length || 0,
      total: MASTER_INGREDIENTS.length,
      message: `Synced ${data?.length || 0} master ingredients to database`,
    });

  } catch (error) {
    console.error('❌ Error in master ingredients sync:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/master-ingredients/sync
 * Check sync status
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Count master ingredients in database
    const { count, error } = await supabase
      .from('master_ingredients')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to check sync status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      inDatabase: count || 0,
      inCode: MASTER_INGREDIENTS.length,
      synced: count === MASTER_INGREDIENTS.length,
      needsSync: count !== MASTER_INGREDIENTS.length,
    });

  } catch (error) {
    console.error('Error checking sync status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

