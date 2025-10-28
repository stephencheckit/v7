import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateSummary } from '@/lib/ai/summary-generator';
import { DerivativeSummaryRequest } from '@/lib/types/summary';

// PATCH /api/summaries/[id]/regenerate - Regenerate existing summary (in-place refresh)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get existing summary
    const { data: summary, error: fetchError } = await supabase
      .from('summary_reports')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError || !summary) {
      return NextResponse.json({ error: 'Summary not found' }, { status: 404 });
    }

    // Set status to generating
    await supabase
      .from('summary_reports')
      .update({ status: 'generating' })
      .eq('id', params.id);

    // Regenerate with existing config
    generateSummary(
      summary.id, 
      summary.cadence_ids || [], 
      summary.form_ids || [], 
      summary.filter_config || {},
      summary.user_commentary
    ).catch(error => console.error('Error regenerating summary:', error));

    return NextResponse.json({ 
      message: 'Regeneration started',
      summary: { ...summary, status: 'generating' }
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error in PATCH /api/summaries/[id]/regenerate:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

// POST /api/summaries/[id]/regenerate - Create derivative summary
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: DerivativeSummaryRequest = await req.json();
    const { user_commentary, filter_config, name } = body;

    // Get parent summary
    const { data: parentSummary, error: fetchError } = await supabase
      .from('summary_reports')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError || !parentSummary) {
      return NextResponse.json({ error: 'Parent summary not found' }, { status: 404 });
    }

    // Create derivative summary with same date range but potentially different filters
    const derivativeName = name || `${parentSummary.name} (Filtered)`;
    const mergedFilterConfig = { ...parentSummary.filter_config, ...filter_config };

    const { data: newSummary, error: insertError } = await supabase
      .from('summary_reports')
      .insert({
        workspace_id: parentSummary.workspace_id,
        name: derivativeName,
        description: user_commentary ? `Filtered view with commentary: ${user_commentary}` : parentSummary.description,
        date_range_start: parentSummary.date_range_start,
        date_range_end: parentSummary.date_range_end,
        cadence_ids: filter_config?.cadence_filter || parentSummary.cadence_ids,
        filter_config: mergedFilterConfig,
        schedule_type: 'manual',
        status: 'generating',
        recipients: parentSummary.recipients,
        notify_users: parentSummary.notify_users,
        parent_summary_id: params.id,
        user_commentary,
        created_by: user.id
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating derivative summary:', insertError);
      return NextResponse.json({ error: 'Failed to create derivative summary', details: insertError.message }, { status: 500 });
    }

    // Update cadences if filter changed them
    const cadenceIds = filter_config?.cadence_filter || parentSummary.cadence_ids;
    for (const cadenceId of cadenceIds) {
      const { data: cadence } = await supabase
        .from('form_cadences')
        .select('included_in_summaries')
        .eq('id', cadenceId)
        .single();
      
      if (cadence) {
        const currentSummaries = cadence.included_in_summaries || [];
        if (!currentSummaries.includes(newSummary.id)) {
          await supabase
            .from('form_cadences')
            .update({
              included_in_summaries: [...currentSummaries, newSummary.id]
            })
            .eq('id', cadenceId);
        }
      }
    }

    // Trigger AI generation with commentary context
    const newFormIds = filter_config?.form_filter || parentSummary.form_ids || [];
    generateSummary(newSummary.id, cadenceIds, newFormIds, mergedFilterConfig, user_commentary)
      .catch(error => console.error('Error generating derivative summary:', error));

    return NextResponse.json({ summary: newSummary }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/summaries/[id]/regenerate:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

