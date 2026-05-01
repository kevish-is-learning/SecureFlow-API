/**
 * Optional Redis client. When REDIS_ENABLED=false, a no-op stub
 * is returned so cache calls never break the request path.
 */
const env = require('./env');
const logger = require('./logger');

let client = null;

if (env.REDIS_ENABLED) {
  const Redis = require('ioredis');
  client = new Redis(env.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 2,
  });

  client.on('error', (err) => {
    logger.warn(`Redis error: ${err.message}`);
  });

  client.on('connect', () => {
    logger.info('Redis connected');
  });

  client.connect().catch((err) => {
    logger.warn(`Redis connection failed, caching disabled: ${err.message}`);
    client = null;
  });
}

const cache = {
  enabled: () => !!client,
  async get(key) {
    if (!client) return null;
    try {
      const raw = await client.get(key);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      logger.warn(`cache.get failed: ${err.message}`);
      return null;
    }
  },
  async set(key, value, ttl = env.CACHE_TTL_SECONDS) {
    if (!client) return;
    try {
      await client.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (err) {
      logger.warn(`cache.set failed: ${err.message}`);
    }
  },
  async del(pattern) {
    if (!client) return;
    try {
      if (pattern.includes('*')) {
        const keys = await client.keys(pattern);
        if (keys.length) await client.del(keys);
      } else {
        await client.del(pattern);
      }
    } catch (err) {
      logger.warn(`cache.del failed: ${err.message}`);
    }
  },
};

module.exports = cache;
