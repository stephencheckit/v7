// Temperature utility functions for sensor dashboard

/**
 * FDA Food Code & HACCP Temperature Standards
 */
export const TEMP_STANDARDS = {
  freezer: {
    min_celsius: -23, // -10°F
    max_celsius: -18, // 0°F
    ideal_celsius: -20, // -4°F
    unit: "freezer",
  },
  fridge: {
    min_celsius: 0, // 32°F
    max_celsius: 4, // 40°F (FDA standard)
    ideal_celsius: 2, // 35°F
    unit: "fridge",
  },
} as const;

/**
 * Convert Celsius to Fahrenheit
 */
export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

/**
 * Convert Fahrenheit to Celsius
 */
export function fahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

/**
 * Format temperature with unit
 */
export function formatTemperature(
  temp: number,
  unit: "C" | "F",
  decimals: number = 1
): string {
  return `${temp.toFixed(decimals)}°${unit}`;
}

/**
 * Get temperature status based on thresholds
 */
export function getTempStatus(
  temp: number,
  min: number,
  max: number,
  warningThreshold: number = 1
): "normal" | "warning" | "critical" | "offline" {
  // Approaching thresholds (within warning range)
  if (temp >= min - warningThreshold && temp < min) {
    return "warning";
  }
  if (temp > max && temp <= max + warningThreshold) {
    return "warning";
  }

  // Out of range
  if (temp < min || temp > max) {
    return "critical";
  }

  // Within range
  return "normal";
}

/**
 * Get status color based on temperature status
 */
export function getStatusColor(
  status: "normal" | "warning" | "critical" | "offline"
): string {
  switch (status) {
    case "normal":
      return "#c4dfc4"; // Green
    case "warning":
      return "#f5edc8"; // Yellow
    case "critical":
      return "#ff6b6b"; // Red
    case "offline":
      return "#6b7280"; // Gray
    default:
      return "#6b7280";
  }
}

/**
 * Get status badge text
 */
export function getStatusBadgeText(
  status: "normal" | "warning" | "critical" | "offline"
): string {
  switch (status) {
    case "normal":
      return "NORMAL";
    case "warning":
      return "WARNING";
    case "critical":
      return "ALERT";
    case "offline":
      return "OFFLINE";
    default:
      return "UNKNOWN";
  }
}

/**
 * Calculate temperature statistics
 */
export function calculateTempStats(readings: number[]): {
  min: number;
  max: number;
  avg: number;
  median: number;
} {
  if (readings.length === 0) {
    return { min: 0, max: 0, avg: 0, median: 0 };
  }

  const sorted = [...readings].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const avg = readings.reduce((sum, val) => sum + val, 0) / readings.length;
  const median =
    readings.length % 2 === 0
      ? (sorted[readings.length / 2 - 1] + sorted[readings.length / 2]) / 2
      : sorted[Math.floor(readings.length / 2)];

  return { min, max, avg, median };
}

/**
 * Check if temperature is in range
 */
export function isInRange(
  temp: number,
  min: number,
  max: number
): boolean {
  return temp >= min && temp <= max;
}

/**
 * Get temperature range display text
 */
export function getRangeText(
  min: number,
  max: number,
  unit: "C" | "F"
): string {
  return `${min.toFixed(1)}° - ${max.toFixed(1)}°${unit}`;
}

/**
 * Convert temperature based on unit preference
 */
export function convertTemp(
  temp: number,
  fromUnit: "C" | "F",
  toUnit: "C" | "F"
): number {
  if (fromUnit === toUnit) return temp;
  return fromUnit === "C" ? celsiusToFahrenheit(temp) : fahrenheitToCelsius(temp);
}

