import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserWorkspaceId } from '@/lib/workspace-helper';
import { nanoid } from 'nanoid';
import { apiRateLimit, getClientIdentifier, checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

/**
 * POST /api/forms - Create a new form (in authenticated user's workspace)
 * Body: { title, description, schema }
 * Returns: { id, shareUrl, form }
 * Rate limited: 100 requests per minute per user
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get user's workspace
    const workspaceId = await getUserWorkspaceId();
    
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Unauthorized - no workspace found' },
        { status: 401 }
      );
    }

    // Apply rate limiting (100 requests per minute per user)
    const { data: { user } } = await supabase.auth.getUser();
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

    const body = await req.json();
    const { title, description, schema, status, ai_vision_enabled, thank_you_settings } = body;

    if (!title || !schema) {
      return NextResponse.json(
        { error: 'Title and schema are required' },
        { status: 400 }
      );
    }

    // Generate short ID
    const formId = nanoid(8);
    
    // Get app URL from environment or construct from request
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    const shareUrl = `${appUrl}/f/${formId}`;

    // Build insert data with workspace_id
    const insertData: any = {
      id: formId,
      workspace_id: workspaceId,
      title,
      description: description || '',
      schema,
      ai_vision_enabled: ai_vision_enabled ?? false,
    };

    // Only set status if provided and valid
    if (status && (status === 'draft' || status === 'published')) {
      insertData.status = status;
    }

    // Add thank you settings if provided
    if (thank_you_settings) {
      insertData.thank_you_settings = thank_you_settings;
    }

    // Insert form into database
    const { data, error } = await supabase
      .from('simple_forms')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to create form',
          details: error.message,
          code: error.code,
          hint: error.hint,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: formId,
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
 * GET /api/forms - List all forms (filtered by workspace)
 * Query params: limit (default 50), offset (default 0)
 * Returns: { forms: [...], total }
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get user's workspace
    const workspaceId = await getUserWorkspaceId();
    
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Unauthorized - no workspace found' },
        { status: 401 }
      );
    }

    const { searchParams } = req.nextUrl;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get forms with submission stats for this workspace only
    const { data: forms, error, count } = await supabase
      .from('simple_forms')
      .select('*, simple_form_stats(*)', { count: 'exact' })
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch forms' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      forms: forms || [],
      total: count || 0,
    });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
