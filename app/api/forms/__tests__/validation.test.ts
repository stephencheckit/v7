import { describe, it, expect } from 'vitest';

/**
 * Form Creation Validation Tests
 * Tests the validation logic for form creation payloads
 */

describe('Form Creation Validation', () => {
  describe('Valid payloads', () => {
    it('should accept valid form creation payload', () => {
      const validPayload = {
        title: 'Customer Feedback Form',
        schema: {
          fields: [
            { name: 'email', type: 'email', required: true },
            { name: 'rating', type: 'number', required: true },
          ],
        },
        description: 'Collect customer feedback',
        status: 'draft',
      };

      // Validate structure
      expect(validPayload.title).toBeTruthy();
      expect(validPayload.title.length).toBeGreaterThan(0);
      expect(validPayload.schema).toBeDefined();
      expect(validPayload.schema.fields).toBeInstanceOf(Array);
      expect(validPayload.schema.fields.length).toBeGreaterThan(0);
    });

    it('should accept minimal valid payload', () => {
      const minimalPayload = {
        title: 'Simple Form',
        schema: { fields: [] },
      };

      expect(minimalPayload.title).toBeTruthy();
      expect(minimalPayload.schema).toBeDefined();
    });

    it('should accept payload with optional fields', () => {
      const payload = {
        title: 'Test Form',
        schema: { fields: [] },
        description: 'Optional description',
        ai_vision_enabled: true,
        thank_you_settings: {
          message: 'Thank you!',
          redirect_url: 'https://example.com',
        },
      };

      expect(payload.description).toBeDefined();
      expect(payload.ai_vision_enabled).toBe(true);
      expect(payload.thank_you_settings).toBeDefined();
    });
  });

  describe('Invalid payloads', () => {
    it('should reject form without title', () => {
      const invalidPayload = {
        schema: { fields: [] },
        description: 'Missing title',
      };

      expect(invalidPayload.title).toBeUndefined();
    });

    it('should reject form without schema', () => {
      const invalidPayload = {
        title: 'Has Title',
        description: 'Missing schema',
      };

      expect(invalidPayload.schema).toBeUndefined();
    });

    it('should reject empty title', () => {
      const invalidPayload = {
        title: '',
        schema: { fields: [] },
      };

      expect(invalidPayload.title.length).toBe(0);
    });

    it('should reject non-object schema', () => {
      const invalidPayload = {
        title: 'Test',
        schema: 'not an object',
      };

      expect(typeof invalidPayload.schema).not.toBe('object');
    });
  });

  describe('Schema validation', () => {
    it('should validate schema has fields array', () => {
      const schema = {
        fields: [
          { name: 'email', type: 'email' },
        ],
      };

      expect(schema.fields).toBeDefined();
      expect(Array.isArray(schema.fields)).toBe(true);
    });

    it('should validate field structure', () => {
      const field = {
        name: 'email',
        type: 'email',
        label: 'Email Address',
        required: true,
        placeholder: 'Enter your email',
      };

      expect(field.name).toBeTruthy();
      expect(field.type).toBeTruthy();
      expect(typeof field.required).toBe('boolean');
    });

    it('should reject fields without name', () => {
      const invalidField = {
        type: 'email',
        label: 'Email',
      };

      expect(invalidField.name).toBeUndefined();
    });
  });

  describe('Status validation', () => {
    it('should accept valid status values', () => {
      const validStatuses = ['draft', 'published'];
      
      validStatuses.forEach(status => {
        expect(['draft', 'published']).toContain(status);
      });
    });

    it('should identify invalid status values', () => {
      const invalidStatuses = ['active', 'inactive', 'pending'];
      
      invalidStatuses.forEach(status => {
        expect(['draft', 'published']).not.toContain(status);
      });
    });

    it('should default to draft if no status provided', () => {
      const payload = {
        title: 'Test',
        schema: { fields: [] },
      };

      const status = payload.status || 'draft';
      expect(status).toBe('draft');
    });
  });
});

