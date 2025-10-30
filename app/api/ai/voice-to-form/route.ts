/**
 * Voice-to-Form Parser API
 * Parses voice transcriptions into structured form data and unstructured commentary
 */

import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

export const runtime = 'edge';
export const maxDuration = 25;

interface VoiceToFormRequest {
  transcription: string;
  formSchema: { fields: any[] };
  currentValues: Record<string, any>;
}

export async function POST(req: Request) {
  try {
    const { transcription, formSchema, currentValues }: VoiceToFormRequest = await req.json();

    console.log('[Voice-to-Form] Processing transcription:', transcription.substring(0, 100) + '...');
    console.log('[Voice-to-Form] Form has', formSchema.fields.length, 'fields');

    // Build AI prompt for parsing
    const systemPrompt = `You are an AI assistant that parses voice transcriptions from workplace inspections into structured form data.

Your task is to analyze the transcription and:
1. Identify which parts answer existing form questions
2. Extract unstructured observations, commentary, or insights that don't match any form field

## Form Schema

${formSchema.fields.map((field: any, idx: number) => 
  `${idx + 1}. **${field.label}** (${field.type})${field.options ? `\n   Options: ${field.options.join(', ')}` : ''}\n   Field ID: ${field.id || field.name}`
).join('\n\n')}

## Instructions

Analyze the transcription and output JSON with this structure:
{
  "field_updates": {
    "field_id": "extracted_value"
  },
  "unstructured_notes": [
    "observation or comment that doesn't match any field"
  ]
}

### Matching Rules:
- Be flexible with matching - "temp is 38" matches a temperature field
- For multiple-choice, match the closest option
- For yes/no fields, recognize variations like "yes", "yeah", "yep", "correct", "no", "nope", "negative"
- For text fields, extract the relevant phrase
- For numbers, extract the numeric value
- If something clearly doesn't answer any field question, put it in unstructured_notes

### Current Values:
${Object.entries(currentValues).map(([key, val]) => `- ${key}: ${val}`).join('\n')}

Only update fields that have NEW information in the transcription. Don't repeat existing values.

Return ONLY the JSON object, no other text.`;

    const userPrompt = `Transcription: "${transcription}"`;

    // Call AI to parse
    const { text } = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent parsing
    });

    console.log('[Voice-to-Form] AI Response:', text);

    // Parse JSON response
    let result;
    try {
      // Try to extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('[Voice-to-Form] Failed to parse AI response:', parseError);
      // Return empty result on parse failure
      result = {
        field_updates: {},
        unstructured_notes: []
      };
    }

    return Response.json(result);
  } catch (error) {
    console.error('[Voice-to-Form] Error:', error);
    return Response.json(
      { error: 'Failed to parse transcription' },
      { status: 500 }
    );
  }
}

