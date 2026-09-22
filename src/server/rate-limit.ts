const buckets = new Map<string, number[]>();

/** Cheap in-memory limiter for demo deployments (single instance). */
export function checkRateLimit(
  key: string,
  { max = 30, windowMs = 60_000 }: { max?: number; windowMs?: number } = {}
): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  const hits = (buckets.get(key) ?? []).filter((t) => t > windowStart);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}
