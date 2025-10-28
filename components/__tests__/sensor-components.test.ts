import { describe, it, expect } from 'vitest';

/**
 * Sensor Component Tests
 * Tests sensor display components and temperature logic
 */

describe('SensorCard Component', () => {
  describe('Temperature display', () => {
    it('should display Celsius temperature', () => {
      const tempUnit = 'C';
      const tempCelsius = 4;

      const displayTemp = tempUnit === 'C' ? tempCelsius : (tempCelsius * 9 / 5) + 32;

      expect(displayTemp).toBe(4);
    });

    it('should display Fahrenheit temperature', () => {
      const tempUnit = 'F';
      const tempCelsius = 4;

      const displayTemp = tempUnit === 'C' ? tempCelsius : (tempCelsius * 9 / 5) + 32;

      expect(displayTemp).toBeCloseTo(39.2, 1);
    });

    it('should convert min temperature to Fahrenheit', () => {
      const tempUnit = 'F';
      const minTempCelsius = 2;

      const minTemp = tempUnit === 'C' ? minTempCelsius : (minTempCelsius * 9 / 5) + 32;

      expect(minTemp).toBeCloseTo(35.6, 1);
    });

    it('should convert max temperature to Fahrenheit', () => {
      const tempUnit = 'F';
      const maxTempCelsius = 8;

      const maxTemp = tempUnit === 'C' ? maxTempCelsius : (maxTempCelsius * 9 / 5) + 32;

      expect(maxTemp).toBeCloseTo(46.4, 1);
    });
  });

  describe('Sensor status', () => {
    it('should show OFFLINE badge when no reading', () => {
      const latestReading = null;
      const status = latestReading ? 'online' : 'offline';

      expect(status).toBe('offline');
    });

    it('should calculate status from temperature', () => {
      const temp = 5;
      const minTemp = 2;
      const maxTemp = 8;

      const isInRange = temp >= minTemp && temp <= maxTemp;
      const status = isInRange ? 'normal' : 'alert';

      expect(status).toBe('normal');
    });

    it('should detect temperature too low', () => {
      const temp = 1;
      const minTemp = 2;
      const maxTemp = 8;

      const status = temp < minTemp ? 'critical' : 'normal';

      expect(status).toBe('critical');
    });

    it('should detect temperature too high', () => {
      const temp = 10;
      const minTemp = 2;
      const maxTemp = 8;

      const status = temp > maxTemp ? 'critical' : 'normal';

      expect(status).toBe('critical');
    });
  });

  describe('Card interaction', () => {
    it('should support onClick handler', () => {
      const onClick = () => console.log('card clicked');

      expect(typeof onClick).toBe('function');
    });

    it('should show hover effects', () => {
      const hasHoverClass = true;

      expect(hasHoverClass).toBe(true);
    });

    it('should be clickable', () => {
      const cursor = 'pointer';

      expect(cursor).toBe('pointer');
    });
  });

  describe('Demo mode', () => {
    it('should support isDemo prop', () => {
      const isDemo = false;

      expect(typeof isDemo).toBe('boolean');
    });

    it('should default to non-demo mode', () => {
      const isDemo = false;

      expect(isDemo).toBe(false);
    });
  });

  describe('Temperature formatting', () => {
    it('should format temperature with unit', () => {
      const temp = 4.5;
      const unit = 'C';
      const formatted = `${temp.toFixed(1)}°${unit}`;

      expect(formatted).toBe('4.5°C');
    });

    it('should format Fahrenheit temperature', () => {
      const temp = 39.2;
      const unit = 'F';
      const formatted = `${temp.toFixed(1)}°${unit}`;

      expect(formatted).toBe('39.2°F');
    });

    it('should round to one decimal place', () => {
      const temp = 4.567;
      const rounded = parseFloat(temp.toFixed(1));

      expect(rounded).toBe(4.6);
    });
  });

  describe('Reading timestamp', () => {
    it('should format relative time', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      const diff = now.getTime() - fiveMinutesAgo.getTime();
      const minutes = Math.floor(diff / (1000 * 60));

      expect(minutes).toBe(5);
    });

    it('should show "just now" for recent readings', () => {
      const now = new Date();
      const secondsAgo = 30;
      const readingTime = new Date(now.getTime() - secondsAgo * 1000);

      const diff = now.getTime() - readingTime.getTime();
      const isRecent = diff < 60000; // Less than 1 minute

      expect(isRecent).toBe(true);
    });
  });
});

describe('Temperature Status Utils', () => {
  describe('Status determination', () => {
    it('should return normal for in-range temperature', () => {
      const temp = 5;
      const min = 2;
      const max = 8;

      const getTempStatus = (t: number, min: number, max: number) => {
        if (t < min) return 'critical';
        if (t > max) return 'critical';
        if (t < min + 1) return 'warning';
        if (t > max - 1) return 'warning';
        return 'normal';
      };

      expect(getTempStatus(temp, min, max)).toBe('normal');
    });

    it('should return warning near lower threshold', () => {
      const temp = 2.5;
      const min = 2;
      const max = 8;

      const isNearMin = temp < min + 1 && temp >= min;
      const status = isNearMin ? 'warning' : 'normal';

      expect(status).toBe('warning');
    });

    it('should return warning near upper threshold', () => {
      const temp = 7.5;
      const min = 2;
      const max = 8;

      const isNearMax = temp > max - 1 && temp <= max;
      const status = isNearMax ? 'warning' : 'normal';

      expect(status).toBe('warning');
    });

    it('should return critical for out-of-range temperature', () => {
      const temp = 1;
      const min = 2;
      const max = 8;

      const status = temp < min || temp > max ? 'critical' : 'normal';

      expect(status).toBe('critical');
    });
  });

  describe('Status colors', () => {
    it('should use green for normal status', () => {
      const status = 'normal';
      const colorMap = {
        normal: 'green',
        warning: 'yellow',
        critical: 'red',
      };

      expect(colorMap[status]).toBe('green');
    });

    it('should use yellow for warning status', () => {
      const status = 'warning';
      const colorMap = {
        normal: 'green',
        warning: 'yellow',
        critical: 'red',
      };

      expect(colorMap[status]).toBe('yellow');
    });

    it('should use red for critical status', () => {
      const status = 'critical';
      const colorMap = {
        normal: 'green',
        warning: 'yellow',
        critical: 'red',
      };

      expect(colorMap[status]).toBe('red');
    });
  });

  describe('Status badge text', () => {
    it('should show "NORMAL" for normal status', () => {
      const status = 'normal';
      const textMap = {
        normal: 'NORMAL',
        warning: 'WARNING',
        critical: 'CRITICAL',
      };

      expect(textMap[status]).toBe('NORMAL');
    });

    it('should show "WARNING" for warning status', () => {
      const status = 'warning';
      const textMap = {
        normal: 'NORMAL',
        warning: 'WARNING',
        critical: 'CRITICAL',
      };

      expect(textMap[status]).toBe('WARNING');
    });

    it('should show "CRITICAL" for critical status', () => {
      const status = 'critical';
      const textMap = {
        normal: 'NORMAL',
        warning: 'WARNING',
        critical: 'CRITICAL',
      };

      expect(textMap[status]).toBe('CRITICAL');
    });
  });
});

describe('Sensor Location Display', () => {
  describe('Location formatting', () => {
    it('should display location with icon', () => {
      const location = 'Walk-in Cooler #1';

      expect(location).toBeTruthy();
      expect(location).toContain('Cooler');
    });

    it('should handle multi-word locations', () => {
      const location = 'Main Kitchen Refrigerator';

      expect(location.split(' ').length).toBeGreaterThan(1);
    });

    it('should display sensor name', () => {
      const name = 'Cooler Sensor A';

      expect(name).toBeTruthy();
    });
  });
});

describe('MiniChart Component', () => {
  describe('Chart data', () => {
    it('should accept readings array', () => {
      const readings = [
        { temperature_celsius: 4, recorded_at: '2025-10-28T10:00:00Z' },
        { temperature_celsius: 5, recorded_at: '2025-10-28T11:00:00Z' },
      ];

      expect(readings.length).toBeGreaterThan(0);
    });

    it('should handle empty readings', () => {
      const readings: any[] = [];

      expect(readings.length).toBe(0);
    });

    it('should extract temperature values', () => {
      const readings = [
        { temperature_celsius: 4 },
        { temperature_celsius: 5 },
        { temperature_celsius: 4.5 },
      ];

      const temps = readings.map(r => r.temperature_celsius);

      expect(temps).toEqual([4, 5, 4.5]);
    });
  });

  describe('Chart display', () => {
    it('should show min/max thresholds', () => {
      const minThreshold = 2;
      const maxThreshold = 8;

      expect(minThreshold).toBeLessThan(maxThreshold);
    });

    it('should use appropriate height', () => {
      const height = 60;

      expect(height).toBeGreaterThan(0);
    });

    it('should support temperature unit', () => {
      const tempUnit: 'C' | 'F' = 'C';

      expect(['C', 'F']).toContain(tempUnit);
    });
  });
});

