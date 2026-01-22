import { errorResponse } from "@/utils/apiResponse";

const buckets = new Map();

function getClientIp(req) {
  const xff = req.headers?.get?.("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();

  const realIp = req.headers?.get?.("x-real-ip");
  if (realIp) return realIp.trim();

  // Fallback: can't reliably know client IP in all deployments.
  return "unknown";
}

export function rateLimit(req, { keyPrefix, limit, windowMs }) {
  const ip = getClientIp(req);
  const key = `${keyPrefix}:${ip}`;

  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (existing.count >= limit) {
    const retryAfterSeconds = Math.ceil((existing.resetAt - now) / 1000);

    return errorResponse("Too many requests", {
      status: 429,
      errorCode: "RATE_LIMITED",
      // (headers would be nicer, but errorResponse doesn't expose them)
    });
  }

  existing.count += 1;
  return null;
}
