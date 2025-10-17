import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { REPORT_BUILDER_SYSTEM_PROMPT } from '@/lib/ai/reporting-prompt';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages, reportData } = await req.json();

    // Add report context to system prompt if available
    let systemPrompt = REPORT_BUILDER_SYSTEM_PROMPT;
    
    if (reportData) {
      systemPrompt += `\n\n## CURRENT REPORT STATE\n\n`;
      systemPrompt += `Total Responses: ${reportData.totalResponses || 0}\n`;
      systemPrompt += `Date Range: ${reportData.dateRange || 'Last 30 days'}\n`;
      
      if (reportData.sections && reportData.sections.length > 0) {
        systemPrompt += `\nExisting Sections:\n`;
        reportData.sections.forEach((section: any, idx: number) => {
          systemPrompt += `${idx + 1}. [${section.type}] ${section.title}\n`;
        });
      }
      
      if (reportData.availableFields && reportData.availableFields.length > 0) {
        systemPrompt += `\nAvailable Data Fields:\n`;
        reportData.availableFields.forEach((field: any) => {
          systemPrompt += `- ${field.id}: ${field.label} (${field.type})\n`;
        });
      }
    }

    const result = streamText({
      model: anthropic('claude-3-7-sonnet-20250219'),
      system: systemPrompt,
      messages,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Report chat API error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process report chat request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

