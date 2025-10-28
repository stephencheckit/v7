import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { getUserWorkspaceId } from '@/lib/workspace-helper';
import { apiRateLimit, getClientIdentifier, checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

/**
 * GET /api/forms/[id] - Get a single form by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Create Supabase client at request time
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: form, error } = await supabase
      .from('simple_forms')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ form });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/forms/[id] - Update a form
 * Rate limited: 100 requests per minute per user
 * Workspace verified: User can only update forms in their workspace
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Create Supabase client at request time
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get authenticated user's workspace
    const workspaceId = await getUserWorkspaceId();
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Unauthorized - no workspace found' },
        { status: 401 }
      );
    }

    // Apply rate limiting
    const serverSupabase = await createServerClient();
    const { data: { user } } = await serverSupabase.auth.getUser();
    const identifier = getClientIdentifier(req, user?.id);
    const rateLimitResult = await checkRateLimit(apiRateLimit, identifier);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please slow down.',
          reset: rateLimitResult.reset
        },
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult)
        }
      );
    }

    // Verify workspace ownership before allowing update
    const { data: existingForm, error: fetchError } = await supabase
      .from('simple_forms')
      .select('workspace_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingForm) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    if (existingForm.workspace_id !== workspaceId) {
      return NextResponse.json(
        { error: 'Unauthorized - you do not have permission to update this form' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, description, schema, status, ai_vision_enabled, thank_you_settings } = body;

    if (!title || !schema) {
      return NextResponse.json(
        { error: 'Title and schema are required' },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: any = {
      title,
      description: description || '',
      schema,
      updated_at: new Date().toISOString(),
    };

    // Update AI Vision setting if provided
    if (ai_vision_enabled !== undefined) {
      updateData.ai_vision_enabled = ai_vision_enabled;
    }

    // Only update status if provided and valid
    if (status && (status === 'draft' || status === 'published')) {
      updateData.status = status;
    }

    // Update thank you settings if provided
    if (thank_you_settings) {
      updateData.thank_you_settings = thank_you_settings;
    }

    const { data, error } = await supabase
      .from('simple_forms')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to update form' },
        { status: 500 }
      );
    }

    // Get app URL from environment or construct from request
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    const shareUrl = `${appUrl}/f/${id}`;

    return NextResponse.json({
      success: true,
      id,
      shareUrl,
      form: data,
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/forms/[id] - Partially update a form (for quick updates like title)
 * Rate limited: 100 requests per minute per user
 * Workspace verified: User can only update forms in their workspace
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Create Supabase client at request time
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get authenticated user's workspace
    const workspaceId = await getUserWorkspaceId();
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Unauthorized - no workspace found' },
        { status: 401 }
      );
    }

    // Apply rate limiting
    const serverSupabase = await createServerClient();
    const { data: { user } } = await serverSupabase.auth.getUser();
    const identifier = getClientIdentifier(req, user?.id);
    const rateLimitResult = await checkRateLimit(apiRateLimit, identifier);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please slow down.',
          reset: rateLimitResult.reset
        },
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult)
        }
      );
    }

    // Verify workspace ownership before allowing update
    const { data: existingForm, error: fetchError } = await supabase
      .from('simple_forms')
      .select('workspace_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingForm) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    if (existingForm.workspace_id !== workspaceId) {
      return NextResponse.json(
        { error: 'Unauthorized - you do not have permission to update this form' },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Add any provided fields
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.schema !== undefined) updateData.schema = body.schema;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.ai_vision_enabled !== undefined) updateData.ai_vision_enabled = body.ai_vision_enabled;
    if (body.thank_you_settings !== undefined) updateData.thank_you_settings = body.thank_you_settings;

    const { data, error } = await supabase
      .from('simple_forms')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to update form' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      form: data,
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/forms/[id] - Delete a form
 * Rate limited: 100 requests per minute per user
 * Workspace verified: User can only delete forms in their workspace
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Create Supabase client at request time
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get authenticated user's workspace
    const workspaceId = await getUserWorkspaceId();
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Unauthorized - no workspace found' },
        { status: 401 }
      );
    }

    // Apply rate limiting
    const serverSupabase = await createServerClient();
    const { data: { user } } = await serverSupabase.auth.getUser();
    const identifier = getClientIdentifier(req, user?.id);
    const rateLimitResult = await checkRateLimit(apiRateLimit, identifier);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please slow down.',
          reset: rateLimitResult.reset
        },
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult)
        }
      );
    }

    // Verify workspace ownership before allowing deletion
    const { data: existingForm, error: fetchError } = await supabase
      .from('simple_forms')
      .select('workspace_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingForm) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    if (existingForm.workspace_id !== workspaceId) {
      return NextResponse.json(
        { error: 'Unauthorized - you do not have permission to delete this form' },
        { status: 403 }
      );
    }

    // Delete the form (this will cascade delete submissions due to FK constraint)
    const { error } = await supabase
      .from('simple_forms')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to delete form' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Form deleted successfully',
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
