#!/usr/bin/env tsx
/**
 * Import ChatGPT-User Visit
 * Adds the ChatGPT-User bot visit found in Vercel logs
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

async function importChatGPTVisit() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase credentials');
        console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('\n🤖 Importing ChatGPT-User bot visit...\n');

    const visitData = {
        bot_name: 'ChatGPT-User',
        user_agent: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot',
        path: '/ai/',
        ip_address: null,
        accessed_at: new Date().toISOString(),
    };

    console.log('📋 Visit Details:');
    console.log(`  Bot: ${visitData.bot_name}`);
    console.log(`  Path: ${visitData.path}`);
    console.log(`  Time: ${visitData.accessed_at}`);
    console.log('');

    const { data, error } = await supabase
        .from('ai_bot_accesses')
        .insert(visitData)
        .select();

    if (error) {
        console.error('❌ Failed to import:', error.message);
        process.exit(1);
    }

    console.log('✅ Successfully imported ChatGPT-User visit!');
    console.log('');

    // Verify by checking total count
    const { count } = await supabase
        .from('ai_bot_accesses')
        .select('*', { count: 'exact', head: true });

    console.log(`📊 Total bot visits in database: ${count}`);
    console.log('');
    console.log('🎯 View on dashboard: https://checkitv7.com/ai/analytics');
    console.log('');
}

importChatGPTVisit().catch(console.error);

