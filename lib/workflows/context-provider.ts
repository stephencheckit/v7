import { createClient } from '@/lib/supabase/server';

interface WorkflowContext {
  sensors: Array<{
    id: string;
    name: string;
    location: string;
    current_temp?: number;
  }>;
  forms: Array<{
    id: string;
    title: string;
  }>;
  users: Array<{
    id: string;
    email: string;
    role?: string;
  }>;
}

/**
 * Get workflow-relevant context for AI conversations
 * This provides the AI with sensors, forms, and users to reference
 */
export async function getWorkflowContext(workspaceId: string): Promise<WorkflowContext> {
  const supabase = await createClient();
  
  try {
    // Fetch sensors with latest reading
    const { data: sensors } = await supabase
      .from('sensors')
      .select(`
        id,
        name,
        location,
        latest_reading:sensor_readings(temperature_fahrenheit)
      `)
      .eq('workspace_id', workspaceId)
      .order('name');
    
    // Fetch forms
    const { data: forms } = await supabase
      .from('simple_forms')
      .select('id, title')
      .eq('workspace_id', workspaceId)
      .order('title');
    
    // Fetch workspace members with user details
    const { data: members } = await supabase
      .from('workspace_members')
      .select(`
        user_id,
        role,
        user:auth.users(email)
      `)
      .eq('workspace_id', workspaceId);
    
    // Format sensors
    const formattedSensors = (sensors || []).map(s => ({
      id: s.id,
      name: s.name,
      location: s.location || 'Unknown',
      current_temp: (s.latest_reading as any)?.[0]?.temperature_fahrenheit
    }));
    
    // Format forms
    const formattedForms = (forms || []).map(f => ({
      id: f.id,
      title: f.title
    }));
    
    // Format users
    const formattedUsers = (members || []).map(m => ({
      id: m.user_id,
      email: (m.user as any)?.email || 'Unknown',
      role: m.role
    }));
    
    return {
      sensors: formattedSensors,
      forms: formattedForms,
      users: formattedUsers
    };
  } catch (error) {
    console.error('Error fetching workflow context:', error);
    return {
      sensors: [],
      forms: [],
      users: []
    };
  }
}

/**
 * Format workflow context as a string for AI prompt injection
 */
export function formatWorkflowContextForAI(context: WorkflowContext): string {
  let contextStr = '\n\n## Available Resources\n\n';
  
  // Add sensors
  if (context.sensors.length > 0) {
    contextStr += '**Sensors:**\n';
    context.sensors.forEach(s => {
      const tempStr = s.current_temp ? ` (${s.current_temp}°F)` : '';
      contextStr += `- ${s.name}${tempStr} - ${s.location} [ID: ${s.id}]\n`;
    });
    contextStr += '\n';
  }
  
  // Add forms
  if (context.forms.length > 0) {
    contextStr += '**Forms:**\n';
    context.forms.forEach(f => {
      contextStr += `- ${f.title} [ID: ${f.id}]\n`;
    });
    contextStr += '\n';
  }
  
  // Add users (just count for privacy)
  if (context.users.length > 0) {
    contextStr += `**Workspace Users:** ${context.users.length} users available\n\n`;
  }
  
  return contextStr;
}

/**
 * Resolve "auto-detect" references in workflow config
 * Attempts to find the most relevant sensor or form based on context
 */
export async function resolveWorkflowReferences(
  workflowConfig: any,
  workspaceId: string,
  conversationContext?: string
): Promise<any> {
  const context = await getWorkflowContext(workspaceId);
  const resolved = JSON.parse(JSON.stringify(workflowConfig)); // Deep clone
  
  // Resolve trigger sensor_id
  if (
    resolved.trigger?.config?.sensor_id === 'auto-detect' &&
    context.sensors.length > 0
  ) {
    // Simple heuristic: use first sensor, or try to match by name in conversation
    let matchedSensor = context.sensors[0];
    
    if (conversationContext) {
      const lowerContext = conversationContext.toLowerCase();
      const matched = context.sensors.find(s => 
        lowerContext.includes(s.name.toLowerCase()) ||
        lowerContext.includes(s.location.toLowerCase())
      );
      if (matched) matchedSensor = matched;
    }
    
    resolved.trigger.config.sensor_id = matchedSensor.id;
  }
  
  // Resolve trigger form_id
  if (
    resolved.trigger?.config?.form_id === 'auto-detect' &&
    context.forms.length > 0
  ) {
    // Simple heuristic: use first form, or try to match by title in conversation
    let matchedForm = context.forms[0];
    
    if (conversationContext) {
      const lowerContext = conversationContext.toLowerCase();
      const matched = context.forms.find(f => 
        lowerContext.includes(f.title.toLowerCase())
      );
      if (matched) matchedForm = matched;
    }
    
    resolved.trigger.config.form_id = matchedForm.id;
  }
  
  // Resolve action form_id for create_task actions
  if (resolved.actions) {
    for (const action of resolved.actions) {
      if (
        action.type === 'create_task' &&
        action.config?.form_id === 'auto-detect' &&
        context.forms.length > 0
      ) {
        // For create_task, try to find a different form than the trigger form
        let matchedForm = context.forms[0];
        
        if (conversationContext) {
          const lowerContext = conversationContext.toLowerCase();
          const matched = context.forms.find(f => 
            lowerContext.includes(f.title.toLowerCase())
          );
          if (matched) matchedForm = matched;
        }
        
        action.config.form_id = matchedForm.id;
      }
    }
  }
  
  // Resolve "current_user" to actual user ID
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user && resolved.actions) {
    for (const action of resolved.actions) {
      if (action.config?.recipients) {
        action.config.recipients = action.config.recipients.map((r: string) => 
          r === 'current_user' ? `user:${user.id}` : r
        );
      }
      if (action.config?.assign_to === 'current_user') {
        action.config.assign_to = `user:${user.id}`;
      }
    }
  }
  
  return resolved;
}

