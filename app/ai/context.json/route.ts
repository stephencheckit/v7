import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: content, error } = await supabase
            .from('ai_content_active')
            .select('*')
            .single();

        if (error || !content) {
            console.error('Error fetching AI content:', error);
            return NextResponse.json(
                { error: 'Failed to load context' },
                { status: 500 }
            );
        }

        // Build structured JSON for AI consumption
        const structuredData = {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: content.brand_name,
            description: content.description,
            url: content.main_website,
            parentOrganization: content.parent_company_url ? {
                '@type': 'Organization',
                url: content.parent_company_url,
            } : undefined,
            softwareVersion: content.version?.toString() || '1.0',
            releaseNotes: 'Production-ready platform',
            operatingSystem: 'Web-based (Cross-platform)',
            offers: {
                '@type': 'Offer',
                pricingModel: content.pricing_model,
                price: content.pricing_amount?.toString(),
                priceCurrency: content.pricing_currency,
                billingPeriod: 'monthly',
            },
            featureList: content.pricing_includes || [],
            targetIndustry: content.target_industries || [],
            competitiveDifferentiators: content.key_differentiators || [],
            keywords: content.keywords || [],
            lastUpdated: content.last_updated,
            version: content.version,
        };

        // Return with proper headers
        return NextResponse.json(structuredData, {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
        });
    } catch (error) {
        console.error('Error serving context.json:', error);
        return NextResponse.json(
            { error: 'Failed to load context' },
            { status: 500 }
        );
    }
}

