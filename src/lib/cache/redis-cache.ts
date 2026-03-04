import { logError, logWarn } from "../logging/logger";

interface DeliveryPrices {
  mainlandUK: number;
  northernIreland: number;
}

class RedisCache {
  private readonly redisKey = 'delivery_prices';
  private readonly TTL = 3600; // 1 hour in seconds
  private readonly FALLBACK: DeliveryPrices = {
    mainlandUK: 4.95,
    northernIreland: 9.95,
  };

  async getDeliveryPrices(): Promise<DeliveryPrices> {
    try {
      // Try Redis first
      const cached = await this.getFromRedis();
      if (cached) {
        return cached;
      }
    } catch {
      logWarn('Redis not available, falling back to database');
    }

    // Redis miss or unavailable - fetch from database
    try {
      const freshData = await this.fetchFromDatabase();
      
      // Try to cache in Redis for next time
      try {
        await this.setInRedis(freshData);
      } catch {
        logWarn('Failed to cache in Redis, but continuing');
      }
      
      return freshData;
    } catch (error) {
      logError('Database fetch failed, using fallback', error);
      return this.FALLBACK;
    }
  }

  private async getFromRedis(): Promise<DeliveryPrices | null> {
    // This would depend on your Redis client setup
    // Example with ioredis:
    /*
    const Redis = require('ioredis');
    const redis = new Redis(process.env.REDIS_URL);
    
    const cached = await redis.get(this.redisKey);
    if (cached) {
      return JSON.parse(cached);
    }
    */
    return null;
  }

  private async setInRedis(_data: DeliveryPrices): Promise<void> {
    // Example with ioredis:
    /*
    const Redis = require('ioredis');
    const redis = new Redis(process.env.REDIS_URL);
    
    await redis.setex(this.redisKey, this.TTL, JSON.stringify(data));
    */
  }

  private async fetchFromDatabase(): Promise<DeliveryPrices> {
    const { prisma } = await import("../prisma");
    const { DELIVERY_PRODUCTS } = await import("../delivery");

    const deliveryProductIds = [
      DELIVERY_PRODUCTS.MAINLAND_UK.lightspeedID,
      DELIVERY_PRODUCTS.NORTHERN_IRELAND_OFFSHORE.lightspeedID,
    ];

    const deliveryProducts = await prisma.products.findMany({
      where: {
        lightspeedID: { in: deliveryProductIds },
        archived: false,
      },
      select: {
        lightspeedID: true,
        price: true,
      },
    });

    const deliveryMap = new Map();
    deliveryProducts.forEach((product) => {
      deliveryMap.set(product.lightspeedID, product.price);
    });

    return {
      mainlandUK: deliveryMap.get(DELIVERY_PRODUCTS.MAINLAND_UK.lightspeedID) || this.FALLBACK.mainlandUK,
      northernIreland: deliveryMap.get(DELIVERY_PRODUCTS.NORTHERN_IRELAND_OFFSHORE.lightspeedID) || this.FALLBACK.northernIreland,
    };
  }

  async invalidateCache(): Promise<void> {
    try {
      await this.deleteFromRedis();
    } catch {
      logWarn('Failed to invalidate Redis cache');
    }
  }

  private async deleteFromRedis(): Promise<void> {
    // Example with ioredis:
    /*
    const Redis = require('ioredis');
    const redis = new Redis(process.env.REDIS_URL);
    
    await redis.del(this.redisKey);
    */
  }
}

export const redisCache = new RedisCache();
