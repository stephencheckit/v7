/**
 * Type Converters for V7 Form Builder
 * 
 * Converts between:
 * - Frontend FormField format (used in forms/page.tsx)
 * - Backend FormSchema format (used in API and Supabase)
 */

import type { FormField as BackendFormField, FormSchema } from '@/lib/types/form-schema';

// Frontend field type definition (from forms/page.tsx)
export interface FrontendFormField {
  id: string;
  type: string;
  name: string;
  label: string;
  placeholder: string;
  required: boolean;
  color: string;
  icon: any;
  description?: string;
  options?: string[];
  multiSelect?: boolean;
  dateRange?: boolean;
}

// ============================================================================
// FIELD TYPE MAPPINGS
// ============================================================================

/**
 * Maps frontend field types to backend field types
 * Frontend uses simpler names, backend uses more descriptive names
 */
const FRONTEND_TO_BACKEND_TYPE: Record<string, string> = {
  'text': 'single-text',
  'textarea': 'multi-text',
  'email': 'email',
  'phone': 'phone',
  'number': 'number',
  'date': 'date',
  'time': 'time',
  'dropdown': 'dropdown',
  'select': 'dropdown',
  'checkbox': 'multi-select',
  'radio': 'multiple-choice',
  'thumbs': 'binary',
  'file': 'file-upload',
  'upload': 'file-upload',
  'group': 'single-text', // Groups become text fields for now
};

/**
 * Reverse mapping: backend to frontend
 */
const BACKEND_TO_FRONTEND_TYPE: Record<string, string> = {
  'single-text': 'text',
  'multi-text': 'textarea',
  'email': 'email',
  'phone': 'phone',
  'number': 'number',
  'date': 'date',
  'time': 'time',
  'dropdown': 'dropdown',
  'multi-select': 'checkbox',
  'multiple-choice': 'radio',
  'binary': 'thumbs',
  'file-upload': 'file',
};

/**
 * Color mapping for field types (used in frontend)
 */
const FIELD_TYPE_COLORS: Record<string, string> = {
  'single-text': '#c4dfc4',
  'multi-text': '#c4dfc4',
  'email': '#c4dfc4',
  'phone': '#c4dfc4',
  'number': '#c4dfc4',
  'date': '#ddc8f5',
  'time': '#ddc8f5',
  'dropdown': '#c8e0f5',
  'multi-select': '#c8e0f5',
  'multiple-choice': '#c8e0f5',
  'binary': '#c8e0f5',
  'file-upload': '#f5edc8',
};

/**
 * Icon mapping for field types (used in frontend)
 */
const FIELD_TYPE_ICONS: Record<string, string> = {
  'single-text': 'Type',
  'multi-text': 'AlignLeft',
  'email': 'Mail',
  'phone': 'Phone',
  'number': 'Hash',
  'date': 'Calendar',
  'time': 'Clock',
  'dropdown': 'List',
  'multi-select': 'CheckSquare',
  'multiple-choice': 'Circle',
  'binary': 'ThumbsUp',
  'file-upload': 'Upload',
};

// ============================================================================
// FRONTEND → BACKEND CONVERSION
// ============================================================================

/**
 * Convert a frontend FormField to backend FormField format
 */
export function convertFrontendToBackend(
  frontendField: FrontendFormField
): BackendFormField {
  const backendType = FRONTEND_TO_BACKEND_TYPE[frontendField.type] || frontendField.type;

  const backendField: BackendFormField = {
    id: frontendField.id,
    type: backendType as any,
    label: frontendField.label,
    placeholder: frontendField.placeholder || undefined,
    description: frontendField.description,
    required: frontendField.required,
  };

  // Convert options if present
  if (frontendField.options && frontendField.options.length > 0) {
    backendField.options = frontendField.options.map((opt, idx) => ({
      label: opt,
      value: opt.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    }));
  }

  // Add validation rules based on field type
  backendField.validation = buildValidationRules(frontendField);

  return backendField;
}

/**
 * Convert an array of frontend fields to backend format
 */
export function convertFrontendFieldsToBackend(
  frontendFields: FrontendFormField[]
): BackendFormField[] {
  return frontendFields.map(convertFrontendToBackend);
}

/**
 * Build validation rules based on frontend field configuration
 */
function buildValidationRules(field: FrontendFormField): BackendFormField['validation'] {
  const validation: BackendFormField['validation'] = {};

  switch (field.type) {
    case 'text':
      validation.minLength = 1;
      validation.maxLength = 200;
      break;
    case 'textarea':
      validation.minLength = 1;
      validation.maxLength = 5000;
      break;
    case 'email':
      validation.pattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';
      break;
    case 'phone':
      validation.pattern = '^[0-9+\\-\\s()]+$';
      break;
    case 'number':
      validation.min = 0;
      break;
  }

  return Object.keys(validation).length > 0 ? validation : undefined;
}

// ============================================================================
// BACKEND → FRONTEND CONVERSION
// ============================================================================

/**
 * Convert a backend FormField to frontend FormField format
 */
export function convertBackendToFrontend(
  backendField: BackendFormField
): FrontendFormField {
  const frontendType = BACKEND_TO_FRONTEND_TYPE[backendField.type] || backendField.type;
  const color = FIELD_TYPE_COLORS[backendField.type] || '#c4dfc4';
  const icon = FIELD_TYPE_ICONS[backendField.type];

  const frontendField: FrontendFormField = {
    id: backendField.id,
    type: frontendType,
    name: backendField.id,
    label: backendField.label,
    placeholder: backendField.placeholder || `Enter ${backendField.label.toLowerCase()}...`,
    required: backendField.required,
    color,
    icon,
    description: backendField.description,
  };

  // Convert options if present
  if (backendField.options && backendField.options.length > 0) {
    frontendField.options = backendField.options.map(opt => opt.label);
  }

  // Set multiSelect flag for checkbox fields
  if (backendField.type === 'multi-select') {
    frontendField.multiSelect = true;
  }

  return frontendField;
}

/**
 * Convert an array of backend fields to frontend format
 */
export function convertBackendFieldsToFrontend(
  backendFields: BackendFormField[]
): FrontendFormField[] {
  return backendFields.map(convertBackendToFrontend);
}

/**
 * Convert a complete backend FormSchema to frontend format
 */
export function convertBackendFormToFrontend(
  backendForm: FormSchema
): {
  fields: FrontendFormField[];
  title: string;
  description?: string;
  submitButtonText?: string;
} {
  return {
    fields: convertBackendFieldsToFrontend(backendForm.fields),
    title: backendForm.title,
    description: backendForm.description,
    submitButtonText: backendForm.submitButton?.label,
  };
}

// ============================================================================
// FULL FORM CONVERSION
// ============================================================================

/**
 * Convert frontend form state to backend FormSchema
 */
export function convertFrontendFormToBackend(params: {
  formId?: string;
  title: string;
  description?: string;
  fields: FrontendFormField[];
  submitButtonText?: string;
}): FormSchema {
  return {
    id: params.formId || `form-${Date.now()}`,
    title: params.title,
    description: params.description,
    fields: convertFrontendFieldsToBackend(params.fields),
    submitButton: {
      label: params.submitButtonText || 'Submit',
    },
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get color for a backend field type
 */
export function getColorForFieldType(backendType: string): string {
  return FIELD_TYPE_COLORS[backendType] || '#c4dfc4';
}

/**
 * Get icon for a backend field type
 */
export function getIconForFieldType(backendType: string): string {
  return FIELD_TYPE_ICONS[backendType] || 'Type';
}

/**
 * Generate a unique field ID
 */
export function generateFieldId(label: string): string {
  const base = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  return `${base}-${Date.now()}`;
}

/**
 * Validate that a field has all required properties
 */
export function validateFrontendField(field: FrontendFormField): boolean {
  return !!(
    field.id &&
    field.type &&
    field.label &&
    typeof field.required === 'boolean'
  );
}

/**
 * Validate that a backend field has all required properties
 */
export function validateBackendField(field: BackendFormField): boolean {
  return !!(
    field.id &&
    field.type &&
    field.label &&
    typeof field.required === 'boolean'
  );
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { BackendFormField, FormSchema };

