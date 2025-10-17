/**
 * AI Tool Definitions for V7 Form Builder
 * Following Cursor's pattern: Include "explanation" parameter to force reasoning
 */

import { z } from 'zod';

// ============================================================================
// Validation Rule Schema
// ============================================================================

const validationRuleSchema = z.object({
  required: z.boolean().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.string().optional(),
  email: z.boolean().optional(),
  url: z.boolean().optional(),
  message: z.string().optional(),
}).optional();

// ============================================================================
// Field Option Schema
// ============================================================================

const fieldOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
  disabled: z.boolean().optional(),
});

// ============================================================================
// Field Schema
// ============================================================================

const fieldSchema = z.object({
  id: z.string().describe('Unique field identifier (lowercase, no spaces)'),
  type: z.enum([
    'single-text',
    'multi-text',
    'email',
    'url',
    'phone',
    'number',
    'date',
    'time',
    'multiple-choice',
    'multi-select',
    'binary',
    'dropdown',
    'file-upload',
  ]).describe('Field type - choose based on data being collected'),
  label: z.string().describe('User-facing label for the field'),
  placeholder: z.string().optional().describe('Placeholder text shown when field is empty'),
  description: z.string().optional().describe('Helper text explaining what to enter'),
  required: z.boolean().describe('Whether this field must be filled'),
  defaultValue: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()),
  ]).optional().describe('Default value for the field'),
  validation: validationRuleSchema,
  options: z.array(fieldOptionSchema).optional()
    .describe('Options for choice fields (multiple-choice, multi-select, dropdown)'),
});

// ============================================================================
// Tool 1: create_form
// ============================================================================

export const createFormTool = {
  description: 'Create a new form with specified fields and configuration',
  parameters: z.object({
    explanation: z.string().describe(
      'One sentence explaining why this form structure was chosen and how it fulfills the user\'s requirements'
    ),
    title: z.string().describe('Form title (user-facing)'),
    description: z.string().optional().describe('Optional form description or instructions'),
    fields: z.array(fieldSchema).min(1).describe('Array of form fields'),
    submitButton: z.object({
      label: z.string().default('Submit'),
      loadingLabel: z.string().optional(),
    }).optional().describe('Submit button configuration'),
  }),
};

// ============================================================================
// Tool 2: add_field
// ============================================================================

export const addFieldTool = {
  description: 'Add a new field to the existing form',
  parameters: z.object({
    explanation: z.string().describe(
      'Why this field is being added and how it relates to the form\'s purpose'
    ),
    field: fieldSchema.describe('The field to add'),
    position: z.union([
      z.literal('first'),
      z.literal('last'),
      z.object({
        after: z.string().optional().describe('Field ID to insert after'),
        before: z.string().optional().describe('Field ID to insert before'),
      }),
    ]).optional().default('last').describe('Where to insert the field'),
  }),
};

// ============================================================================
// Tool 3: update_field
// ============================================================================

export const updateFieldTool = {
  description: 'Modify an existing field in the form',
  parameters: z.object({
    explanation: z.string().describe(
      'Why this field is being updated and what problem it solves'
    ),
    fieldId: z.string().describe('ID of the field to update'),
    updates: fieldSchema.partial().describe('Properties to update (only include changed properties)'),
  }),
};

// ============================================================================
// Tool 4: remove_field
// ============================================================================

export const removeFieldTool = {
  description: 'Remove a field from the form',
  parameters: z.object({
    explanation: z.string().describe(
      'Why this field is being removed'
    ),
    fieldId: z.string().describe('ID of the field to remove'),
  }),
};

// ============================================================================
// Tool 5: validate_form_schema
// ============================================================================

export const validateFormSchemaTool = {
  description: 'Validate the complete form schema against business rules and constraints',
  parameters: z.object({
    strictMode: z.boolean().default(true).describe(
      'If true, fail on warnings. If false, return warnings but allow form'
    ),
  }),
};

// ============================================================================
// Tool 6: widget_lookup
// ============================================================================

export const widgetLookupTool = {
  description: 'Get information about available widgets and their capabilities',
  parameters: z.object({
    fieldType: z.string().optional().describe(
      'Optional: Filter by specific field type to see its widget details'
    ),
  }),
};

// ============================================================================
// Tool 7: database_check (Phase 3)
// ============================================================================

export const databaseCheckTool = {
  description: 'Check database schema for a table (used when @database tag is present)',
  parameters: z.object({
    tableName: z.string().describe('Name of the database table to check'),
  }),
};

// ============================================================================
// Export all tools
// ============================================================================

export const formBuilderTools = {
  create_form: createFormTool,
  add_field: addFieldTool,
  update_field: updateFieldTool,
  remove_field: removeFieldTool,
  validate_form_schema: validateFormSchemaTool,
  widget_lookup: widgetLookupTool,
  database_check: databaseCheckTool,
};

// ============================================================================
// Type exports for TypeScript
// ============================================================================

export type CreateFormParams = z.infer<typeof createFormTool.parameters>;
export type AddFieldParams = z.infer<typeof addFieldTool.parameters>;
export type UpdateFieldParams = z.infer<typeof updateFieldTool.parameters>;
export type RemoveFieldParams = z.infer<typeof removeFieldTool.parameters>;
export type ValidateFormSchemaParams = z.infer<typeof validateFormSchemaTool.parameters>;
export type WidgetLookupParams = z.infer<typeof widgetLookupTool.parameters>;
export type DatabaseCheckParams = z.infer<typeof databaseCheckTool.parameters>;

