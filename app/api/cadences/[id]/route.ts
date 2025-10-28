import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { FormCadence } from '@/lib/types/cadence';

/**
 * GET /api/cadences/[id]
 * Get a single cadence by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: cadence, error } = await supabase
      .from('form_cadences')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !cadence) {
      console.error('Error fetching cadence:', error);
      return NextResponse.json(
        { error: 'Cadence not found' },
        { status: 404 }
      );
    }

    // Also get associated form details
    const { data: form } = await supabase
      .from('simple_forms')
      .select('id, title, description')
      .eq('id', cadence.form_id)
      .single();

    // Get instance stats for this cadence
    const { data: stats } = await supabase
      .from('v_cadence_stats')
      .select('*')
      .eq('cadence_id', id)
      .single();

    return NextResponse.json({
      cadence,
      form,
      stats: stats || {
        total_instances: 0,
        completed_count: 0,
        missed_count: 0,
        ready_count: 0,
        completion_rate: 0
      }
    });
  } catch (error: any) {
    console.error('Error in GET /api/cadences/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/cadences/[id]
 * Update a cadence
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const {
      name,
      description,
      schedule_config,
      trigger_config,
      notification_config,
      assigned_to,
      is_active
    } = body;

    const supabase = await createClient();

    // Build update object with only provided fields
    const updates: any = {};
    
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (schedule_config !== undefined) updates.schedule_config = schedule_config;
    if (trigger_config !== undefined) updates.trigger_config = trigger_config;
    if (notification_config !== undefined) updates.notification_config = notification_config;
    if (assigned_to !== undefined) updates.assigned_to = assigned_to;
    if (is_active !== undefined) updates.is_active = is_active;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const { data: cadence, error } = await supabase
      .from('form_cadences')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !cadence) {
      console.error('Error updating cadence:', error);
      return NextResponse.json(
        { error: 'Failed to update cadence', details: error?.message },
        { status: 500 }
      );
    }

    // If cadence was disabled, delete all future instances (keep past ones for history)
    if (is_active === false) {
      const now = new Date().toISOString();
      const { error: deleteError } = await supabase
        .from('form_instances')
        .delete()
        .eq('cadence_id', id)
        .gt('scheduled_for', now); // Only delete future instances

      if (deleteError) {
        console.error('Error deleting future instances:', deleteError);
        // Don't fail the request, just log the error
      } else {
        console.log(`🗑️  Deleted future instances for disabled cadence: ${id}`);
      }
    }

    return NextResponse.json({
      success: true,
      cadence
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/cadences/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cadences/[id]
 * Delete a cadence (and optionally its instances)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const deleteInstances = searchParams.get('delete_instances') === 'true';

    const supabase = await createClient();

    if (deleteInstances) {
      // Delete all instances for this cadence
      const { error: instancesError } = await supabase
        .from('form_instances')
        .delete()
        .eq('cadence_id', id);

      if (instancesError) {
        console.error('Error deleting instances:', instancesError);
        // Continue anyway
      }
    } else {
      // Just unlink instances from cadence
      const { error: unlinkError } = await supabase
        .from('form_instances')
        .update({ cadence_id: null })
        .eq('cadence_id', id);

      if (unlinkError) {
        console.error('Error unlinking instances:', unlinkError);
        // Continue anyway
      }
    }

    // Delete the cadence
    const { error } = await supabase
      .from('form_cadences')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting cadence:', error);
      return NextResponse.json(
        { error: 'Failed to delete cadence', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cadence deleted successfully'
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/cadences/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

