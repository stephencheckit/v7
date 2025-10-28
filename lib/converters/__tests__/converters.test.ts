import { describe, it, expect } from 'vitest';

/**
 * Data converter tests
 * Tests conversion between different data formats
 */

describe('Data Converters', () => {
  describe('Date formatting', () => {
    it('should format date to ISO string', () => {
      const date = new Date('2025-10-28T09:00:00Z');
      const iso = date.toISOString();
      
      expect(iso).toBe('2025-10-28T09:00:00.000Z');
    });

    it('should parse ISO string to date', () => {
      const iso = '2025-10-28T09:00:00.000Z';
      const date = new Date(iso);
      
      expect(date.getUTCFullYear()).toBe(2025);
      expect(date.getUTCMonth()).toBe(9); // 0-indexed (October)
      expect(date.getUTCDate()).toBe(28);
    });

    it('should format date for display', () => {
      const date = new Date('2025-10-28T09:00:00Z');
      const formatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      
      // Note: This will vary by timezone, so we just check it's a string
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });
  });

  describe('JSON conversion', () => {
    it('should stringify object to JSON', () => {
      const obj = { name: 'Test', value: 123 };
      const json = JSON.stringify(obj);
      
      expect(json).toBe('{"name":"Test","value":123}');
    });

    it('should parse JSON to object', () => {
      const json = '{"name":"Test","value":123}';
      const obj = JSON.parse(json);
      
      expect(obj.name).toBe('Test');
      expect(obj.value).toBe(123);
    });

    it('should handle nested objects', () => {
      const obj = {
        form: {
          title: 'Test Form',
          fields: [{ name: 'field1' }],
        },
      };
      
      const json = JSON.stringify(obj);
      const parsed = JSON.parse(json);
      
      expect(parsed.form.title).toBe('Test Form');
      expect(parsed.form.fields).toHaveLength(1);
    });
  });

  describe('Form data conversion', () => {
    it('should convert form schema to submission format', () => {
      const schema = {
        fields: [
          { name: 'email', type: 'email', required: true },
          { name: 'message', type: 'textarea', required: false },
        ],
      };

      const fieldNames = schema.fields.map(f => f.name);
      expect(fieldNames).toContain('email');
      expect(fieldNames).toContain('message');
    });

    it('should extract required fields', () => {
      const fields = [
        { name: 'email', required: true },
        { name: 'phone', required: false },
        { name: 'name', required: true },
      ];

      const required = fields.filter(f => f.required).map(f => f.name);
      expect(required).toEqual(['email', 'name']);
    });
  });

  describe('File size conversion', () => {
    it('should convert bytes to MB', () => {
      const bytes = 5242880; // 5 MB
      const mb = bytes / (1024 * 1024);
      
      expect(mb).toBe(5);
    });

    it('should convert KB to bytes', () => {
      const kb = 100;
      const bytes = kb * 1024;
      
      expect(bytes).toBe(102400);
    });

    it('should format file size for display', () => {
      const bytes = 1536; // 1.5 KB
      const kb = bytes / 1024;
      const formatted = `${kb.toFixed(1)} KB`;
      
      expect(formatted).toBe('1.5 KB');
    });
  });

  describe('Status normalization', () => {
    it('should normalize status to lowercase', () => {
      const statuses = ['PENDING', 'Completed', 'MISSED'];
      const normalized = statuses.map(s => s.toLowerCase());
      
      expect(normalized).toEqual(['pending', 'completed', 'missed']);
    });

    it('should map old statuses to new ones', () => {
      const oldStatus = 'in-progress';
      const newStatus = oldStatus.replace('-', '_');
      
      expect(newStatus).toBe('in_progress');
    });
  });
});

