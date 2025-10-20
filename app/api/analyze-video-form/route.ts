/**
 * Video Form Analysis API - OpenAI Vision Integration
 * Analyzes video snapshots and attempts to answer form questions
 */

// Configure function timeout for AI operations
export const runtime = 'edge';
export const maxDuration = 25;

export async function POST(req: Request) {
  try {
    const { image, questions } = await req.json();

    if (!image || !questions || !Array.isArray(questions)) {
      return Response.json({ error: 'Invalid request: missing image or questions' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Build detailed prompt for OpenAI Vision
    const questionsList = questions
      .map((q, idx) => {
        let questionText = `${idx + 1}. "${q.label}" (ID: ${q.id}, Type: ${q.type})`;
        if (q.options && q.options.length > 0) {
          questionText += `\n   Options: ${q.options.map((opt: any) => opt.label || opt).join(', ')}`;
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
6. If you cannot see clear evidence or are less than 80% confident, respond with null

QUESTIONS TO ANSWER:
${questionsList}

Respond ONLY with valid JSON in this exact format:
{
  "answers": {
    "question_id": "answer" | null
  },
  "confidence": {
    "question_id": 95
  }
}

Rules for confidence scores:
- 95-100: Absolutely certain, clear visual evidence
- 85-94: Very confident, good evidence
- 80-84: Confident enough to answer
- Below 80: Do NOT answer (set to null)

Example response:
{
  "answers": {
    "proper_uniforms": "Yes",
    "hand_washing": null,
    "temperature": "42"
  },
  "confidence": {
    "proper_uniforms": 92,
    "hand_washing": 45,
    "temperature": 88
  }
}`;

    console.log('[analyze-video-form] Sending request to OpenAI Vision...');
    console.log('[analyze-video-form] Questions count:', questions.length);

    // Call OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Latest model with vision capabilities
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${image}`,
                  detail: 'high' // Use high detail for better analysis
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.1 // Low temperature for more consistent responses
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[analyze-video-form] OpenAI API error:', errorText);
      return Response.json({ error: 'OpenAI API error', details: errorText }, { status: response.status });
    }

    const data = await response.json();
    console.log('[analyze-video-form] OpenAI response received');

    const aiContent = data.choices[0].message.content;
    
    // Parse AI response - handle potential markdown code blocks
    let aiResponse;
    try {
      // Remove markdown code blocks if present
      const jsonMatch = aiContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : aiContent;
      aiResponse = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('[analyze-video-form] Failed to parse AI response:', aiContent);
      return Response.json({ error: 'Invalid AI response format' }, { status: 500 });
    }

    // Filter out low confidence answers (below 80%)
    const filteredAnswers: Record<string, any> = {};
    const confidenceScores: Record<string, number> = {};

    if (aiResponse.answers && aiResponse.confidence) {
      Object.entries(aiResponse.answers).forEach(([id, answer]) => {
        const confidence = aiResponse.confidence[id];
        confidenceScores[id] = confidence;
        
        if (confidence >= 80 && answer !== null) {
          filteredAnswers[id] = answer;
        }
      });
    }

    console.log('[analyze-video-form] Filtered answers:', Object.keys(filteredAnswers).length, 'of', questions.length);

    return Response.json({
      answers: filteredAnswers,
      confidence: confidenceScores,
      totalQuestions: questions.length,
      answeredQuestions: Object.keys(filteredAnswers).length
    });

  } catch (error) {
    console.error('[analyze-video-form] Error:', error);
    return Response.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

