export type PennantOptions = {
  baseUrl: string;
  apiKey: string;
  /** Milliseconds to reuse an evaluate response. Defaults to 0, so every check hits the API. */
  cacheTtlMs?: number;
  /** Used only when the request fails. A missing flag still returns false from the API. */
  defaultValue?: boolean;
  fetch?: typeof fetch;
};

type CacheEntry = {
  enabled: boolean;
  expiresAt: number;
};

const MAX_CACHE_ENTRIES = 1000;

/**
 * Server-side client. Do not ship the API key to a browser.
 * Evaluation stays on the Pennant server, so a dashboard toggle applies without redeploying.
 */
export class Pennant {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly cacheTtlMs: number;
  private readonly defaultValue: boolean | undefined;
  private readonly fetchImpl: typeof fetch;
  private readonly cache = new Map<string, CacheEntry>();

  constructor(options: PennantOptions) {
    if (!options.baseUrl?.trim()) throw new Error("Pennant baseUrl is required");
    if (!options.apiKey?.trim()) throw new Error("Pennant apiKey is required");
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.apiKey = options.apiKey;
    this.cacheTtlMs = options.cacheTtlMs ?? 0;
    this.defaultValue = options.defaultValue;
    this.fetchImpl = options.fetch ?? globalThis.fetch;
  }

  async isEnabled(flag: string, userId?: string): Promise<boolean> {
    const id = userId?.trim() || undefined;
    if (!flag.trim()) throw new Error("Pennant flag key is required");
    const cacheKey = `${flag}\n${id ?? ""}`;
    if (this.cacheTtlMs > 0) {
      const hit = this.cache.get(cacheKey);
      if (hit && hit.expiresAt > Date.now()) {
        this.cache.delete(cacheKey);
        this.cache.set(cacheKey, hit);
        return hit.enabled;
      }
      if (hit) this.cache.delete(cacheKey);
    }

    const url = new URL(`${this.baseUrl}/api/v1/evaluate`);
    url.searchParams.set("flag", flag);
    if (id) url.searchParams.set("userId", id);

    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        headers: { authorization: `Bearer ${this.apiKey}` },
      });
    } catch (error) {
      if (this.defaultValue !== undefined) return this.defaultValue;
      throw error;
    }

    if (!response.ok) {
      if (this.defaultValue !== undefined) return this.defaultValue;
      throw new Error(`Pennant evaluate failed (${response.status})`);
    }

    const body = (await response.json()) as { enabled?: unknown };
    if (typeof body.enabled !== "boolean") {
      if (this.defaultValue !== undefined) return this.defaultValue;
      throw new Error("Pennant evaluate returned an unexpected payload");
    }

    if (this.cacheTtlMs > 0) {
      if (this.cache.size >= MAX_CACHE_ENTRIES) {
        const oldest = this.cache.keys().next().value;
        if (oldest !== undefined) this.cache.delete(oldest);
      }
      this.cache.set(cacheKey, {
        enabled: body.enabled,
        expiresAt: Date.now() + this.cacheTtlMs,
      });
    }
    return body.enabled;
  }
}
