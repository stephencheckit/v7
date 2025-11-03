import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Calculate date threshold
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - days);

        // Fetch citation test results
        const { data: tests, error: testsError } = await supabase
            .from('ai_citation_tests')
            .select('*')
            .gte('tested_at', dateThreshold.toISOString())
            .order('tested_at', { ascending: false });

        if (testsError) {
            console.error('Supabase tests error:', testsError);
            throw testsError;
        }

        // Calculate summary statistics
        const totalTests = tests?.length || 0;
        const successfulMentions = tests?.filter(t => t.was_mentioned).length || 0;
        const citationRate = totalTests > 0 ? (successfulMentions / totalTests * 100).toFixed(1) : '0';

        // Group by AI model
        const modelStats: Record<string, { total: number; mentions: number; rate: string }> = {};
        tests?.forEach(test => {
            if (!modelStats[test.ai_model]) {
                modelStats[test.ai_model] = { total: 0, mentions: 0, rate: '0' };
            }
            modelStats[test.ai_model].total++;
            if (test.was_mentioned) {
                modelStats[test.ai_model].mentions++;
            }
        });

        // Calculate rates
        Object.keys(modelStats).forEach(model => {
            const stats = modelStats[model];
            stats.rate = stats.total > 0 ? (stats.mentions / stats.total * 100).toFixed(1) : '0';
        });

        // Group by query for top performers
        const queryStats: Record<string, { mentions: number; total: number }> = {};
        tests?.forEach(test => {
            if (!queryStats[test.query]) {
                queryStats[test.query] = { mentions: 0, total: 0 };
            }
            queryStats[test.query].total++;
            if (test.was_mentioned) {
                queryStats[test.query].mentions++;
            }
        });

        // Find top performing query
        let topQuery = 'N/A';
        let topQueryRate = 0;
        Object.entries(queryStats).forEach(([query, stats]) => {
            const rate = stats.total > 0 ? (stats.mentions / stats.total * 100) : 0;
            if (rate > topQueryRate) {
                topQueryRate = rate;
                topQuery = query;
            }
        });

        // Time series data (group by date)
        const timeSeriesMap: Record<string, { date: string; [key: string]: any }> = {};
        tests?.forEach(test => {
            const date = test.tested_at.split('T')[0]; // Get just the date part
            if (!timeSeriesMap[date]) {
                timeSeriesMap[date] = { date };
            }
            const model = test.ai_model;
            if (!timeSeriesMap[date][model]) {
                timeSeriesMap[date][model] = 0;
            }
            if (test.was_mentioned) {
                timeSeriesMap[date][model]++;
            }
        });

        const timeSeriesData = Object.values(timeSeriesMap).sort((a, b) =>
            a.date.localeCompare(b.date)
        );

        // Recent tests (limit to 50)
        const recentTests = tests?.slice(0, 50) || [];

        // Also fetch competitors mentioned
        const competitorMentions: Record<string, number> = {};
        tests?.forEach(test => {
            if (test.competitors_mentioned && Array.isArray(test.competitors_mentioned)) {
                test.competitors_mentioned.forEach((comp: string) => {
                    competitorMentions[comp] = (competitorMentions[comp] || 0) + 1;
                });
            }
        });

        return NextResponse.json({
            summary: {
                totalTests,
                successfulMentions,
                citationRate,
                topQuery: topQuery !== 'N/A' ? topQuery.substring(0, 50) + '...' : topQuery,
                topQueryRate: topQueryRate.toFixed(1),
            },
            modelStats,
            timeSeriesData,
            recentTests,
            competitorMentions,
        });
    } catch (error) {
        console.error('Error fetching citation analytics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch citation analytics' },
            { status: 500 }
        );
    }
}

