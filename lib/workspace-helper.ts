/**
 * Workspace Helper
 * Utility functions for workspace-based multi-tenancy
 */

import { createClient } from '@/lib/supabase/server';

/**
 * Get the authenticated user's workspace ID
 * Returns null if user is not authenticated or has no workspace
 */
export async function getUserWorkspaceId(): Promise<string | null> {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.log('No authenticated user');
    return null;
  }

  // Get user's workspace (first one they're a member of)
  const { data: membership, error: membershipError } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: true })
    .limit(1)
    .single();

  if (membershipError || !membership) {
    console.log('No workspace found for user:', user.id);
    return null;
  }

  return membership.workspace_id;
}

/**
 * Get authenticated user and their workspace ID
 * Returns both user object and workspace ID
 * Throws error if user is not authenticated
 */
export async function getAuthenticatedUserWithWorkspace() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error('Unauthorized - authentication required');
  }

  const workspaceId = await getUserWorkspaceId();
  
  if (!workspaceId) {
    throw new Error('No workspace found for user');
  }

  return {
    user,
    workspaceId,
    supabase,
  };
}

