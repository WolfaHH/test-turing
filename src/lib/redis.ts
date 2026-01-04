import Redis from "ioredis";
import { logger } from "./logger";

// Redis is optional - if not configured, caching is disabled
const REDIS_ENABLED = !!process.env.REDIS_URL;

// Create a mock redis client that does nothing when Redis is not configured
const createMockRedisClient = () => {
  const noop = async () => Promise.resolve(null);
  const noopDel = async () => Promise.resolve(0);
  const noopKeys = async () => Promise.resolve([]);

  return {
    get: noop,
    set: noop,
    setex: noop,
    del: noopDel,
    keys: noopKeys,
    smembers: noopKeys,
    sadd: noop,
    srem: noop,
    expire: noop,
    ttl: async () => Promise.resolve(-1),
    exists: async () => Promise.resolve(0),
    // Add more methods as needed
  } as unknown as Redis;
};

export const redisClient: Redis = REDIS_ENABLED
  ? new Redis(process.env.REDIS_URL ?? "", {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          return null;
        }
        return Math.min(times * 50, 2000);
      },
      lazyConnect: true,
    })
  : createMockRedisClient();

if (!REDIS_ENABLED) {
  logger.warn("[Redis] REDIS_URL not configured - caching is disabled");
}

export const isRedisEnabled = () => REDIS_ENABLED;
