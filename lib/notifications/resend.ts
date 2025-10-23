// Email notification service using Resend

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface Sensor {
  id: string;
  name: string;
  location: string;
  equipment_type: string;
  min_temp_celsius: number;
  max_temp_celsius: number;
}

export interface SensorAlert {
  id: string;
  started_at: string;
  severity: string;
  status: string;
}

/**
 * Send temperature alert email
 */
export async function sendTemperatureAlert(
  recipient: string,
  sensor: Sensor,
  alert: SensorAlert,
  currentTemp: number,
  unit: "C" | "F"
): Promise<{ success: boolean; error?: string }> {
  try {
    const duration = calculateDuration(alert.started_at);
    const minTemp =
      unit === "C"
        ? sensor.min_temp_celsius
        : celsiusToFahrenheit(sensor.min_temp_celsius);
    const maxTemp =
      unit === "C"
        ? sensor.max_temp_celsius
        : celsiusToFahrenheit(sensor.max_temp_celsius);

    const subject = `🚨 Temperature Alert: ${sensor.name}`;

    const html = getAlertEmailTemplate({
      sensorName: sensor.name,
      location: sensor.location,
      equipmentType: sensor.equipment_type,
      currentTemp,
      unit,
      minTemp,
      maxTemp,
      duration,
      severity: alert.severity,
      sensorId: sensor.id,
    });

    const { data, error } = await resend.emails.send({
      from: "CheckIt Alerts <alerts@checkit.com>",
      to: recipient,
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("❌ Resend error:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Email sent successfully:", data?.id);
    return { success: true };
  } catch (error: any) {
    console.error("❌ Email send error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send alert resolution confirmation email
 */
export async function sendResolutionEmail(
  recipient: string,
  sensor: Sensor,
  alert: SensorAlert,
  resolvedBy: string,
  resolutionAction: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const subject = `✅ Resolved: ${sensor.name}`;

    const html = getResolutionEmailTemplate({
      sensorName: sensor.name,
      location: sensor.location,
      resolvedBy,
      resolutionAction,
      notes,
      duration: calculateDuration(alert.started_at),
      sensorId: sensor.id,
    });

    const { data, error } = await resend.emails.send({
      from: "CheckIt Alerts <alerts@checkit.com>",
      to: recipient,
      subject: subject,
      html: html,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Alert email template
 */
function getAlertEmailTemplate(data: {
  sensorName: string;
  location: string;
  equipmentType: string;
  currentTemp: number;
  unit: string;
  minTemp: number;
  maxTemp: number;
  duration: string;
  severity: string;
  sensorId: string;
}): string {
  const severityColor = data.severity === "critical" ? "#ff6b6b" : "#f5edc8";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
          }
          .alert-box { 
            background: ${severityColor}; 
            color: ${data.severity === "critical" ? "white" : "#0a0a0a"}; 
            padding: 40px 30px; 
            text-align: center;
          }
          .temp-display { 
            font-size: 72px; 
            font-weight: bold; 
            margin: 30px 0;
            line-height: 1;
          }
          .details { 
            background: #f5f5f5; 
            padding: 30px; 
            margin: 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e5e5e5;
          }
          .detail-label {
            font-weight: bold;
            color: #666;
          }
          .button {
            background: #c4dfc4;
            color: #0a0a0a;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
            margin-top: 30px;
            font-weight: 600;
          }
          .footer {
            text-align: center;
            padding: 30px;
            color: #666;
            font-size: 13px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="alert-box">
            <h1 style="margin: 0 0 10px 0; font-size: 28px;">🚨 TEMPERATURE ALERT</h1>
            <p style="font-size: 20px; margin: 0 0 10px 0;"><strong>${data.sensorName}</strong></p>
            <p style="font-size: 16px; margin: 0; opacity: 0.9;">${data.location}</p>
            
            <div class="temp-display">
              ${data.currentTemp.toFixed(1)}°${data.unit}
            </div>
            
            <p style="font-size: 18px; margin: 0;">
              Acceptable Range: ${data.minTemp.toFixed(1)}° - ${data.maxTemp.toFixed(1)}°${data.unit}
            </p>
            <p style="font-size: 16px; margin: 15px 0 0 0;">
              Duration: ${data.duration}
            </p>
          </div>
          
          <div class="details">
            <h2 style="margin-top: 0; color: #0a0a0a;">Alert Details</h2>
            
            <div class="detail-row">
              <span class="detail-label">Equipment Type</span>
              <span>${data.equipmentType.charAt(0).toUpperCase() + data.equipmentType.slice(1)}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Severity</span>
              <span style="text-transform: uppercase; font-weight: bold; color: ${severityColor};">${data.severity}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Status</span>
              <span>ACTIVE - Requires Attention</span>
            </div>
            
            <div style="text-align: center;">
              <a href="https://yourdomain.com/sensors/${data.sensorId}" class="button">
                View Sensor Dashboard →
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>You're receiving this alert because you're listed as a notification recipient for ${data.sensorName}.</p>
            <p style="margin: 10px 0 0 0;">
              <a href="https://yourdomain.com/settings" style="color: #c4dfc4;">Update notification preferences</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Resolution email template
 */
function getResolutionEmailTemplate(data: {
  sensorName: string;
  location: string;
  resolvedBy: string;
  resolutionAction: string;
  notes?: string;
  duration: string;
  sensorId: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
          }
          .header { 
            background: #c4dfc4; 
            color: #0a0a0a; 
            padding: 40px 30px; 
            text-align: center;
          }
          .content {
            padding: 30px;
          }
          .detail-box {
            background: #f5f5f5;
            padding: 20px;
            margin: 20px 0;
            border-radius: 6px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">✅ Alert Resolved</h1>
            <p style="font-size: 20px; margin: 10px 0 0 0;"><strong>${data.sensorName}</strong></p>
          </div>
          
          <div class="content">
            <p>The temperature alert for <strong>${data.sensorName}</strong> (${data.location}) has been resolved.</p>
            
            <div class="detail-box">
              <p><strong>Resolved by:</strong> ${data.resolvedBy}</p>
              <p><strong>Action Taken:</strong> ${formatResolutionAction(data.resolutionAction)}</p>
              <p><strong>Duration:</strong> ${data.duration}</p>
              ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ""}
            </div>
            
            <p>The sensor is now operating within normal parameters.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Utility functions
 */
function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

function calculateDuration(startedAt: string): string {
  const start = new Date(startedAt);
  const now = new Date();
  const minutes = Math.floor((now.getTime() - start.getTime()) / 1000 / 60);

  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? "s" : ""}${remainingMinutes > 0 ? ` ${remainingMinutes}m` : ""}`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""}`;
}

function formatResolutionAction(action: string): string {
  return action
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

