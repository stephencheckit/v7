// Webhook receiver for Disruptive Technologies sensor events

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";
import { validateDTSignature, validateDTPayload, extractTemperatureData } from "@/lib/dt/webhook-validator";
import { celsiusToFahrenheit } from "@/lib/sensors/temperature-utils";
import { checkAlertCondition } from "@/lib/sensors/alert-detector";

/**
 * POST /api/webhooks/dt-sensors
 * 
 * Receives temperature events from Disruptive Technologies Data Connector
 * Frequency: Every 5 seconds per sensor
 */
export async function POST(req: NextRequest) {
  console.log("📥 Webhook received from DT");

  try {
    // 1. Parse request body
    const body = await req.json();
    console.log("📦 Payload:", JSON.stringify(body, null, 2));

    // 2. Validate webhook signature (security)
    const bodyString = JSON.stringify(body);
    const isValidSignature = validateDTSignature(req.headers, bodyString);

    if (!isValidSignature) {
      console.error("❌ Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // 3. Validate payload structure
    const payloadValidation = validateDTPayload(body);
    if (!payloadValidation.isValid) {
      console.error("❌ Invalid payload:", payloadValidation.error);
      return NextResponse.json(
        { error: payloadValidation.error },
        { status: 400 }
      );
    }

    // 4. Extract temperature data
    const tempData = extractTemperatureData(body);
    if (!tempData) {
      return NextResponse.json(
        { error: "Failed to extract temperature data" },
        { status: 400 }
      );
    }

    console.log(`🌡️  Device: ${tempData.deviceId}, Temp: ${tempData.celsius}°C`);

    // 5. Find sensor in database
    const supabase = createClient();
    const { data: sensor, error: sensorError } = await supabase
      .from("sensors")
      .select("*")
      .eq("dt_device_id", tempData.deviceId)
      .single();

    if (sensorError || !sensor) {
      console.warn(`⚠️  Sensor not found for device: ${tempData.deviceId}`);
      console.warn("Creating placeholder sensor entry (update via UI later)");

      // Auto-create sensor entry with defaults
      const { data: newSensor, error: createError } = await supabase
        .from("sensors")
        .insert({
          dt_device_id: tempData.deviceId,
          dt_project_id: body.projectId || "unknown",
          name: `Sensor ${tempData.deviceId.slice(-6)}`,
          location: "Unknown",
          equipment_type: "fridge", // Default to fridge
          min_temp_celsius: 0,
          max_temp_celsius: 4,
          alert_delay_minutes: 15,
          alert_recipients: [
            {
              name: "Charlie Checkit",
              email: "charlie@checkit.com",
              notify_methods: ["email", "in_app"],
            },
          ],
        })
        .select()
        .single();

      if (createError || !newSensor) {
        console.error("❌ Failed to create sensor:", createError);
        return NextResponse.json(
          { error: "Sensor not found and failed to create" },
          { status: 404 }
        );
      }

      console.log("✅ Auto-created sensor:", newSensor.id);
      // Use the newly created sensor
      return await processSensorReading(newSensor, tempData, body);
    }

    // 6. Process reading with existing sensor
    return await processSensorReading(sensor, tempData, body);
  } catch (error: any) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Process sensor reading and save to database
 */
async function processSensorReading(
  sensor: any,
  tempData: any,
  rawEvent: any
): Promise<NextResponse> {
  const supabase = createClient();

  // Calculate Fahrenheit
  const fahrenheit = celsiusToFahrenheit(tempData.celsius);

  // Check if temperature is in range
  const isInRange =
    tempData.celsius >= sensor.min_temp_celsius &&
    tempData.celsius <= sensor.max_temp_celsius;

  console.log(
    `📊 Range check: ${tempData.celsius}°C (${sensor.min_temp_celsius}°C - ${sensor.max_temp_celsius}°C) = ${isInRange ? "✅ IN RANGE" : "❌ OUT OF RANGE"}`
  );

  // 7. Save reading to database
  const { error: readingError } = await supabase.from("sensor_readings").insert({
    sensor_id: sensor.id,
    temperature_celsius: tempData.celsius,
    temperature_fahrenheit: fahrenheit,
    is_in_range: isInRange,
    is_critical: false, // Will be updated by alert detector
    recorded_at: tempData.eventTime,
    raw_event: rawEvent,
  });

  if (readingError) {
    console.error("❌ Error saving reading:", readingError);
    return NextResponse.json(
      { error: "Failed to save reading" },
      { status: 500 }
    );
  }

  console.log("✅ Reading saved successfully");

  // 8. Check for alert conditions
  try {
    await checkAlertCondition(sensor, tempData.celsius, fahrenheit);
  } catch (alertError) {
    console.error("❌ Error checking alerts:", alertError);
    // Don't fail the webhook - reading was saved successfully
  }

  // 9. Return success to DT
  return NextResponse.json({
    success: true,
    message: "Temperature reading received and processed",
    data: {
      sensor_id: sensor.id,
      temperature_celsius: tempData.celsius,
      temperature_fahrenheit: fahrenheit,
      is_in_range: isInRange,
    },
  });
}

/**
 * GET /api/webhooks/dt-sensors
 * 
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "DT Sensor webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}

