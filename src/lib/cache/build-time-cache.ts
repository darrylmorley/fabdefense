import { logError } from "../logging/logger";

// This runs at build time - perfect for static data
export async function getBuildTimeDeliveryPrices(): Promise<{
  mainlandUK: number;
  northernIreland: number;
}> {
  try {
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
        deliveryMap.get(DELIVERY_PRODUCTS.MAINLAND_UK.lightspeedID) || 6.95,
      northernIreland:
        deliveryMap.get(
          DELIVERY_PRODUCTS.NORTHERN_IRELAND_OFFSHORE.lightspeedID,
        ) || 10,
    };
  } catch (error) {
    logError("Build-time delivery price fetch failed, using defaults", error);
    return {
      mainlandUK: 6.95,
      northernIreland: 10,
    };
  }
}
