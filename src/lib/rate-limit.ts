type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5000;

function prune(now: number) {
  if (buckets.size < MAX_BUCKETS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  while (buckets.size >= MAX_BUCKETS) {
    const oldest = buckets.keys().next().value;
    if (oldest === undefined) break;
    buckets.delete(oldest);
  }
}

export function requestIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const ip = forwarded || "unknown";
  return ip.slice(0, 80);
}

export function loginBlocked(key: string, limit = 8, windowMs = 15 * 60 * 1000): boolean {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= Date.now()) return false;
  return bucket.count >= limit && windowMs > 0;
}

export function recordLoginFailure(key: string, windowMs = 15 * 60 * 1000): void {
  const now = Date.now();
  prune(now);
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  bucket.count += 1;
}
