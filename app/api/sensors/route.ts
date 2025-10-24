// Sensors API - List and create sensors

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserWorkspaceId } from "@/lib/workspace-helper";

/**
 * GET /api/sensors
 * 
 * List all sensors with their latest readings (filtered by workspace)
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get user's workspace
    const workspaceId = await getUserWorkspaceId();
    
    if (!workspaceId) {
      return NextResponse.json(
        { error: "Unauthorized - no workspace found" },
        { status: 401 }
      );
    }

    // Fetch sensors for this workspace only
    const { data: sensors, error: sensorsError } = await supabase
      .from("sensors")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("is_active", true)
      .order("name");

    if (sensorsError) {
      console.error("Error fetching sensors:", sensorsError);
      return NextResponse.json(
        { error: "Failed to fetch sensors" },
        { status: 500 }
      );
    }

    // Fetch latest reading for each sensor
    const sensorsWithReadings = await Promise.all(
      (sensors || []).map(async (sensor) => {
        const { data: latestReading } = await supabase
          .from("sensor_readings")
          .select("*")
          .eq("sensor_id", sensor.id)
          .order("recorded_at", { ascending: false })
          .limit(1)
          .single();

        // Check for active alerts
        const { data: activeAlerts, count: alertCount } = await supabase
          .from("sensor_alerts")
          .select("*", { count: "exact" })
          .eq("sensor_id", sensor.id)
          .eq("status", "active");

        return {
          ...sensor,
          latest_reading: latestReading || null,
          active_alerts_count: alertCount || 0,
          has_active_alert: (alertCount || 0) > 0,
        };
      })
    );

    return NextResponse.json({
      sensors: sensorsWithReadings,
      total: sensorsWithReadings.length,
    });
  } catch (error: any) {
    console.error("Error in GET /api/sensors:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sensors
 * 
 * Create a new sensor (in authenticated user's workspace)
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get user's workspace
    const workspaceId = await getUserWorkspaceId();
    
    if (!workspaceId) {
      return NextResponse.json(
        { error: "Unauthorized - no workspace found" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate required fields
    const {
      dt_device_id,
      dt_project_id,
      name,
      location,
      equipment_type,
      min_temp_celsius,
      max_temp_celsius,
    } = body;

    if (!dt_device_id || !name || !equipment_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if sensor already exists in this workspace
    const { data: existing } = await supabase
      .from("sensors")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("dt_device_id", dt_device_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Sensor with this device ID already exists in your workspace" },
        { status: 409 }
      );
    }

    // Create sensor with workspace_id
    const { data: sensor, error: createError } = await supabase
      .from("sensors")
      .insert({
        workspace_id: workspaceId,
        dt_device_id,
        dt_project_id: dt_project_id || "unknown",
        name,
        location: location || "Unknown",
        equipment_type,
        min_temp_celsius: min_temp_celsius || (equipment_type === "freezer" ? -23 : 0),
        max_temp_celsius: max_temp_celsius || (equipment_type === "freezer" ? -18 : 4),
        alert_delay_minutes: body.alert_delay_minutes || 15,
        alert_recipients: body.alert_recipients || [],
      })
      .select()
      .single();

    if (createError || !sensor) {
      console.error("Error creating sensor:", createError);
      return NextResponse.json(
        { error: "Failed to create sensor" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sensor,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/sensors:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

