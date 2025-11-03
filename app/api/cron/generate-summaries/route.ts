import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateSummary } from '@/lib/ai/summary-generator';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max

// Cron job to generate scheduled summaries
export async function GET(req: NextRequest) {
  try {
    // Verify this is a legitimate Vercel Cron request
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Allow Vercel Cron (which doesn't send auth headers) OR manual requests with CRON_SECRET
    const isVercelCron = req.headers.get('user-agent')?.includes('vercel-cron');
    const isAuthorizedManual = cronSecret && authHeader === `Bearer ${cronSecret}`;

    if (!isVercelCron && !isAuthorizedManual) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const now = new Date().toISOString();

    // Fetch summaries that are due to run
    const { data: summaries, error } = await supabase
      .from('summary_reports')
      .select('*')
      .eq('status', 'scheduled')
      .lte('next_run_at', now)
      .order('next_run_at', { ascending: true });

    if (error) {
      console.error('Error fetching scheduled summaries:', error);
      return NextResponse.json({ error: 'Failed to fetch summaries' }, { status: 500 });
    }

    if (!summaries || summaries.length === 0) {
      return NextResponse.json({ message: 'No summaries due', processed: 0 });
    }

    const results = [];

    for (const summary of summaries) {
      try {
        console.log(`Generating summary: ${summary.name} (${summary.id})`);

        // Generate the summary
        await generateSummary(
          summary.id,
          summary.cadence_ids || [],
          summary.form_ids || [],
          summary.filter_config || {},
          summary.user_commentary
        );

        // Calculate next run if recurring
        let nextRunAt = null;
        if (summary.schedule_type === 'recurring' && summary.schedule_config) {
          nextRunAt = calculateNextRun(summary.schedule_config);
        }

        // Update summary
        await supabase
          .from('summary_reports')
          .update({
            status: nextRunAt ? 'scheduled' : 'completed',
            next_run_at: nextRunAt
          })
          .eq('id', summary.id);

        results.push({ id: summary.id, name: summary.name, status: 'success' });
      } catch (error: any) {
        console.error(`Error generating summary ${summary.id}:`, error);
        results.push({ id: summary.id, name: summary.name, status: 'failed', error: error.message });
      }
    }

    return NextResponse.json({
      message: 'Summaries processed',
      processed: results.length,
      results
    });
  } catch (error: any) {
    console.error('Error in cron job:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

function calculateNextRun(schedule_config: any): string {
  const now = new Date();
  const { frequency, time = '09:00', day_of_week, day_of_month } = schedule_config;
  const [hours, minutes] = time.split(':').map(Number);

  let nextRun = new Date(now);
  nextRun.setHours(hours, minutes, 0, 0);

  switch (frequency) {
    case 'daily':
      nextRun.setDate(nextRun.getDate() + 1);
      break;
    case 'weekly':
      const targetDay = day_of_week || 1; // Default Monday
      nextRun.setDate(nextRun.getDate() + 1);
      while (nextRun.getDay() !== targetDay) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      break;
    case 'monthly':
      const targetDate = day_of_month || 1;
      nextRun.setMonth(nextRun.getMonth() + 1);
      nextRun.setDate(targetDate);
      break;
  }

  return nextRun.toISOString();
}

