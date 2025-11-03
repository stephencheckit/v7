/**
 * Voice-to-Form Parser API
 * Cleans transcript with OpenAI, then aggressively matches to form fields
 */

import { OpenAI } from 'openai';

export const runtime = 'edge';
export const maxDuration = 25;

interface VoiceToFormRequest {
  transcription: string;
  formSchema: { fields: any[] };
  currentValues: Record<string, any>;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { transcription, formSchema, currentValues }: VoiceToFormRequest = await req.json();

    console.log('[Voice-to-Form] Processing transcription:', transcription.substring(0, 100) + '...');
    console.log('[Voice-to-Form] Form has', formSchema.fields.length, 'fields');

    // Step 1: Clean up the transcript using OpenAI
    const cleanupResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a transcript cleanup assistant. Fix grammar, remove filler words (um, uh, like), capitalize properly, and make the text clear. Preserve all factual information. Return ONLY the cleaned text, no extra commentary.'
        },
        {
          role: 'user',
          content: `Clean up this voice transcript: "${transcription}"`
        }
      ],
      temperature: 0.3,
    });

    const cleanedText = cleanupResponse.choices[0].message.content || transcription;
    console.log('[Voice-to-Form] Cleaned text:', cleanedText);

    // Step 2: Aggressively match cleaned text to form fields
    const formFieldsDescription = formSchema.fields.map((field: any, idx: number) => {
      let description = `${idx + 1}. "${field.label}" (type: ${field.type}, id: ${field.id || field.name})`;
      if (field.options && field.options.length > 0) {
        description += `\n   Options: ${field.options.join(', ')}`;
      }
      if (field.type === 'checkbox') {
        description += `\n   ⚠️ CHECKBOX: Return an ARRAY of ALL selected options`;
      }
      return description;
    }).join('\n\n');

    const matchingPrompt = `You are filling out an inspection form based on spoken answers. Be VERY AGGRESSIVE about matching answers to questions.

## Form Questions:
${formFieldsDescription}

## Current Answers:
${Object.entries(currentValues).length > 0 ? Object.entries(currentValues).map(([key, val]) => `- ${key}: ${val}`).join('\n') : 'None yet'}

## Spoken Text (cleaned):
"${cleanedText}"

## Your Task:
1. Match EVERY part of the spoken text to form questions if possible
2. Extract field values even if phrasing isn't exact
3. For yes/no: recognize "yes", "yeah", "yep", "correct", "good", "no", "nope", "negative", "not good"
4. For numbers: extract ANY numeric value mentioned
5. For text: extract relevant phrases
6. For multiple-choice/radio: **Match the EXACT option text** (including emojis like 👍 Yes or 👎 No)
7. For CHECKBOX fields: Return an ARRAY of ALL mentioned options (e.g., ["Shoes", "Book", "Cup"])
8. Be creative with matching - if they say "saw shoes and a book", that matches multiple items
9. Only put things in unstructured_notes if they REALLY don't match any question

## Output Format (JSON only):
{
  "field_updates": {
    "field_id": "exact_option_value_or_array"
  },
  "unstructured_notes": ["things that don't match any question"]
}

## CRITICAL RULES:
- For radio/select: Return the EXACT option text from the list (e.g., "👍 Yes" not just "Yes")
- For CHECKBOX fields: ALWAYS return an array of EXACT option texts: ["👍 Yes", "Shoes", "Book"]
- For text fields: Return a string: "The scene looks great"
- BE AGGRESSIVE at matching meaning to options:
  • If they say "yes" and options are ["👍 Yes", "👎 No"] → return "👍 Yes"
  • If they say "no" and options are ["👍 Yes", "👎 No"] → return "👎 No"
  • If they say "shoes" and options are ["Shoes", "Child", "Cup"] → return "Shoes"
- If someone says "temperature is 38" and there's a temperature field, fill it
- If they say "I see shoes, a child, a cup, and a book" → extract ALL items for checkbox field

Return ONLY valid JSON, no other text.`;

    const matchingResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: matchingPrompt
        }
      ],
      temperature: 0.2,
    });

    const aiResponse = matchingResponse.choices[0].message.content || '{}';
    console.log('[Voice-to-Form] Matching response:', aiResponse);

    // Parse JSON response
    let result;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('[Voice-to-Form] Failed to parse AI response:', parseError);
      result = {
        field_updates: {},
        unstructured_notes: []
      };
    }

    // Step 3: Normalize field values (fuzzy match for radio/select options with emojis)
    const normalizedUpdates: Record<string, any> = {};

    Object.entries(result.field_updates || {}).forEach(([fieldId, value]) => {
      const field = formSchema.fields.find((f: any) => f.id === fieldId || f.name === fieldId);

      if (!field) {
        normalizedUpdates[fieldId] = value;
        return;
      }

      // For radio/select fields with options, do fuzzy matching
      if ((field.type === 'radio' || field.type === 'select') && field.options && Array.isArray(field.options)) {
        // Check if value exactly matches an option
        if (field.options.includes(value)) {
          normalizedUpdates[fieldId] = value;
        } else {
          // Fuzzy match: find option that contains the value (case-insensitive)
          const cleanValue = String(value).toLowerCase().trim();
          const match = field.options.find((opt: string) =>
            opt.toLowerCase().includes(cleanValue) || cleanValue.includes(opt.toLowerCase())
          );
          normalizedUpdates[fieldId] = match || value; // Use match if found, otherwise original

          if (match && match !== value) {
            console.log(`[Voice-to-Form] 🔧 Fuzzy matched "${value}" → "${match}" for field: ${field.label}`);
          }
        }
      }
      // For checkbox fields, fuzzy match each item in the array
      else if (field.type === 'checkbox' && field.options && Array.isArray(field.options) && Array.isArray(value)) {
        const matchedItems = value.map((item: string) => {
          if (field.options.includes(item)) {
            return item;
          } else {
            const cleanItem = String(item).toLowerCase().trim();
            const match = field.options.find((opt: string) =>
              opt.toLowerCase().includes(cleanItem) || cleanItem.includes(opt.toLowerCase())
            );
            if (match && match !== item) {
              console.log(`[Voice-to-Form] 🔧 Fuzzy matched "${item}" → "${match}" for field: ${field.label}`);
            }
            return match || item;
          }
        });
        normalizedUpdates[fieldId] = matchedItems;
      }
      // For other fields, use value as-is
      else {
        normalizedUpdates[fieldId] = value;
      }
    });

    const finalResult = {
      field_updates: normalizedUpdates,
      unstructured_notes: result.unstructured_notes || []
    };

    console.log('[Voice-to-Form] ✅ Final result (after normalization):', JSON.stringify(finalResult, null, 2));
    console.log('[Voice-to-Form] Field updates:');
    Object.entries(finalResult.field_updates || {}).forEach(([fieldId, value]) => {
      const field = formSchema.fields.find((f: any) => f.id === fieldId || f.name === fieldId);
      if (field) {
        console.log(`  - ${field.label} (${field.type}): ${Array.isArray(value) ? `[${value.join(', ')}]` : value}`);
      }
    });

    return Response.json(finalResult);
  } catch (error) {
    console.error('[Voice-to-Form] Error:', error);
    return Response.json(
      { error: 'Failed to parse transcription' },
      { status: 500 }
    );
  }
}

