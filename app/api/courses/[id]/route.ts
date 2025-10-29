/**
 * Single Course API - Get course by ID
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

// GET /api/courses/[id] - Get single course with all blocks
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const supabase = await createClient();

        // Verify authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Fetch course
        const { data: course, error } = await supabase
            .from('courses')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching course:', error);
            return NextResponse.json(
                { error: 'Course not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ course });
    } catch (error) {
        console.error('Error in GET /api/courses/[id]:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

