import { describe, it, expect } from 'vitest';

/**
 * Basic form validation tests
 * These test the fundamental validation logic for forms
 */

describe('Form Field Validation', () => {
  describe('Email validation', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.co.uk',
        'user+tag@example.com',
      ];

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'test@',
        'test @example.com',
        '',
      ];

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });
  });

  describe('Required field validation', () => {
    it('should reject empty required fields', () => {
      expect(isFieldValid('', true)).toBe(false);
      expect(isFieldValid('   ', true)).toBe(false);
      expect(isFieldValid(null, true)).toBe(false);
      expect(isFieldValid(undefined, true)).toBe(false);
    });

    it('should accept non-empty required fields', () => {
      expect(isFieldValid('test', true)).toBe(true);
      expect(isFieldValid('  test  ', true)).toBe(true);
    });

    it('should accept empty optional fields', () => {
      expect(isFieldValid('', false)).toBe(true);
      expect(isFieldValid(null, false)).toBe(true);
    });
  });

  describe('Phone number validation', () => {
    it('should accept valid phone formats', () => {
      const validPhones = [
        '1234567890',
        '123-456-7890',
        '(123) 456-7890',
        '+1 (123) 456-7890',
      ];

      validPhones.forEach(phone => {
        expect(isValidPhone(phone)).toBe(true);
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidPhones = [
        '123',
        'abc-def-ghij',
        '',
      ];

      invalidPhones.forEach(phone => {
        expect(isValidPhone(phone)).toBe(false);
      });
    });
  });
});

// Helper validation functions (simple implementations for testing)
function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isFieldValid(value: any, required: boolean): boolean {
  if (!required) return true;
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return !!value;
}

function isValidPhone(phone: string | null | undefined): boolean {
  if (!phone) return false;
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  // Valid if it has 10-11 digits (US format)
  return digitsOnly.length >= 10 && digitsOnly.length <= 11;
}

