import { Redis } from "@upstash/redis/cloudflare";
import { Ratelimit } from "@upstash/ratelimit";
import { Context } from "hono";

import { getClosestRateLimitDatabase } from "../services/countries";
import { getErrorMessage } from "../services/helper";

export enum REDIS_RATE_LIMIT_DATABASES {
    VIRGINIA = 'Virginia',
    CALIFORNIA = 'California',
    GERMANY = 'Germany',
    JAPAN = 'Japan',
    AUSTRALIA = 'Australia',
    BRAZIL = 'Brazil'
}

const getRedisDatabaseConfig = (env: Env, database: REDIS_RATE_LIMIT_DATABASES) => {
    switch (database) {
        case REDIS_RATE_LIMIT_DATABASES.VIRGINIA:
            return {
                url: env.UPSTASH_REDIS_RATE_LIMIT_VIRGINIA_REST_URL,
                token: env.UPSTASH_REDIS_RATE_LIMIT_VIRGINIA_REST_TOKEN
            }
        case REDIS_RATE_LIMIT_DATABASES.CALIFORNIA:
            return {
                url: env.UPSTASH_REDIS_RATE_LIMIT_CALIFORNIA_REST_URL,
                token: env.UPSTASH_REDIS_RATE_LIMIT_CALIFORNIA_REST_TOKEN
            }
        case REDIS_RATE_LIMIT_DATABASES.GERMANY:
            return {
                url: env.UPSTASH_REDIS_RATE_LIMIT_GERMANY_REST_URL,
                token: env.UPSTASH_REDIS_RATE_LIMIT_GERMANY_REST_TOKEN
            }
        case REDIS_RATE_LIMIT_DATABASES.AUSTRALIA: 
            return {
                url: env.UPSTASH_REDIS_RATE_LIMIT_AUSTRALIA_REST_URL,
                token: env.UPSTASH_REDIS_RATE_LIMIT_AUSTRALIA_REST_TOKEN
            }
        case REDIS_RATE_LIMIT_DATABASES.BRAZIL:
            return {
                url: env.UPSTASH_REDIS_RATE_LIMIT_BRAZIL_REST_URL,
                token: env.UPSTASH_REDIS_RATE_LIMIT_BRAZIL_REST_TOKEN
            }
        case REDIS_RATE_LIMIT_DATABASES.JAPAN:
            return {
                url: env.UPSTASH_REDIS_RATE_LIMIT_JAPAN_REST_URL,
                token: env.UPSTASH_REDIS_RATE_LIMIT_JAPAN_REST_TOKEN
            }
        default:
            return {
                url: env.UPSTASH_REDIS_RATE_LIMIT_VIRGINIA_REST_URL,
                token: env.UPSTASH_REDIS_RATE_LIMIT_VIRGINIA_REST_TOKEN
            }
    }
};

interface RateLimitConfig {
    requests: number;  // Number of requests allowed
    window: number;    // Time window in seconds
}

const cache = new Map();

export async function rateLimit(
    c: Context<{ Bindings: Env }>,
    config: RateLimitConfig = { requests: 10, window: 60 }
) {
    try {
        const ip = c.req.header('cf-connecting-ip') || 'unknown';

        if (!ip || ip === 'unknown') {
            throw new Error('IP address not found');
        }
        
        const cfData = (c.req.raw as Request & { cf: { timezone: string, country: string } }).cf;
        const timezone = cfData?.timezone || 'America/New_York';
        const country = cfData?.country || 'US';
        const redisDatabase = getClosestRateLimitDatabase(timezone, country);
        
        const redisConfig = getRedisDatabaseConfig(c.env, redisDatabase);
        const redis = new Redis({
            url: redisConfig.url,
            token: redisConfig.token,
        });

        const ratelimit = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(config.requests, `${config.window}s`),
            analytics: false,
            prefix: "ratelimit",
            ephemeralCache: cache,
        });

        const { success, limit, remaining, reset } = await ratelimit.limit(ip);
        
        c.header('X-RateLimit-Limit', limit.toString());
        c.header('X-RateLimit-Remaining', remaining.toString());
        c.header('X-RateLimit-Reset', reset.toString());
        c.header('X-RateLimit-Database', redisDatabase);

        return success;
    } catch (error) {
        console.error({ event: 'failed_to_rate_limit', error: getErrorMessage(error) });
        return false;
    }
}


export const rateLimitMiddleware = (config?: RateLimitConfig) => {
    return async (c: Context<{ Bindings: Env }>, next: () => Promise<void>) => {
        const isAllowed = await rateLimit(c, config);
        
        if (!isAllowed) {
            console.error({ event: 'rate_limit_denied', type: 'middleware'});
            return c.json(
                { error: 'Too many requests' },
                {
                    status: 429,
                    headers: {
                        'Retry-After': config?.window?.toString() || '60',
                        'X-RateLimit-Policy': `${config?.requests || 10} requests per ${config?.window || 60}s`,
                    }
                }
            );
        }

        await next();
    };
};
