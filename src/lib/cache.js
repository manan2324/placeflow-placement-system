import getRedis from "./redis";

/**
 * Cache key templates for all cached routes.
 * Centralised here so invalidation is consistent.
 */
export const CACHE_KEYS = {
    ADMIN_DASHBOARD: "cache:admin:dashboard",
    STUDENT_DASHBOARD: (userId) => `cache:student:dashboard:${userId}`,
    ADMIN_STUDENTS: "cache:admin:students",
    ADMIN_APPLICATIONS: (companyId, status) =>
        `cache:admin:apps:${companyId || "all"}:${status || "all"}`,
    STUDENT_APPLICATIONS: (userId) => `cache:student:apps:${userId}`,
};

/**
 * Cache-aside helper.
 *
 * 1. Check Redis for `key`  → return cached value on hit.
 * 2. On miss, call `fetcher()`, store the result with `ttlSeconds`, and return it.
 *
 * If Redis is unreachable the call falls through to the fetcher silently
 * so caching never breaks the application.
 *
 * @param {string}   key         Redis key
 * @param {number}   ttlSeconds  Time-to-live in seconds
 * @param {Function} fetcher     Async function that returns the fresh data
 * @returns {Promise<*>}
 */
export async function withCache(key, ttlSeconds, fetcher) {
    const redis = getRedis();

    try {
        const cached = await redis.get(key);
        if (cached !== null && cached !== undefined) {
            return cached; // Upstash auto-deserialises JSON
        }
    } catch {
        // Redis read failed — fall through to fetcher
    }

    const freshData = await fetcher();

    try {
        await redis.set(key, JSON.stringify(freshData), { ex: ttlSeconds });
    } catch {
        // Redis write failed — non-critical, data is still returned
    }

    return freshData;
}

/**
 * Delete one or more cache keys.
 *
 * Accepts exact keys **and** wildcard patterns (e.g. `"cache:student:dashboard:*"`).
 * Exact keys are deleted with `DEL`; patterns are resolved via `SCAN` + `DEL`.
 *
 * Errors are silently swallowed so invalidation never breaks a mutation.
 *
 * @param {...string} keys  Cache keys or glob patterns to invalidate
 */
export async function invalidateCache(...keys) {
    const redis = getRedis();

    try {
        const exactKeys = [];
        const patterns = [];

        for (const k of keys) {
            if (k.includes("*")) {
                patterns.push(k);
            } else {
                exactKeys.push(k);
            }
        }

        // Delete exact keys in a single call
        if (exactKeys.length > 0) {
            await redis.del(...exactKeys);
        }

        // Resolve and delete pattern-matched keys via SCAN
        for (const pattern of patterns) {
            let cursor = 0;
            do {
                const result = await redis.scan(cursor, { match: pattern, count: 100 });
                cursor = result[0];
                const matchedKeys = result[1];
                if (matchedKeys.length > 0) {
                    await redis.del(...matchedKeys);
                }
            } while (cursor !== 0);
        }
    } catch {
        // Invalidation failure is non-critical
    }
}
