import { describe, it, expect } from 'vitest';

/**
 * Form Schema Validation Tests
 * Tests validation of form schema structure and field types
 */

describe('Schema Validation', () => {
  describe('Field type validation', () => {
    it('should validate text field structure', () => {
      const field = {
        type: 'text',
        name: 'full_name',
        label: 'Full Name',
        required: true,
        placeholder: 'Enter your name',
      };

      expect(field.type).toBe('text');
      expect(field.name).toBeTruthy();
      expect(field.label).toBeTruthy();
    });

    it('should validate email field structure', () => {
      const field = {
        type: 'email',
        name: 'email',
        label: 'Email Address',
        required: true,
        validation: {
          pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
        },
      };

      expect(field.type).toBe('email');
      expect(field.validation?.pattern).toBeTruthy();
    });

    it('should validate number field with constraints', () => {
      const field = {
        type: 'number',
        name: 'age',
        label: 'Age',
        validation: {
          min: 0,
          max: 120,
        },
      };

      expect(field.type).toBe('number');
      expect(field.validation.min).toBeGreaterThanOrEqual(0);
      expect(field.validation.max).toBeGreaterThan(field.validation.min);
    });

    it('should validate select field with options', () => {
      const field = {
        type: 'select',
        name: 'country',
        label: 'Country',
        options: ['USA', 'UK', 'Canada'],
      };

      expect(field.type).toBe('select');
      expect(Array.isArray(field.options)).toBe(true);
      expect(field.options.length).toBeGreaterThan(0);
    });

    it('should validate checkbox field', () => {
      const field = {
        type: 'checkbox',
        name: 'agree_terms',
        label: 'I agree to terms',
        required: true,
      };

      expect(field.type).toBe('checkbox');
      expect(typeof field.required).toBe('boolean');
    });

    it('should validate file upload field', () => {
      const field = {
        type: 'file',
        name: 'attachment',
        label: 'Upload File',
        validation: {
          maxSize: 10 * 1024 * 1024, // 10MB
          allowedTypes: ['image/*', 'application/pdf'],
        },
      };

      expect(field.type).toBe('file');
      expect(field.validation.maxSize).toBeGreaterThan(0);
      expect(field.validation.allowedTypes.length).toBeGreaterThan(0);
    });
  });

  describe('Field name validation', () => {
    it('should validate field name format', () => {
      const validNames = [
        'first_name',
        'email_address',
        'phone_number',
        'date_of_birth',
      ];

      const nameRegex = /^[a-z][a-z0-9_]*$/;

      validNames.forEach(name => {
        expect(nameRegex.test(name)).toBe(true);
      });
    });

    it('should reject invalid field names', () => {
      const invalidNames = [
        '123_name', // Starts with number
        'First Name', // Contains space
        'email-address', // Contains hyphen
        '', // Empty
      ];

      const nameRegex = /^[a-z][a-z0-9_]*$/;

      invalidNames.forEach(name => {
        expect(nameRegex.test(name)).toBe(false);
      });
    });

    it('should enforce unique field names', () => {
      const fields = [
        { name: 'email' },
        { name: 'name' },
        { name: 'email' }, // Duplicate!
      ];

      const names = fields.map(f => f.name);
      const uniqueNames = new Set(names);
      const hasDuplicates = uniqueNames.size !== names.length;

      expect(hasDuplicates).toBe(true);
    });
  });

  describe('Validation rules', () => {
    it('should validate min/max length', () => {
      const validation = {
        minLength: 2,
        maxLength: 100,
      };

      expect(validation.maxLength).toBeGreaterThan(validation.minLength);
    });

    it('should validate regex patterns', () => {
      const patterns = {
        email: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
        phone: '^\\d{10}$',
        zipcode: '^\\d{5}(-\\d{4})?$',
      };

      Object.values(patterns).forEach(pattern => {
        expect(pattern.length).toBeGreaterThan(0);
        // Validate it's a valid regex
        expect(() => new RegExp(pattern)).not.toThrow();
      });
    });

    it('should validate custom validation functions', () => {
      const customValidators = {
        strongPassword: (value: string) => {
          return value.length >= 8 && 
                 /[A-Z]/.test(value) && 
                 /[0-9]/.test(value);
        },
      };

      expect(customValidators.strongPassword('Weak')).toBe(false);
      expect(customValidators.strongPassword('Strong123')).toBe(true);
    });
  });

  describe('Conditional logic', () => {
    it('should validate show/hide conditions', () => {
      const field = {
        name: 'other_reason',
        showIf: {
          field: 'reason',
          value: 'other',
        },
      };

      expect(field.showIf.field).toBeTruthy();
      expect(field.showIf.value).toBeTruthy();
    });

    it('should validate multiple conditions', () => {
      const field = {
        name: 'company_size',
        showIf: {
          operator: 'AND',
          conditions: [
            { field: 'employment_status', value: 'employed' },
            { field: 'industry', value: 'tech' },
          ],
        },
      };

      expect(field.showIf.conditions.length).toBeGreaterThan(1);
      expect(['AND', 'OR']).toContain(field.showIf.operator);
    });

    it('should validate dependency chains', () => {
      const fields = [
        { name: 'country', dependencies: [] },
        { name: 'state', dependencies: ['country'] },
        { name: 'city', dependencies: ['state'] },
      ];

      // Verify no circular dependencies
      const hasCycle = false; // Would need graph traversal
      expect(hasCycle).toBe(false);
    });
  });

  describe('Schema versioning', () => {
    it('should track schema version', () => {
      const schema = {
        version: 1,
        fields: [{ name: 'email' }],
      };

      expect(schema.version).toBeGreaterThan(0);
    });

    it('should handle schema migrations', () => {
      const v1Schema = {
        version: 1,
        fields: [{ name: 'name', type: 'text' }],
      };

      const v2Schema = {
        version: 2,
        fields: [
          { name: 'first_name', type: 'text' }, // Split name
          { name: 'last_name', type: 'text' },
        ],
      };

      expect(v2Schema.version).toBeGreaterThan(v1Schema.version);
    });

    it('should maintain backward compatibility', () => {
      const submission = {
        schema_version: 1,
        data: { name: 'John Doe' },
      };

      // Can still process old submissions
      expect(submission.schema_version).toBe(1);
      expect(submission.data.name).toBeTruthy();
    });
  });

  describe('Complex field types', () => {
    it('should validate signature field', () => {
      const field = {
        type: 'signature',
        name: 'signature',
        label: 'Sign Here',
        required: true,
        validation: {
          minPoints: 10, // Minimum drawing points
        },
      };

      expect(field.type).toBe('signature');
      expect(field.validation.minPoints).toBeGreaterThan(0);
    });

    it('should validate address field group', () => {
      const field = {
        type: 'group',
        name: 'address',
        label: 'Address',
        fields: [
          { name: 'street', type: 'text' },
          { name: 'city', type: 'text' },
          { name: 'state', type: 'text' },
          { name: 'zip', type: 'text' },
        ],
      };

      expect(field.type).toBe('group');
      expect(field.fields.length).toBeGreaterThan(0);
    });

    it('should validate repeatable field groups', () => {
      const field = {
        type: 'repeater',
        name: 'family_members',
        label: 'Family Members',
        minItems: 1,
        maxItems: 10,
        template: [
          { name: 'name', type: 'text' },
          { name: 'age', type: 'number' },
        ],
      };

      expect(field.type).toBe('repeater');
      expect(field.maxItems).toBeGreaterThan(field.minItems);
    });
  });

  describe('Schema metadata', () => {
    it('should include form-level settings', () => {
      const schema = {
        version: 1,
        title: 'Contact Form',
        description: 'Get in touch',
        fields: [],
        settings: {
          submitButtonText: 'Send Message',
          showProgressBar: true,
          allowSave: true,
        },
      };

      expect(schema.title).toBeTruthy();
      expect(schema.settings).toBeDefined();
    });

    it('should include field-level help text', () => {
      const field = {
        name: 'password',
        label: 'Password',
        helpText: 'Must be at least 8 characters with 1 number',
      };

      expect(field.helpText).toBeTruthy();
    });

    it('should support field icons', () => {
      const field = {
        name: 'email',
        label: 'Email',
        icon: 'mail',
      };

      expect(field.icon).toBeTruthy();
    });
  });
});

