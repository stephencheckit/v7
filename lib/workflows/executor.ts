import { createClient } from '@/lib/supabase/server';
import { Workflow, WorkflowAction } from '@/lib/types/workflow';

interface ExecuteWorkflowsParams {
  trigger_type: string;
  workspace_id: string;
  trigger_data: any;
}

/**
 * Execute all active workflows matching the trigger type
 */
export async function executeWorkflows(params: ExecuteWorkflowsParams) {
  const { trigger_type, workspace_id, trigger_data } = params;

  console.log(`[Workflows] Executing workflows for trigger: ${trigger_type}`);

  try {
    // Find matching workflows
    const workflows = await findMatchingWorkflows(params);

    if (workflows.length === 0) {
      console.log('[Workflows] No matching workflows found');
      return;
    }

    console.log(`[Workflows] Found ${workflows.length} matching workflow(s)`);

    // Execute each workflow
    for (const workflow of workflows) {
      if (!workflow.is_active) {
        console.log(`[Workflows] Skipping inactive workflow: ${workflow.name}`);
        continue;
      }

      console.log(`[Workflows] Executing workflow: ${workflow.name}`);

      try {
        const results = [];

        // Execute each action in sequence
        for (const action of workflow.actions) {
          try {
            const result = await executeAction(action, trigger_data, workspace_id);
            results.push(result);
          } catch (actionError) {
            console.error(`[Workflows] Action ${action.type} failed:`, actionError);
            results.push({
              action: action.type,
              status: 'failed',
              error: actionError instanceof Error ? actionError.message : 'Unknown error'
            });
          }
        }

        // Log successful execution
        await logExecution(workflow.id, trigger_data, results, 'completed');

        // Update workflow stats
        await incrementTriggerCount(workflow.id);

        console.log(`[Workflows] Successfully executed workflow: ${workflow.name}`);
      } catch (workflowError) {
        console.error(`[Workflows] Workflow ${workflow.id} failed:`, workflowError);
        await logExecution(
          workflow.id,
          trigger_data,
          [{ status: 'failed', error: workflowError instanceof Error ? workflowError.message : 'Unknown error' }],
          'failed'
        );
      }
    }
  } catch (error) {
    console.error('[Workflows] Error executing workflows:', error);
  }
}

/**
 * Find workflows that match the trigger
 */
async function findMatchingWorkflows(params: ExecuteWorkflowsParams): Promise<Workflow[]> {
  const { trigger_type, workspace_id, trigger_data } = params;

  const supabase = await createClient();

  const { data: workflows, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('workspace_id', workspace_id)
    .eq('trigger_type', trigger_type)
    .eq('is_active', true);

  if (error) {
    console.error('[Workflows] Error fetching workflows:', error);
    return [];
  }

  // For sensor triggers, also check if sensor_id matches
  if ((trigger_type === 'sensor_temp_exceeds' || trigger_type === 'sensor_temp_below') && trigger_data.sensor_id) {
    return (workflows || []).filter(w => {
      const config = w.trigger_config as any;
      return config.sensor_id === trigger_data.sensor_id;
    });
  }

  // For form triggers, check if form_id matches
  if ((trigger_type === 'form_overdue' || trigger_type === 'form_submitted' || trigger_type === 'form_missed') && trigger_data.form_id) {
    return (workflows || []).filter(w => {
      const config = w.trigger_config as any;
      return config.form_id === trigger_data.form_id;
    });
  }

  return workflows || [];
}

/**
 * Execute a single action
 */
async function executeAction(action: WorkflowAction, trigger_data: any, workspace_id: string): Promise<any> {
  console.log(`[Workflows] Executing action: ${action.type}`);

  switch (action.type) {
    case 'email':
      return await sendEmail(action.config, trigger_data, workspace_id);

    case 'sms':
      return await sendSMS(action.config, trigger_data, workspace_id);

    case 'slack':
      // Slack integration - placeholder for demo
      console.log('[Workflows] Slack action triggered:', action.config);
      console.log(`[Workflows] Would post to ${action.config.channel}: ${action.config.message}`);
      if (action.config.mention) {
        console.log(`[Workflows] Would @mention: ${action.config.mention}`);
      }
      return { success: true, message: 'Slack message sent (demo mode)' };

    case 'create_task':
      return await createFormInstance(action.config, trigger_data, workspace_id);

    default:
      // TypeScript exhaustiveness check - this should never be reached
      const exhaustiveCheck: never = action;
      throw new Error(`Unknown action type: ${(exhaustiveCheck as any).type}`);
  }
}

/**
 * Send email notification
 */
async function sendEmail(config: any, trigger_data: any, workspace_id: string): Promise<any> {
  console.log('[Workflows] Sending email:', config);

  // TODO: Implement email sending via SendGrid, Resend, etc.
  // For now, just log it
  console.log(`[Workflows] Email would be sent to:`, config.recipients);
  console.log(`[Workflows] Subject:`, config.subject);
  console.log(`[Workflows] Message:`, config.message);

  return {
    action: 'email',
    status: 'success',
    details: {
      recipients: config.recipients,
      subject: config.subject
    }
  };
}

/**
 * Send SMS notification
 */
async function sendSMS(config: any, trigger_data: any, workspace_id: string): Promise<any> {
  console.log('[Workflows] Sending SMS:', config);

  // TODO: Implement SMS sending via Twilio, etc.
  // For now, just log it
  console.log(`[Workflows] SMS would be sent to:`, config.recipients);
  console.log(`[Workflows] Message:`, config.message);

  return {
    action: 'sms',
    status: 'success',
    details: {
      recipients: config.recipients
    }
  };
}

/**
 * Create a form instance (task)
 */
async function createFormInstance(config: any, trigger_data: any, workspace_id: string): Promise<any> {
  console.log('[Workflows] Creating form instance:', config);

  const supabase = await createClient();

  // Calculate due date
  const dueDate = new Date();
  dueDate.setMinutes(dueDate.getMinutes() + (config.due_minutes || 60));

  // Resolve assign_to (could be user:uuid or role:manager)
  let assignedTo = null;
  if (config.assign_to) {
    if (config.assign_to.startsWith('user:')) {
      assignedTo = config.assign_to.substring(5);
    }
    // TODO: Handle role-based assignment (role:manager, etc.)
  }

  const { data: instance, error } = await supabase
    .from('form_instances')
    .insert({
      form_id: config.form_id,
      workspace_id,
      assigned_to: assignedTo,
      due_date: dueDate.toISOString(),
      status: 'pending',
      priority: config.priority || 'medium'
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create form instance: ${error.message}`);
  }

  console.log('[Workflows] Created form instance:', instance.id);

  return {
    action: 'create_task',
    status: 'success',
    details: {
      instance_id: instance.id,
      form_id: config.form_id,
      due_date: dueDate
    }
  };
}

/**
 * Log workflow execution
 */
async function logExecution(
  workflow_id: string,
  trigger_data: any,
  actions_executed: any[],
  status: 'completed' | 'failed' | 'partial'
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('workflow_executions')
    .insert({
      workflow_id,
      trigger_data,
      actions_executed,
      status,
      error_log: status === 'failed' ? actions_executed : null
    });

  if (error) {
    console.error('[Workflows] Error logging execution:', error);
  }
}

/**
 * Increment workflow trigger count
 */
async function incrementTriggerCount(workflow_id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('workflows')
    .update({
      triggered_count: supabase.rpc('increment_trigger_count', { workflow_id }),
      last_triggered_at: new Date().toISOString()
    })
    .eq('id', workflow_id);

  if (error) {
    // If RPC doesn't exist, fallback to manual increment
    const { data: workflow } = await supabase
      .from('workflows')
      .select('triggered_count')
      .eq('id', workflow_id)
      .single();

    if (workflow) {
      await supabase
        .from('workflows')
        .update({
          triggered_count: (workflow.triggered_count || 0) + 1,
          last_triggered_at: new Date().toISOString()
        })
        .eq('id', workflow_id);
    }
  }
}

