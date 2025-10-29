/**
 * V7 Form Builder - Chat API Endpoint
 * Main Orchestration Agent with streaming and tool calling
 */

import { anthropic } from '@ai-sdk/anthropic';
import { streamText, tool } from 'ai';
import { FORM_BUILDER_SYSTEM_PROMPT } from '@/lib/ai/system-prompt';
import { formBuilderTools } from '@/lib/ai/tools';
import { getAvailableWidgets, getWidgetDefinition } from '@/lib/widgets/registry';
import type { FormSchema, FormField } from '@/lib/types/form-schema';
import { nanoid } from 'nanoid';

// Configure function timeout for AI operations
export const runtime = 'edge';
export const maxDuration = 25;

// Form state stored in memory (will move to database in Phase 3)
let currentForm: FormSchema | null = null;

export async function POST(req: Request) {
  try {
    const { messages, image, workspaceId, context } = await req.json();

    console.log('[API] Received messages:', JSON.stringify(messages, null, 2));
    if (image) console.log('[API] Received image data');
    if (workspaceId) console.log('[API] Received workspaceId:', workspaceId);
    if (context) console.log('[API] Context type:', context);

    // Fetch workspace context if available (for both image and text flows)
    let enhancedSystemPrompt = FORM_BUILDER_SYSTEM_PROMPT;
    if (workspaceId) {
      try {
        console.log('[API] 🔍 Fetching workspace context for workspaceId:', workspaceId);
        // Note: Edge runtime limitation - need to import the module properly
        const { getWorkspaceContext, formatContextForAI } = await import('@/lib/ai/workspace-context');
        
        // Get user from Supabase
        const { createClient } = await import('@/lib/supabase/server');
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('[API] ❌ Auth error:', authError);
        }
        
        if (user) {
          console.log('[API] ✅ User authenticated:', user.id);
          const workspaceContext = await getWorkspaceContext(workspaceId, user.id, false);
          console.log('[API] 📊 Workspace context fetched:', {
            forms: workspaceContext.forms.length,
            workflows: workspaceContext.workflows.length,
            sensors: workspaceContext.sensors.length,
            teamMembers: workspaceContext.teamMembers.length,
            responses: workspaceContext.recentResponses.length
          });
          const contextString = formatContextForAI(workspaceContext);
          console.log('[API] 📝 Context string length:', contextString.length, 'characters');
          enhancedSystemPrompt = FORM_BUILDER_SYSTEM_PROMPT + '\n\n' + contextString;
          console.log('[API] ✅ Enhanced system prompt with workspace context');
        } else {
          console.log('[API] ⚠️ No user found in auth');
        }
      } catch (error) {
        console.error('[API] ❌ Failed to fetch workspace context:', error);
        console.error('[API] Error details:', error instanceof Error ? error.message : 'Unknown error');
        console.error('[API] Stack:', error instanceof Error ? error.stack : 'No stack');
        // Continue without context
      }
    } else {
      console.log('[API] ⚠️ No workspaceId provided in request');
    }

    // If an image is provided, call Anthropic API directly
    if (image && messages.length > 0) {
      console.log('[API] Using direct Anthropic API for vision request...');
      
      const lastMessage = messages[messages.length - 1];
      
      // Extract media type and base64 data from data URL
      const matches = image.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        console.error('[API] Invalid image format - expected data URL');
        throw new Error('Invalid image format');
      }
      
      const mediaType = matches[1];
      const base64Data = matches[2];
      
      console.log('[API] Image media type:', mediaType);
      console.log('[API] Base64 data length:', base64Data.length);
      
      // Call Anthropic API directly
      const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-7-sonnet-20250219',
          max_tokens: 4096,
          system: enhancedSystemPrompt,
          messages: [
            ...messages.slice(0, -1).map((msg: any) => ({
              role: msg.role,
              content: typeof msg.content === 'string' ? msg.content : msg.content,
            })),
            {
              role: lastMessage.role,
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: mediaType,
                    data: base64Data,
                  },
                },
                {
                  type: 'text',
                  text: lastMessage.content,
                },
              ],
            },
          ],
        }),
      });

      if (!anthropicResponse.ok) {
        const errorText = await anthropicResponse.text();
        console.error('[API] Anthropic API error:', errorText);
        throw new Error(`Anthropic API error: ${anthropicResponse.status}`);
      }

      const data = await anthropicResponse.json();
      console.log('[API] Anthropic response received');
      
      // Convert to text stream format expected by the client
      const textContent = data.content
        .filter((block: any) => block.type === 'text')
        .map((block: any) => block.text)
        .join('\n');
      
      // Create a streaming response that matches the AI SDK format
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          // Send the text content in the format expected by the client
          const lines = textContent.split('\n');
          for (const line of lines) {
            controller.enqueue(encoder.encode(`0:"${line.replace(/"/g, '\\"')}"\n`));
          }
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      });
    }

    // Normal text-only flow using AI SDK
    console.log('[API] Starting streamText with Anthropic...');
    const result = streamText({
      model: anthropic('claude-3-7-sonnet-20250219'),
      system: enhancedSystemPrompt,
      messages: messages,
      // TOOLS DISABLED - Using text parsing workaround for Phase 1
      /*tools: {
      // ====================================================================
      // Tool 1: create_form
      // ====================================================================
      
      create_form: tool({
        description: formBuilderTools.create_form.description,
        parameters: formBuilderTools.create_form.parameters,
        // @ts-expect-error - Zod inferred types
        execute: async ({ explanation, title, description, fields, submitButton }) => {
          console.log('[create_form] Explanation:', explanation);
          
          // Create form schema
          currentForm = {
            id: nanoid(),
            title,
            description,
            fields: fields.map((field: any) => ({
              ...field,
              // Ensure id is URL-safe
              id: field.id.toLowerCase().replace(/\s+/g, '-'),
            })),
            submitButton: submitButton || { label: 'Submit' },
            createdAt: new Date().toISOString(),
            version: 1,
          };

          return {
            success: true,
            formId: currentForm.id,
            message: `Created form "${title}" with ${fields.length} field(s)`,
            form: currentForm,
          };
        },
      }),

      // ====================================================================
      // Tool 2: add_field
      // ====================================================================
      
      add_field: tool({
        description: formBuilderTools.add_field.description,
        parameters: formBuilderTools.add_field.parameters,
        
        
        // @ts-expect-error - Zod inferred types
        execute: async (args) => {
          const { explanation, field, position } = args;
          console.log('[add_field] Explanation:', explanation);
          
          if (!currentForm) {
            return {
              success: false,
              error: 'No form exists. Create a form first using create_form.',
            };
          }

          // Ensure field ID is URL-safe
          const normalizedField = {
            ...field,
            id: field.id.toLowerCase().replace(/\s+/g, '-'),
          };

          // Determine insertion index
          let insertIndex = currentForm.fields.length;
          
          if (position === 'first') {
            insertIndex = 0;
          } else if (typeof position === 'object') {
            if (position.after) {
              const afterIndex = currentForm.fields.findIndex(f => f.id === position.after);
              insertIndex = afterIndex >= 0 ? afterIndex + 1 : currentForm.fields.length;
            } else if (position.before) {
              const beforeIndex = currentForm.fields.findIndex(f => f.id === position.before);
              insertIndex = beforeIndex >= 0 ? beforeIndex : 0;
            }
          }

          // Insert field
          currentForm.fields.splice(insertIndex, 0, normalizedField);
          currentForm.updatedAt = new Date().toISOString();

          return {
            success: true,
            message: `Added field "${field.label}" to the form`,
            fieldId: normalizedField.id,
            form: currentForm,
          };
        },
      }),

      // ====================================================================
      // Tool 3: update_field
      // ====================================================================
      
      update_field: tool({
        description: formBuilderTools.update_field.description,
        parameters: formBuilderTools.update_field.parameters,
        
        
        // @ts-expect-error - Zod inferred types
        execute: async (args) => {
          const { explanation, fieldId, updates } = args;
          console.log('[update_field] Explanation:', explanation);
          
          if (!currentForm) {
            return {
              success: false,
              error: 'No form exists.',
            };
          }

          const fieldIndex = currentForm.fields.findIndex(f => f.id === fieldId);
          
          if (fieldIndex === -1) {
            return {
              success: false,
              error: `Field "${fieldId}" not found in form.`,
            };
          }

          // Update field
          currentForm.fields[fieldIndex] = {
            ...currentForm.fields[fieldIndex],
            ...updates,
          };
          currentForm.updatedAt = new Date().toISOString();

          return {
            success: true,
            message: `Updated field "${fieldId}"`,
            form: currentForm,
          };
        },
      }),

      // ====================================================================
      // Tool 4: remove_field
      // ====================================================================
      
      remove_field: tool({
        description: formBuilderTools.remove_field.description,
        parameters: formBuilderTools.remove_field.parameters,
        
        
        // @ts-expect-error - Zod inferred types
        execute: async (args) => {
          const { explanation, fieldId } = args;
          console.log('[remove_field] Explanation:', explanation);
          
          if (!currentForm) {
            return {
              success: false,
              error: 'No form exists.',
            };
          }

          const fieldIndex = currentForm.fields.findIndex(f => f.id === fieldId);
          
          if (fieldIndex === -1) {
            return {
              success: false,
              error: `Field "${fieldId}" not found.`,
            };
          }

          const removedField = currentForm.fields[fieldIndex];
          currentForm.fields.splice(fieldIndex, 1);
          currentForm.updatedAt = new Date().toISOString();

          return {
            success: true,
            message: `Removed field "${removedField.label}"`,
            form: currentForm,
          };
        },
      }),

      // ====================================================================
      // Tool 5: validate_form_schema
      // ====================================================================
      
      validate_form_schema: tool({
        description: formBuilderTools.validate_form_schema.description,
        parameters: formBuilderTools.validate_form_schema.parameters,
        
        
        // @ts-expect-error - Zod inferred types
        execute: async (args) => {
          const { strictMode } = args;
          if (!currentForm) {
            return {
              valid: false,
              errors: [{ code: 'NO_FORM', message: 'No form to validate' }],
              warnings: [],
            };
          }

          const errors: Array<{ field?: string; code: string; message: string; suggestion?: string }> = [];
          const warnings: Array<{ field?: string; code: string; message: string; suggestion?: string }> = [];

          // Validate form has fields
          if (currentForm.fields.length === 0) {
            errors.push({
              code: 'NO_FIELDS',
              message: 'Form must have at least one field',
              suggestion: 'Add fields using add_field tool',
            });
          }

          // Validate each field
          for (const field of currentForm.fields) {
            // Check for choice fields without options
            if (['multiple-choice', 'multi-select', 'dropdown'].includes(field.type)) {
              if (!field.options || field.options.length === 0) {
                errors.push({
                  field: field.id,
                  code: 'MISSING_OPTIONS',
                  message: `${field.type} field "${field.label}" must have options`,
                  suggestion: 'Add options array with at least 2 choices',
                });
              } else if (field.options.length < 2) {
                warnings.push({
                  field: field.id,
                  code: 'FEW_OPTIONS',
                  message: `${field.type} field "${field.label}" has only ${field.options.length} option`,
                  suggestion: 'Choice fields typically need at least 2 options',
                });
              }
            }

            // Check for duplicate field IDs
            const duplicates = currentForm.fields.filter(f => f.id === field.id);
            if (duplicates.length > 1) {
              errors.push({
                field: field.id,
                code: 'DUPLICATE_ID',
                message: `Duplicate field ID: "${field.id}"`,
                suggestion: 'Each field must have a unique ID',
              });
            }

            // Warn about missing validation on required fields
            if (field.required && field.type === 'single-text' && !field.validation?.minLength) {
              warnings.push({
                field: field.id,
                code: 'MISSING_VALIDATION',
                message: `Required field "${field.label}" has no minLength validation`,
                suggestion: 'Consider adding minLength to prevent empty submissions',
              });
            }
          }

          const valid = errors.length === 0 && (strictMode ? warnings.length === 0 : true);

          return {
            valid,
            errors,
            warnings,
            message: valid ? 'Form validation passed' : 'Form has validation issues',
          };
        },
      }),

      // ====================================================================
      // Tool 6: widget_lookup
      // ====================================================================
      
      widget_lookup: tool({
        description: formBuilderTools.widget_lookup.description,
        parameters: formBuilderTools.widget_lookup.parameters,
        
        
        // @ts-expect-error - Zod inferred types
        execute: async (args) => {
          const { fieldType } = args;
          if (fieldType) {
            const widget = getWidgetDefinition(fieldType);
            if (!widget) {
              return {
                success: false,
                error: `Unknown field type: "${fieldType}"`,
              };
            }
            return {
              success: true,
              fieldType,
              widget,
            };
          }

          // Return all widgets
          const widgets = getAvailableWidgets();
          return {
            success: true,
            widgets,
            count: widgets.length,
          };
        },
      }),

      // ====================================================================
      // Tool 7: database_check (Phase 3 - placeholder for now)
      // ====================================================================
      
      database_check: tool({
        description: formBuilderTools.database_check.description,
        parameters: formBuilderTools.database_check.parameters,
        
        
        // @ts-expect-error - Zod inferred types
        execute: async (args) => {
          const { tableName } = args;
          // Phase 3: Will integrate with Supabase here
          return {
            success: false,
            message: 'Database integration coming in Phase 3',
            tableName,
          };
        },
      }),
    },*/
  });

    console.log('[API] streamText configured, returning response...');
    const response = result.toTextStreamResponse();
    console.log('[API] Response created:', response.status, response.statusText);
    return response;
  } catch (error) {
    console.error('[API] ERROR in POST handler:');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'N/A');
    console.error('Full error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

