import fs from 'fs/promises';
import path from 'path';
import { logDebug, logError } from '../logging/logger';

interface DeliveryPrices {
  mainlandUK: number;
  northernIreland: number;
}

interface CacheData {
  data: DeliveryPrices;
  timestamp: number;
}

class FileCache {
  private readonly cacheFile = path.join(process.cwd(), '.cache/delivery-prices.json');
  private readonly TTL = 60 * 60 * 1000; // 1 hour
  private readonly FALLBACK: DeliveryPrices = {
    mainlandUK: 4.95,
    northernIreland: 9.95,
  };

  async getDeliveryPrices(): Promise<DeliveryPrices> {
    try {
      // Try to read from cache file
      const cacheData = await this.readCacheFile();
      
      if (cacheData && this.isValid(cacheData)) {
        return cacheData.data;
      }
    } catch {
      logDebug('Cache file not found or invalid, fetching fresh data');
    }

    // Cache miss or invalid - fetch from database
    try {
      const freshData = await this.fetchFromDatabase();
      await this.writeCacheFile(freshData);
      return freshData;
    } catch (error) {
      logError('Database fetch failed, using fallback', error);
      return this.FALLBACK;
    }
  }

  private async readCacheFile(): Promise<CacheData | null> {
    try {
      const data = await fs.readFile(this.cacheFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  private async writeCacheFile(data: DeliveryPrices): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.cacheFile), { recursive: true });
      const cacheData: CacheData = {
        data,
        timestamp: Date.now(),
      };
      await fs.writeFile(this.cacheFile, JSON.stringify(cacheData, null, 2));
    } catch (error) {
      logError('Failed to write cache file', error);
    }
  }

  private isValid(cacheData: CacheData): boolean {
    return Date.now() - cacheData.timestamp < this.TTL;
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
      await fs.unlink(this.cacheFile);
    } catch {
      // File doesn't exist, that's fine
    }
  }
}

export const fileCache = new FileCache();
