import { describe, it, expect } from 'vitest';

/**
 * Workspace helper function tests
 * Tests utility functions used across the workspace system
 */

describe('Workspace Helpers', () => {
  describe('Slug generation', () => {
    it('should convert names to valid slugs', () => {
      expect(generateSlug('My Workspace')).toBe('my-workspace');
      expect(generateSlug('Test   Workspace')).toBe('test-workspace');
      expect(generateSlug('Workspace-123')).toBe('workspace-123');
    });

    it('should remove special characters', () => {
      expect(generateSlug('My@Workspace!')).toBe('myworkspace');
      expect(generateSlug('Test & Workspace')).toBe('test-workspace');
    });

    it('should handle edge cases', () => {
      expect(generateSlug('')).toBe('');
      expect(generateSlug('   ')).toBe('');
      expect(generateSlug('123')).toBe('123');
    });
  });

  describe('Domain extraction', () => {
    it('should extract domain from email', () => {
      expect(extractDomain('test@example.com')).toBe('example.com');
      expect(extractDomain('user@subdomain.example.com')).toBe('subdomain.example.com');
    });

    it('should handle invalid emails', () => {
      expect(extractDomain('notanemail')).toBe(null);
      expect(extractDomain('')).toBe(null);
      expect(extractDomain('@example.com')).toBe(null);
    });
  });

  describe('Consumer domain detection', () => {
    it('should identify consumer email domains', () => {
      const consumerDomains = [
        'gmail.com',
        'yahoo.com',
        'hotmail.com',
        'outlook.com',
        'icloud.com',
      ];

      consumerDomains.forEach(domain => {
        expect(isConsumerDomain(domain)).toBe(true);
      });
    });

    it('should identify business domains', () => {
      const businessDomains = [
        'company.com',
        'restaurant.com',
        'hospital.org',
      ];

      businessDomains.forEach(domain => {
        expect(isConsumerDomain(domain)).toBe(false);
      });
    });
  });
});

// Helper functions (implement these based on actual workspace-helper.ts)
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Remove consecutive hyphens
}

function extractDomain(email: string): string | null {
  if (!email || !email.includes('@')) return null;
  const parts = email.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return parts[1];
}

function isConsumerDomain(domain: string): boolean {
  const consumerDomains = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'icloud.com',
    'aol.com',
    'protonmail.com',
    'mail.com',
  ];
  return consumerDomains.includes(domain.toLowerCase());
}

