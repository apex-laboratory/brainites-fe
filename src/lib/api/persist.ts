import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import {
  removeOldestQuery,
  type PersistQueryClientOptions,
} from "@tanstack/react-query-persist-client";

/**
 * Bump when the *shape* of anything we cache changes in a way that would break
 * a component reading a restored entry — a renamed field, a changed mapper
 * contract, a reworked query key. Restored data is written by an older build of
 * this app and never revalidated by the server before first paint, so a shape
 * change ships a crash to everyone holding yesterday's cache. The buster is the
 * only thing standing between that and a hard refresh.
 */
const PERSIST_VERSION = "v1";

const STORAGE_KEY = "brainite.query-cache";

/**
 * How long a restored entry may be trusted for first paint. Every restored
 * query is still stale on mount (staleTime is far shorter than this), so this
 * is not "how long we serve stale data" — it's "how old a snapshot is still
 * worth painting instead of a spinner".
 */
const MAX_AGE = 24 * 60 * 60 * 1000;

/**
 * localStorage rather than IndexedDB: the payloads are small view models, and a
 * synchronous read means the cache is already in hand on the first render pass
 * instead of one frame later.
 *
 * `retry` matters more than it looks. Safari private mode and a full quota both
 * throw on write; without a retry the persister would throw on every cache
 * change for the rest of the session. Dropping the oldest query and re-trying
 * degrades to "persist less" instead of "persist nothing".
 */
export const queryPersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: STORAGE_KEY,
  retry: removeOldestQuery,
});

export const persistOptions: Omit<PersistQueryClientOptions, "queryClient"> = {
  persister: queryPersister,
  maxAge: MAX_AGE,
  buster: PERSIST_VERSION,
  dehydrateOptions: {
    /**
     * Two rules, and the second one is a security boundary.
     *
     * A cache entry here is written to disk, survives the tab, and is readable
     * by anything running on this origin. That is fine for view models and
     * wrong for credentials — see the onboarding agent key, which caches a
     * *live* API secret under `staleTime: Infinity` so that re-entering the
     * step can't mint a second one. Any query holding something a user
     * shouldn't find in localStorage must opt out with `meta: { persist: false }`.
     */
    shouldDehydrateQuery: (query) =>
      query.state.status === "success" && query.meta?.persist !== false,
    /**
     * Mutations are never restored. The only mutations worth persisting are
     * offline-paused ones, which this app doesn't have — and a resumed mutation
     * would replay a write (approve a review, revoke a key) that the user
     * already believes settled one page load ago.
     */
    shouldDehydrateMutation: () => false,
  },
};

/**
 * Drop the persisted snapshot outright. `queryClient.clear()` alone would
 * eventually write an empty cache through the subscription, but "eventually"
 * is not a guarantee to make about one user's workspace data sitting on a
 * shared machine — sign-out removes the file, not just the memory.
 */
export function clearPersistedCache(): void {
  void queryPersister.removeClient();
}
