import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SummaryReport, CreateSummaryFormData } from '@/lib/types/summary';
import { generateSummary } from '@/lib/ai/summary-generator';

// GET /api/summaries - List summaries for workspace
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const workspace_id = searchParams.get('workspace_id');
    const status = searchParams.get('status');
    
    if (!workspace_id) {
      return NextResponse.json({ error: 'workspace_id is required' }, { status: 400 });
    }

    let query = supabase
      .from('summary_reports')
      .select('*')
      .eq('workspace_id', workspace_id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: summaries, error } = await query;

    if (error) {
      console.error('Error fetching summaries:', error);
      return NextResponse.json({ error: 'Failed to fetch summaries', details: error.message }, { status: 500 });
    }

    // Return empty array if no summaries found
    return NextResponse.json({ summaries: summaries || [] });
  } catch (error: any) {
    console.error('Error in GET /api/summaries:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

// POST /api/summaries - Create new summary
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateSummaryFormData = await req.json();
    
    const {
      name,
      description,
      date_range_start,
      date_range_end,
      cadence_ids,
      filter_config,
      schedule_type,
      schedule_config,
      recipients,
      notify_users,
      generate_now
    } = body;

    // Validation
    if (!name || !date_range_start || !date_range_end || !cadence_ids || cadence_ids.length === 0) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, date_range_start, date_range_end, cadence_ids' 
      }, { status: 400 });
    }

    // Get workspace_id from first cadence
    const { data: cadence } = await supabase
      .from('form_cadences')
      .select('workspace_id')
      .eq('id', cadence_ids[0])
      .single();

    if (!cadence) {
      return NextResponse.json({ error: 'Cadence not found' }, { status: 404 });
    }

    const workspace_id = cadence.workspace_id;

    // Calculate next_run_at for scheduled summaries
    let next_run_at = null;
    if (schedule_type === 'one_time' && schedule_config?.scheduled_at) {
      next_run_at = schedule_config.scheduled_at;
    } else if (schedule_type === 'recurring' && schedule_config) {
      // Calculate next occurrence based on frequency
      next_run_at = calculateNextRun(schedule_config);
    }

    // Create summary record
    const { data: summary, error: insertError } = await supabase
      .from('summary_reports')
      .insert({
        workspace_id,
        name,
        description,
        date_range_start,
        date_range_end,
        cadence_ids,
        filter_config: filter_config || {},
        schedule_type,
        schedule_config: schedule_config || null,
        next_run_at,
        status: generate_now ? 'generating' : (schedule_type === 'manual' ? 'draft' : 'scheduled'),
        recipients: recipients || [],
        notify_users: notify_users !== false,
        created_by: user.id
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating summary:', insertError);
      return NextResponse.json({ error: 'Failed to create summary', details: insertError.message }, { status: 500 });
    }

    // Update cadences with summary inclusion
    for (const cadenceId of cadence_ids) {
      const { error: updateError } = await supabase.rpc('array_append_unique', {
        table_name: 'form_cadences',
        id: cadenceId,
        column_name: 'included_in_summaries',
        new_value: summary.id
      });

      // Fallback if RPC doesn't exist
      if (updateError) {
        await supabase
          .from('form_cadences')
          .update({
            included_in_summaries: supabase.raw(`
              CASE 
                WHEN included_in_summaries @> '"${summary.id}"'::jsonb 
                THEN included_in_summaries
                ELSE included_in_summaries || '"${summary.id}"'::jsonb
              END
            `)
          })
          .eq('id', cadenceId);
      }
    }

    // If generate_now, trigger AI generation
    if (generate_now) {
      // Run in background - don't await
      generateSummary(summary.id, cadence_ids, filter_config || {})
        .catch(error => console.error('Error generating summary:', error));
    }

    return NextResponse.json({ summary }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/summaries:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

function calculateNextRun(schedule_config: any): string {
  const now = new Date();
  const { frequency, time = '09:00', day_of_week, day_of_month } = schedule_config;
  const [hours, minutes] = time.split(':').map(Number);

  let nextRun = new Date(now);
  nextRun.setHours(hours, minutes, 0, 0);

  switch (frequency) {
    case 'daily':
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      break;
    case 'weekly':
      const targetDay = day_of_week || 1; // Default Monday
      while (nextRun.getDay() !== targetDay || nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      break;
    case 'monthly':
      const targetDate = day_of_month || 1;
      nextRun.setDate(targetDate);
      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1);
      }
      break;
  }

  return nextRun.toISOString();
}

