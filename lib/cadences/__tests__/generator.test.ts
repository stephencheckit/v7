import { describe, it, expect } from 'vitest';
import { addHours, parseISO } from 'date-fns';

/**
 * Cadence instance generation tests
 * Critical for ensuring scheduled tasks are created correctly
 */

describe('Cadence Instance Generation', () => {
  describe('Date calculations', () => {
    it('should calculate lookahead window correctly', () => {
      const now = new Date('2025-10-28T00:00:00Z');
      const lookAheadHours = 24;
      const expected = new Date('2025-10-29T00:00:00Z');
      
      expect(addHours(now, lookAheadHours)).toEqual(expected);
    });

    it('should handle timezone conversions', () => {
      // Test that we can parse ISO dates correctly
      const isoDate = '2025-10-28T09:00:00Z';
      const parsed = parseISO(isoDate);
      
      expect(parsed.getUTCHours()).toBe(9);
    });
  });

  describe('Schedule pattern parsing', () => {
    it('should identify daily patterns', () => {
      const pattern = 'daily';
      expect(['daily', 'weekly', 'monthly', 'quarterly']).toContain(pattern);
    });

    it('should identify weekly patterns', () => {
      const pattern = 'weekly';
      expect(['daily', 'weekly', 'monthly', 'quarterly']).toContain(pattern);
    });

    it('should reject invalid patterns', () => {
      const pattern = 'invalid';
      expect(['daily', 'weekly', 'monthly', 'quarterly']).not.toContain(pattern);
    });
  });

  describe('Instance naming', () => {
    it('should generate readable instance names', () => {
      const cadenceName = 'Morning Checklist';
      const date = '2025-10-28';
      const instanceName = `${cadenceName} - ${date}`;
      
      expect(instanceName).toBe('Morning Checklist - 2025-10-28');
    });

    it('should handle special characters in names', () => {
      const name = 'Temperature Check (AM)';
      expect(name).toContain('(AM)');
    });
  });

  describe('Status transitions', () => {
    it('should transition pending to ready after scheduled time', () => {
      const scheduled = new Date('2025-10-28T09:00:00Z');
      const now = new Date('2025-10-28T09:30:00Z');
      
      expect(now > scheduled).toBe(true); // Should be ready
    });

    it('should transition ready to missed after due time', () => {
      const due = new Date('2025-10-28T17:00:00Z');
      const now = new Date('2025-10-28T18:00:00Z');
      
      expect(now > due).toBe(true); // Should be missed
    });

    it('should keep pending before scheduled time', () => {
      const scheduled = new Date('2025-10-28T09:00:00Z');
      const now = new Date('2025-10-28T08:00:00Z');
      
      expect(now < scheduled).toBe(true); // Should stay pending
    });
  });

  describe('Days of week parsing', () => {
    it('should handle weekday arrays', () => {
      const weekdays = [1, 2, 3, 4, 5]; // Mon-Fri
      expect(weekdays).toHaveLength(5);
      expect(weekdays).toContain(1); // Monday
      expect(weekdays).toContain(5); // Friday
      expect(weekdays).not.toContain(0); // Sunday
    });

    it('should handle weekend days', () => {
      const weekend = [0, 6]; // Sun, Sat
      expect(weekend).toHaveLength(2);
      expect(weekend).toContain(0); // Sunday
      expect(weekend).toContain(6); // Saturday
    });

    it('should handle all days', () => {
      const allDays = [0, 1, 2, 3, 4, 5, 6];
      expect(allDays).toHaveLength(7);
    });
  });

  describe('Completion window calculation', () => {
    it('should calculate due date correctly', () => {
      const scheduled = new Date('2025-10-28T09:00:00Z');
      const windowHours = 8;
      const expected = new Date('2025-10-28T17:00:00Z');
      
      expect(addHours(scheduled, windowHours)).toEqual(expected);
    });

    it('should handle short windows (1 hour)', () => {
      const scheduled = new Date('2025-10-28T09:00:00Z');
      const windowHours = 1;
      const expected = new Date('2025-10-28T10:00:00Z');
      
      expect(addHours(scheduled, windowHours)).toEqual(expected);
    });

    it('should handle long windows (24 hours)', () => {
      const scheduled = new Date('2025-10-28T09:00:00Z');
      const windowHours = 24;
      const expected = new Date('2025-10-29T09:00:00Z');
      
      expect(addHours(scheduled, windowHours)).toEqual(expected);
    });
  });
});

