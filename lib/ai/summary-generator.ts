import { createClient } from '@/lib/supabase/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { FilterConfig, SummaryMetrics, AIContent, CadenceMetric, Insight } from '@/lib/types/summary';

export async function generateSummary(
  summaryId: string,
  cadenceIds: string[],
  filterConfig: FilterConfig,
  userCommentary?: string
): Promise<void> {
  const supabase = await createClient();

  try {
    // Update status to generating
    await supabase
      .from('summary_reports')
      .update({ status: 'generating' })
      .eq('id', summaryId);

    // Get summary details
    const { data: summary } = await supabase
      .from('summary_reports')
      .select('*')
      .eq('id', summaryId)
      .single();

    if (!summary) {
      throw new Error('Summary not found');
    }

    // Fetch cadences with form details
    const { data: cadences } = await supabase
      .from('form_cadences')
      .select('*, form:forms(*)')
      .in('id', cadenceIds);

    if (!cadences || cadences.length === 0) {
      throw new Error('No cadences found');
    }

    // Fetch form instances within date range
    const statusFilter = filterConfig.status_filter || ['completed', 'missed', 'ready', 'in_progress', 'pending'];
    
    const { data: instances } = await supabase
      .from('form_instances')
      .select(`
        *,
        cadence:form_cadences(id, name),
        form:forms(title),
        content:content(*)
      `)
      .in('cadence_id', cadenceIds)
      .gte('scheduled_for', summary.date_range_start)
      .lte('scheduled_for', summary.date_range_end)
      .in('status', statusFilter)
      .order('scheduled_for', { ascending: true });

    if (!instances) {
      throw new Error('Failed to fetch instances');
    }

    // Calculate metrics
    const metrics = calculateMetrics(instances, cadences);

    // Aggregate form responses
    const responses = await aggregateResponses(instances, supabase);

    // Build AI prompt
    const prompt = buildPrompt(
      cadences,
      instances,
      metrics,
      responses,
      summary.date_range_start,
      summary.date_range_end,
      userCommentary
    );

    // Call OpenAI
    const { text } = await generateText({
      model: openai('gpt-4o'),
      messages: [
        {
          role: 'system',
          content: `You are a compliance analyst assistant. Analyze form completion data and provide actionable insights. 
          Return your response as a valid JSON object with the following structure:
          {
            "executive_summary": "2-3 paragraph overview",
            "insights": [
              {
                "category": "compliance" | "quality" | "timing" | "trends",
                "title": "Short title",
                "description": "Detailed description",
                "severity": "low" | "medium" | "high"
              }
            ],
            "recommendations": ["Recommendation 1", "Recommendation 2", ...]
          }`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      maxTokens: 2000
    });

    // Parse AI response
    let aiContent: AIContent;
    try {
      aiContent = JSON.parse(text);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      aiContent = {
        executive_summary: text,
        insights: [],
        recommendations: []
      };
    }

    // Update summary with results
    await supabase
      .from('summary_reports')
      .update({
        status: 'completed',
        ai_content: aiContent,
        metrics,
        generated_at: new Date().toISOString()
      })
      .eq('id', summaryId);

    // Send notifications to recipients
    await sendSummaryNotifications(summaryId, summary.workspace_id, summary.recipients, summary.name, supabase);

  } catch (error: any) {
    console.error('Error generating summary:', error);
    
    // Update status to failed
    await supabase
      .from('summary_reports')
      .update({ 
        status: 'failed',
        ai_content: {
          executive_summary: `Failed to generate summary: ${error.message}`,
          insights: [],
          recommendations: []
        }
      })
      .eq('id', summaryId);
    
    throw error;
  }
}

function calculateMetrics(instances: any[], cadences: any[]): SummaryMetrics {
  const total = instances.length;
  const completed = instances.filter(i => i.status === 'completed').length;
  const missed = instances.filter(i => i.status === 'missed').length;
  const inProgress = instances.filter(i => i.status === 'in_progress').length;
  const pending = instances.filter(i => i.status === 'pending').length;

  const by_cadence: CadenceMetric[] = cadences.map(cadence => {
    const cadenceInstances = instances.filter(i => i.cadence_id === cadence.id);
    const cadenceCompleted = cadenceInstances.filter(i => i.status === 'completed');
    const cadenceMissed = cadenceInstances.filter(i => i.status === 'missed');
    
    // Calculate average completion time
    const completionTimes = cadenceCompleted
      .filter(i => i.completed_at && i.scheduled_for)
      .map(i => {
        const scheduled = new Date(i.scheduled_for);
        const completed = new Date(i.completed_at);
        return (completed.getTime() - scheduled.getTime()) / (1000 * 60); // minutes
      });
    
    const avgCompletionTime = completionTimes.length > 0
      ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
      : undefined;

    return {
      cadence_id: cadence.id,
      cadence_name: cadence.name,
      total: cadenceInstances.length,
      completed: cadenceCompleted.length,
      missed: cadenceMissed.length,
      completion_rate: cadenceInstances.length > 0 ? (cadenceCompleted.length / cadenceInstances.length) * 100 : 0,
      avg_completion_time_minutes: avgCompletionTime
    };
  });

  return {
    total_instances: total,
    completed,
    missed,
    in_progress: inProgress,
    pending,
    completion_rate: total > 0 ? (completed / total) * 100 : 0,
    by_cadence
  };
}

async function aggregateResponses(instances: any[], supabase: any): Promise<any> {
  const responses: any = {};

  for (const instance of instances) {
    if (instance.status !== 'completed' || !instance.submission_id) continue;

    // Fetch submission data
    const { data: submission } = await supabase
      .from('form_submissions')
      .select('data')
      .eq('id', instance.submission_id)
      .single();

    if (submission?.data) {
      const cadenceName = instance.cadence?.name || 'Unknown';
      if (!responses[cadenceName]) {
        responses[cadenceName] = [];
      }
      responses[cadenceName].push({
        instance_id: instance.id,
        scheduled_for: instance.scheduled_for,
        completed_at: instance.completed_at,
        data: submission.data
      });
    }
  }

  return responses;
}

function buildPrompt(
  cadences: any[],
  instances: any[],
  metrics: SummaryMetrics,
  responses: any,
  dateStart: string,
  dateEnd: string,
  userCommentary?: string
): string {
  const cadenceNames = cadences.map(c => c.name).join(', ');
  const dateRange = `${new Date(dateStart).toLocaleDateString()} to ${new Date(dateEnd).toLocaleDateString()}`;

  let prompt = `Analyze the following compliance data for the period ${dateRange}.\n\n`;
  
  if (userCommentary) {
    prompt += `**User Commentary/Focus**: ${userCommentary}\n\n`;
  }

  prompt += `**Cadences**: ${cadenceNames}\n\n`;
  prompt += `**Overall Metrics**:\n`;
  prompt += `- Total scheduled: ${metrics.total_instances}\n`;
  prompt += `- Completed: ${metrics.completed} (${metrics.completion_rate.toFixed(1)}%)\n`;
  prompt += `- Missed: ${metrics.missed}\n`;
  prompt += `- In Progress: ${metrics.in_progress}\n`;
  prompt += `- Pending: ${metrics.pending}\n\n`;

  prompt += `**By Cadence**:\n`;
  metrics.by_cadence.forEach(c => {
    prompt += `- ${c.cadence_name}: ${c.completed}/${c.total} completed (${c.completion_rate.toFixed(1)}%)`;
    if (c.avg_completion_time_minutes) {
      prompt += `, avg time: ${Math.round(c.avg_completion_time_minutes)} minutes`;
    }
    prompt += `\n`;
  });

  prompt += `\n**Form Responses** (sample from completed forms):\n`;
  for (const [cadenceName, submissions] of Object.entries(responses as any)) {
    const sampleSize = Math.min(submissions.length, 5);
    prompt += `\n${cadenceName} (showing ${sampleSize} of ${submissions.length}):\n`;
    
    submissions.slice(0, sampleSize).forEach((sub: any, idx: number) => {
      prompt += `  ${idx + 1}. Completed: ${new Date(sub.completed_at).toLocaleString()}\n`;
      prompt += `     Data: ${JSON.stringify(sub.data, null, 2).substring(0, 500)}...\n`;
    });
  }

  prompt += `\n**Instructions**:\n`;
  prompt += `1. Provide an executive summary highlighting compliance rates, trends, and concerns.\n`;
  prompt += `2. Generate 3-5 actionable insights categorized by: compliance, quality, timing, or trends.\n`;
  prompt += `3. Provide 3-5 specific recommendations to improve compliance and quality.\n`;
  prompt += `4. If user commentary is provided, ensure your analysis addresses their specific concerns.\n`;
  prompt += `5. For images, note their presence but state you cannot analyze visual content.\n`;
  prompt += `6. Return response as valid JSON matching the specified schema.\n`;

  return prompt;
}

async function sendSummaryNotifications(
  summaryId: string,
  workspaceId: string,
  recipients: string[],
  summaryName: string,
  supabase: any
): Promise<void> {
  // Get workspace members matching recipients
  const { data: members } = await supabase
    .from('workspace_members')
    .select('user_id, users(email)')
    .eq('workspace_id', workspaceId)
    .in('users.email', recipients);

  if (!members || members.length === 0) return;

  // Create in-app notifications
  for (const member of members) {
    await supabase
      .from('notifications')
      .insert({
        workspace_id: workspaceId,
        user_id: member.user_id,
        type: 'summary_generated',
        title: 'New Summary Available',
        message: `${summaryName} has been generated`,
        action_url: `/cadences?tab=summaries&view=${summaryId}`,
        metadata: { summary_id: summaryId }
      });
  }
}

