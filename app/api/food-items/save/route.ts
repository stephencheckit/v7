import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user (optional for demo mode)
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { imageUrl, imageSize, items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'No items provided' },
        { status: 400 }
      );
    }

    // If no user, return success without saving to database (demo mode)
    if (!user) {
      console.log('No user logged in - skipping database save');
      return NextResponse.json({
        success: true,
        demo: true,
        itemsSaved: items.length,
        message: 'Demo mode - items not saved to database',
      });
    }

    // Get user's workspace (assuming first workspace for now)
    const { data: workspaces } = await supabase
      .from('workspaces')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1);

    const workspaceId = workspaces?.[0]?.id;

    if (!workspaceId) {
      console.log('No workspace found - skipping database save');
      return NextResponse.json({
        success: true,
        demo: true,
        itemsSaved: items.length,
        message: 'No workspace - items not saved to database',
      });
    }

    // Create menu upload record
    const { data: menuUpload, error: uploadError } = await supabase
      .from('menu_uploads')
      .insert({
        workspace_id: workspaceId,
        uploaded_by: user.id,
        image_url: imageUrl || 'uploaded',
        image_size: imageSize || 0,
        analyzed_at: new Date().toISOString(),
        items_found: items.length,
      })
      .select()
      .single();

    if (uploadError || !menuUpload) {
      console.error('Error creating menu upload:', uploadError);
      return NextResponse.json(
        { error: 'Failed to save menu upload' },
        { status: 500 }
      );
    }

    // Transform and save food items with new unified library structure
    const foodItems = items.map((item: any) => ({
      menu_upload_id: menuUpload.id,
      workspace_id: workspaceId,
      name: item.name,
      item_type: item.type || 'food_item', // food_item or ingredient
      source_type: item.source || 'menu_upload', // menu_upload, manual, extracted, integration
      category: item.category || 'uncategorized',
      day: item.day || null,
      meal: item.meal || null,
      ingredients: item.ingredients || [],
      allergens: item.allergens || [],
      shelf_life_days: item.shelfLifeDays || 1,
      storage_method: item.storageMethod || null,
      print_count: item.printCount || 0,
      last_printed_at: item.lastPrinted || null,
      print_history: item.printHistory || [],
      is_active: true,
      metadata: {
        original_id: item.id,
        ...(item.metadata || {}),
      },
    }));

    const { data: savedItems, error: itemsError } = await supabase
      .from('food_items')
      .insert(foodItems)
      .select();

    if (itemsError) {
      console.error('Error saving food items:', itemsError);
      return NextResponse.json(
        { error: 'Failed to save food items' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      menuUploadId: menuUpload.id,
      itemsSaved: savedItems?.length || 0,
      items: savedItems,
    });

  } catch (error) {
    console.error('Error in save food items API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

