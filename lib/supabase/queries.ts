/**
 * V7 Form Builder - Supabase Query Functions
 * 
 * This file contains all database query functions for the V7 Form Builder.
 * All functions use the Supabase client and TypeScript types for type safety.
 */

import { supabase } from './client';
import type { Database, Tables, TablesInsert, TablesUpdate } from './database.types';

// Type aliases for easier use
export type Workspace = Tables<'workspaces'>;
export type WorkspaceInsert = TablesInsert<'workspaces'>;
export type WorkspaceUpdate = TablesUpdate<'workspaces'>;

export type Form = Tables<'forms'>;
export type FormInsert = TablesInsert<'forms'>;
export type FormUpdate = TablesUpdate<'forms'>;

export type FormSubmission = Tables<'form_submissions'>;
export type FormSubmissionInsert = TablesInsert<'form_submissions'>;

export type Template = Tables<'templates'>;

// ============================================================================
// WORKSPACE OPERATIONS
// ============================================================================

/**
 * Get all workspaces for the current user
 */
export async function getWorkspaces() {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get a single workspace by ID
 */
export async function getWorkspace(id: string) {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new workspace
 */
export async function createWorkspace(workspace: WorkspaceInsert) {
  const { data, error } = await supabase
    .from('workspaces')
    .insert(workspace)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a workspace
 */
export async function updateWorkspace(id: string, updates: WorkspaceUpdate) {
  const { data, error } = await supabase
    .from('workspaces')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a workspace
 */
export async function deleteWorkspace(id: string) {
  const { error } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================================
// FORM OPERATIONS
// ============================================================================

/**
 * Get all forms in a workspace
 */
export async function getForms(workspaceId: string, status?: string) {
  let query = supabase
    .from('forms')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

/**
 * Get a single form by ID
 */
export async function getForm(id: string) {
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get a form by slug
 */
export async function getFormBySlug(workspaceId: string, slug: string) {
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new form
 */
export async function createForm(form: FormInsert) {
  const { data, error } = await supabase
    .from('forms')
    .insert(form)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a form
 */
export async function updateForm(id: string, updates: FormUpdate) {
  const { data, error } = await supabase
    .from('forms')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a form
 */
export async function deleteForm(id: string) {
  const { error } = await supabase
    .from('forms')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Publish a form (change status to published)
 */
export async function publishForm(id: string) {
  const { data, error } = await supabase
    .from('forms')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Unpublish a form (change status to draft)
 */
export async function unpublishForm(id: string) {
  const { data, error } = await supabase
    .from('forms')
    .update({ status: 'draft' })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// FORM SUBMISSION OPERATIONS
// ============================================================================

/**
 * Get all submissions for a form
 */
export async function getFormSubmissions(formId: string, limit = 100, offset = 0) {
  const { data, error } = await supabase
    .from('form_submissions')
    .select('*')
    .eq('form_id', formId)
    .order('submitted_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
}

/**
 * Get a single submission by ID
 */
export async function getFormSubmission(id: string) {
  const { data, error } = await supabase
    .from('form_submissions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new form submission (for public form submissions)
 */
export async function createFormSubmission(submission: FormSubmissionInsert) {
  const { data, error } = await supabase
    .from('form_submissions')
    .insert(submission)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get submission statistics for a form
 */
export async function getFormStats(formId: string) {
  const { data, error } = await supabase
    .from('form_submissions')
    .select('id, time_to_complete, device_type, submitted_at')
    .eq('form_id', formId);

  if (error) throw error;

  // Calculate stats
  const total = data.length;
  const avgCompletionTime = data.reduce((sum, s) => sum + (s.time_to_complete || 0), 0) / total;
  const deviceBreakdown = data.reduce((acc, s) => {
    acc[s.device_type || 'unknown'] = (acc[s.device_type || 'unknown'] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Submissions in last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentSubmissions = data.filter(s => 
    new Date(s.submitted_at!) >= sevenDaysAgo
  ).length;

  return {
    total,
    avgCompletionTime: Math.round(avgCompletionTime),
    deviceBreakdown,
    recentSubmissions,
    submissionsLast7Days: recentSubmissions,
  };
}

// ============================================================================
// TEMPLATE OPERATIONS
// ============================================================================

/**
 * Get all public templates
 */
export async function getPublicTemplates() {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('is_public', true)
    .order('use_count', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get featured templates
 */
export async function getFeaturedTemplates() {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('is_featured', true)
    .eq('is_public', true)
    .limit(6);

  if (error) throw error;
  return data;
}

/**
 * Get templates by category
 */
export async function getTemplatesByCategory(category: string) {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('category', category)
    .eq('is_public', true)
    .order('use_count', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Increment template use count
 * TODO: Create RPC function in Supabase before enabling
 */
// export async function incrementTemplateUseCount(id: string) {
//   const { data, error } = await supabase
//     .rpc('increment_template_use_count', { template_id: id });

//   if (error) throw error;
//   return data;
// }

// ============================================================================
// AI CHAT HISTORY OPERATIONS
// ============================================================================

/**
 * Get chat history for a user
 */
export async function getChatHistory(userId: string, formId?: string, limit = 50) {
  let query = supabase
    .from('ai_chat_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (formId) {
    query = query.eq('form_id', formId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

/**
 * Save a chat message
 */
export async function saveChatMessage(message: {
  user_id: string;
  workspace_id?: string;
  form_id?: string;
  role: string;
  message: string;
  context?: any;
  model?: string;
  tokens_used?: number;
}) {
  const { data, error } = await supabase
    .from('ai_chat_history')
    .insert(message)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// ANALYTICS OPERATIONS
// ============================================================================

/**
 * Get analytics for a form by date range
 */
export async function getFormAnalytics(
  formId: string,
  startDate: string,
  endDate: string
) {
  const { data, error } = await supabase
    .from('form_analytics')
    .select('*')
    .eq('form_id', formId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Get recent analytics (last 30 days)
 */
export async function getRecentAnalytics(formId: string) {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  return getFormAnalytics(formId, startDate, endDate);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a unique slug from a name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Check if a slug is available in a workspace
 */
export async function isSlugAvailable(workspaceId: string, slug: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('forms')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('slug', slug)
    .single();

  // If error (not found), slug is available
  return error !== null;
}

/**
 * Generate a unique slug for a workspace
 */
export async function generateUniqueSlug(workspaceId: string, name: string): Promise<string> {
  let slug = generateSlug(name);
  let counter = 1;

  while (!(await isSlugAvailable(workspaceId, slug))) {
    slug = `${generateSlug(name)}-${counter}`;
    counter++;
  }

  return slug;
}

