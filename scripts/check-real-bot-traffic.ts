#!/usr/bin/env tsx
/**
 * Check for Real Bot Traffic
 * 
 * Quick script to see if real bots have visited since middleware deployment
 * 
 * Usage: npx tsx scripts/check-real-bot-traffic.ts
 */

import { createClient } from '@supabase/supabase-js';

async function checkRealTraffic() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('\n🤖 Checking for Real Bot Traffic');
  console.log('═══════════════════════════════════════\n');

  // Get current time
  const now = new Date();
  console.log(`Current time: ${now.toISOString()}\n`);

  // Check last hour
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  const { data: recentVisits, error } = await supabase
    .from('ai_bot_accesses')
    .select('*')
    .gte('accessed_at', oneHourAgo.toISOString())
    .order('accessed_at', { ascending: false });

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  if (!recentVisits || recentVisits.length === 0) {
    console.log('📭 No bot visits in the last hour');
    console.log('\n💡 Try:');
    console.log('   1. Testing with ChatGPT/Claude (see prompts above)');
    console.log('   2. Waiting 5-10 minutes after testing');
    console.log('   3. Checking if middleware is deployed');
    return;
  }

  console.log(`✅ Found ${recentVisits.length} bot visit(s) in the last hour:\n`);

  recentVisits.forEach((visit, i) => {
    console.log(`${i + 1}. ${visit.bot_name}`);
    console.log(`   Path: ${visit.path}`);
    console.log(`   Time: ${new Date(visit.accessed_at).toLocaleString()}`);
    console.log(`   IP: ${visit.ip_address || 'N/A'}`);
    console.log(`   User Agent: ${visit.user_agent.substring(0, 60)}...`);
    console.log('');
  });

  // Check for "suspicious" IPs that might be seed data
  const seedIpPatterns = ['35.185', '35.247', '34.98', '66.249', '104.198'];
  const possibleSeedVisits = recentVisits.filter(visit => 
    visit.ip_address && seedIpPatterns.some(pattern => 
      visit.ip_address.startsWith(pattern)
    )
  );

  if (possibleSeedVisits.length > 0) {
    console.log('⚠️  Note: Some IPs match seed data patterns');
    console.log('   Real bot visits typically have different IP ranges\n');
  }

  // Get total stats
  const { data: totalStats } = await supabase
    .from('ai_bot_accesses')
    .select('bot_name', { count: 'exact' });

  if (totalStats) {
    console.log(`📊 Total bot visits in database: ${totalStats.length}`);
  }

  console.log('\n✅ Check your dashboard: https://checkitv7.com/ai/analytics\n');
}

checkRealTraffic().catch(console.error);

