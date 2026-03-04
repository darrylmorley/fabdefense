import { deliveryCache } from "./delivery-cache";
import { logError, logInfo } from "../logging/logger";

/**
 * Initialize all caches on application startup
 * Call this in your app initialization or middleware
 */
export async function initializeCaches(): Promise<void> {
  try {
    // Warm up delivery cache in background with a timeout to prevent hanging
    const warmupTimeout = new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error('Cache warmup timed out')), 5000)
    );
    Promise.race([deliveryCache.warmCache(), warmupTimeout]).catch(error => {
      logError('Failed to warm up delivery cache', error);
    });

    logInfo('Cache initialization started');
  } catch (error) {
    logError('Cache initialization failed', error);
  }
}

/**
 * Invalidate all caches (useful after admin updates)
 */
export async function invalidateAllCaches(): Promise<void> {
  try {
    deliveryCache.invalidateCache();
    logInfo('All caches invalidated');
  } catch (error) {
    logError('Cache invalidation failed', error);
  }
}

export { deliveryCache } from "./delivery-cache";
