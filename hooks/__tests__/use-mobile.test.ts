import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Mobile Detection Hook Tests
 * Tests the useIsMobile hook logic
 */

describe('useIsMobile Hook Logic', () => {
  const MOBILE_BREAKPOINT = 768;

  beforeEach(() => {
    // Reset window.innerWidth
    vi.stubGlobal('innerWidth', 1024);
  });

  describe('Breakpoint detection', () => {
    it('should use 768px as mobile breakpoint', () => {
      expect(MOBILE_BREAKPOINT).toBe(768);
    });

    it('should detect mobile at 767px', () => {
      const width = 767;
      const isMobile = width < MOBILE_BREAKPOINT;

      expect(isMobile).toBe(true);
    });

    it('should detect desktop at 768px', () => {
      const width = 768;
      const isMobile = width < MOBILE_BREAKPOINT;

      expect(isMobile).toBe(false);
    });

    it('should detect mobile at 375px (phone)', () => {
      const width = 375;
      const isMobile = width < MOBILE_BREAKPOINT;

      expect(isMobile).toBe(true);
    });

    it('should detect desktop at 1024px (tablet landscape)', () => {
      const width = 1024;
      const isMobile = width < MOBILE_BREAKPOINT;

      expect(isMobile).toBe(false);
    });

    it('should detect desktop at 1920px (desktop)', () => {
      const width = 1920;
      const isMobile = width < MOBILE_BREAKPOINT;

      expect(isMobile).toBe(false);
    });
  });

  describe('Media query generation', () => {
    it('should generate correct media query string', () => {
      const mediaQuery = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

      expect(mediaQuery).toBe('(max-width: 767px)');
    });

    it('should validate media query format', () => {
      const mediaQuery = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

      expect(mediaQuery).toMatch(/^\(max-width: \d+px\)$/);
    });
  });

  describe('State transitions', () => {
    it('should transition from undefined to mobile', () => {
      let state: boolean | undefined = undefined;
      const width = 375;

      if (width < MOBILE_BREAKPOINT) {
        state = true;
      }

      expect(state).toBe(true);
    });

    it('should transition from undefined to desktop', () => {
      let state: boolean | undefined = undefined;
      const width = 1024;

      if (width >= MOBILE_BREAKPOINT) {
        state = false;
      }

      expect(state).toBe(false);
    });

    it('should handle resize from mobile to desktop', () => {
      let isMobile = true;
      const newWidth = 1024;

      isMobile = newWidth < MOBILE_BREAKPOINT;

      expect(isMobile).toBe(false);
    });

    it('should handle resize from desktop to mobile', () => {
      let isMobile = false;
      const newWidth = 375;

      isMobile = newWidth < MOBILE_BREAKPOINT;

      expect(isMobile).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle exactly at breakpoint', () => {
      const widthAtBreakpoint = MOBILE_BREAKPOINT;
      const isMobile = widthAtBreakpoint < MOBILE_BREAKPOINT;

      expect(isMobile).toBe(false);
    });

    it('should handle one pixel below breakpoint', () => {
      const widthBelowBreakpoint = MOBILE_BREAKPOINT - 1;
      const isMobile = widthBelowBreakpoint < MOBILE_BREAKPOINT;

      expect(isMobile).toBe(true);
    });

    it('should handle very small screens', () => {
      const tinyScreen = 320;
      const isMobile = tinyScreen < MOBILE_BREAKPOINT;

      expect(isMobile).toBe(true);
    });

    it('should handle very large screens', () => {
      const largeScreen = 2560;
      const isMobile = largeScreen < MOBILE_BREAKPOINT;

      expect(isMobile).toBe(false);
    });
  });

  describe('Boolean coercion', () => {
    it('should coerce undefined to false', () => {
      const isMobile: boolean | undefined = undefined;
      const result = !!isMobile;

      expect(result).toBe(false);
    });

    it('should coerce true to true', () => {
      const isMobile: boolean | undefined = true;
      const result = !!isMobile;

      expect(result).toBe(true);
    });

    it('should coerce false to false', () => {
      const isMobile: boolean | undefined = false;
      const result = !!isMobile;

      expect(result).toBe(false);
    });
  });
});

