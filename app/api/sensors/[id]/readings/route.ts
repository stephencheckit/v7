// Sensor Readings API - Get historical temperature data

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";
import { celsiusToFahrenheit } from "@/lib/sensors/temperature-utils";

/**
 * GET /api/sensors/[id]/readings
 * 
 * Get historical temperature readings for a sensor
 * Query params:
 * - range: 24h | 7d | 30d (default: 24h)
 * - unit: C | F (default: F)
 * - limit: number (default: 1000)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "24h";
    const unit = (searchParams.get("unit") || "F") as "C" | "F";
    const limit = parseInt(searchParams.get("limit") || "1000");

    const supabase = createClient();
    const { id } = params;

    // Calculate time range
    const timeRangeMs = getTimeRangeMs(range);
    const startTime = new Date(Date.now() - timeRangeMs).toISOString();

    // Fetch readings
    const { data: readings, error: readingsError } = await supabase
      .from("sensor_readings")
      .select("*")
      .eq("sensor_id", id)
      .gte("recorded_at", startTime)
      .order("recorded_at", { ascending: true })
      .limit(limit);

    if (readingsError) {
      console.error("Error fetching readings:", readingsError);
      return NextResponse.json(
        { error: "Failed to fetch readings" },
        { status: 500 }
      );
    }

    // Convert temperatures if needed and format data
    const formattedReadings = (readings || []).map((reading) => ({
      id: reading.id,
      temperature:
        unit === "C"
          ? reading.temperature_celsius
          : reading.temperature_fahrenheit,
      temperature_celsius: reading.temperature_celsius,
      temperature_fahrenheit: reading.temperature_fahrenheit,
      unit,
      is_in_range: reading.is_in_range,
      is_critical: reading.is_critical,
      recorded_at: reading.recorded_at,
    }));

    // Calculate statistics
    const temps = formattedReadings.map((r) => r.temperature);
    const stats = temps.length > 0 ? calculateStats(temps) : null;

    return NextResponse.json({
      sensor_id: id,
      range,
      unit,
      readings: formattedReadings,
      count: formattedReadings.length,
      stats,
      time_range: {
        start: startTime,
        end: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/sensors/[id]/readings:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Get time range in milliseconds
 */
function getTimeRangeMs(range: string): number {
  switch (range) {
    case "1h":
      return 60 * 60 * 1000;
    case "6h":
      return 6 * 60 * 60 * 1000;
    case "24h":
      return 24 * 60 * 60 * 1000;
    case "7d":
      return 7 * 24 * 60 * 60 * 1000;
    case "30d":
      return 30 * 24 * 60 * 60 * 1000;
    default:
      return 24 * 60 * 60 * 1000; // Default to 24 hours
  }
}

/**
 * Calculate temperature statistics
 */
function calculateStats(temps: number[]) {
  if (temps.length === 0) {
    return null;
  }

  const sorted = [...temps].sort((a, b) => a - b);
  const sum = temps.reduce((acc, t) => acc + t, 0);
  const avg = sum / temps.length;
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const median =
    temps.length % 2 === 0
      ? (sorted[temps.length / 2 - 1] + sorted[temps.length / 2]) / 2
      : sorted[Math.floor(temps.length / 2)];

  // Calculate out-of-range percentage (would need thresholds from sensor)
  // For now, just return basic stats

  return {
    min,
    max,
    avg,
    median,
    count: temps.length,
  };
}

