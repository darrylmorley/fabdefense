import { logError } from "../logging/logger";

interface DeliveryPrices {
  mainlandUK: number;
  northernIreland: number;
}

interface CacheEntry {
  data: DeliveryPrices;
  timestamp: number;
}

class DeliveryCache {
  private cache: CacheEntry | null = null;
  private readonly TTL = 60 * 60 * 1000; // 1 hour in milliseconds
  private readonly FALLBACK_PRICES: DeliveryPrices = {
    mainlandUK: 6.95,
    northernIreland: 10,
  };

  async getDeliveryPrices(): Promise<DeliveryPrices> {
    // Check if cache exists and is valid
    if (this.cache && Date.now() - this.cache.timestamp < this.TTL) {
      return this.cache.data;
    }

    // Cache miss or expired - fetch from database
    try {
      const freshPrices = await this.fetchFromDatabase();
      this.cache = {
        data: freshPrices,
        timestamp: Date.now(),
      };
      return freshPrices;
    } catch (error) {
      logError("Failed to fetch delivery prices, using fallback", error);
      // Return fallback prices if database fails
      return this.FALLBACK_PRICES;
    }
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
      mainlandUK:
        deliveryMap.get(DELIVERY_PRODUCTS.MAINLAND_UK.lightspeedID) ||
        this.FALLBACK_PRICES.mainlandUK,
      northernIreland:
        deliveryMap.get(
          DELIVERY_PRODUCTS.NORTHERN_IRELAND_OFFSHORE.lightspeedID,
        ) || this.FALLBACK_PRICES.northernIreland,
    };
  }

  // Manual cache invalidation
  invalidateCache(): void {
    this.cache = null;
  }

  // Pre-warm cache
  async warmCache(): Promise<void> {
    await this.getDeliveryPrices();
  }
}

// Singleton instance
export const deliveryCache = new DeliveryCache();
