#!/usr/bin/env tsx
/**
 * Manual Bot Visit Import Tool
 * 
 * Quick way to manually add real bot visits you find in Vercel dashboard logs
 * 
 * Usage:
 *   npx tsx scripts/manual-bot-import.ts
 * 
 * Then paste bot visit details when prompted
 */

import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

async function addBotVisit() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('\n🤖 Manual Bot Visit Import');
  console.log('═══════════════════════════════════════\n');
  
  const botName = await question('Bot name (e.g., GPTBot, Claude-Bot): ');
  const userAgent = await question('User agent (paste full string): ');
  const path = await question('Path (e.g., /ai/context.json): ');
  const ipAddress = await question('IP address (optional, press Enter to skip): ');
  const timestamp = await question('Timestamp (YYYY-MM-DD HH:MM:SS or press Enter for now): ');

  const accessedAt = timestamp.trim() ? new Date(timestamp) : new Date();

  console.log('\n📋 Summary:');
  console.log(`  Bot: ${botName}`);
  console.log(`  Path: ${path}`);
  console.log(`  IP: ${ipAddress || 'N/A'}`);
  console.log(`  Time: ${accessedAt.toISOString()}`);
  
  const confirm = await question('\n✅ Import this visit? (y/n): ');

  if (confirm.toLowerCase() !== 'y') {
    console.log('❌ Cancelled');
    rl.close();
    return;
  }

  const { error } = await supabase
    .from('ai_bot_accesses')
    .insert({
      bot_name: botName,
      user_agent: userAgent,
      path: path,
      ip_address: ipAddress || null,
      accessed_at: accessedAt.toISOString(),
    });

  if (error) {
    console.error('❌ Failed to import:', error.message);
  } else {
    console.log('✅ Bot visit imported successfully!');
  }

  const another = await question('\n➕ Add another? (y/n): ');
  
  if (another.toLowerCase() === 'y') {
    await addBotVisit();
  } else {
    console.log('\n✅ Done! Check your dashboard at /ai/analytics\n');
    rl.close();
  }
}

// Run
addBotVisit().catch(console.error);

