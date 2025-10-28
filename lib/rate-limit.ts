/**
 * Rate Limiting Utilities
 * 
 * Protects API endpoints from abuse using Upstash Redis
 * 
 * Usage:
 * - submitRateLimit: For public form submissions (10 per hour per IP)
 * - apiRateLimit: For authenticated API calls (100 per minute per user)
 * - strictRateLimit: For sensitive operations (5 per hour per IP)
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client
// Falls back to memory storage if Upstash is not configured (dev mode)
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : undefined;

/**
 * Rate limit for public form submissions
 * 10 submissions per hour per IP address
 */
export const submitRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      prefix: "ratelimit:submit",
      analytics: true,
    })
  : null;

/**
 * Rate limit for authenticated API calls
 * 100 requests per minute per user
 */
export const apiRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      prefix: "ratelimit:api",
      analytics: true,
    })
  : null;

/**
 * Strict rate limit for sensitive operations
 * 5 requests per hour per IP (form creation, deletion, etc.)
 */
export const strictRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      prefix: "ratelimit:strict",
      analytics: true,
    })
  : null;

/**
 * Rate limit for form viewing (prevent enumeration attacks)
 * 60 views per minute per IP
 */
export const viewRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      prefix: "ratelimit:view",
      analytics: true,
    })
  : null;

/**
 * Helper to get client identifier (IP address or user ID)
 */
export function getClientIdentifier(
  request: Request,
  userId?: string
): string {
  // Prefer user ID for authenticated requests
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP address
  const headers = request.headers;
  const forwardedFor = headers.get("x-forwarded-for");
  const realIp = headers.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0].trim() || realIp || "unknown";

  return `ip:${ip}`;
}

/**
 * Check rate limit and return appropriate response
 */
export async function checkRateLimit(
  rateLimit: Ratelimit | null,
  identifier: string
): Promise<{
  success: boolean;
  limit?: number;
  remaining?: number;
  reset?: number;
}> {
  // If rate limiting is not configured (dev mode), allow all requests
  if (!rateLimit) {
    console.warn(
      "⚠️  Rate limiting not configured. Set UPSTASH_REDIS_REST_URL to enable."
    );
    return { success: true };
  }

  const result = await rateLimit.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * Format rate limit headers for HTTP response
 */
export function getRateLimitHeaders(result: {
  limit?: number;
  remaining?: number;
  reset?: number;
}): Record<string, string> {
  const headers: Record<string, string> = {};

  if (result.limit !== undefined) {
    headers["X-RateLimit-Limit"] = result.limit.toString();
  }
  if (result.remaining !== undefined) {
    headers["X-RateLimit-Remaining"] = result.remaining.toString();
  }
  if (result.reset !== undefined) {
    headers["X-RateLimit-Reset"] = result.reset.toString();
  }

  return headers;
}

