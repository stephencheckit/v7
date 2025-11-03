/**
 * Import Bot Traffic from Vercel JSON Logs
 * 
 * This script parses Vercel JSON logs (exported format) and imports
 * AI bot visits to the database.
 * 
 * Usage:
 *   npx tsx scripts/import-json-logs.ts /path/to/logs_result.json
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

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
 * Import bot visits from JSON log file
 */
async function importFromJsonLogs(logFile: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('❌ Missing Supabase credentials in .env.local');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('📖 Reading JSON log file...');
    const logContent = readFileSync(logFile, 'utf-8');
    const logs: VercelLogEntry[] = JSON.parse(logContent);

    console.log(`📊 Found ${logs.length} total log entries`);

    // Filter for bot visits
    const botVisits = logs
        .map(log => {
            const botName = detectBot(log.requestUserAgent || '');
            if (!botName) return null;

            // Clean up path - remove domain prefix
            const path = log.requestPath?.replace('checkitv7.com', '') || '/';

            return {
                bot_name: botName,
                user_agent: log.requestUserAgent,
                path: path,
                accessed_at: log.TimeUTC,
                response_time_ms: null,
                metadata: {
                    request_id: log.requestId,
                    region: log.region,
                    status_code: log.responseStatusCode,
                },
            };
        })
        .filter((visit): visit is NonNullable<typeof visit> => visit !== null);

    console.log(`🤖 Found ${botVisits.length} bot visits`);

    if (botVisits.length === 0) {
        console.log('❌ No bot traffic found in logs');
        return;
    }

    // Show breakdown
    const botBreakdown = botVisits.reduce((acc, visit) => {
        acc[visit.bot_name] = (acc[visit.bot_name] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    console.log('\n📈 Bot Breakdown:');
    Object.entries(botBreakdown).forEach(([bot, count]) => {
        console.log(`   ${bot}: ${count} visits`);
    });

    // Show path breakdown
    const pathBreakdown = botVisits.reduce((acc, visit) => {
        acc[visit.path] = (acc[visit.path] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    console.log('\n📂 Path Breakdown:');
    Object.entries(pathBreakdown)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([path, count]) => {
            console.log(`   ${path}: ${count} visits`);
        });

    console.log('\n💾 Importing to database...');

    // Check for duplicates and insert
    let imported = 0;
    let duplicates = 0;
    let errors = 0;

    for (const visit of botVisits) {
        // Check if this visit already exists (by bot_name, path, and timestamp)
        const { data: existing } = await supabase
            .from('ai_bot_accesses')
            .select('id')
            .eq('bot_name', visit.bot_name)
            .eq('path', visit.path)
            .eq('accessed_at', visit.accessed_at)
            .maybeSingle();

        if (existing) {
            duplicates++;
            continue;
        }

        // Insert new visit
        const { error } = await supabase
            .from('ai_bot_accesses')
            .insert({
                bot_name: visit.bot_name,
                user_agent: visit.user_agent,
                path: visit.path,
                accessed_at: visit.accessed_at,
                response_time_ms: visit.response_time_ms,
            });

        if (error) {
            console.error(`   ⚠️  Failed: ${error.message}`);
            errors++;
        } else {
            imported++;
            if (imported % 10 === 0) {
                process.stdout.write(`   Progress: ${imported}/${botVisits.length}\r`);
            }
        }
    }

    console.log('\n');
    console.log('✅ Import Complete!');
    console.log(`   Imported: ${imported}`);
    console.log(`   Duplicates skipped: ${duplicates}`);
    console.log(`   Errors: ${errors}`);
}

// Run if called directly
if (require.main === module) {
    const logFile = process.argv[2];
    if (!logFile) {
        console.error('Usage: npx tsx scripts/import-json-logs.ts <log-file.json>');
        console.error('Example: npx tsx scripts/import-json-logs.ts ~/Downloads/logs_result.json');
        process.exit(1);
    }

    importFromJsonLogs(logFile).catch(error => {
        console.error('❌ Import failed:', error);
        process.exit(1);
    });
}

export { importFromJsonLogs };

