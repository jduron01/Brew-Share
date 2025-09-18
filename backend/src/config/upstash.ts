import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import env from "../util/validate.js";

export const authRateLimit = new Ratelimit({
    redis: new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(20, "60 s"),
});

export const apiRateLimit = new Ratelimit({
    redis: new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(300, "60 s"),
});
