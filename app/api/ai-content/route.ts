import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase
            .from('ai_content_active')
            .select('*')
            .single();

        if (error) {
            console.error('Error fetching AI content:', error);
            return NextResponse.json(
                { error: 'Failed to fetch AI content' },
                { status: 500 }
            );
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

