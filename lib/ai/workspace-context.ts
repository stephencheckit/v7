/**
 * Workspace Context Provider for AI Assistant
 * 
 * Provides rich context about the user's workspace including:
 * - Forms & questions (all forms)
 * - Recent responses (last 7 days)
 * - Workflows (all workflows)
 * - Sensors (all sensors)
 * - Team members (all members)
 * 
 * Note: No artificial limits - fetches all data for maximum AI capability.
 * Can add limits later if token costs or performance become an issue.
 */

import { createClient } from '@/lib/supabase/server';

export interface WorkspaceContext {
  forms: FormContext[];
  recentResponses: ResponseContext[];
  workflows: WorkflowContext[];
  sensors: SensorContext[];
  teamMembers: TeamMemberContext[];
  summary: string;
}

export interface FormContext {
  id: string;
  title: string;
  description: string | null;
  question_count: number;
  response_count: number;
  questions: string[];
}

export interface ResponseContext {
  form_title: string;
  submitted_at: string;
  response_data: any;
}

export interface WorkflowContext {
  id: string;
  name: string;
  trigger_type: string;
  action_count: number;
  is_active: boolean;
}

export interface SensorContext {
  id: string;
  name: string;
  sensor_type: string;
  location: string | null;
  current_reading: number | null;
  status: string;
}

export interface TeamMemberContext {
  name: string;
  email: string;
  role: string;
}

/**
 * Get comprehensive workspace context for AI assistant
 */
export async function getWorkspaceContext(
  workspaceId: string,
  userId: string,
  includePrivateData: boolean = false
): Promise<WorkspaceContext> {
  const supabase = await createClient();

  // Fetch forms with question count
  const { data: forms } = await supabase
    .from('simple_forms')
    .select('id, title, description, schema, created_at')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  const formsContext: FormContext[] = (forms || []).map(form => {
    // schema is JSONB with { fields: [...] } structure
    const schema = form.schema as any;
    const fields = Array.isArray(schema?.fields) ? schema.fields : [];
    const questions = fields
      .filter((f: any) => f.label)
      .map((f: any) => f.label)
      .slice(0, 5); // Top 5 questions per form

    return {
      id: form.id,
      title: form.title,
      description: form.description,
      question_count: fields.length,
      response_count: 0, // TODO: Join with responses count
      questions
    };
  });

  // Fetch recent form responses (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  let responsesContext: ResponseContext[] = [];
  if (includePrivateData) {
    const { data: responses } = await supabase
      .from('simple_form_submissions')
      .select(`
        data,
        submitted_at,
        simple_forms!inner(title)
      `)
      .eq('workspace_id', workspaceId)
      .gte('submitted_at', sevenDaysAgo.toISOString())
      .order('submitted_at', { ascending: false });

    responsesContext = (responses || []).map(r => ({
      form_title: (r as any).simple_forms.title,
      submitted_at: r.submitted_at,
      response_data: r.data
    }));
  }

  // Fetch workflows
  const { data: workflows } = await supabase
    .from('workflows')
    .select('id, name, trigger_type, trigger_config, actions, is_active')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false});

  const workflowsContext: WorkflowContext[] = (workflows || []).map(w => ({
    id: w.id,
    name: w.name,
    trigger_type: w.trigger_type,
    action_count: Array.isArray(w.actions) ? w.actions.length : 0,
    is_active: w.is_active
  }));

  // Fetch sensors
  const { data: sensors } = await supabase
    .from('sensors')
    .select('id, name, type, location, last_reading_at')
    .eq('workspace_id', workspaceId)
    .order('name');

  const sensorsContext: SensorContext[] = (sensors || []).map(s => ({
    id: s.id,
    name: s.name,
    sensor_type: s.type,
    location: s.location,
    current_reading: null, // Would need to join with sensor_readings for latest reading
    status: s.last_reading_at ? 'active' : 'inactive'
  }));

  // Fetch team members (limited info for privacy)
  const { data: members } = await supabase
    .from('workspace_members')
    .select(`
      role,
      user:auth.users(email)
    `)
    .eq('workspace_id', workspaceId);

  const teamContext: TeamMemberContext[] = (members || []).map(m => {
    const email = (m as any).user?.email || 'unknown';
    const name = email.split('@')[0];
    return {
      name,
      email,
      role: m.role
    };
  });

  // Generate summary
  const summary = generateContextSummary({
    forms: formsContext,
    recentResponses: responsesContext,
    workflows: workflowsContext,
    sensors: sensorsContext,
    teamMembers: teamContext
  });

  return {
    forms: formsContext,
    recentResponses: responsesContext,
    workflows: workflowsContext,
    sensors: sensorsContext,
    teamMembers: teamContext,
    summary
  };
}

/**
 * Generate a human-readable summary of workspace context
 */
function generateContextSummary(context: Omit<WorkspaceContext, 'summary'>): string {
  const lines: string[] = [];

  lines.push('**Your Workspace Context:**\n');

  // Forms
  if (context.forms.length > 0) {
    lines.push(`📋 **${context.forms.length} Forms** (showing most recent):`);
    context.forms.slice(0, 5).forEach(form => {
      lines.push(`   • "${form.title}" - ${form.question_count} questions`);
      if (form.questions.length > 0) {
        lines.push(`     Sample questions: ${form.questions.slice(0, 2).join(', ')}`);
      }
    });
    lines.push('');
  }

  // Workflows
  if (context.workflows.length > 0) {
    lines.push(`⚡ **${context.workflows.length} Workflows:**`);
    context.workflows.slice(0, 5).forEach(w => {
      const status = w.is_active ? '🟢 Active' : '⏸️ Paused';
      lines.push(`   • ${status} "${w.name}" (${w.trigger_type} → ${w.action_count} actions)`);
    });
    lines.push('');
  }

  // Sensors
  if (context.sensors.length > 0) {
    lines.push(`🌡️ **${context.sensors.length} Sensors:**`);
    context.sensors.slice(0, 5).forEach(s => {
      const reading = s.current_reading ? `${s.current_reading}°F` : 'No reading';
      lines.push(`   • "${s.name}" (${s.sensor_type}) - ${reading}`);
    });
    lines.push('');
  }

  // Responses
  if (context.recentResponses.length > 0) {
    lines.push(`📊 **${context.recentResponses.length} Recent Responses** (last 7 days)`);
    lines.push('');
  }

  // Team
  if (context.teamMembers.length > 0) {
    lines.push(`👥 **${context.teamMembers.length} Team Members**`);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Format workspace context for AI system prompt injection
 */
export function formatContextForAI(context: WorkspaceContext): string {
  const lines: string[] = [];

  lines.push('\n**WORKSPACE CONTEXT:**');
  lines.push('You have access to the following workspace data. Use this to provide specific, contextual answers.\n');

  // Forms
  if (context.forms.length > 0) {
    lines.push('**Available Forms:**');
    context.forms.forEach(form => {
      lines.push(`- Form: "${form.title}"`);
      lines.push(`  ID: ${form.id}`);
      if (form.description) lines.push(`  Description: ${form.description}`);
      lines.push(`  ${form.question_count} questions, ${form.response_count} responses`);
      if (form.questions.length > 0) {
        lines.push(`  Sample questions: ${form.questions.join(', ')}`);
      }
    });
    lines.push('');
  }

  // Workflows
  if (context.workflows.length > 0) {
    lines.push('**Active Workflows:**');
    context.workflows.forEach(w => {
      const status = w.is_active ? 'ACTIVE' : 'PAUSED';
      lines.push(`- [${status}] "${w.name}" (ID: ${w.id})`);
      lines.push(`  Trigger: ${w.trigger_type}, ${w.action_count} actions`);
    });
    lines.push('');
  }

  // Sensors
  if (context.sensors.length > 0) {
    lines.push('**Sensors:**');
    context.sensors.forEach(s => {
      const reading = s.current_reading ? `Current: ${s.current_reading}°F` : 'No reading';
      lines.push(`- "${s.name}" (${s.sensor_type}) - ${reading}`);
      if (s.location) lines.push(`  Location: ${s.location}`);
    });
    lines.push('');
  }

  // Recent responses (if included)
  if (context.recentResponses.length > 0) {
    lines.push(`**Recent Form Activity:** ${context.recentResponses.length} responses in last 7 days`);
    lines.push('');
  }

  lines.push('When referencing forms, workflows, or sensors, use their actual names and IDs from above.');
  lines.push('');

  return lines.join('\n');
}

