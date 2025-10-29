import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';
export const maxDuration = 25;

export async function POST(req: Request) {
  try {
    const { image, formSchema, currentValues } = await req.json();

    if (!image || !formSchema || !formSchema.fields) {
      return NextResponse.json(
        { error: 'Invalid request: missing image or formSchema' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Create OpenAI client at request time, not build time
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    // Build prompt with form schema
    const questionsList = formSchema.fields
      .map((field: any, idx: number) => {
        let questionText = `${idx + 1}. "${field.label}" (ID: ${field.id}, Type: ${field.type})`;
        if (field.options && field.options.length > 0) {
          questionText += `\n   Options: ${field.options.join(', ')}`;
        }
        return questionText;
      })
      .join('\n');

    const prompt = `You are analyzing a video snapshot to answer form inspection questions.

CRITICAL RULES:
1. ONLY answer if you can see CLEAR, DEFINITIVE evidence in the image
2. Use EXACTLY 80% as your confidence threshold - be strict
3. For Yes/No questions: answer "Yes" or "No" only if absolutely certain
4. For multiple choice: use the EXACT option text provided
5. For text fields: provide brief, factual descriptions only
6. If you cannot see clear evidence or are less than 80% confident, DO NOT include that field in your response

QUESTIONS TO ANSWER:
${questionsList}

CURRENT VALUES (skip if already filled):
${JSON.stringify(currentValues, null, 2)}

Respond ONLY with valid JSON in this exact format:
{
  "suggestions": {
    "field_id": {
      "value": "answer",
      "confidence": 0.85,
      "reasoning": "Brief explanation of what you see"
    }
  }
}

Only include fields where confidence >= 0.80. Omit fields you're unsure about.`;

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.2, // Lower temperature for more consistent responses
    });

    const content = response.choices[0]?.message?.content || '{}';
    
    // Parse AI response
    let suggestions = {};
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        suggestions = parsed.suggestions || {};
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('AI response was:', content);
    }

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    console.error('Vision API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


