/**
 * Courses API - List and Create
 */

import { createClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';
import type { Course, CourseBlock } from '@/lib/types/course';

export const runtime = 'edge';

// GET /api/courses - List all courses in workspace
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const workspaceId = searchParams.get('workspace_id');

        if (!workspaceId) {
            return NextResponse.json(
                { error: 'workspace_id is required' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Verify authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Fetch courses
        const { data: courses, error } = await supabase
            .from('courses')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching courses:', error);
            return NextResponse.json(
                { error: 'Failed to fetch courses' },
                { status: 500 }
            );
        }

        return NextResponse.json({ courses: courses || [] });
    } catch (error) {
        console.error('Error in GET /api/courses:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/courses - Create new course
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, blocks, workspace_id } = body;

        if (!title || !blocks || !workspace_id) {
            return NextResponse.json(
                { error: 'title, blocks, and workspace_id are required' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Verify authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Calculate total points from quiz blocks
        const totalPoints = (blocks as CourseBlock[]).reduce((sum, block) => {
            if (block.type === 'multiple_choice' || block.type === 'true_false') {
                return sum + block.points;
            }
            return sum;
        }, 0);

        // Generate course ID
        const courseId = nanoid();

        // Create course
        const { data: course, error } = await supabase
            .from('courses')
            .insert({
                id: courseId,
                workspace_id,
                creator_id: user.id,
                title,
                description: description || null,
                blocks,
                total_points: totalPoints,
                estimated_minutes: body.estimated_minutes || 10,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating course:', error);
            return NextResponse.json(
                { error: 'Failed to create course' },
                { status: 500 }
            );
        }

        return NextResponse.json({ course }, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/courses:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

