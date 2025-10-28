import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/instances/[id]
 * Get instance details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: instance, error } = await supabase
      .from('form_instances')
      .select(`
        *,
        form:simple_forms(id, title, description, schema),
        cadence:form_cadences(id, name, schedule_config),
        submission:simple_form_submissions(id, data, submitted_at)
      `)
      .eq('id', id)
      .single();

    if (error || !instance) {
      console.error('Error fetching instance:', error);
      return NextResponse.json(
        { error: 'Instance not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ instance });
  } catch (error: any) {
    console.error('Error in GET /api/instances/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/instances/[id]
 * Update instance (start, complete, skip, etc.)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, submission_id, metadata } = body;

    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    const updates: any = {};

    switch (action) {
      case 'start':
        updates.status = 'in_progress';
        updates.started_at = new Date().toISOString();
        if (user) {
          updates.metadata = { ...metadata, started_by: user.id };
        }
        break;

      case 'complete':
        if (!submission_id) {
          return NextResponse.json(
            { error: 'submission_id required for complete action' },
            { status: 400 }
          );
        }
        updates.status = 'completed';
        updates.completed_at = new Date().toISOString();
        updates.submission_id = submission_id;
        if (user) {
          updates.completed_by = user.id;
        }
        break;

      case 'skip':
        updates.status = 'skipped';
        if (metadata?.skip_reason) {
          updates.metadata = { ...metadata };
        }
        break;

      case 'reset':
        // Reset back to ready state
        updates.status = 'ready';
        updates.started_at = null;
        updates.completed_at = null;
        updates.completed_by = null;
        updates.submission_id = null;
        break;

      default:
        // Allow arbitrary updates
        if (body.status) updates.status = body.status;
        if (body.metadata) updates.metadata = body.metadata;
        if (body.assigned_to) updates.assigned_to = body.assigned_to;
        break;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No updates to apply' },
        { status: 400 }
      );
    }

    const { data: instance, error } = await supabase
      .from('form_instances')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !instance) {
      console.error('Error updating instance:', error);
      return NextResponse.json(
        { error: 'Failed to update instance', details: error?.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      instance
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/instances/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

