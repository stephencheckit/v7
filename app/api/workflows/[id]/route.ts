import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    const { data: workflow, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', params.id)
      .single();
      
    if (error) {
      console.error('Supabase error fetching workflow:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }
    
    return NextResponse.json({ workflow });
  } catch (error) {
    console.error('Error in GET /api/workflows/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const identifier = req.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitResult = await checkRateLimit(identifier);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }
    
    const body = await req.json();
    const supabase = await createClient();
    
    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.trigger_type !== undefined) updateData.trigger_type = body.trigger_type;
    if (body.trigger_config !== undefined) updateData.trigger_config = body.trigger_config;
    if (body.actions !== undefined) updateData.actions = body.actions;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    
    const { data: workflow, error } = await supabase
      .from('workflows')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();
      
    if (error) {
      console.error('Supabase error updating workflow:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }
    
    return NextResponse.json({ workflow });
  } catch (error) {
    console.error('Error in PATCH /api/workflows/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const identifier = req.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitResult = await checkRateLimit(identifier);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }
    
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', params.id);
      
    if (error) {
      console.error('Supabase error deleting workflow:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/workflows/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

