import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateSummary } from '@/lib/ai/summary-generator';
import { DerivativeSummaryRequest } from '@/lib/types/summary';

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
      await supabase
        .from('form_cadences')
        .update({
          included_in_summaries: supabase.raw(`
            CASE 
              WHEN included_in_summaries @> '"${newSummary.id}"'::jsonb 
              THEN included_in_summaries
              ELSE included_in_summaries || '"${newSummary.id}"'::jsonb
            END
          `)
        })
        .eq('id', cadenceId);
    }

    // Trigger AI generation with commentary context
    generateSummary(newSummary.id, cadenceIds, mergedFilterConfig, user_commentary)
      .catch(error => console.error('Error generating derivative summary:', error));

    return NextResponse.json({ summary: newSummary }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/summaries/[id]/regenerate:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

