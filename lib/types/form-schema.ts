/**
 * Core type definitions for V7 Form Builder
 * Based on multi-agent architecture inspired by Cursor
 */

// ============================================================================
// Field Types
// ============================================================================

export type FieldType =
  | 'single-text'      // Single line text input
  | 'multi-text'       // Textarea
  | 'email'            // Email with validation
  | 'url'              // URL with validation
  | 'phone'            // Phone number
  | 'number'           // Numeric input
  | 'date'             // Date picker
  | 'time'             // Time picker
  | 'multiple-choice'  // Radio buttons (single select)
  | 'multi-select'     // Checkboxes (multiple select)
  | 'binary'           // Yes/No radio
  | 'dropdown'         // Select dropdown
  | 'file-upload';     // File input

// ============================================================================
// Validation Rules
// ============================================================================

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  email?: boolean;
  url?: boolean;
  custom?: string; // Custom validation function
  message?: string; // Custom error message
}

// ============================================================================
// Field Options (for choice fields)
// ============================================================================

export interface FieldOption {
  label: string;
  value: string;
  disabled?: boolean;
}

// ============================================================================
// Conditional Logic
// ============================================================================

export interface ConditionalRule {
  field: string; // Field ID to watch
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  value: string | number | boolean;
  action: 'show' | 'hide' | 'enable' | 'disable';
}

// ============================================================================
// Form Field Definition
// ============================================================================

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  description?: string;
  required: boolean;
  defaultValue?: string | number | boolean | string[];
  validation?: ValidationRule;
  options?: FieldOption[]; // For choice fields
  conditionalLogic?: ConditionalRule[];
  
  // Widget-specific props
  widget?: string; // Override default widget
  widgetProps?: Record<string, unknown>;
  
  // Database mapping (Phase 3)
  dbColumn?: string;
  dbType?: string;
}

// ============================================================================
// Form Schema
// ============================================================================

export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  
  // Submit configuration
  submitButton?: {
    label: string;
    loadingLabel?: string;
  };
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
  version?: number;
  
  // Database mapping (Phase 3)
  targetTable?: string;
  
  // Styling
  theme?: 'default' | 'minimal' | 'material';
  layout?: 'single-column' | 'two-column';
}

// ============================================================================
// Form Submission
// ============================================================================

export interface FormSubmission {
  formId: string;
  data: Record<string, unknown>;
  submittedAt: string;
  metadata?: {
    userAgent?: string;
    ip?: string;
    referrer?: string;
  };
}

// ============================================================================
// Semantic Form Operations (for multi-agent system)
// ============================================================================

export type FormOperation = 
  | AddFieldOperation
  | UpdateFieldOperation
  | RemoveFieldOperation
  | ReorderFieldsOperation
  | UpdateFormMetaOperation;

export interface AddFieldOperation {
  type: 'add_field';
  field: FormField;
  position?: {
    after?: string; // Field ID
    before?: string; // Field ID
  } | 'first' | 'last';
  reason: string; // Why this field is being added
}

export interface UpdateFieldOperation {
  type: 'update_field';
  fieldId: string;
  updates: Partial<FormField>;
  reason: string;
}

export interface RemoveFieldOperation {
  type: 'remove_field';
  fieldId: string;
  reason: string;
}

export interface ReorderFieldsOperation {
  type: 'reorder_fields';
  fieldOrder: string[]; // Array of field IDs in new order
  reason: string;
}

export interface UpdateFormMetaOperation {
  type: 'update_form_meta';
  updates: Partial<Omit<FormSchema, 'fields'>>;
  reason: string;
}

// ============================================================================
// Semantic Form Diff (for Form Apply Agent)
// ============================================================================

export interface SemanticFormDiff {
  formId: string;
  operations: FormOperation[];
  explanation: string; // Overall explanation of changes
}

// ============================================================================
// Widget Registry Types
// ============================================================================

export interface WidgetDefinition {
  component: string;
  label: string;
  description: string;
  validation: string[]; // Available validation types
  dbTypes: string[]; // Compatible database types
  defaultProps?: Record<string, unknown>;
  icon?: string;
}

export type WidgetRegistry = Record<FieldType, WidgetDefinition>;

// ============================================================================
// Tool Call Types (for AI agents)
// ============================================================================

export interface CreateFormToolCall {
  explanation: string;
  title: string;
  description?: string;
  fields: FormField[];
  targetTable?: string;
}

export interface ValidateFormSchemaToolCall {
  formSchema: FormSchema;
  strictMode?: boolean;
}

export interface ValidationError {
  field?: string;
  code: string;
  message: string;
  suggestion?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// ============================================================================
// Export Types
// ============================================================================

export type ExportFormat = 'react' | 'json' | 'html' | 'typescript';

export interface ExportOptions {
  format: ExportFormat;
  includeValidation?: boolean;
  includeStyles?: boolean;
  framework?: 'react' | 'next' | 'vue' | 'vanilla';
}

