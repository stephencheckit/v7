import { createClient } from '@supabase/supabase-js';

// Create a Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only create client if env vars are available
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export interface BotAccessLog {
    bot_name: string;
    user_agent: string;
    path: string;
    ip_address?: string;
    referer?: string | null;
    response_time_ms?: number;
}

/**
 * Log an AI bot access to the database
 */
export async function logBotAccess(data: BotAccessLog): Promise<void> {
  console.log(`💾 Attempting to log bot access:`, {
    bot_name: data.bot_name,
    path: data.path,
    hasSupabase: !!supabase,
    supabaseUrl: !!supabaseUrl,
    supabaseKey: !!supabaseServiceKey,
  });

  if (!supabase) {
    console.error('❌ Supabase client not initialized - env vars:', {
      url: supabaseUrl,
      hasKey: !!supabaseServiceKey,
    });
    return;
  }

  try {
    const { error } = await supabase
      .from('ai_bot_accesses')
      .insert({
        bot_name: data.bot_name,
        user_agent: data.user_agent,
        path: data.path,
        ip_address: data.ip_address || null,
        referer: data.referer || null,
        response_time_ms: data.response_time_ms || null,
      });

    if (error) {
      console.error('❌ Error logging bot access to Supabase:', error);
    } else {
      console.log('✅ Successfully logged bot access');
    }
  } catch (err) {
    console.error('❌ Failed to log bot access (exception):', err);
  }
}

/**
 * AI bot detection patterns
 */
export const AI_BOT_PATTERNS = {
    'GPTBot': 'OpenAI',
    'ChatGPT-User': 'OpenAI',
    'Claude-Web': 'Anthropic',
    'Claude-Bot': 'Anthropic',
    'PerplexityBot': 'Perplexity',
    'Google-Extended': 'Google',
    'anthropic-ai': 'Anthropic',
    'Bytespider': 'ByteDance',
    'Applebot-Extended': 'Apple',
    'cohere-ai': 'Cohere',
    'YouBot': 'You.com',
} as const;

export type BotName = keyof typeof AI_BOT_PATTERNS;
export type BotCompany = typeof AI_BOT_PATTERNS[BotName];

export interface DetectedBot {
    name: BotName;
    company: BotCompany;
}

/**
 * Detect if a user agent string belongs to an AI bot
 */
export function detectAIBot(userAgent: string): DetectedBot | null {
    if (!userAgent) return null;

    for (const [botPattern, company] of Object.entries(AI_BOT_PATTERNS)) {
        if (userAgent.includes(botPattern)) {
            return {
                name: botPattern as BotName,
                company: company as BotCompany,
            };
        }
    }

    return null;
}

/**
 * Check if a user agent is an AI bot
 */
export function isAIBot(userAgent: string): boolean {
    return detectAIBot(userAgent) !== null;
}

/**
 * Get analytics for a specific date range
 */
export async function getBotAnalytics(startDate?: Date, endDate?: Date) {
  if (!supabase) {
    console.warn('Supabase client not initialized');
    return null;
  }

  try {
    let query = supabase
      .from('ai_bot_accesses')
      .select('*')
      .order('accessed_at', { ascending: false });

    if (startDate) {
      query = query.gte('accessed_at', startDate.toISOString());
    }

    if (endDate) {
      query = query.lte('accessed_at', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching bot analytics:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Failed to fetch bot analytics:', err);
    return null;
  }
}

/**
 * Get aggregated bot statistics
 */
export async function getBotStatistics() {
  if (!supabase) {
    console.warn('Supabase client not initialized');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('ai_bot_analytics')
      .select('*');

    if (error) {
      console.error('Error fetching bot statistics:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Failed to fetch bot statistics:', err);
    return null;
  }
}

