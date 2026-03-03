import Redis from "ioredis";

// ---------------------------------------------------------------------------
// Singleton Redis client
// ---------------------------------------------------------------------------

let redis: Redis | null = null;

/**
 * Return the shared Redis client, or `null` when `REDIS_URL` is not set.
 *
 * The client uses lazy-connect so it won't open a TCP socket until the first
 * command is sent. Connection errors are silently swallowed so the app
 * continues to work without Redis (graceful degradation).
 */
function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null;

  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      // Reconnect with exponential back-off capped at 3 seconds
      retryStrategy(times) {
        if (times > 5) return null; // stop reconnecting after 5 attempts
        return Math.min(times * 200, 3000);
      },
    });

    // Suppress connection errors so they don't crash the process
    redis.on("error", () => {});
  }

  return redis;
}

// ---------------------------------------------------------------------------
// Public helpers — all degrade gracefully when Redis is unavailable
// ---------------------------------------------------------------------------

/**
 * Retrieve a cached value by key. Returns `null` on cache miss or if Redis
 * is not configured / unreachable.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const client = getRedis();
    if (!client) return null;

    const raw = await client.get(key);
    if (raw === null) return null;

    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Store a value in the cache. Optionally set a TTL in seconds.
 * Silently fails when Redis is not available.
 */
export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds?: number
): Promise<void> {
  try {
    const client = getRedis();
    if (!client) return;

    const serialized = JSON.stringify(value);

    if (ttlSeconds && ttlSeconds > 0) {
      await client.set(key, serialized, "EX", ttlSeconds);
    } else {
      await client.set(key, serialized);
    }
  } catch {
    // Silently fail — cache is optional
  }
}

/**
 * Delete all keys matching a glob-style pattern (e.g. `"articles:*"`).
 * Uses SCAN to avoid blocking the server on large key sets.
 * Silently fails when Redis is not available.
 */
export async function cacheInvalidate(pattern: string): Promise<void> {
  try {
    const client = getRedis();
    if (!client) return;

    let cursor = "0";
    do {
      const [nextCursor, keys] = await client.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100
      );
      cursor = nextCursor;

      if (keys.length > 0) {
        await client.del(...keys);
      }
    } while (cursor !== "0");
  } catch {
    // Silently fail
  }
}

/**
 * Delete a single key from the cache.
 * Silently fails when Redis is not available.
 */
export async function cacheDel(key: string): Promise<void> {
  try {
    const client = getRedis();
    if (!client) return;

    await client.del(key);
  } catch {
    // Silently fail
  }
}
