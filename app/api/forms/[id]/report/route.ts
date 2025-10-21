import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/forms/:id/report - Generate basic report
 * Returns: {
 *   form: { title, description },
 *   stats: { total, lastSubmission },
 *   submissions: [...],
 *   fieldStats: [{ label, type, responses: [...] }]
 * }
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: formId } = await params;

    // Get form with stats
    const { data: form, error: formError } = await supabase
      .from('simple_forms')
      .select('*, simple_form_stats(*)')
      .eq('id', formId)
      .single();

    if (formError || !form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    // Get all submissions
    const { data: submissions, error: submissionsError } = await supabase
      .from('simple_form_submissions')
      .select('*')
      .eq('form_id', formId)
      .order('submitted_at', { ascending: false });

    if (submissionsError) {
      console.error('Supabase error:', submissionsError);
      return NextResponse.json(
        { error: 'Failed to fetch submissions' },
        { status: 500 }
      );
    }

    // Parse form schema
    const formSchema = form.schema;
    const fields = formSchema.fields || [];

    // Aggregate responses by field
    const fieldStats = fields.map((field: any) => {
      const fieldName = field.name || field.id;
      const responses = (submissions || []).map(s => s.data[fieldName]);
      
      // Count response frequency for choice fields
      const responseCounts: Record<string, number> = {};
      responses.forEach(response => {
        if (response !== undefined && response !== null) {
          const key = Array.isArray(response) ? response.join(', ') : String(response);
          responseCounts[key] = (responseCounts[key] || 0) + 1;
        }
      });

      return {
        fieldId: field.id,
        label: field.label,
        type: field.type,
        totalResponses: responses.filter(r => r !== undefined && r !== null).length,
        responseCounts,
        allResponses: responses,
      };
    });

    // Get stats
    const stats = form.simple_form_stats?.[0] || {
      total_submissions: submissions?.length || 0,
      last_submission_at: submissions?.[0]?.submitted_at || null,
    };

    return NextResponse.json({
      form: {
        id: form.id,
        title: form.title,
        description: form.description,
        created_at: form.created_at,
      },
      stats: {
        total: stats.total_submissions,
        lastSubmission: stats.last_submission_at,
      },
      submissions: submissions || [],
      fieldStats,
    });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


