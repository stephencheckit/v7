import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * POST /api/forms/:id/submit - Submit form response
 * Body: { data: { field1: value1, field2: value2, ... } }
 * Returns: { success, submissionId }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: formId } = await params;
    const body = await req.json();
    const { data: submissionData } = body;

    if (!submissionData || typeof submissionData !== 'object') {
      return NextResponse.json(
        { error: 'Submission data is required' },
        { status: 400 }
      );
    }

    // Verify form exists
    const { data: form, error: formError } = await supabase
      .from('simple_forms')
      .select('id')
      .eq('id', formId)
      .single();

    if (formError || !form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    // Insert submission
    const { data: submission, error: submissionError } = await supabase
      .from('simple_form_submissions')
      .insert({
        form_id: formId,
        data: submissionData,
      })
      .select()
      .single();

    if (submissionError) {
      console.error('Supabase error:', submissionError);
      return NextResponse.json(
        { error: 'Failed to submit form' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      message: 'Form submitted successfully!',
    });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


