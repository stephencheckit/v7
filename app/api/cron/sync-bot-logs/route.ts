/**
 * Vercel Cron Job: Sync Bot Traffic from Logs
 * 
 * This endpoint runs daily to fetch Vercel logs and import AI bot visits
 * to the database automatically.
 * 
 * Triggered by: Vercel Cron (see vercel.json)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Known AI bot user agents to detect
const BOT_PATTERNS = [
  { name: 'GPTBot', pattern: /GPTBot/i },
  { name: 'ChatGPT-User', pattern: /ChatGPT-User/i },
  { name: 'Claude-Bot', pattern: /ClaudeBot/i },
  { name: 'Claude-User', pattern: /Claude-User/i },
  { name: 'anthropic-ai', pattern: /anthropic-ai/i },
  { name: 'PerplexityBot', pattern: /PerplexityBot/i },
  { name: 'Google-Extended', pattern: /Google-Extended/i },
  { name: 'Bytespider', pattern: /Bytespider/i },
  { name: 'Applebot-Extended', pattern: /Applebot-Extended/i },
  { name: 'cohere-ai', pattern: /cohere-ai/i },
  { name: 'YouBot', pattern: /YouBot/i },
];

interface VercelLogEntry {
  TimeUTC: string;
  timestampInMs: number;
  requestPath: string;
  requestMethod: string;
  responseStatusCode: number;
  requestUserAgent: string;
  requestId: string;
  region?: string;
}

/**
 * Detect bot from user agent
 */
function detectBot(userAgent: string): string | null {
  for (const { name, pattern } of BOT_PATTERNS) {
    if (pattern.test(userAgent)) {
      return name;
    }
  }
  return null;
}

/**
 * Fetch logs from Vercel API
 * Note: Requires VERCEL_TOKEN environment variable
 */
async function fetchVercelLogs(hoursBack: number = 24): Promise<VercelLogEntry[]> {
  const vercelToken = process.env.VERCEL_TOKEN;
  const vercelProjectId = process.env.VERCEL_PROJECT_ID;
  const vercelTeamId = process.env.VERCEL_TEAM_ID;

  if (!vercelToken) {
    console.warn('⚠️  VERCEL_TOKEN not set, skipping log sync');
    return [];
  }

  if (!vercelProjectId) {
    console.warn('⚠️  VERCEL_PROJECT_ID not set, skipping log sync');
    return [];
  }

  try {
    const since = Date.now() - (hoursBack * 60 * 60 * 1000);
    const until = Date.now();
    
    let url = `https://api.vercel.com/v2/deployments/logs?projectId=${vercelProjectId}&since=${since}&until=${until}&limit=1000`;
    
    if (vercelTeamId) {
      url += `&teamId=${vercelTeamId}`;
    }

    console.log(`📥 Fetching Vercel logs from last ${hoursBack} hours...`);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Vercel API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.logs || [];
  } catch (error) {
    console.error('❌ Failed to fetch Vercel logs:', error);
    return [];
  }
}

/**
 * Process and import bot visits
 */
async function syncBotLogs() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Supabase credentials not set');
    return { success: false, error: 'Missing Supabase credentials', imported: 0 };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch logs from last 24 hours
  const logs = await fetchVercelLogs(24);
  console.log(`📊 Found ${logs.length} total log entries`);

  // Filter for bot visits
  const botVisits = logs
    .map(log => {
      const botName = detectBot(log.requestUserAgent || '');
      if (!botName) return null;

      // Clean up path
      const path = log.requestPath?.replace('checkitv7.com', '') || '/';

      return {
        bot_name: botName,
        user_agent: log.requestUserAgent,
        path: path,
        accessed_at: log.TimeUTC,
        response_time_ms: null,
      };
    })
    .filter((visit): visit is NonNullable<typeof visit> => visit !== null);

  console.log(`🤖 Found ${botVisits.length} bot visits`);

  if (botVisits.length === 0) {
    return { success: true, imported: 0 };
  }

  // Check for duplicates and insert
  let imported = 0;
  let duplicates = 0;

  for (const visit of botVisits) {
    // Check if this visit already exists (by bot_name, path, and timestamp)
    const { data: existing } = await supabase
      .from('ai_bot_accesses')
      .select('id')
      .eq('bot_name', visit.bot_name)
      .eq('path', visit.path)
      .eq('accessed_at', visit.accessed_at)
      .single();

    if (existing) {
      duplicates++;
      continue;
    }

    // Insert new visit
    const { error } = await supabase
      .from('ai_bot_accesses')
      .insert(visit);

    if (error) {
      console.error(`Failed to import visit: ${error.message}`);
    } else {
      imported++;
    }
  }

  console.log(`✅ Imported ${imported} new bot visits (${duplicates} duplicates skipped)`);

  return {
    success: true,
    imported,
    duplicates,
    totalLogs: logs.length,
    totalBotVisits: botVisits.length,
  };
}

/**
 * GET handler - can be called manually or via cron
 */
export async function GET(request: NextRequest) {
  // Verify cron secret (optional security measure)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.warn('⚠️  Unauthorized cron request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('🔄 Starting bot log sync...');
  const result = await syncBotLogs();

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    ...result,
  });
}

/**
 * POST handler - for manual triggers with custom time range
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const hoursBack = body.hoursBack || 24;

    console.log(`🔄 Manual bot log sync (${hoursBack} hours back)...`);
    const result = await syncBotLogs();

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    console.error('❌ Sync error:', error);
    return NextResponse.json(
      { error: 'Sync failed', details: String(error) },
      { status: 500 }
    );
  }
}

