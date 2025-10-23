import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Configure function timeout - Node Runtime allows longer timeouts
export const runtime = 'nodejs';
export const maxDuration = 60; // seconds

export async function POST(req: NextRequest) {
  try {
    console.log('[Analyze Menu] Starting analysis...');
    
    const { image } = await req.json();

    if (!image) {
      console.error('[Analyze Menu] No image provided');
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('[Analyze Menu] ANTHROPIC_API_KEY not found in environment');
      return NextResponse.json({ 
        error: 'API key not configured. Please add ANTHROPIC_API_KEY to your .env.local file' 
      }, { status: 500 });
    }

    // Extract base64 data and media type
    const matches = image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
    }

    const imageFormat = matches[1].toLowerCase();
    const base64Data = matches[2];
    
    // Validate and type the media type
    const validMediaTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;
    const mediaType = `image/${imageFormat}` as typeof validMediaTypes[number];
    
    if (!validMediaTypes.includes(mediaType)) {
      return NextResponse.json({ 
        error: `Unsupported image format: ${imageFormat}. Please use jpeg, png, gif, or webp.` 
      }, { status: 400 });
    }
    
    console.log('[Analyze Menu] Image type:', mediaType);
    console.log('[Analyze Menu] Base64 length:', base64Data.length);

    // Create the food safety analysis prompt - SIMPLIFIED AND DIRECT
            const prompt = `Extract ALL food items from this menu image.

This is a weekly menu table. Read it cell by cell and extract EVERY food item.

For each food item found, determine:
- Name
- Day (Sunday/Monday/Tuesday/Wednesday/Thursday/Friday/Saturday)
- Meal (Breakfast/Lunch/Dinner)
- Ingredients (3-5 main ingredients)
- Shelf life in days (conservative food safety estimate)
- Category (Entree/Side/Soup/Salad/Dessert/Beverage/etc)
- Allergens (dairy/nuts/gluten/soy/eggs/shellfish/fish)

SHELF LIFE GUIDE:
- Raw proteins: 1-2 days
- Fresh vegetables/salads: 2-3 days
- Cooked meat dishes: 3-4 days
- Dairy sauces: 3-5 days
- Soups: 3-4 days
- Baked goods: 2-3 days

OUTPUT: Valid JSON only. No text before or after. Format:

{
  "items": [
    {
      "id": "sunday-breakfast-french-toast-sticks",
      "name": "French Toast Sticks",
      "day": "Sunday",
      "meal": "Breakfast",
      "ingredients": ["bread", "eggs", "milk", "cinnamon"],
      "shelfLifeDays": 2,
      "category": "Breakfast",
      "allergens": ["gluten", "eggs", "dairy"]
    }
  ]
}

Extract ALL items from ALL 7 days. Expect 70-120+ total items.`;

    // Call Claude Vision API
    console.log('[Analyze Menu] Calling Claude Vision API...');
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 8192, // Optimized for speed while handling large menus
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    });

    // Extract the JSON from Claude's response
    console.log('[Analyze Menu] Got response from Claude');
    const content = response.content[0];
    if (content.type !== 'text') {
      console.error('[Analyze Menu] Unexpected response type:', content.type);
      throw new Error('Unexpected response type from Claude');
    }
    
    console.log('[Analyze Menu] Response text length:', content.text.length);
    console.log('[Analyze Menu] Full response:', content.text);

    let result;
    try {
      // Try to parse the entire response as JSON
      result = JSON.parse(content.text);
    } catch (e) {
      console.log('[Analyze Menu] Direct JSON parse failed, trying alternatives...');
      console.log('[Analyze Menu] Parse error:', e);
      
      // If that fails, try to extract JSON from markdown code blocks
      const jsonMatch = content.text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        try {
          result = JSON.parse(jsonMatch[1]);
        } catch (e2) {
          console.log('[Analyze Menu] Markdown JSON parse failed');
        }
      }
      
      if (!result) {
        // Try to find and fix incomplete JSON
        const jsonObjectMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonObjectMatch) {
          let jsonStr = jsonObjectMatch[0];
          
          // Try to fix common issues with incomplete JSON
          // If it ends with a comma and incomplete object, try to close it
          if (!jsonStr.endsWith('}')) {
            console.log('[Analyze Menu] JSON appears incomplete, attempting to fix...');
            // Remove trailing incomplete item and close arrays/objects
            jsonStr = jsonStr.replace(/,\s*$/, ''); // Remove trailing comma
            const openBraces = (jsonStr.match(/\{/g) || []).length;
            const closeBraces = (jsonStr.match(/\}/g) || []).length;
            const openBrackets = (jsonStr.match(/\[/g) || []).length;
            const closeBrackets = (jsonStr.match(/\]/g) || []).length;
            
            // Add missing closing brackets
            for (let i = 0; i < (openBrackets - closeBrackets); i++) {
              jsonStr += ']';
            }
            for (let i = 0; i < (openBraces - closeBraces); i++) {
              jsonStr += '}';
            }
          }
          
          try {
            result = JSON.parse(jsonStr);
            console.log('[Analyze Menu] Successfully parsed fixed JSON');
          } catch (e3) {
            console.error('[Analyze Menu] Could not fix JSON:', e3);
            console.error('[Analyze Menu] First 500 chars:', content.text.substring(0, 500));
            console.error('[Analyze Menu] Last 500 chars:', content.text.substring(content.text.length - 500));
            throw new Error('Could not extract valid JSON from response');
          }
        } else {
          throw new Error('Could not find JSON object in response');
        }
      }
    }

    // Validate the result has items
    if (!result.items || !Array.isArray(result.items)) {
      console.error('[Analyze Menu] Invalid result format:', result);
      throw new Error('Invalid response format from AI');
    }

    console.log('[Analyze Menu] Successfully extracted', result.items.length, 'items');

    // Add metadata to items
    result.items = result.items.map((item: any, index: number) => ({
      ...item,
      id: item.id || `item-${Date.now()}-${index}`,
      printCount: 0,
      lastPrinted: null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Menu analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze menu', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

