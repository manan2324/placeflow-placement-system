import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { errorResponse } from "@/utils/apiResponse";

function createRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    return new Redis({ url, token });
  }

  // Local development fallback
  console.warn(
    "[rateLimit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set. " +
      "Using ephemeral in-memory store (fine for local dev, NOT for production)."
  );
  return undefined;
}

const limiters = new Map();

/**
 * Create (or retrieve) an Upstash rate-limiter for the given prefix.
 *
 * @param {string}  keyPrefix  – logical group, e.g. "auth:login"
 * @param {number}  limit      – max requests per window
 * @param {number}  windowMs   – window size in milliseconds
 */
function getLimiter(keyPrefix, limit, windowMs) {
  const cacheKey = `${keyPrefix}:${limit}:${windowMs}`;

  if (!limiters.has(cacheKey)) {
    const redis = createRedisClient();

    const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
    const duration = `${windowSeconds} s`;

    const options = {
      limiter: Ratelimit.slidingWindow(limit, duration),
      prefix: `ratelimit:${keyPrefix}`,
    };

    if (redis) {
      options.redis = redis;
    } else {
      options.ephemeralCache = new Map();
    }

    limiters.set(cacheKey, new Ratelimit(options));
  }

  return limiters.get(cacheKey);
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

  const limiter = getLimiter(keyPrefix, limit, windowMs);
  const { success } = await limiter.limit(identifier);

  if (!success) {
    return errorResponse("Too many requests", {
      status: 429,
      errorCode: "RATE_LIMITED",
    });
  }

  return null;
}
