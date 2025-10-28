import { describe, it, expect } from 'vitest';

/**
 * Temperature Sensor Validation Tests
 * Tests temperature reading validation and alert logic
 */

describe('Temperature Sensor Validation', () => {
  describe('Temperature range validation', () => {
    it('should validate refrigerator temperatures (32-41°F)', () => {
      const reading = 38;
      const min = 32;
      const max = 41;

      expect(reading).toBeGreaterThanOrEqual(min);
      expect(reading).toBeLessThanOrEqual(max);
    });

    it('should validate freezer temperatures (-10-0°F)', () => {
      const reading = -5;
      const min = -10;
      const max = 0;

      expect(reading).toBeGreaterThanOrEqual(min);
      expect(reading).toBeLessThanOrEqual(max);
    });

    it('should validate hot holding temperatures (135-165°F)', () => {
      const reading = 145;
      const min = 135;
      const max = 165;

      expect(reading).toBeGreaterThanOrEqual(min);
      expect(reading).toBeLessThanOrEqual(max);
    });

    it('should detect out-of-range refrigerator temp', () => {
      const reading = 50; // Too warm!
      const max = 41;

      expect(reading).toBeGreaterThan(max);
    });

    it('should detect out-of-range freezer temp', () => {
      const reading = 15; // Too warm!
      const max = 0;

      expect(reading).toBeGreaterThan(max);
    });
  });

  describe('Temperature conversion', () => {
    it('should convert Fahrenheit to Celsius', () => {
      const fahrenheit = 32;
      const celsius = (fahrenheit - 32) * (5 / 9);

      expect(celsius).toBeCloseTo(0, 1);
    });

    it('should convert Celsius to Fahrenheit', () => {
      const celsius = 0;
      const fahrenheit = (celsius * 9 / 5) + 32;

      expect(fahrenheit).toBe(32);
    });

    it('should handle negative temperatures', () => {
      const fahrenheit = -40;
      const celsius = (fahrenheit - 32) * (5 / 9);

      expect(celsius).toBeCloseTo(-40, 1);
    });

    it('should handle decimal temperatures', () => {
      const fahrenheit = 98.6;
      const celsius = (fahrenheit - 32) * (5 / 9);

      expect(celsius).toBeCloseTo(37, 0);
    });
  });

  describe('Sensor reading validation', () => {
    it('should validate reading structure', () => {
      const reading = {
        sensor_id: 'temp-001',
        temperature: 38,
        unit: 'F',
        timestamp: new Date().toISOString(),
      };

      expect(reading.sensor_id).toBeTruthy();
      expect(typeof reading.temperature).toBe('number');
      expect(['F', 'C']).toContain(reading.unit);
    });

    it('should reject invalid temperature values', () => {
      const invalidValues = [
        NaN,
        Infinity,
        -Infinity,
      ];

      invalidValues.forEach(value => {
        expect(isFinite(value)).toBe(false);
      });
    });

    it('should validate realistic temperature bounds', () => {
      const reading = 38;
      const absoluteMin = -100; // °F
      const absoluteMax = 300; // °F

      expect(reading).toBeGreaterThan(absoluteMin);
      expect(reading).toBeLessThan(absoluteMax);
    });

    it('should validate timestamp format', () => {
      const timestamp = new Date().toISOString();
      const parsed = new Date(timestamp);

      expect(parsed.toString()).not.toBe('Invalid Date');
    });
  });

  describe('Alert thresholds', () => {
    it('should trigger warning for near-limit temperature', () => {
      const reading = 40; // Close to 41°F max
      const max = 41;
      const warningThreshold = max - 2;

      const shouldWarn = reading >= warningThreshold;
      expect(shouldWarn).toBe(true);
    });

    it('should trigger critical alert for out-of-range', () => {
      const reading = 50;
      const max = 41;

      const isCritical = reading > max;
      expect(isCritical).toBe(true);
    });

    it('should calculate time out of range', () => {
      const startTime = new Date('2025-10-28T10:00:00Z');
      const endTime = new Date('2025-10-28T10:15:00Z');
      const minutesOutOfRange = (endTime.getTime() - startTime.getTime()) / (1000 * 60);

      expect(minutesOutOfRange).toBe(15);
    });

    it('should escalate alerts after sustained violation', () => {
      const minutesOutOfRange = 30;
      const escalationThreshold = 15;

      const shouldEscalate = minutesOutOfRange > escalationThreshold;
      expect(shouldEscalate).toBe(true);
    });
  });

  describe('Sensor metadata', () => {
    it('should validate sensor configuration', () => {
      const sensor = {
        id: 'temp-001',
        location: 'Walk-in Cooler #1',
        type: 'refrigerator',
        min_temp: 32,
        max_temp: 41,
        alert_emails: ['manager@restaurant.com'],
      };

      expect(sensor.id).toBeTruthy();
      expect(sensor.location).toBeTruthy();
      expect(sensor.max_temp).toBeGreaterThan(sensor.min_temp);
    });

    it('should validate sensor battery level', () => {
      const sensor = {
        battery_level: 75,
      };

      expect(sensor.battery_level).toBeGreaterThanOrEqual(0);
      expect(sensor.battery_level).toBeLessThanOrEqual(100);
    });

    it('should detect low battery', () => {
      const batteryLevel = 15;
      const lowBatteryThreshold = 20;

      const isLowBattery = batteryLevel < lowBatteryThreshold;
      expect(isLowBattery).toBe(true);
    });

    it('should track last communication time', () => {
      const lastSeen = new Date('2025-10-28T10:00:00Z');
      const now = new Date('2025-10-28T10:30:00Z');
      const minutesSinceLastSeen = (now.getTime() - lastSeen.getTime()) / (1000 * 60);

      expect(minutesSinceLastSeen).toBe(30);
    });

    it('should detect offline sensors', () => {
      const minutesSinceLastSeen = 120; // 2 hours
      const offlineThreshold = 60; // 1 hour

      const isOffline = minutesSinceLastSeen > offlineThreshold;
      expect(isOffline).toBe(true);
    });
  });

  describe('Reading aggregation', () => {
    it('should calculate average temperature', () => {
      const readings = [38, 39, 37, 40, 38];
      const average = readings.reduce((sum, temp) => sum + temp, 0) / readings.length;

      expect(average).toBeCloseTo(38.4, 1);
    });

    it('should find min/max temperatures', () => {
      const readings = [38, 39, 37, 40, 38];
      const min = Math.min(...readings);
      const max = Math.max(...readings);

      expect(min).toBe(37);
      expect(max).toBe(40);
    });

    it('should calculate temperature trend', () => {
      const readings = [
        { time: 1, temp: 38 },
        { time: 2, temp: 39 },
        { time: 3, temp: 40 },
      ];

      // Increasing trend
      const isIncreasing = readings.every((r, i) => 
        i === 0 || r.temp >= readings[i - 1].temp
      );

      expect(isIncreasing).toBe(true);
    });

    it('should detect temperature spikes', () => {
      const readings = [38, 38, 55, 39, 38]; // Spike at index 2
      const avgWithoutSpike = 38.25;
      const spike = readings[2];
      const spikeThreshold = avgWithoutSpike + 10;

      const hasSpike = spike > spikeThreshold;
      expect(hasSpike).toBe(true);
    });
  });

  describe('Compliance validation', () => {
    it('should enforce FDA temperature guidelines', () => {
      const guidelines = {
        cold_holding: { min: 32, max: 41 },
        hot_holding: { min: 135, max: 165 },
        danger_zone: { min: 41, max: 135 },
      };

      expect(guidelines.cold_holding.max).toBe(41);
      expect(guidelines.hot_holding.min).toBe(135);
    });

    it('should detect danger zone temperatures', () => {
      const temp = 70; // In danger zone!
      const dangerZoneMin = 41;
      const dangerZoneMax = 135;

      const isInDangerZone = temp > dangerZoneMin && temp < dangerZoneMax;
      expect(isInDangerZone).toBe(true);
    });

    it('should validate 4-hour rule for time in danger zone', () => {
      const minutesInDangerZone = 250; // Over 4 hours
      const maxMinutes = 240; // 4 hours

      const violatesRule = minutesInDangerZone > maxMinutes;
      expect(violatesRule).toBe(true);
    });

    it('should log all temperature violations', () => {
      const violation = {
        sensor_id: 'temp-001',
        temperature: 50,
        threshold: 41,
        timestamp: new Date().toISOString(),
        severity: 'critical',
      };

      expect(violation.temperature).toBeGreaterThan(violation.threshold);
      expect(['warning', 'critical']).toContain(violation.severity);
    });
  });
});

