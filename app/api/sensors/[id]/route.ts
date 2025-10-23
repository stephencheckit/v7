// Sensor Detail API - Get and update individual sensor

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

/**
 * GET /api/sensors/[id]
 * 
 * Get sensor details with statistics
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { id } = params;

    // Fetch sensor
    const { data: sensor, error: sensorError } = await supabase
      .from("sensors")
      .select("*")
      .eq("id", id)
      .single();

    if (sensorError || !sensor) {
      return NextResponse.json(
        { error: "Sensor not found" },
        { status: 404 }
      );
    }

    // Fetch latest reading
    const { data: latestReading } = await supabase
      .from("sensor_readings")
      .select("*")
      .eq("sensor_id", id)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .single();

    // Fetch active alerts
    const { data: activeAlerts, count: alertCount } = await supabase
      .from("sensor_alerts")
      .select("*", { count: "exact" })
      .eq("sensor_id", id)
      .eq("status", "active");

    // Fetch reading statistics (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentReadings } = await supabase
      .from("sensor_readings")
      .select("temperature_celsius")
      .eq("sensor_id", id)
      .gte("recorded_at", twentyFourHoursAgo);

    let stats = null;
    if (recentReadings && recentReadings.length > 0) {
      const temps = recentReadings.map((r) => r.temperature_celsius);
      const sorted = [...temps].sort((a, b) => a - b);

      stats = {
        min: sorted[0],
        max: sorted[sorted.length - 1],
        avg: temps.reduce((sum, t) => sum + t, 0) / temps.length,
        count: temps.length,
      };
    }

    return NextResponse.json({
      sensor,
      latest_reading: latestReading,
      active_alerts: activeAlerts || [],
      alert_count: alertCount || 0,
      stats_24h: stats,
    });
  } catch (error: any) {
    console.error("Error in GET /api/sensors/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/sensors/[id]
 * 
 * Update sensor settings
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { id } = params;
    const updates = await req.json();

    // Allowed fields to update
    const allowedFields = [
      "name",
      "location",
      "equipment_type",
      "min_temp_celsius",
      "max_temp_celsius",
      "alert_delay_minutes",
      "alert_recipients",
      "is_active",
    ];

    // Filter to only allowed fields
    const filteredUpdates = Object.keys(updates)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Update sensor
    const { data: sensor, error: updateError } = await supabase
      .from("sensors")
      .update(filteredUpdates)
      .eq("id", id)
      .select()
      .single();

    if (updateError || !sensor) {
      console.error("Error updating sensor:", updateError);
      return NextResponse.json(
        { error: "Failed to update sensor" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sensor,
    });
  } catch (error: any) {
    console.error("Error in PATCH /api/sensors/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sensors/[id]
 * 
 * Delete sensor (soft delete by setting is_active = false)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { id } = params;

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from("sensors")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      console.error("Error deleting sensor:", error);
      return NextResponse.json(
        { error: "Failed to delete sensor" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Sensor deactivated successfully",
    });
  } catch (error: any) {
    console.error("Error in DELETE /api/sensors/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

