import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import path from 'path';

export async function GET() {
    try {
        // Read the JSON file
        const jsonPath = path.join(process.cwd(), 'public', 'ai', 'context.json');
        const jsonContent = readFileSync(jsonPath, 'utf-8');
        const data = JSON.parse(jsonContent);

        // Return with proper headers
        return NextResponse.json(data, {
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

