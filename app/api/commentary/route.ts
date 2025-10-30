/**
 * Commentary Storage API
 * Saves voice commentary from inspections to database
 */

import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, apiRateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    // Rate limiting
    const identifier = req.headers.get('x-forwarded-for') || 'anonymous';
    await checkRateLimit(apiRateLimit, identifier);

    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      workspace_id,
      form_id,
      submission_id,
      location,
      raw_transcription,
      extracted_insights
    } = await req.json();

    // Validate required fields
    if (!workspace_id || !form_id || !raw_transcription) {
      return Response.json(
        { error: 'Missing required fields: workspace_id, form_id, raw_transcription' },
        { status: 400 }
      );
    }

    console.log('[Commentary] Saving commentary for form:', form_id);
    console.log('[Commentary] Transcription length:', raw_transcription.length);

    // Insert commentary
    const { data: commentary, error: insertError } = await supabase
      .from('inspection_commentary')
      .insert({
        workspace_id,
        form_id,
        submission_id,
        inspector_id: user.id,
        location,
        raw_transcription,
        extracted_insights
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Commentary] Insert error:', insertError);
      return Response.json({ error: insertError.message }, { status: 500 });
    }

    console.log('[Commentary] ✅ Saved commentary:', commentary.id);

    return Response.json({
      success: true,
      commentary
    });
  } catch (error) {
    console.error('[Commentary] Error:', error);
    return Response.json(
      { error: 'Failed to save commentary' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query params
    const { searchParams } = new URL(req.url);
    const workspace_id = searchParams.get('workspace_id');
    const form_id = searchParams.get('form_id');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!workspace_id) {
      return Response.json({ error: 'workspace_id required' }, { status: 400 });
    }

    // Build query
    let query = supabase
      .from('inspection_commentary')
      .select('*')
      .eq('workspace_id', workspace_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (form_id) {
      query = query.eq('form_id', form_id);
    }

    const { data: commentary, error: fetchError } = await query;

    if (fetchError) {
      console.error('[Commentary] Fetch error:', fetchError);
      return Response.json({ error: fetchError.message }, { status: 500 });
    }

    return Response.json({
      commentary: commentary || []
    });
  } catch (error) {
    console.error('[Commentary] Error:', error);
    return Response.json(
      { error: 'Failed to fetch commentary' },
      { status: 500 }
    );
  }
}

