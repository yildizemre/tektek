type Entry = { value: unknown; expires: number };

const store = new Map<string, Entry>();

export async function remember<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as T;

  const value = await load();
  store.set(key, { value, expires: Date.now() + ttlMs });
  return value;
}

export function bustCatalog() {
  store.clear();
}
