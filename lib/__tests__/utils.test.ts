import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('Utils', () => {
  describe('cn (className merger)', () => {
    it('should merge multiple class names', () => {
      expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
    });

    it('should handle conditional classes', () => {
      expect(cn('base', true && 'active')).toContain('active');
      expect(cn('base', false && 'inactive')).not.toContain('inactive');
    });

    it('should merge tailwind classes correctly', () => {
      // Test that tailwind-merge removes conflicts
      expect(cn('p-4', 'p-2')).toBe('p-2');
    });
  });
});

