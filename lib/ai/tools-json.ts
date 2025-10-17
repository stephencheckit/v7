/**
 * JSON Schema versions of tool definitions
 * Manually defined to avoid Zod conversion issues with Anthropic API
 */

export const formBuilderToolsJSON = {
  create_form: {
    description: 'Create a new form with specified fields and configuration',
    parameters: {
      type: 'object',
      properties: {
        explanation: {
          type: 'string',
          description: 'One sentence explaining why this form structure was chosen and how it fulfills the user\'s requirements'
        },
        title: {
          type: 'string',
          description: 'Form title (user-facing)'
        },
        description: {
          type: 'string',
          description: 'Optional form description or instructions'
        },
        fields: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Unique field identifier (lowercase, no spaces)' },
              type: { 
                type: 'string',
                enum: ['single-text', 'multi-text', 'email', 'url', 'phone', 'number', 'date', 'time', 'multiple-choice', 'multi-select', 'binary', 'dropdown', 'file-upload']
              },
              label: { type: 'string', description: 'User-facing field label' },
              placeholder: { type: 'string', description: 'Placeholder text' },
              description: { type: 'string', description: 'Help text shown to user' },
              required: { type: 'boolean', description: 'Whether field is required' },
              defaultValue: { 
                description: 'Default value for the field',
                oneOf: [
                  { type: 'string' },
                  { type: 'number' },
                  { type: 'boolean' },
                  { type: 'array', items: { type: 'string' } }
                ]
              },
              options: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    label: { type: 'string' },
                    value: { type: 'string' },
                    disabled: { type: 'boolean' }
                  },
                  required: ['label', 'value']
                }
              }
            },
            required: ['id', 'type', 'label', 'required']
          },
          minItems: 1
        },
        submitButton: {
          type: 'object',
          properties: {
            label: { type: 'string', default: 'Submit' },
            loadingLabel: { type: 'string' }
          }
        }
      },
      required: ['explanation', 'title', 'fields']
    }
  },
  
  add_field: {
    description: 'Add a new field to the existing form',
    parameters: {
      type: 'object',
      properties: {
        explanation: {
          type: 'string',
          description: 'Why this field is being added and how it relates to the form\'s purpose'
        },
        field: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { 
              type: 'string',
              enum: ['single-text', 'multi-text', 'email', 'url', 'phone', 'number', 'date', 'time', 'multiple-choice', 'multi-select', 'binary', 'dropdown', 'file-upload']
            },
            label: { type: 'string' },
            placeholder: { type: 'string' },
            description: { type: 'string' },
            required: { type: 'boolean' },
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  value: { type: 'string' }
                },
                required: ['label', 'value']
              }
            }
          },
          required: ['id', 'type', 'label', 'required']
        },
        position: {
          oneOf: [
            { type: 'string', enum: ['first', 'last'] },
            {
              type: 'object',
              properties: {
                after: { type: 'string' },
                before: { type: 'string' }
              }
            }
          ]
        }
      },
      required: ['explanation', 'field']
    }
  },
  
  update_field: {
    description: 'Modify an existing field in the form',
    parameters: {
      type: 'object',
      properties: {
        explanation: {
          type: 'string',
          description: 'Why this field is being updated and what problem it solves'
        },
        fieldId: {
          type: 'string',
          description: 'ID of the field to update'
        },
        updates: {
          type: 'object',
          properties: {
            label: { type: 'string' },
            placeholder: { type: 'string' },
            description: { type: 'string' },
            required: { type: 'boolean' },
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  value: { type: 'string' }
                }
              }
            }
          }
        }
      },
      required: ['explanation', 'fieldId', 'updates']
    }
  },
  
  remove_field: {
    description: 'Remove a field from the form',
    parameters: {
      type: 'object',
      properties: {
        explanation: {
          type: 'string',
          description: 'Why this field is being removed'
        },
        fieldId: {
          type: 'string',
          description: 'ID of the field to remove'
        }
      },
      required: ['explanation', 'fieldId']
    }
  },
  
  validate_form_schema: {
    description: 'Validate the complete form schema against business rules and constraints',
    parameters: {
      type: 'object',
      properties: {
        strictMode: {
          type: 'boolean',
          default: true,
          description: 'If true, fail on warnings. If false, return warnings but allow form'
        }
      },
      required: []
    }
  },
  
  widget_lookup: {
    description: 'Get information about available widgets and their capabilities',
    parameters: {
      type: 'object',
      properties: {
        fieldType: {
          type: 'string',
          description: 'Optional: Filter by specific field type to see its widget details'
        }
      },
      required: []
    }
  },
  
  database_check: {
    description: 'Check database schema for a table (used when @database tag is present)',
    parameters: {
      type: 'object',
      properties: {
        tableName: {
          type: 'string',
          description: 'Name of the database table to check'
        }
      },
      required: ['tableName']
    }
  }
} as const;

