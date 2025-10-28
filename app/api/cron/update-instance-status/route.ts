import { NextRequest, NextResponse } from 'next/server';
import { updateInstanceStatuses } from '@/lib/cadences/generator';

/**
 * GET /api/cron/update-instance-status
 * 
 * Cron job that runs every 5 minutes to update instance statuses
 * - pending → ready (when scheduled_for time arrives)
 * - ready/in_progress → missed (when due_at time passes)
 * 
 * Protected by CRON_SECRET environment variable
 */
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔄 Starting instance status update cron job...');

    await updateInstanceStatuses();

    console.log('✅ Instance status update complete');

    return NextResponse.json({
      success: true,
      message: 'Instance statuses updated successfully'
    });
  } catch (error: any) {
    console.error('Error in update-instance-status cron:', error);
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

