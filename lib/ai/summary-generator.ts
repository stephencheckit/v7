import { createClient } from '@/lib/supabase/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { FilterConfig, SummaryMetrics, AIContent, CadenceMetric, Insight } from '@/lib/types/summary';

export async function generateSummary(
  summaryId: string,
  cadenceIds: string[],
  formIds: string[],
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

    // Fetch cadences with form details (if any)
    let cadences = [];
    let instances: any[] = [];
    
    if (cadenceIds && cadenceIds.length > 0) {
      const { data: cadenceData } = await supabase
        .from('form_cadences')
        .select('*, form:simple_forms(*)')
        .in('id', cadenceIds);
      cadences = cadenceData || [];

      // Fetch form instances within date range
      const statusFilter = filterConfig.status_filter || ['completed', 'missed', 'ready', 'in_progress', 'pending'];
      
      const { data: instanceData } = await supabase
        .from('form_instances')
        .select(`
          *,
          cadence:form_cadences(id, name),
          form:simple_forms(title),
          content:content(*)
        `)
        .in('cadence_id', cadenceIds)
        .gte('scheduled_for', summary.date_range_start)
        .lte('scheduled_for', summary.date_range_end)
        .in('status', statusFilter)
        .order('scheduled_for', { ascending: true });

      instances = instanceData || [];
    }

    // Fetch regular form submissions (if any)
    let formSubmissions: any[] = [];
    if (formIds && formIds.length > 0) {
      const { data: forms } = await supabase
        .from('simple_forms')
        .select('id, title')
        .in('id', formIds);

      if (forms) {
        for (const form of forms) {
          const { data: submissions } = await supabase
            .from('simple_form_submissions')
            .select('*')
            .eq('form_id', form.id)
            .gte('submitted_at', summary.date_range_start)
            .lte('submitted_at', summary.date_range_end)
            .order('submitted_at', { ascending: true });

          if (submissions) {
            formSubmissions.push(...submissions.map(s => ({
              ...s,
              form: { title: form.title },
              form_name: form.title,
              form_id: form.id,
              status: 'completed'
            })));
          }
        }
      }
    }

    // Combine both data sources
    const allData = [...instances, ...formSubmissions];

    // Calculate metrics from combined data
    const metrics = calculateMetrics(allData, cadences, formIds || []);

    // Aggregate form responses from all data
    const responses = await aggregateResponses(allData, supabase);

    // Build AI prompt with all data
    const prompt = buildPrompt(
      cadences,
      allData,
      metrics,
      responses,
      summary.date_range_start,
      summary.date_range_end,
      userCommentary,
      formIds || []
    );

    // Call OpenAI
    const { text } = await generateText({
      model: openai('gpt-4o'),
      messages: [
        {
          role: 'system',
          content: `You are a senior compliance analyst preparing reports for executive leadership, board members, and investors. Your reports are authoritative, data-driven, and action-oriented.

CRITICAL RULES:
- Write for C-suite executives, board members, and investors (external stakeholders)
- Focus ONLY on findings, implications, and actions - never discuss the report itself
- Use confident, declarative language - avoid phrases like "this report suggests" or "future reports could"
- Be specific with numbers, percentages, and concrete examples
- Provide actionable insights that drive business decisions
- Never include meta-commentary about the report, data limitations, or analysis frameworks

BAD EXAMPLES (Never write like this):
❌ "Given the user commentary, it is essential to consider this report as a framework..."
❌ "Future reports could benefit from more detailed data..."
❌ "This analysis provides a starting point..."
❌ "Based on the available information..."

GOOD EXAMPLES (Write like this):
✅ "Compliance rates demonstrate strong operational discipline at 95%."
✅ "Three critical areas require immediate attention to mitigate risk."
✅ "Implementation of recommended protocols will reduce incidents by an estimated 40%."

Return your response as a valid JSON object with this structure:
{
  "executive_summary": "2-3 authoritative paragraphs focusing on key findings and business impact",
  "insights": [
    {
      "category": "compliance" | "quality" | "timing" | "trends",
      "title": "Clear, specific finding",
      "description": "Data-driven insight with business implications",
      "severity": "low" | "medium" | "high"
    }
  ],
  "recommendations": ["Specific, actionable directive with expected outcome", ...]
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

    // Parse AI response - strip markdown code fences if present
    let aiContent: AIContent;
    try {
      // Remove markdown code fences (```json ... ``` or ``` ... ```)
      let cleanedText = text.trim();
      if (cleanedText.startsWith('```')) {
        // Remove opening fence (```json or ```)
        cleanedText = cleanedText.replace(/^```(?:json)?\n?/, '');
        // Remove closing fence
        cleanedText = cleanedText.replace(/\n?```$/, '');
      }
      
      aiContent = JSON.parse(cleanedText.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw text:', text);
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

function calculateMetrics(allData: any[], cadences: any[], formIds: string[]): SummaryMetrics {
  const instances = allData;
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
  userCommentary?: string,
  formIds?: string[]
): string {
  const cadenceNames = cadences.map(c => c.name).join(', ');
  const dateRange = `${new Date(dateStart).toLocaleDateString()} to ${new Date(dateEnd).toLocaleDateString()}`;

  let prompt = `You are preparing an executive compliance report for the period ${dateRange}. This report will be presented to senior leadership, board members, and investors. Provide authoritative analysis with actionable insights.\n\n`;
  
  if (userCommentary) {
    prompt += `**Executive Focus Areas**: ${userCommentary}\n\n`;
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

  prompt += `\n**Analysis Requirements**:\n`;
  prompt += `1. Write an executive summary that presents key findings, business impact, and critical actions. Focus on what the data reveals about operational performance and risk.\n`;
  prompt += `2. Identify 3-5 data-driven insights with clear business implications. Each insight should:\n`;
  prompt += `   - State a specific finding with supporting data\n`;
  prompt += `   - Explain the business impact or risk\n`;
  prompt += `   - Be actionable by leadership\n`;
  prompt += `3. Provide 3-5 specific, implementable recommendations that:\n`;
  prompt += `   - Address identified issues or opportunities\n`;
  prompt += `   - Include expected business outcomes\n`;
  prompt += `   - Can be acted upon immediately\n`;
  prompt += `4. Use authoritative, confident language suitable for board presentations.\n`;
  prompt += `5. Never discuss the report itself, data limitations, or suggest future analyses.\n`;
  prompt += `6. If user commentary is provided, incorporate those concerns directly into your analysis.\n`;
  prompt += `7. For images: acknowledge their presence but note visual content analysis is not available.\n`;

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

