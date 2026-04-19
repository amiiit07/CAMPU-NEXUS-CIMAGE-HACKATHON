type RedisLike = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode?: "EX", ttl?: number): Promise<unknown>;
};

let redisClient: RedisLike | null = null;

export async function getRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  const { createClient } = await import("redis");
  const client = createClient({ url: process.env.REDIS_URL });
  client.on("error", () => undefined);
  await client.connect();
  redisClient = client;
  return redisClient;
}

export async function cacheJson<T>(key: string, value: T, ttlSeconds = 60) {
  const client = await getRedisClient();
  await client.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export async function readCachedJson<T>(key: string) {
  const client = await getRedisClient();
  const value = await client.get(key);
  return value ? (JSON.parse(value) as T) : null;
}
