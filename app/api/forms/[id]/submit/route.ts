import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { submitRateLimit, getClientIdentifier, checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * POST /api/forms/:id/submit - Submit form response
 * Body: { data: { field1: value1, field2: value2, ... } }
 * Returns: { success, submissionId }
 * Rate limited: 10 submissions per hour per IP
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: formId } = await params;

    // Apply rate limiting (10 submissions per hour per IP)
    const identifier = getClientIdentifier(req);
    const rateLimitResult = await checkRateLimit(submitRateLimit, identifier);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          reset: rateLimitResult.reset
        },
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult)
        }
      );
    }

    const body = await req.json();
    const { data: submissionData, ai_metadata, is_preview } = body;

    if (!submissionData || typeof submissionData !== 'object') {
      return NextResponse.json(
        { error: 'Submission data is required' },
        { status: 400 }
      );
    }

    // Verify form exists
    const { data: form, error: formError } = await supabase
      .from('simple_forms')
      .select('id, schema')
      .eq('id', formId)
      .single();

    if (formError || !form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    // Extract and process signatures from submission data
    const signatures: any[] = [];
    const signatureAudit: any[] = [];
    
    if (form.schema?.fields) {
      form.schema.fields
        .filter((f: any) => f.type === 'signature')
        .forEach((field: any) => {
          const fieldName = field.name || field.id;
          if (submissionData[fieldName]) {
            const signatureData = submissionData[fieldName];
            signatures.push(signatureData);
            signatureAudit.push({
              timestamp: new Date().toISOString(),
              action: 'signature_captured',
              signatureId: signatureData.id,
              userId: signatureData.signedById || null,
              ipAddress: signatureData.ipAddress || 'unknown'
            });
          }
        });
    }

    // Insert submission with signatures
    const { data: submission, error: submissionError } = await supabase
      .from('simple_form_submissions')
      .insert({
        form_id: formId,
        data: submissionData,
        signatures: signatures.length > 0 ? signatures : [],
        signature_audit: signatureAudit.length > 0 ? signatureAudit : [],
        ai_metadata: ai_metadata || null,
        is_preview: is_preview || false,
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


