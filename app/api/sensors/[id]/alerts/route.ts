// Sensor Alerts API - Get and manage alerts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

/**
 * GET /api/sensors/[id]/alerts
 * 
 * Get alert history for a sensor
 * Query params:
 * - status: active | resolved | all (default: all)
 * - limit: number (default: 50)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";
    const limit = parseInt(searchParams.get("limit") || "50");

    const supabase = createClient();
    const { id } = await params;

    // Build query
    let query = supabase
      .from("sensor_alerts")
      .select("*")
      .eq("sensor_id", id)
      .order("started_at", { ascending: false })
      .limit(limit);

    // Filter by status if specified
    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data: alerts, error: alertsError } = await query;

    if (alertsError) {
      console.error("Error fetching alerts:", alertsError);
      return NextResponse.json(
        { error: "Failed to fetch alerts" },
        { status: 500 }
      );
    }

    // Get associated tasks for each alert
    const alertsWithTasks = await Promise.all(
      (alerts || []).map(async (alert) => {
        const { data: tasks } = await supabase
          .from("sensor_tasks")
          .select("*")
          .eq("alert_id", alert.id);

        return {
          ...alert,
          tasks: tasks || [],
        };
      })
    );

    return NextResponse.json({
      sensor_id: id,
      alerts: alertsWithTasks,
      count: alertsWithTasks.length,
    });
  } catch (error: any) {
    console.error("Error in GET /api/sensors/[id]/alerts:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/sensors/[id]/alerts/[alertId]
 * 
 * Update/resolve an alert
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { alertId, status, resolved_by, resolution_action, resolution_notes } = body;

    if (!alertId) {
      return NextResponse.json(
        { error: "Alert ID is required" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const updates: any = {
      status,
    };

    if (status === "resolved" || status === "false_alarm") {
      updates.resolved_at = new Date().toISOString();
      updates.resolved_by = resolved_by || "Charlie Checkit";
      updates.resolution_action = resolution_action;
      updates.resolution_notes = resolution_notes;
      updates.severity = "resolved";
    }

    const { data: alert, error: updateError } = await supabase
      .from("sensor_alerts")
      .update(updates)
      .eq("id", alertId)
      .select()
      .single();

    if (updateError || !alert) {
      console.error("Error updating alert:", updateError);
      return NextResponse.json(
        { error: "Failed to update alert" },
        { status: 500 }
      );
    }

    // If resolved, complete any associated tasks
    if (status === "resolved" || status === "false_alarm") {
      await supabase
        .from("sensor_tasks")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("alert_id", alertId)
        .eq("status", "pending");
    }

    return NextResponse.json({
      success: true,
      alert,
    });
  } catch (error: any) {
    console.error("Error in PATCH alert:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

