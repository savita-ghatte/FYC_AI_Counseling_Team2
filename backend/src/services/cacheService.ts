import Redis from 'ioredis';

// Ensure the Redis server is running locally on port 6379 or provide REDIS_URL in .env
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

class CacheService {
  private client: Redis | null = null;
  private isConnected = false;

  constructor() {
    try {
      this.client = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1, // Fail fast if Redis is not running in dev
      });

      this.client.on('error', (err) => {
        console.warn('Redis connection error (Caching will be bypassed):', err.message);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Connected to Redis successfully.');
        this.isConnected = true;
      });
      
      // Attempt connection but don't crash app if it fails
      this.client.connect().catch(() => {
        this.isConnected = false;
      });
    } catch (e) {
      console.warn('Failed to initialize Redis client. Caching disabled.');
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected || !this.client) return null;
    try {
      const data = await this.client.get(key);
      if (data) {
        return JSON.parse(data) as T;
      }
      return null;
    } catch (error) {
      console.warn(`Cache GET error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    if (!this.isConnected || !this.client) return;
    try {
      const serialized = JSON.stringify(value);
      await this.client.setex(key, ttlSeconds, serialized);
    } catch (error) {
      console.warn(`Cache SET error for key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected || !this.client) return;
    try {
      await this.client.del(key);
    } catch (error) {
      console.warn(`Cache DEL error for key ${key}:`, error);
    }
  }

  async invalidatePrefix(prefix: string): Promise<void> {
    if (!this.isConnected || !this.client) return;
    try {
      const keys = await this.client.keys(`${prefix}*`);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      console.warn(`Cache INVALIDATE PREFIX error for ${prefix}:`, error);
    }
  }
}

export const cacheService = new CacheService();
