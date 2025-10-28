import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { FormCadence } from '@/lib/types/cadence';

/**
 * GET /api/cadences
 * List all cadences for a workspace
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspace_id = searchParams.get('workspace_id');
    const form_id = searchParams.get('form_id');
    const is_active = searchParams.get('is_active');

    if (!workspace_id) {
      return NextResponse.json(
        { error: 'workspace_id is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    let query = supabase
      .from('form_cadences')
      .select('*')
      .eq('workspace_id', workspace_id)
      .order('created_at', { ascending: false });

    // Apply optional filters
    if (form_id) {
      query = query.eq('form_id', form_id);
    }

    if (is_active !== null && is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }

    const { data: cadences, error } = await query;

    if (error) {
      console.error('Error fetching cadences:', error);
      return NextResponse.json(
        { error: 'Failed to fetch cadences' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      cadences: cadences || [],
      count: cadences?.length || 0
    });
  } catch (error: any) {
    console.error('Error in GET /api/cadences:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cadences
 * Create a new cadence
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      workspace_id,
      form_id,
      name,
      description,
      schedule_config,
      trigger_config,
      notification_config,
      assigned_to,
      is_active = true
    } = body;

    // Validation
    if (!workspace_id || !form_id || !name || !schedule_config) {
      return NextResponse.json(
        { error: 'Missing required fields: workspace_id, form_id, name, schedule_config' },
        { status: 400 }
      );
    }

    // Validate schedule_config has required fields
    if (!schedule_config.type || !schedule_config.pattern || !schedule_config.time || !schedule_config.timezone) {
      return NextResponse.json(
        { error: 'Invalid schedule_config: missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    const cadenceData = {
      workspace_id,
      form_id,
      name,
      description,
      schedule_config,
      trigger_config,
      notification_config: notification_config || {
        recipients: [],
        notify_on_ready: true,
        notify_on_missed: true,
        reminder_minutes_before_deadline: [60, 15]
      },
      assigned_to: assigned_to || [],
      is_active,
      created_by: user?.id
    };

    const { data: cadence, error } = await supabase
      .from('form_cadences')
      .insert(cadenceData)
      .select()
      .single();

    if (error) {
      console.error('Error creating cadence:', error);
      return NextResponse.json(
        { error: 'Failed to create cadence', details: error.message },
        { status: 500 }
      );
    }

    // Trigger initial instance generation
    // Note: This will be handled by the cron job, but we can optionally
    // generate the first few instances immediately
    try {
      const { generateInstancesForCadence } = await import('@/lib/cadences/generator');
      await generateInstancesForCadence(cadence as FormCadence, 336); // 14 days
    } catch (genError: any) {
      console.error('Error generating initial instances:', genError);
      // Don't fail the request if instance generation fails
    }

    return NextResponse.json({
      success: true,
      cadence
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/cadences:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

