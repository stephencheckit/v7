/**
 * Reverse Engineer Questions API
 * Analyzes voice commentary patterns and suggests new form questions
 */

import { createClient } from '@/lib/supabase/server';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

export const runtime = 'edge';
export const maxDuration = 25;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspace_id, days = 30 } = await req.json();

    if (!workspace_id) {
      return Response.json({ error: 'workspace_id required' }, { status: 400 });
    }

    console.log('[Reverse Engineer] Analyzing commentary for workspace:', workspace_id);

    // Fetch recent commentary (last 30 days)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data: commentary, error: fetchError } = await supabase
      .from('inspection_commentary')
      .select('*')
      .eq('workspace_id', workspace_id)
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('[Reverse Engineer] Fetch error:', fetchError);
      return Response.json({ error: fetchError.message }, { status: 500 });
    }

    if (!commentary || commentary.length === 0) {
      console.log('[Reverse Engineer] No commentary found');
      return Response.json({ suggestions: [] });
    }

    console.log('[Reverse Engineer] Analyzing', commentary.length, 'commentary entries');

    // Prepare commentary for AI analysis
    const commentaryText = commentary
      .map((c: any, idx: number) => `${idx + 1}. "${c.raw_transcription}"`)
      .join('\n\n');

    // AI Prompt for pattern analysis
    const systemPrompt = `You are an AI assistant that analyzes workplace inspection commentary to identify recurring themes and suggest standardized form questions.

Your task is to:
1. Identify patterns and recurring themes across multiple inspections
2. Suggest new form questions that would capture this information systematically
3. Focus on operational, safety, compliance, and quality issues

## Analysis Guidelines

- Look for issues mentioned multiple times (equipment problems, safety hazards, supply needs)
- Look for positive patterns (training effectiveness, employee performance)
- Consider what would be valuable to track systematically
- Suggest practical, actionable questions

## Output Format

Return JSON array with this structure:
[
  {
    "suggested_question": "Clear, concise question text",
    "suggested_type": "single-text|multiple-choice|binary|number|date",
    "suggested_options": ["Option 1", "Option 2", ...], // Only for multiple-choice
    "pattern_source": "Brief description of the pattern observed",
    "occurrence_count": <number of times this pattern appeared>
  }
]

### Field Type Selection:
- **binary**: Yes/No questions (e.g., "Is equipment operational?")
- **multiple-choice**: 3-5 specific options (e.g., "Floor mat condition: Good / Worn / Torn / Missing")
- **single-text**: Open-ended responses (e.g., "Employee observations")
- **number**: Numeric values (e.g., "Days since last maintenance")
- **date**: Date values

### Quality Criteria:
- Questions should be clear and specific
- Options should cover common scenarios
- Focus on high-impact patterns (mentioned 3+ times)
- Prioritize safety, compliance, and operational efficiency

Return ONLY the JSON array, no other text.`;

    const userPrompt = `Analyze these ${commentary.length} inspection commentary entries from the last ${days} days and suggest standardized form questions:

${commentaryText}`;

    // Call AI to analyze patterns
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
      temperature: 0.4,
    });

    console.log('[Reverse Engineer] AI Response:', text);

    // Parse suggestions
    let suggestions: any[] = [];
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON array found in response');
      }
    } catch (parseError) {
      console.error('[Reverse Engineer] Failed to parse AI response:', parseError);
      return Response.json({ suggestions: [] });
    }

    console.log('[Reverse Engineer] Found', suggestions.length, 'suggestions');

    // Store suggestions in database
    if (suggestions.length > 0) {
      const suggestionsToInsert = suggestions.map((s: any) => ({
        workspace_id,
        suggested_question: s.suggested_question,
        suggested_type: s.suggested_type,
        suggested_options: s.suggested_options || null,
        pattern_source: s.pattern_source,
        occurrence_count: s.occurrence_count || 1,
        status: 'pending'
      }));

      const { error: insertError } = await supabase
        .from('suggested_form_questions')
        .insert(suggestionsToInsert);

      if (insertError) {
        console.error('[Reverse Engineer] Insert error:', insertError);
        // Continue even if insert fails - return suggestions anyway
      } else {
        console.log('[Reverse Engineer] ✅ Stored', suggestions.length, 'suggestions');
      }
    }

    return Response.json({
      suggestions,
      analyzed_commentary_count: commentary.length
    });
  } catch (error) {
    console.error('[Reverse Engineer] Error:', error);
    return Response.json(
      { error: 'Failed to analyze commentary' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve existing suggestions
export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspace_id = searchParams.get('workspace_id');
    const status = searchParams.get('status') || 'pending';

    if (!workspace_id) {
      return Response.json({ error: 'workspace_id required' }, { status: 400 });
    }

    const { data: suggestions, error: fetchError } = await supabase
      .from('suggested_form_questions')
      .select('*')
      .eq('workspace_id', workspace_id)
      .eq('status', status)
      .order('occurrence_count', { ascending: false })
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('[Reverse Engineer] Fetch error:', fetchError);
      return Response.json({ error: fetchError.message }, { status: 500 });
    }

    return Response.json({
      suggestions: suggestions || []
    });
  } catch (error) {
    console.error('[Reverse Engineer] Error:', error);
    return Response.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}

