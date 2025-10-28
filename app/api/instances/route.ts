import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/instances
 * List instances with filters
 * 
 * Query params:
 * - workspace_id (required)
 * - status (optional): pending, ready, in_progress, completed, missed, skipped
 * - form_id (optional)
 * - cadence_id (optional)
 * - start_date (optional): ISO date
 * - end_date (optional): ISO date
 * - limit (optional): default 100
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspace_id = searchParams.get('workspace_id');
    const status = searchParams.get('status');
    const form_id = searchParams.get('form_id');
    const cadence_id = searchParams.get('cadence_id');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '100');
    const view = searchParams.get('view'); // 'calendar' for calendar data

    if (!workspace_id) {
      return NextResponse.json(
        { error: 'workspace_id is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    let query = supabase
      .from('form_instances')
      .select(`
        *,
        form:simple_forms(id, title),
        cadence:form_cadences(id, name)
      `)
      .eq('workspace_id', workspace_id);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (form_id) {
      query = query.eq('form_id', form_id);
    }

    if (cadence_id) {
      query = query.eq('cadence_id', cadence_id);
    }

    if (start_date) {
      query = query.gte('scheduled_for', start_date);
    }

    if (end_date) {
      query = query.lte('scheduled_for', end_date);
    }

    query = query
      .order('scheduled_for', { ascending: true })
      .limit(limit);

    const { data: instances, error } = await query;

    if (error) {
      console.error('Error fetching instances:', error);
      
      // Check if table doesn't exist
      if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: 'Database tables not yet created. Please apply the migration: supabase/migrations/20251028000000_create_form_cadences.sql',
            details: error.message,
            events: [],
            count: 0
          },
          { status: 200 } // Return 200 with empty data instead of 500
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch instances', details: error.message },
        { status: 500 }
      );
    }

    // If calendar view, transform data for calendar component
    if (view === 'calendar') {
      const events = (instances || []).map(instance => ({
        id: instance.id,
        title: instance.instance_name,
        start: instance.scheduled_for,
        end: instance.due_at,
        status: instance.status,
        formId: instance.form_id,
        instanceId: instance.id,
        cadenceId: instance.cadence_id,
        resource: {
          formTitle: instance.form?.title,
          cadenceName: instance.cadence?.name
        }
      }));

      return NextResponse.json({
        events,
        count: events.length
      });
    }

    return NextResponse.json({
      instances: instances || [],
      count: instances?.length || 0
    });
  } catch (error: any) {
    console.error('Error in GET /api/instances:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

