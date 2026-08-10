import { Redis } from "@upstash/redis";

const getRedis = () => {
    if (!globalThis._redis) {
        const url = process.env.UPSTASH_REDIS_REST_URL;
        const token = process.env.UPSTASH_REDIS_REST_TOKEN;

        if (!url || !token) throw new Error("Missing redis credentials");

        globalThis._redis = new Redis({ url, token });
    }

    return globalThis._redis;
}

export default getRedis;