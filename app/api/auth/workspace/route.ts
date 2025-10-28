import { NextResponse } from 'next/server';
import { getUserWorkspaceId } from '@/lib/workspace-helper';

/**
 * GET /api/auth/workspace
 * Returns the current user's workspace ID
 */
export async function GET() {
  try {
    const workspaceId = await getUserWorkspaceId();
    
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'No workspace found for user' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ workspaceId });
  } catch (error: any) {
    console.error('Error fetching workspace:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspace', details: error.message },
      { status: 500 }
    );
  }
}

