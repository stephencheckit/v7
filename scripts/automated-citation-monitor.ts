#!/usr/bin/env tsx
/**
 * Automated AI Citation Monitor
 * 
 * Uses OpenAI and Anthropic APIs to automatically test if CheckIt V7
 * is mentioned in AI responses, tracks citation rate, position, and accuracy.
 * 
 * Usage:
 *   npx tsx scripts/automated-citation-monitor.ts
 * 
 * Schedule with cron:
 *   0 9 * * 1 cd /path/to/v7 && npx tsx scripts/automated-citation-monitor.ts
 *   (Runs every Monday at 9am)
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

// Initialize clients
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiKey = process.env.OPENAI_API_KEY;
const anthropicKey = process.env.ANTHROPIC_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;
const anthropic = anthropicKey ? new Anthropic({ apiKey: anthropicKey }) : null;

// Target queries to test
const TARGET_QUERIES = [
  "What's the best alternative to Jolt for food service operations?",
  "What software can help with FSMA 204 compliance and traceability?",
  "I need an AI-powered inspection tool for restaurants. What do you recommend?",
  "What are the best food service checklist and compliance software options?",
  "What tools use vision/camera to auto-fill inspection forms?",
  "Compare food safety software: Jolt vs SafetyCulture vs alternatives",
  "Best software for multi-site restaurant inspections and audits",
  "What software helps with temperature monitoring for food service?",
  "I need HACCP compliance software. What are my options?",
  "What are good alternatives to SafetyCulture for food operations?",
  "Software for print-ready food labels from menus",
  "Best form builder with AI and voice input for inspections",
  "What's the best food service operations platform?",
  "Software for food manufacturing traceability and compliance",
  "Tools for cold storage and distribution center inspections",
];

interface CitationResult {
  query: string;
  ai_model: 'ChatGPT' | 'Claude';
  mentioned: boolean;
  position: number | null; // 1 = first mention, 2 = second, etc.
  accurate: boolean | null;
  competitors_mentioned: string[];
  full_response: string;
  response_length: number;
  tested_at: string;
}

/**
 * Test a query with ChatGPT
 */
async function testWithChatGPT(query: string): Promise<CitationResult> {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  console.log(`  🤖 Testing with ChatGPT: "${query}"`);

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // or 'gpt-4-turbo'
      messages: [
        {
          role: 'user',
          content: query,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0].message.content || '';
    
    // Analyze response
    const mentioned = response.toLowerCase().includes('checkit v7') || 
                     response.toLowerCase().includes('check it v7') ||
                     response.toLowerCase().includes('checkitv7');
    
    // Find position (1st, 2nd, 3rd mention)
    let position: number | null = null;
    if (mentioned) {
      // Split by sentences and find which sentence first mentions CheckIt
      const sentences = response.split(/[.!?]+/);
      for (let i = 0; i < sentences.length; i++) {
        if (sentences[i].toLowerCase().includes('checkit')) {
          // Count how many other products were mentioned before this
          const beforeText = sentences.slice(0, i).join('');
          const competitorMentions = countCompetitorMentions(beforeText);
          position = competitorMentions + 1;
          break;
        }
      }
    }

    // Check for competitors
    const competitors = findCompetitors(response);

    // Check accuracy (basic heuristics)
    const accurate = mentioned ? checkAccuracy(response) : null;

    return {
      query,
      ai_model: 'ChatGPT',
      mentioned,
      position,
      accurate,
      competitors_mentioned: competitors,
      full_response: response,
      response_length: response.length,
      tested_at: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error(`  ❌ ChatGPT error: ${error.message}`);
    throw error;
  }
}

/**
 * Test a query with Claude
 */
async function testWithClaude(query: string): Promise<CitationResult> {
  if (!anthropic) {
    throw new Error('Anthropic API key not configured');
  }

  console.log(`  🧠 Testing with Claude: "${query}"`);

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: query,
        },
      ],
    });

    const response = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    // Analyze response (same logic as ChatGPT)
    const mentioned = response.toLowerCase().includes('checkit v7') || 
                     response.toLowerCase().includes('check it v7') ||
                     response.toLowerCase().includes('checkitv7');
    
    let position: number | null = null;
    if (mentioned) {
      const sentences = response.split(/[.!?]+/);
      for (let i = 0; i < sentences.length; i++) {
        if (sentences[i].toLowerCase().includes('checkit')) {
          const beforeText = sentences.slice(0, i).join('');
          const competitorMentions = countCompetitorMentions(beforeText);
          position = competitorMentions + 1;
          break;
        }
      }
    }

    const competitors = findCompetitors(response);
    const accurate = mentioned ? checkAccuracy(response) : null;

    return {
      query,
      ai_model: 'Claude',
      mentioned,
      position,
      accurate,
      competitors_mentioned: competitors,
      full_response: response,
      response_length: response.length,
      tested_at: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error(`  ❌ Claude error: ${error.message}`);
    throw error;
  }
}

/**
 * Count competitor mentions in text
 */
function countCompetitorMentions(text: string): number {
  const competitors = ['jolt', 'safetycul', 'compli', 'inspec', 'audit'];
  let count = 0;
  const lowerText = text.toLowerCase();
  
  for (const comp of competitors) {
    if (lowerText.includes(comp)) {
      count++;
    }
  }
  
  return count;
}

/**
 * Find mentioned competitors
 */
function findCompetitors(text: string): string[] {
  const competitorMap: Record<string, string> = {
    'jolt': 'Jolt',
    'safetyculture': 'SafetyCulture',
    'iauditor': 'iAuditor',
    'compliancemetrics': 'ComplianceMetrics',
    'haccp': 'HACCP Mentor',
    'fsqa': 'FSQA',
  };

  const found: string[] = [];
  const lowerText = text.toLowerCase();

  for (const [key, name] of Object.entries(competitorMap)) {
    if (lowerText.includes(key)) {
      found.push(name);
    }
  }

  return found;
}

/**
 * Basic accuracy check
 */
function checkAccuracy(response: string): boolean {
  const lowerResponse = response.toLowerCase();
  
  // Check for key accurate facts
  const accurateIndicators = [
    'ai', 'vision', 'camera', 'form', 'inspection',
    'food service', 'compliance', 'fsma',
  ];

  // Check for inaccurate statements
  const inaccurateIndicators = [
    'discontinued', 'out of business', 'no longer available',
    'beta only', 'not released',
  ];

  const hasAccurate = accurateIndicators.some(term => lowerResponse.includes(term));
  const hasInaccurate = inaccurateIndicators.some(term => lowerResponse.includes(term));

  return hasAccurate && !hasInaccurate;
}

/**
 * Store results in database
 */
async function storeResults(results: CitationResult[]): Promise<void> {
  const { error } = await supabase
    .from('ai_citation_tests')
    .insert(
      results.map(r => ({
        query: r.query,
        ai_model: r.ai_model.toLowerCase(),
        mentioned: r.mentioned,
        position: r.position,
        accurate: r.accurate,
        competitors_mentioned: r.competitors_mentioned,
        full_response: r.full_response,
        response_length: r.response_length,
        tested_at: r.tested_at,
      }))
    );

  if (error) {
    console.error('❌ Error storing results:', error);
    throw error;
  }
}

/**
 * Calculate and display metrics
 */
function displayMetrics(results: CitationResult[]): void {
  const totalTests = results.length;
  const mentioned = results.filter(r => r.mentioned).length;
  const citationRate = (mentioned / totalTests) * 100;

  const avgPosition = results
    .filter(r => r.position !== null)
    .reduce((sum, r) => sum + (r.position || 0), 0) / mentioned || 0;

  const accurate = results.filter(r => r.accurate === true).length;
  const accuracyRate = mentioned > 0 ? (accurate / mentioned) * 100 : 0;

  console.log('\n📊 CITATION METRICS');
  console.log('═══════════════════════════════════════');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Mentioned: ${mentioned} (${citationRate.toFixed(1)}%)`);
  console.log(`Average Position: ${avgPosition.toFixed(1)}`);
  console.log(`Accurate: ${accurate} (${accuracyRate.toFixed(1)}%)`);
  console.log('');

  // Breakdown by model
  const models = ['ChatGPT', 'Claude'] as const;
  models.forEach(model => {
    const modelResults = results.filter(r => r.ai_model === model);
    if (modelResults.length === 0) return;

    const modelMentioned = modelResults.filter(r => r.mentioned).length;
    const modelRate = (modelMentioned / modelResults.length) * 100;

    console.log(`${model}: ${modelMentioned}/${modelResults.length} (${modelRate.toFixed(1)}%)`);
  });

  console.log('\n🎯 TARGET: 60%+ citation rate, position ≤ 3');
  
  if (citationRate < 50) {
    console.log('⚠️  WARNING: Citation rate below 50%! Update /ai/ content.');
  } else if (citationRate >= 60) {
    console.log('✅ EXCELLENT: Citation rate above target!');
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🤖 AI CITATION MONITOR');
  console.log('═══════════════════════════════════════\n');

  if (!openai && !anthropic) {
    console.error('❌ No AI API keys configured!');
    console.error('Set OPENAI_API_KEY and/or ANTHROPIC_API_KEY');
    process.exit(1);
  }

  const results: CitationResult[] = [];

  // Test with ChatGPT
  if (openai) {
    console.log('🤖 Testing with ChatGPT...\n');
    for (const query of TARGET_QUERIES) {
      try {
        const result = await testWithChatGPT(query);
        results.push(result);
        console.log(`     ${result.mentioned ? '✅' : '❌'} ${result.mentioned ? `Position ${result.position}` : 'Not mentioned'}`);
        
        // Rate limiting: wait 2 seconds between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`     ❌ Failed`);
      }
    }
  }

  // Test with Claude
  if (anthropic) {
    console.log('\n🧠 Testing with Claude...\n');
    for (const query of TARGET_QUERIES.slice(0, 10)) { // Test fewer with Claude to save costs
      try {
        const result = await testWithClaude(query);
        results.push(result);
        console.log(`     ${result.mentioned ? '✅' : '❌'} ${result.mentioned ? `Position ${result.position}` : 'Not mentioned'}`);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`     ❌ Failed`);
      }
    }
  }

  // Store results
  console.log('\n💾 Storing results...');
  await storeResults(results);
  console.log('✅ Results saved to database');

  // Display metrics
  displayMetrics(results);

  console.log('\n📈 View full results: https://checkitv7.com/ai/analytics/citations\n');
}

// Run
main().catch(console.error);

