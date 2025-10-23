// Alert detection logic for temperature violations

import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/database.types";

export type Sensor = Database["public"]["Tables"]["sensors"]["Row"];
export type SensorAlert = Database["public"]["Tables"]["sensor_alerts"]["Row"];

/**
 * Check if alert condition exists and should trigger notifications
 */
export async function checkAlertCondition(
  sensor: Sensor,
  celsius: number,
  fahrenheit: number
): Promise<void> {
  const supabase = createClient();

  // Check if there's already an active alert for this sensor
  const { data: existingAlert, error: alertError } = await supabase
    .from("sensor_alerts")
    .select("*")
    .eq("sensor_id", sensor.id)
    .eq("status", "active")
    .single();

  if (alertError && alertError.code !== "PGRST116") {
    // PGRST116 = no rows returned (expected)
    console.error("Error checking alerts:", alertError);
    return;
  }

  const isOutOfRange =
    celsius < sensor.min_temp_celsius || celsius > sensor.max_temp_celsius;

  if (isOutOfRange) {
    if (existingAlert) {
      // Alert already exists - check if we need to escalate
      await updateExistingAlert(existingAlert, celsius, fahrenheit, sensor);
    } else {
      // Create new alert
      await createNewAlert(sensor, celsius, fahrenheit);
    }
  } else {
    // Temperature back in range
    if (existingAlert) {
      await autoResolveAlert(existingAlert.id);
    }
  }
}

/**
 * Create a new alert
 */
async function createNewAlert(
  sensor: Sensor,
  celsius: number,
  fahrenheit: number
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("sensor_alerts").insert({
    sensor_id: sensor.id,
    alert_type: "temperature_violation",
    severity: "warning",
    temp_celsius: celsius,
    temp_fahrenheit: fahrenheit,
    threshold_min: sensor.min_temp_celsius,
    threshold_max: sensor.max_temp_celsius,
    status: "active",
    started_at: new Date().toISOString(),
    detected_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Error creating alert:", error);
  } else {
    console.log(`🚨 New alert created for sensor: ${sensor.name}`);
  }
}

/**
 * Update existing alert and check if notification threshold reached
 */
async function updateExistingAlert(
  existingAlert: SensorAlert,
  celsius: number,
  fahrenheit: number,
  sensor: Sensor
): Promise<void> {
  const supabase = createClient();

  // Calculate how long the alert has been active
  const startedAt = new Date(existingAlert.started_at);
  const now = new Date();
  const minutesActive = Math.floor(
    (now.getTime() - startedAt.getTime()) / 1000 / 60
  );

  const alertThreshold = sensor.alert_delay_minutes ?? 15; // Default to 15 minutes
  
  console.log(
    `⏰ Alert active for ${minutesActive} minutes (threshold: ${alertThreshold})`
  );

  // Check if we should trigger notifications
  if (
    minutesActive >= alertThreshold &&
    (!existingAlert.notifications_sent ||
      existingAlert.notifications_sent.length === 0)
  ) {
    console.log(`📧 Triggering notifications for sensor: ${sensor.name}`);

    // Update alert to critical severity
    await supabase
      .from("sensor_alerts")
      .update({
        severity: "critical",
        temp_celsius: celsius,
        temp_fahrenheit: fahrenheit,
      })
      .eq("id", existingAlert.id);

    // Trigger notifications (will be handled by notification service)
    // For now, just log - actual email/SMS sending will be in notification service
    await triggerAlertNotifications(sensor, existingAlert, celsius, fahrenheit);

    // Create task for resolution
    await createAlertTask(sensor, existingAlert);
  }
}

/**
 * Auto-resolve alert when temperature returns to normal
 */
async function autoResolveAlert(alertId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("sensor_alerts")
    .update({
      status: "resolved",
      resolved_at: new Date().toISOString(),
      resolution_action: "auto_resolved",
      resolution_notes: "Temperature returned to normal range automatically",
      severity: "resolved",
    })
    .eq("id", alertId);

  if (error) {
    console.error("Error auto-resolving alert:", error);
  } else {
    console.log(`✅ Alert auto-resolved: ${alertId}`);
  }
}

/**
 * Trigger alert notifications
 * This will be called by the notification service
 */
async function triggerAlertNotifications(
  sensor: Sensor,
  alert: SensorAlert,
  celsius: number,
  fahrenheit: number
): Promise<void> {
  const recipients = Array.isArray(sensor.alert_recipients) ? sensor.alert_recipients : [];
  
  console.log(
    `📬 Sending notifications to ${recipients.length} recipients`
  );

  // Import notification service
  try {
    const { sendTemperatureAlert } = await import("@/lib/notifications/resend");

    const supabase = createClient();
    const notificationLog: any[] = [];

    // Send email to each recipient
    for (const recipient of recipients) {
      if (recipient.notify_methods?.includes("email") && recipient.email) {
        try {
          const result = await sendTemperatureAlert(
            recipient.email,
            sensor,
            alert,
            fahrenheit, // Always send in Fahrenheit for US users
            "F"
          );

          notificationLog.push({
            type: "email",
            recipient: recipient.email,
            sent_at: new Date().toISOString(),
            status: result.success ? "delivered" : "failed",
            error: result.error,
          });

          console.log(`✅ Email sent to ${recipient.email}`);
        } catch (error: any) {
          console.error(`❌ Failed to send email to ${recipient.email}:`, error);
          notificationLog.push({
            type: "email",
            recipient: recipient.email,
            sent_at: new Date().toISOString(),
            status: "failed",
            error: error.message,
          });
        }
      }
    }

    // Update alert with notification log
    await supabase
      .from("sensor_alerts")
      .update({ notifications_sent: notificationLog })
      .eq("id", alert.id);
  } catch (error) {
    console.error("Error sending notifications:", error);
  }
}

/**
 * Create a task for alert resolution
 */
async function createAlertTask(
  sensor: Sensor,
  alert: SensorAlert
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("sensor_tasks").insert({
    alert_id: alert.id,
    sensor_id: sensor.id,
    title: `Resolve temperature alert: ${sensor.name}`,
    description: `Temperature out of range. Check ${sensor.equipment_type} and take corrective action.`,
    task_type: "alert_response",
    assigned_to: "Charlie Checkit", // Default user for now
    priority: "high",
    status: "pending",
  });

  if (error) {
    console.error("Error creating task:", error);
  } else {
    console.log(`✅ Task created for alert: ${alert.id}`);
  }
}

/**
 * Get active alerts count
 */
export async function getActiveAlertsCount(): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("sensor_alerts")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  if (error) {
    console.error("Error getting alerts count:", error);
    return 0;
  }

  return count || 0;
}

