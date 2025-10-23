import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

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
    const { foodItemId, ingredients } = body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'No ingredients provided' },
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

    // Use Claude to analyze each ingredient's shelf life
    const prompt = `You are a food safety expert. For each ingredient in the following list, provide detailed shelf life and storage information.

Ingredients to analyze:
${ingredients.map((ing: string, idx: number) => `${idx + 1}. ${ing}`).join('\n')}

For each ingredient, provide:
1. Category (dairy, produce, protein, dry_goods, condiments, etc.)
2. Storage method (refrigerated, frozen, room_temp)
3. Shelf life in days (once opened/prepared)
4. Optimal temperature range in Celsius (if applicable)
5. Any allergen type (dairy, gluten, nuts, soy, eggs, fish, shellfish, or none)
6. Brief safety notes

Return the data as a valid JSON array with this exact structure:
[
  {
    "name": "ingredient name",
    "category": "category",
    "storageMethod": "storage method",
    "shelfLifeDays": number,
    "optimalTempMin": number or null,
    "optimalTempMax": number or null,
    "allergenType": "allergen or none",
    "safetyNotes": "brief notes"
  }
]

Only return the JSON array, no other text.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse the AI response
    const cleanedText = content.text.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const analyzedIngredients = JSON.parse(cleanedText);

    // Save to database if foodItemId is provided
    if (foodItemId) {
      const ingredientsToInsert = analyzedIngredients.map((ing: any) => ({
        workspace_id: workspaceId,
        food_item_id: foodItemId,
        name: ing.name,
        category: ing.category || 'other',
        storage_method: ing.storageMethod || 'unknown',
        shelf_life_days: ing.shelfLifeDays || 1,
        optimal_temp_min: ing.optimalTempMin,
        optimal_temp_max: ing.optimalTempMax,
        allergen_type: ing.allergenType === 'none' ? null : ing.allergenType,
        safety_notes: ing.safetyNotes || null,
        is_active: true,
      }));

      const { data: savedIngredients, error: insertError } = await supabase
        .from('ingredients')
        .insert(ingredientsToInsert)
        .select();

      if (insertError) {
        console.error('Error saving ingredients:', insertError);
        // Don't fail the whole request, just log the error
      }

      return NextResponse.json({
        success: true,
        ingredients: analyzedIngredients,
        saved: savedIngredients?.length || 0,
      });
    }

    return NextResponse.json({
      success: true,
      ingredients: analyzedIngredients,
    });

  } catch (error) {
    console.error('Error analyzing ingredients:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

