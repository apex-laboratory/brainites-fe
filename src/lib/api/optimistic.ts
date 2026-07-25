/**
 * The optimistic list-removal recipe, written once.
 *
 * Every "resolve this row and make it disappear now" mutation needs the same
 * four steps in the same order — cancel in-flight refetches, snapshot, filter,
 * restore on failure — and getting the order wrong fails silently: a refetch
 * that wasn't cancelled quietly reinstates the row the user just dismissed.
 */

import type { QueryClient, QueryKey } from "@tanstack/react-query";

/** The rollback snapshot. Return it from `onMutate` — it *is* the context. */
export interface OptimisticSnapshot<T> {
  previous: T[] | undefined;
}

/**
 * Optimistically drop rows from a cached list by id.
 *
 * Cancels any in-flight refetch first, so it can't land after the write and
 * clobber it, then snapshots the list for `rollbackRemove`.
 */
export async function optimisticRemove<T extends { id: string }>(
  queryClient: QueryClient,
  key: QueryKey,
  ids: string[],
): Promise<OptimisticSnapshot<T>> {
  await queryClient.cancelQueries({ queryKey: key });
  const previous = queryClient.getQueryData<T[]>(key);

  const drop = new Set(ids);
  queryClient.setQueryData<T[]>(key, (current) =>
    current?.filter((row) => !drop.has(row.id)),
  );

  return { previous };
}

/**
 * Restore a list snapshotted by `optimisticRemove`. A no-op when the list was
 * never cached, which is the correct behaviour — there is nothing to put back.
 */
export function rollbackRemove<T>(
  queryClient: QueryClient,
  key: QueryKey,
  context: OptimisticSnapshot<T> | undefined,
): void {
  if (context?.previous) queryClient.setQueryData(key, context.previous);
}
