import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { imageUrl, imageSize, items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'No items provided' },
        { status: 400 }
      );
    }

    // Get user's workspace (assuming first workspace for now)
    // TODO: Add workspace selection or use from session
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

    // Transform and save food items
    const foodItems = items.map((item: any) => ({
      menu_upload_id: menuUpload.id,
      workspace_id: workspaceId,
      name: item.name,
      category: item.category || 'uncategorized',
      day: item.day || null,
      meal: item.meal || null,
      ingredients: item.ingredients || [],
      allergens: item.allergens || [],
      shelf_life_days: item.shelfLifeDays || 1,
      print_count: item.printCount || 0,
      last_printed_at: item.lastPrinted || null,
      is_active: true,
      metadata: {
        original_id: item.id,
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

