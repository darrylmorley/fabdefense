type Rule = { windowMs: number; max: number };

// Per-key sliding window store: key → array of request timestamps
const store = new Map<string, number[]>();

// Prune fully-expired keys every minute to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of store.entries()) {
    if (timestamps.length === 0 || now - timestamps[timestamps.length - 1] > 10 * 60_000) {
      store.delete(key);
    }
  }
}, 60_000);

export function checkRateLimit(
  key: string,
  rule: Rule,
): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const windowStart = now - rule.windowMs;

  const timestamps = (store.get(key) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= rule.max) {
    store.set(key, timestamps);
    const retryAfter = Math.ceil((timestamps[0] + rule.windowMs - now) / 1000);
    return { allowed: false, retryAfter };
  }

  timestamps.push(now);
  store.set(key, timestamps);
  return { allowed: true, retryAfter: 0 };
}

// Rate limit rules per route prefix
export const RATE_LIMIT_RULES: Record<string, Rule> = {
  "/api/contact":          { windowMs: 10 * 60_000, max: 5  }, // 5 / 10 min
  "/api/addresses/search": { windowMs:      60_000, max: 20 }, // 20 / min
  "/api/products/search":  { windowMs:      60_000, max: 30 }, // 30 / min
  "/api/cart/items":       { windowMs:      60_000, max: 60 }, // 60 / min
};

/**
 * Returns the client IP from the request.
 * Uses the rightmost X-Forwarded-For entry (appended by our own infrastructure)
 * to prevent client spoofing of the header.
 */
export function getRequestIP(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",");
    return ips[ips.length - 1].trim();
  }
  return request.headers.get("x-real-ip")?.trim() ?? "unknown";
}
