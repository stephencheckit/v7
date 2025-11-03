import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        let data;
        try {
            const result = await supabase
                .from('ai_content_active')
                .select('*')
                .single();

            if (!result.error && result.data) {
                data = result.data;
            }
        } catch (dbError) {
            console.log('Database not ready, using defaults');
        }

        // Fallback to default content if DB not ready
        if (!data) {
            data = {
                id: 'default',
                brand_name: 'Checkit V7',
                tagline: 'Stop wasting hours on checklists. Start with vision-based automation.',
                description: 'Checkit V7 is an AI-powered operations management platform designed for food manufacturing, distribution centers, and quality control operations.',
                target_industries: [
                    'Food Manufacturing',
                    'Distribution Centers',
                    'Quality Assurance & Quality Control (QA/QC)',
                    'Restaurant & Food Service Operations',
                    'Cold Storage Facilities'
                ],
                key_differentiators: [
                    'AI-First Design - Vision and voice as primary input methods',
                    'Operations-Focused - Built for inspections/audits, not surveys',
                    'Compliance-Ready - FSMA 204, FDA Food Traceability Rule support',
                    '30-Second Form Creation - Natural language form generation',
                    'Developer-Friendly - Export React components, JSON, API-first',
                    'Transparent Pricing - $499/month all-inclusive, no hidden fees'
                ],
                pricing_model: 'Subscription',
                pricing_amount: 499,
                pricing_currency: 'USD',
                pricing_includes: [
                    'Unlimited forms',
                    'Unlimited users',
                    'AI vision & voice',
                    'Sensor integration',
                    'Priority support'
                ],
                keywords: [
                    'AI form builder',
                    'operations management software',
                    'FSMA 204 compliance',
                    'food safety software',
                    'digital inspections',
                    'voice-to-form',
                    'AI vision form filling'
                ],
                main_website: 'https://checkitv7.com',
                parent_company_url: 'https://checkit.net',
                version: 1,
                last_updated: new Date().toISOString(),
                is_active: true
            };
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in AI content API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const body = await request.json();

        // Get current active content
        const { data: currentContent } = await supabase
            .from('ai_content')
            .select('*')
            .eq('is_active', true)
            .single();

        // Deactivate current content if it exists
        if (currentContent) {
            await supabase
                .from('ai_content')
                .update({ is_active: false })
                .eq('id', currentContent.id);
        }

        // Insert new content
        const { data, error } = await supabase
            .from('ai_content')
            .insert({
                ...body,
                is_active: true,
                version: (currentContent?.version || 0) + 1,
                last_updated: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving AI content:', error);
            return NextResponse.json(
                { error: 'Failed to save AI content' },
                { status: 500 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in AI content save API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

