import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { errorResponse } from "@/utils/apiResponse";

function createRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    return new Redis({ url, token });
  }

  return null;
}

const upstashLimiters = new Map();

function getUpstashLimiter(keyPrefix, limit, windowMs, redis) {
  const cacheKey = `${keyPrefix}:${limit}:${windowMs}`;

  if (!upstashLimiters.has(cacheKey)) {
    const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
    const duration = `${windowSeconds} s`;

    upstashLimiters.set(
      cacheKey,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, duration),
        prefix: `ratelimit:${keyPrefix}`,
      })
    );
  }

  return upstashLimiters.get(cacheKey);
}

const buckets = new Map();

function inMemoryLimit(identifier, limit, windowMs) {
  const now = Date.now();
  const existing = buckets.get(identifier);

  if (!existing || now >= existing.resetAt) {
    buckets.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true };
  }

  if (existing.count >= limit) {
    return { success: false };
  }

  existing.count += 1;
  return { success: true };
}

/**
 * Extract the client IP from incoming request headers.
 */
function getClientIp(req) {
  const xff = req.headers?.get?.("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();

  const realIp = req.headers?.get?.("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

/**
 * @param {Request} req
 * @param {{ keyPrefix: string, limit: number, windowMs: number }} opts
 * @returns {Promise<import("next/server").NextResponse | null>}
 */
export async function rateLimit(req, { keyPrefix, limit, windowMs }) {
  const ip = getClientIp(req);
  const identifier = `${keyPrefix}:${ip}`;

  const redis = createRedisClient();
  let success;

  if (redis) {
    const limiter = getUpstashLimiter(keyPrefix, limit, windowMs, redis);
    ({ success } = await limiter.limit(identifier));
  } else {
    ({ success } = inMemoryLimit(identifier, limit, windowMs));
  }

  if (!success) {
    return errorResponse("Too many requests", {
      status: 429,
      errorCode: "RATE_LIMITED",
    });
  }

  return null;
}
