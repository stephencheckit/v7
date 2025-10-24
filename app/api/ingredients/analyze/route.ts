import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user (optional for demo mode)
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { foodItemId, ingredients } = body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'No ingredients provided' },
        { status: 400 }
      );
    }

    // Get user's workspace if available
    let workspaceId = null;
    if (user) {
      const { data: workspaces } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1);

      workspaceId = workspaces?.[0]?.id || null;
    }

    // HYBRID APPROACH: Check master library first (from database), then AI for unknowns
    const analyzedIngredients: any[] = [];
    const unknownIngredients: string[] = [];
    let masterLibraryHits = 0;

    // Step 1: Check master ingredient library from database
    for (const ingredientName of ingredients) {
      // Query database for master ingredient match (exact name or alias match)
      const { data: masterMatches } = await supabase
        .from('master_ingredients')
        .select('*')
        .or(`name.ilike.${ingredientName},aliases.cs.{${ingredientName}}`)
        .limit(1);
      
      const masterMatch = masterMatches?.[0];
      
      if (masterMatch) {
        // Found in master library - use authoritative data
        const storageMethod = masterMatch.storage_method;
        const shelfLife = storageMethod === 'refrigerated' 
          ? masterMatch.shelf_life_refrigerated 
          : storageMethod === 'frozen'
          ? masterMatch.shelf_life_frozen
          : masterMatch.shelf_life_pantry;

        analyzedIngredients.push({
          name: masterMatch.canonical_name || masterMatch.name, // Use canonical name
          category: masterMatch.category,
          storageMethod: masterMatch.storage_method,
          shelfLifeDays: shelfLife || 7,
          optimalTempMin: masterMatch.optimal_temp_min || null,
          optimalTempMax: masterMatch.optimal_temp_max || null,
          allergenType: masterMatch.allergen_type || 'none',
          safetyNotes: masterMatch.safety_notes || '',
        });
        masterLibraryHits++;

        // Update match count for analytics
        await supabase
          .from('master_ingredients')
          .update({ match_count: (masterMatch.match_count || 0) + 1 })
          .eq('id', masterMatch.id);
      } else {
        // Not in master library - needs AI analysis
        unknownIngredients.push(ingredientName);
      }
    }

    // Step 2: Use AI only for unknown ingredients
    if (unknownIngredients.length > 0) {
      const prompt = `You are a food safety expert. For each ingredient in the following list, provide detailed shelf life and storage information.

Ingredients to analyze:
${unknownIngredients.map((ing: string, idx: number) => `${idx + 1}. ${ing}`).join('\n')}

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
        model: 'claude-3-7-sonnet-20250219',
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
      const aiAnalyzedIngredients = JSON.parse(cleanedText);
      
      // Combine AI results with master library results
      analyzedIngredients.push(...aiAnalyzedIngredients);
    }

    // Save to database if foodItemId and workspaceId are provided
    if (foodItemId && workspaceId) {
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
        stats: {
          total: analyzedIngredients.length,
          fromMasterLibrary: masterLibraryHits,
          fromAI: unknownIngredients.length,
          accuracy: masterLibraryHits > 0 ? 'high' : 'ai-generated',
        },
      });
    }

    return NextResponse.json({
      success: true,
      ingredients: analyzedIngredients,
      demo: !workspaceId,
      stats: {
        total: analyzedIngredients.length,
        fromMasterLibrary: masterLibraryHits,
        fromAI: unknownIngredients.length,
        accuracy: masterLibraryHits > 0 ? 'high' : 'ai-generated',
      },
    });

  } catch (error) {
    console.error('Error analyzing ingredients:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

