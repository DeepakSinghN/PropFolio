import { NextResponse } from "next/server";

interface RateLimitRecord {
  timestamps: number[];
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  retryAfterSec: number;
  resetSec: number;
}

/**
 * Extracts client IP address accurately from standard proxy headers
 */
export function getClientIp(req: Request | any): string {
  try {
    const forwarded = req.headers?.get?.("x-forwarded-for");
    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }
    const realIp = req.headers?.get?.("x-real-ip");
    if (realIp) {
      return realIp.trim();
    }
  } catch {}
  return "127.0.0.1";
}

/**
 * Sliding window rate limiter with auto-expiry cleanup
 */
export function checkRateLimit(
  identifier: string,
  limit: number,
  windowSec: number
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSec * 1000;

  const g = globalThis as any;
  if (!g.__propfolioRateLimits) {
    g.__propfolioRateLimits = new Map<string, RateLimitRecord>();
  }
  const store: Map<string, RateLimitRecord> = g.__propfolioRateLimits;

  // Periodic memory hygiene
  if (store.size > 8000) {
    for (const [k, rec] of store.entries()) {
      if (!rec.timestamps.length || now - rec.timestamps[rec.timestamps.length - 1] > windowMs * 2) {
        store.delete(k);
      }
    }
  }

  const record = store.get(identifier) || { timestamps: [] };
  const activeTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (activeTimestamps.length >= limit) {
    const oldestTimestamp = activeTimestamps[0];
    const retryAfterMs = Math.max(1000, windowMs - (now - oldestTimestamp));
    const retryAfterSec = Math.ceil(retryAfterMs / 1000);

    record.timestamps = activeTimestamps;
    store.set(identifier, record);

    return {
      success: false,
      remaining: 0,
      retryAfterSec,
      resetSec: retryAfterSec,
    };
  }

  activeTimestamps.push(now);
  record.timestamps = activeTimestamps;
  store.set(identifier, record);

  const remaining = Math.max(0, limit - activeTimestamps.length);
  return {
    success: true,
    remaining,
    retryAfterSec: 0,
    resetSec: windowSec,
  };
}

/**
 * Helper generating standard HTTP 429 response with Retry-After headers
 */
export function createRateLimitResponse(
  message: string,
  retryAfterSec: number
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: "RATE_LIMIT_EXCEEDED",
      retryAfterSec,
    },
    {
      status: 429,
      headers: {
        "Retry-After": retryAfterSec.toString(),
        "X-RateLimit-Reset": retryAfterSec.toString(),
      },
    }
  );
}

