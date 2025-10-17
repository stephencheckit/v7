/**
 * Widget Registry - Maps field types to UI components
 * Fast lookup for Widget Lookup Agent (no LLM needed)
 */

import type { WidgetRegistry } from '../types/form-schema';

export const WIDGET_REGISTRY: WidgetRegistry = {
  'single-text': {
    component: 'TextInput',
    label: 'Text Input',
    description: 'Single line text input for short responses',
    validation: ['required', 'minLength', 'maxLength', 'pattern'],
    dbTypes: ['VARCHAR', 'TEXT', 'STRING', 'CHAR'],
    defaultProps: {
      autoComplete: 'off',
    },
  },
  
  'multi-text': {
    component: 'TextareaInput',
    label: 'Text Area',
    description: 'Multi-line text input for longer responses',
    validation: ['required', 'minLength', 'maxLength'],
    dbTypes: ['TEXT', 'LONGTEXT', 'MEDIUMTEXT'],
    defaultProps: {
      rows: 4,
      autoResize: true,
    },
  },
  
  'email': {
    component: 'EmailInput',
    label: 'Email Input',
    description: 'Email input with validation',
    validation: ['required', 'email', 'pattern'],
    dbTypes: ['VARCHAR', 'TEXT', 'STRING'],
    defaultProps: {
      type: 'email',
      autoComplete: 'email',
    },
  },
  
  'url': {
    component: 'UrlInput',
    label: 'URL Input',
    description: 'URL input with validation',
    validation: ['required', 'url', 'pattern'],
    dbTypes: ['VARCHAR', 'TEXT', 'STRING'],
    defaultProps: {
      type: 'url',
      autoComplete: 'url',
    },
  },
  
  'phone': {
    component: 'PhoneInput',
    label: 'Phone Input',
    description: 'Phone number input with formatting',
    validation: ['required', 'pattern'],
    dbTypes: ['VARCHAR', 'TEXT', 'STRING'],
    defaultProps: {
      type: 'tel',
      autoComplete: 'tel',
      format: 'international',
    },
  },
  
  'number': {
    component: 'NumberInput',
    label: 'Number Input',
    description: 'Numeric input with min/max validation',
    validation: ['required', 'min', 'max'],
    dbTypes: ['INTEGER', 'INT', 'BIGINT', 'DECIMAL', 'FLOAT', 'DOUBLE'],
    defaultProps: {
      type: 'number',
      step: 1,
    },
  },
  
  'date': {
    component: 'DateInput',
    label: 'Date Picker',
    description: 'Date selection input',
    validation: ['required', 'min', 'max'],
    dbTypes: ['DATE', 'DATETIME', 'TIMESTAMP'],
    defaultProps: {
      type: 'date',
    },
  },
  
  'time': {
    component: 'TimeInput',
    label: 'Time Picker',
    description: 'Time selection input',
    validation: ['required'],
    dbTypes: ['TIME', 'TIMESTAMP'],
    defaultProps: {
      type: 'time',
    },
  },
  
  'multiple-choice': {
    component: 'RadioGroup',
    label: 'Multiple Choice',
    description: 'Radio buttons for single selection',
    validation: ['required'],
    dbTypes: ['VARCHAR', 'TEXT', 'STRING', 'ENUM'],
    defaultProps: {
      orientation: 'vertical',
    },
  },
  
  'multi-select': {
    component: 'CheckboxGroup',
    label: 'Multi-Select',
    description: 'Checkboxes for multiple selections',
    validation: ['required', 'minItems', 'maxItems'],
    dbTypes: ['ARRAY', 'JSONB', 'JSON', 'TEXT'],
    defaultProps: {
      orientation: 'vertical',
    },
  },
  
  'binary': {
    component: 'BinaryChoice',
    label: 'Yes/No Choice',
    description: 'Binary radio buttons (Yes/No, True/False)',
    validation: ['required'],
    dbTypes: ['BOOLEAN', 'BOOL', 'TINYINT', 'BIT'],
    defaultProps: {
      options: [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ],
    },
  },
  
  'dropdown': {
    component: 'SelectDropdown',
    label: 'Dropdown',
    description: 'Select dropdown for single selection',
    validation: ['required'],
    dbTypes: ['VARCHAR', 'TEXT', 'STRING', 'ENUM', 'INTEGER'],
    defaultProps: {
      placeholder: 'Select an option...',
    },
  },
  
  'file-upload': {
    component: 'FileUpload',
    label: 'File Upload',
    description: 'File upload input',
    validation: ['required', 'fileSize', 'fileType'],
    dbTypes: ['VARCHAR', 'TEXT', 'JSONB'],
    defaultProps: {
      maxSize: 5 * 1024 * 1024, // 5MB
      accept: '*/*',
    },
  },
};

/**
 * Get widget definition by field type
 */
export function getWidgetDefinition(fieldType: string) {
  return WIDGET_REGISTRY[fieldType as keyof typeof WIDGET_REGISTRY];
}

/**
 * Get all available widget types
 */
export function getAvailableWidgets() {
  return Object.entries(WIDGET_REGISTRY).map(([type, def]) => ({
    type,
    ...def,
  }));
}

/**
 * Find compatible widgets for a database type
 */
export function getWidgetsForDbType(dbType: string) {
  const normalizedDbType = dbType.toUpperCase();
  
  return Object.entries(WIDGET_REGISTRY)
    .filter(([_, def]) => 
      def.dbTypes.some(type => normalizedDbType.includes(type))
    )
    .map(([type, def]) => ({
      type,
      ...def,
    }));
}

/**
 * Get default widget for a database type
 */
export function getDefaultWidgetForDbType(dbType: string): string | null {
  const widgets = getWidgetsForDbType(dbType);
  return widgets.length > 0 ? widgets[0].type : null;
}

