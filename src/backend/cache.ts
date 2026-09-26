import NodeCache from "node-cache";
import { getStore, type Store } from "@netlify/blobs";

/**
 * Two-layer response cache.
 *
 * Layer 1 is in-process memory, which is fast but private to a single
 * serverless instance and lost on every cold start.
 * Layer 2 is Netlify Blobs, shared by every instance of the site. It is used
 * automatically when the function runs on Netlify and silently skipped
 * elsewhere (local `bun run server`, tests), so the memory layer is always
 * a complete fallback.
 */

interface Entry<T> {
    value: T;
    /** Unix milliseconds */
    expiresAt: number;
}

export type CacheBackend = "netlify-blobs" | "memory";

const STORE_NAME = "weather-cache";
const memory = new NodeCache({ checkperiod: 120, useClones: false });

/** undefined = not yet resolved, null = unavailable */
let blobStore: Store | null | undefined;

const resolveStore = (): Store | null => {
    if (blobStore !== undefined) return blobStore;
    try {
        blobStore = getStore({ name: STORE_NAME, consistency: "eventual" });
    } catch {
        // The environment has no Blobs context (local dev, CI). Memory only.
        blobStore = null;
    }
    return blobStore;
};

/** After a runtime failure, stop paying for a store that does not work */
const disableStore = (err: unknown) => {
    console.warn("Netlify Blobs cache disabled:", err instanceof Error ? err.message : err);
    blobStore = null;
};

/** Blob keys are path-like; keep arbitrary user input (spaces, unicode) safe */
const blobKey = (key: string) => encodeURIComponent(key);

export const cacheBackend = (): CacheBackend => (resolveStore() ? "netlify-blobs" : "memory");

/**
 * Return the cached value for `key`, or run `fetcher`, cache its result for
 * `ttlSeconds`, and return it.
 */
export async function getCached<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
    const local = memory.get<T>(key);
    if (local !== undefined) return local;

    const store = resolveStore();
    if (store) {
        try {
            const entry = (await store.get(blobKey(key), { type: "json" })) as Entry<T> | null;
            if (entry && typeof entry.expiresAt === "number" && entry.expiresAt > Date.now()) {
                const remaining = Math.max(1, Math.floor((entry.expiresAt - Date.now()) / 1000));
                memory.set(key, entry.value, remaining);
                return entry.value;
            }
        } catch (err) {
            disableStore(err);
        }
    }

    const value = await fetcher();
    memory.set(key, value, ttlSeconds);

    const activeStore = resolveStore();
    if (activeStore) {
        const entry: Entry<T> = { value, expiresAt: Date.now() + ttlSeconds * 1000 };
        try {
            await activeStore.setJSON(blobKey(key), entry);
        } catch (err) {
            disableStore(err);
        }
    }

    return value;
}

/** Test helper: forget everything in the memory layer */
export const clearMemoryCache = () => memory.flushAll();
