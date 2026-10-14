/**
 * In-memory rate limiter per Cloudflare Worker isolate.
 * 
 * Note: This rate limiting is per-isolate, not global across all edge locations.
 * For production at scale, migrate to Cloudflare KV or Durable Objects for 
 * distributed rate limiting.
 */

type Bucket = {
  tokens: number;
  lastRefill: number;
};

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_TOKENS = 10; // requests per minute
const REFILL_RATE = MAX_TOKENS / WINDOW_MS; // tokens per ms

/**
 * Token bucket rate limiter. Returns true if request should proceed, false if rate limited.
 */
export function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  let bucket = buckets.get(identifier);

  if (!bucket) {
    bucket = { tokens: MAX_TOKENS - 1, lastRefill: now };
    buckets.set(identifier, bucket);
    return true;
  }

  // Refill tokens based on elapsed time
  const elapsed = now - bucket.lastRefill;
  const refillAmount = elapsed * REFILL_RATE;
  bucket.tokens = Math.min(MAX_TOKENS, bucket.tokens + refillAmount);
  bucket.lastRefill = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return true;
  }

  return false;
}

/**
 * Cleanup old buckets (run periodically to prevent memory leaks)
 */
export function cleanupRateLimitBuckets(): void {
  const now = Date.now();
  const staleThreshold = WINDOW_MS * 10; // 10 minutes

  for (const [key, bucket] of buckets.entries()) {
    if (now - bucket.lastRefill > staleThreshold) {
      buckets.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimitBuckets, 300_000);
}
