/**
 * Import Actual Bot Traffic from Vercel Logs
 * 
 * This script parses Vercel logs to retroactively populate the ai_bot_accesses table
 * with real bot visits that occurred before the tracking middleware was deployed.
 * 
 * Usage:
 *   1. Export Vercel logs: `vercel logs > logs.txt`
 *   2. Run: `npx tsx scripts/import-bot-traffic-from-logs.ts logs.txt`
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Known AI bot user agents to detect
const BOT_PATTERNS = [
  { name: 'GPTBot', pattern: /GPTBot/i },
  { name: 'ChatGPT-User', pattern: /ChatGPT-User/i },
  { name: 'Claude-Bot', pattern: /ClaudeBot/i },
  { name: 'Claude-Web', pattern: /Claude-Web/i },
  { name: 'anthropic-ai', pattern: /anthropic-ai/i },
  { name: 'PerplexityBot', pattern: /PerplexityBot/i },
  { name: 'Google-Extended', pattern: /Google-Extended/i },
  { name: 'Bytespider', pattern: /Bytespider/i },
  { name: 'Applebot-Extended', pattern: /Applebot-Extended/i },
  { name: 'cohere-ai', pattern: /cohere-ai/i },
  { name: 'YouBot', pattern: /YouBot/i },
];

interface LogEntry {
  timestamp: string;
  userAgent: string;
  path: string;
  ip?: string;
  statusCode?: number;
}

/**
 * Parse Vercel log format
 * Expected format: [timestamp] [method] [path] [status] [user-agent] [ip]
 */
function parseVercelLogs(logContent: string): LogEntry[] {
  const entries: LogEntry[] = [];
  const lines = logContent.split('\n');

  for (const line of lines) {
    // Try to extract timestamp, path, status, user-agent, IP
    // Adjust regex based on actual Vercel log format
    const match = line.match(/\[(.*?)\].*?(GET|POST).*?(\/[^\s]*?).*?(\d{3}).*?"(.*?)".*?(\d+\.\d+\.\d+\.\d+)?/);
    
    if (match) {
      const [, timestamp, , path, statusCode, userAgent, ip] = match;
      entries.push({
        timestamp,
        path,
        statusCode: parseInt(statusCode),
        userAgent,
        ip: ip || undefined,
      });
    }
  }

  return entries;
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
 * Import bot visits to Supabase
 */
async function importBotVisits(logFile: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('📖 Reading log file...');
  const logContent = readFileSync(logFile, 'utf-8');
  const entries = parseVercelLogs(logContent);
  console.log(`Found ${entries.length} total log entries`);

  const botVisits = entries
    .filter(entry => entry.path.startsWith('/ai/')) // Only /ai/ paths
    .map(entry => ({
      botName: detectBot(entry.userAgent),
      ...entry,
    }))
    .filter(entry => entry.botName !== null); // Only bot traffic

  console.log(`Found ${botVisits.length} bot visits to /ai/ path`);

  if (botVisits.length === 0) {
    console.log('❌ No bot traffic found in logs');
    return;
  }

  // Insert into database
  let imported = 0;
  for (const visit of botVisits) {
    const { error } = await supabase
      .from('ai_bot_accesses')
      .insert({
        bot_name: visit.botName,
        user_agent: visit.userAgent,
        path: visit.path,
        ip_address: visit.ip,
        accessed_at: new Date(visit.timestamp).toISOString(),
        response_time_ms: null, // Not available from logs
      });

    if (!error) {
      imported++;
    } else {
      console.error(`Failed to import: ${error.message}`);
    }
  }

  console.log(`✅ Imported ${imported} bot visits`);
}

// Run if called directly
if (require.main === module) {
  const logFile = process.argv[2];
  if (!logFile) {
    console.error('Usage: npx tsx scripts/import-bot-traffic-from-logs.ts <log-file>');
    process.exit(1);
  }

  importBotVisits(logFile).catch(console.error);
}

export { importBotVisits, parseVercelLogs, detectBot };

