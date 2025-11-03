#!/usr/bin/env tsx
/**
 * Quick Citation Test
 * 
 * Tests 5 queries with ChatGPT to see if CheckIt V7 is mentioned.
 * Faster and cheaper than full monitoring.
 * 
 * Usage: npx tsx scripts/quick-citation-test.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import OpenAI from 'openai';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const QUICK_QUERIES = [
  "What's the best alternative to Jolt for food service?",
  "Software for FSMA 204 compliance?",
  "AI-powered inspection tools for restaurants?",
  "Compare food safety software options",
  "Best form builder with vision/camera auto-fill?",
];

async function quickTest() {
  console.log('🚀 QUICK CITATION TEST\n');
  console.log('Testing 5 queries with ChatGPT...\n');

  let mentioned = 0;
  const results: any[] = [];

  for (let i = 0; i < QUICK_QUERIES.length; i++) {
    const query = QUICK_QUERIES[i];
    console.log(`${i + 1}. "${query}"`);

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: query }],
        temperature: 0.7,
        max_tokens: 800,
      });

      const response = completion.choices[0].message.content || '';
      const ismentioned = response.toLowerCase().includes('checkit');

      if (ismentioned) {
        mentioned++;
        console.log('   ✅ CheckIt V7 MENTIONED');
        
        // Find where it's mentioned
        const lines = response.split('\n');
        for (const line of lines) {
          if (line.toLowerCase().includes('checkit')) {
            console.log(`   📝 "${line.trim().substring(0, 80)}..."`);
            break;
          }
        }
      } else {
        console.log('   ❌ Not mentioned');
      }

      results.push({ query, mentioned: ismentioned, response });
      console.log('');

      // Wait 2 seconds between requests
      if (i < QUICK_QUERIES.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
  }

  // Summary
  const citationRate = (mentioned / QUICK_QUERIES.length) * 100;
  console.log('═══════════════════════════════════════');
  console.log(`📊 RESULTS: ${mentioned}/${QUICK_QUERIES.length} queries mentioned CheckIt V7`);
  console.log(`📈 Citation Rate: ${citationRate.toFixed(0)}%`);
  console.log('');

  if (citationRate >= 60) {
    console.log('✅ EXCELLENT! Above 60% target');
  } else if (citationRate >= 40) {
    console.log('⚠️  GOOD: But could be better. Aim for 60%+');
  } else {
    console.log('❌ LOW: Update /ai/ content and re-test in 1 week');
  }

  console.log('');
  console.log('💡 TIP: Run full test with:');
  console.log('   npx tsx scripts/automated-citation-monitor.ts');
  console.log('');
}

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY not set!');
  console.error('Export it first: export OPENAI_API_KEY="sk-..."');
  process.exit(1);
}

quickTest().catch(console.error);

