import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateInstancesForCadence } from '@/lib/cadences/generator';
import { FormCadence } from '@/lib/types/cadence';

/**
 * POST /api/cron/generate-instances
 * 
 * Cron job that runs hourly to generate upcoming form instances
 * Protected by CRON_SECRET environment variable
 */
export async function GET(req: NextRequest) {
  try {
    // Verify this is a legitimate Vercel Cron request
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Allow Vercel Cron (which doesn't send auth headers) OR manual requests with CRON_SECRET
    const isVercelCron = req.headers.get('user-agent')?.includes('vercel-cron');
    const isAuthorizedManual = cronSecret && authHeader === `Bearer ${cronSecret}`;

    if (!isVercelCron && !isAuthorizedManual) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔄 Starting instance generation cron job...');

    const supabase = await createClient();

    // Fetch all active cadences
    const { data: cadences, error } = await supabase
      .from('form_cadences')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching cadences:', error);
      return NextResponse.json(
        { error: 'Failed to fetch cadences', details: error.message },
        { status: 500 }
      );
    }

    if (!cadences || cadences.length === 0) {
      console.log('No active cadences found');
      return NextResponse.json({
        success: true,
        message: 'No active cadences to process',
        processed: 0,
        generated: 0
      });
    }

    console.log(`📋 Found ${cadences.length} active cadences`);

    let totalGenerated = 0;
    const results = [];

    // Generate instances for each cadence
    for (const cadence of cadences) {
      try {
        const instances = await generateInstancesForCadence(
          cadence as FormCadence,
          48 // Look ahead 48 hours
        );

        totalGenerated += instances.length;
        results.push({
          cadence_id: cadence.id,
          cadence_name: cadence.name,
          instances_generated: instances.length
        });

        console.log(`✅ Generated ${instances.length} instances for: ${cadence.name}`);
      } catch (genError: any) {
        console.error(`❌ Error generating instances for ${cadence.name}:`, genError);
        results.push({
          cadence_id: cadence.id,
          cadence_name: cadence.name,
          error: genError.message
        });
      }
    }

    console.log(`✅ Cron job complete. Total instances generated: ${totalGenerated}`);

    return NextResponse.json({
      success: true,
      processed: cadences.length,
      generated: totalGenerated,
      results
    });
  } catch (error: any) {
    console.error('Error in generate-instances cron:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggering
export async function POST(req: NextRequest) {
  return GET(req);
}

