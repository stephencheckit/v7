// Disruptive Technologies Webhook Signature Validation

import crypto from "crypto";

/**
 * Validate DT webhook signature
 * 
 * DT sends a signature in the request headers to verify authenticity.
 * We compute HMAC SHA-256 using the webhook secret and compare.
 */
export function validateDTSignature(
  headers: Headers,
  body: string | object
): boolean {
  try {
    const secret = process.env.DT_WEBHOOK_SECRET;
    
    if (!secret) {
      console.warn("⚠️ DT_WEBHOOK_SECRET not configured - skipping signature validation");
      return true; // Allow in development if secret not set
    }

    // Get signature from headers (DT typically uses X-DT-Signature or similar)
    const receivedSignature = 
      headers.get("x-dt-signature") || 
      headers.get("x-disruptive-signature") ||
      headers.get("x-webhook-signature");

    if (!receivedSignature) {
      console.error("❌ No signature found in webhook headers");
      return false;
    }

    // Convert body to string if needed
    const bodyString = typeof body === "string" ? body : JSON.stringify(body);

    // Compute HMAC SHA-256
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(bodyString);
    const computedSignature = hmac.digest("hex");

    // Timing-safe comparison
    const isValid = crypto.timingSafeEqual(
      Buffer.from(receivedSignature),
      Buffer.from(computedSignature)
    );

    if (!isValid) {
      console.error("❌ Invalid webhook signature");
    }

    return isValid;
  } catch (error) {
    console.error("❌ Signature validation error:", error);
    return false;
  }
}

/**
 * Validate basic webhook payload structure
 */
export function validateDTPayload(payload: any): {
  isValid: boolean;
  error?: string;
} {
  // Check required fields based on DT event structure
  if (!payload || typeof payload !== "object") {
    return { isValid: false, error: "Invalid payload structure" };
  }

  // DT events typically have these fields
  if (!payload.targetName) {
    return { isValid: false, error: "Missing targetName (device ID)" };
  }

  if (!payload.data) {
    return { isValid: false, error: "Missing data object" };
  }

  if (!payload.eventTime) {
    return { isValid: false, error: "Missing eventTime" };
  }

  // Check temperature data exists
  if (payload.data.temperature === undefined) {
    return { isValid: false, error: "Missing temperature data" };
  }

  if (payload.data.temperature.celsius === undefined) {
    return { isValid: false, error: "Missing celsius temperature value" };
  }

  return { isValid: true };
}

/**
 * Extract temperature data from DT event
 */
export interface DTTemperatureEvent {
  deviceId: string;
  celsius: number;
  eventTime: string;
  rawEvent: any;
}

export function extractTemperatureData(payload: any): DTTemperatureEvent | null {
  try {
    return {
      deviceId: payload.targetName,
      celsius: payload.data.temperature.celsius,
      eventTime: payload.eventTime,
      rawEvent: payload,
    };
  } catch (error) {
    console.error("❌ Error extracting temperature data:", error);
    return null;
  }
}

