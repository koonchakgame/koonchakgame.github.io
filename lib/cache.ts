import "server-only";
export interface CachedResult<T> {
  data: T;
  fetchedAt: string;
  stale: boolean;
  error?: string;
}
export function cachedLoader<T>(load: () => Promise<T>, ttl: number) {
  let value: CachedResult<T> | undefined;
  let nextCheck = 0;
  let pending: Promise<CachedResult<T>> | undefined;
  return async (): Promise<CachedResult<T>> => {
    if (value && Date.now() < nextCheck) return value;
    if (pending) return pending;
    pending = (async () => {
      try {
        value = {
          data: await load(),
          fetchedAt: new Date().toISOString(),
          stale: false,
        };
        nextCheck = Date.now() + ttl;
        return value;
      } catch (error) {
        if (!value) throw error;
        value = {
          ...value,
          stale: true,
          error: error instanceof Error ? error.message : "Source unavailable",
        };
        nextCheck = Date.now() + Math.min(ttl, 60_000);
        return value;
      } finally {
        pending = undefined;
      }
    })();
    return pending;
  };
}
