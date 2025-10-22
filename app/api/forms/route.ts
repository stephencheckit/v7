import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * POST /api/forms - Create a new form
 * Body: { title, description, schema }
 * Returns: { id, shareUrl, form }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, schema } = body;

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

    // Insert form into database
    const { data, error } = await supabase
      .from('simple_forms')
      .insert({
        id: formId,
        title,
        description: description || '',
        schema,
      })
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
 * GET /api/forms - List all forms
 * Query params: limit (default 50), offset (default 0)
 * Returns: { forms: [...], total }
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get forms with submission stats
    const { data: forms, error, count } = await supabase
      .from('simple_forms')
      .select('*, simple_form_stats(*)', { count: 'exact' })
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


