import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, apiRateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspace_id = searchParams.get('workspace_id');
    
    if (!workspace_id) {
      return NextResponse.json({ error: 'workspace_id required' }, { status: 400 });
    }
    
    const supabase = await createClient();
    
    const { data: workflows, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('workspace_id', workspace_id)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Supabase error fetching workflows:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ workflows: workflows || [] });
  } catch (error) {
    console.error('Error in GET /api/workflows:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('🔵 POST /api/workflows called');
    
    // Rate limiting
    const identifier = req.headers.get('x-forwarded-for') || 'anonymous';
    console.log('🔵 Checking rate limit for:', identifier);
    const rateLimitResult = await checkRateLimit(apiRateLimit, identifier);
    console.log('🔵 Rate limit result:', rateLimitResult);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }
    
    console.log('🔵 Parsing request body');
    const body = await req.json();
    console.log('✅ Received workflow creation request:', body);
    const { workspace_id, name, description, trigger_type, trigger_config, actions, is_active } = body;
    
    if (!workspace_id || !name || !trigger_type || !trigger_config || !actions) {
      console.error('Missing required fields:', { workspace_id, name, trigger_type, trigger_config, actions });
      return NextResponse.json(
        { error: 'Missing required fields: workspace_id, name, trigger_type, trigger_config, actions' },
        { status: 400 }
      );
    }
    
    console.log('🔵 Creating Supabase client');
    const supabase = await createClient();
    console.log('✅ Supabase client created');
    
    // Get current user
    console.log('🔵 Getting current user');
    const { data: { user } } = await supabase.auth.getUser();
    console.log('✅ Current user:', user?.id);
    
    if (!user) {
      console.error('❌ No user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('🔵 Inserting workflow into database');
    const { data: workflow, error } = await supabase
      .from('workflows')
      .insert({
        workspace_id,
        name,
        description: description || null,
        trigger_type,
        trigger_config,
        actions,
        is_active: is_active !== undefined ? is_active : true,
        created_by: user.id
      })
      .select()
      .single();
      
    console.log('🔵 Database insert result:', { workflow: !!workflow, error: !!error });
      
    if (error) {
      console.error('❌ Supabase error creating workflow:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log('✅ Workflow created successfully:', workflow?.id);
    return NextResponse.json({ workflow });
  } catch (error) {
    console.error('Error in POST /api/workflows:', error);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

