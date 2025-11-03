import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { format, subDays } from 'date-fns';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const days = parseInt(searchParams.get('days') || '30');

        // Calculate start date
        const startDate = subDays(new Date(), days);

        // Get all accesses in date range
        const { data: accesses, error: accessError } = await supabase
            .from('ai_bot_accesses')
            .select('*')
            .gte('accessed_at', startDate.toISOString())
            .order('accessed_at', { ascending: false });

        if (accessError) {
            console.error('Error fetching accesses:', accessError);
            return NextResponse.json(
                { error: 'Failed to fetch analytics' },
                { status: 500 }
            );
        }

        // Get aggregated statistics
        const { data: stats, error: statsError } = await supabase
            .from('ai_bot_analytics')
            .select('*');

        if (statsError) {
            console.error('Error fetching stats:', statsError);
        }

        // Calculate summary metrics
        const totalVisits = accesses?.length || 0;
        const uniqueBots = new Set(accesses?.map(a => a.bot_name)).size;
        const lastVisit = accesses && accesses.length > 0 ? accesses[0].accessed_at : null;

        // Group by bot for chart data
        const botCounts: Record<string, number> = {};
        accesses?.forEach(access => {
            botCounts[access.bot_name] = (botCounts[access.bot_name] || 0) + 1;
        });

        // Group by date for time series
        const dailyCounts: Record<string, Record<string, number>> = {};
        accesses?.forEach(access => {
            const date = format(new Date(access.accessed_at), 'yyyy-MM-dd');
            if (!dailyCounts[date]) {
                dailyCounts[date] = {};
            }
            const botName = access.bot_name;
            dailyCounts[date][botName] = (dailyCounts[date][botName] || 0) + 1;
        });

        // Convert to array for charts
        const timeSeriesData = Object.entries(dailyCounts)
            .map(([date, bots]) => ({
                date,
                ...bots,
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // Most active bot
        const mostActiveBot = Object.entries(botCounts)
            .sort(([, a], [, b]) => b - a)[0]?.[0] || 'None';

        return NextResponse.json({
            summary: {
                totalVisits,
                uniqueBots,
                mostActiveBot,
                lastVisit,
            },
            botCounts,
            timeSeriesData,
            recentAccesses: accesses?.slice(0, 100) || [],
            statistics: stats || [],
        });
    } catch (error) {
        console.error('Analytics API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

