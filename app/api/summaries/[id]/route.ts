import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateSummary } from '@/lib/ai/summary-generator';

// GET /api/summaries/[id] - Get summary details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: summary, error } = await supabase
      .from('summary_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching summary:', error);
      return NextResponse.json({ error: 'Failed to fetch summary', details: error.message }, { status: 500 });
    }

    if (!summary) {
      return NextResponse.json({ error: 'Summary not found' }, { status: 404 });
    }

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('Error in GET /api/summaries/[id]:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

// PATCH /api/summaries/[id] - Update summary
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await req.json();
    
    // Don't allow updating certain fields directly
    delete updates.id;
    delete updates.workspace_id;
    delete updates.created_by;
    delete updates.created_at;

    const { data: summary, error } = await supabase
      .from('summary_reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating summary:', error);
      return NextResponse.json({ error: 'Failed to update summary', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('Error in PATCH /api/summaries/[id]:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

// DELETE /api/summaries/[id] - Delete summary
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get summary to access cadence_ids before deletion
    const { data: summary } = await supabase
      .from('summary_reports')
      .select('cadence_ids')
      .eq('id', id)
      .single();

    if (summary) {
      // Remove from cadences' included_in_summaries
      for (const cadenceId of (summary.cadence_ids as string[])) {
        await supabase
          .from('form_cadences')
          .update({
            included_in_summaries: supabase.raw(`
              included_in_summaries - '"${id}"'::text
            `)
          })
          .eq('id', cadenceId);
      }
    }

    const { error } = await supabase
      .from('summary_reports')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting summary:', error);
      return NextResponse.json({ error: 'Failed to delete summary', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/summaries/[id]:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

