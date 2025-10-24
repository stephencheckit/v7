import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/food-items/library
 * Loads the entire food library for a workspace
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    let workspaceId = null;
    let isDemo = false;

    if (user) {
      // Get user's workspace
      const { data: workspaces } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1);

      workspaceId = workspaces?.[0]?.id || null;
    }

    // If no user or no workspace, use demo mode (workspace_id IS NULL)
    if (!workspaceId) {
      isDemo = true;
    }

    // Load all active items from the workspace (or demo items if workspace_id is null)
    let query = supabase
      .from('food_items')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });
    
    // Add workspace filter
    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    } else {
      query = query.is('workspace_id', null);
    }
    
    const { data: items, error } = await query;

    if (error) {
      console.error('Error loading food library:', error);
      return NextResponse.json(
        { error: 'Failed to load library' },
        { status: 500 }
      );
    }

    // Transform to frontend format
    const libraryItems = (items || []).map(item => ({
      id: item.id,
      name: item.name,
      type: item.item_type || 'food_item',
      category: item.category,
      shelfLifeDays: item.shelf_life_days,
      storageMethod: item.storage_method,
      allergens: item.allergens || [],
      ingredients: item.ingredients || [],
      source: item.source_type || 'menu_upload',
      printCount: item.print_count || 0,
      lastPrinted: item.last_printed_at,
      printHistory: item.print_history || [],
      createdAt: item.created_at,
      metadata: item.metadata || {},
    }));

    return NextResponse.json({
      success: true,
      items: libraryItems,
      total: libraryItems.length,
      demo: isDemo,
    });

  } catch (error) {
    console.error('Error in library API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/food-items/library
 * Bulk add items to the library (for manual adds or imports)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items array required' },
        { status: 400 }
      );
    }

    // Get user's workspace
    const { data: workspaces } = await supabase
      .from('workspaces')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1);

    const workspaceId = workspaces?.[0]?.id;

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'No workspace found' },
        { status: 404 }
      );
    }

    // Transform and insert items
    const foodItems = items.map((item: any) => ({
      workspace_id: workspaceId,
      name: item.name,
      item_type: item.type || 'food_item',
      source_type: item.source || 'manual',
      category: item.category || 'uncategorized',
      ingredients: item.ingredients || [],
      allergens: item.allergens || [],
      shelf_life_days: item.shelfLifeDays || 3,
      storage_method: item.storageMethod || null,
      print_count: 0,
      print_history: [],
      is_active: true,
      metadata: item.metadata || {},
    }));

    const { data: savedItems, error } = await supabase
      .from('food_items')
      .insert(foodItems)
      .select();

    if (error) {
      console.error('Error saving items:', error);
      return NextResponse.json(
        { error: 'Failed to save items' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      items: savedItems,
      count: savedItems?.length || 0,
    });

  } catch (error) {
    console.error('Error in library POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

