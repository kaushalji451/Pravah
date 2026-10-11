/** Tiny in-memory TTL cache that also de-duplicates in-flight requests. */
class TtlCache {
  constructor() {
    this.store = new Map();
  }

  async getOrSet(key, ttlMs, producer) {
    const hit = this.store.get(key);
    if (hit && hit.expires > Date.now()) return hit.promise;
    const promise = Promise.resolve().then(producer);
    this.store.set(key, { promise, expires: Date.now() + ttlMs });
    // Failed lookups are not cached, so the next request retries.
    promise.catch(() => this.store.delete(key));
    if (this.store.size > 2000) this.prune();
    return promise;
  }

  prune() {
    const now = Date.now();
    for (const [k, v] of this.store) if (v.expires <= now) this.store.delete(k);
  }
}

export const cache = new TtlCache();
