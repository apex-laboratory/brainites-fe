import { MutationCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError, isApiError, type ApiErrorCode } from "./errors";

/**
 * How a failed mutation is presented, declared per-mutation as `meta` so that
 * rendering a failure stays the sole job of the global handler below.
 *
 * A mutation that needs rollback keeps its own `onError` for *state* only; it
 * no longer has to re-implement the toast just to change one word of copy.
 */
export type MutationErrorMeta = {
  /** Set `false` to stay silent — the caller surfaces the failure itself. */
  errorToast?: boolean;
  /** Copy for a thrown value that carries no message of its own. */
  errorMessage?: string;
  /** Copy that replaces the server message for specific failure codes. */
  errorMessages?: Partial<Record<ApiErrorCode, string>>;
};

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: MutationErrorMeta;
  }
}

/**
 * The one sentence a failed mutation shows. A real `ApiError` speaks for itself
 * unless `meta` overrides that specific code; anything else falls back to copy.
 */
function errorToastMessage(err: unknown, meta?: MutationErrorMeta): string {
  if (isApiError(err)) {
    return meta?.errorMessages?.[err.code] ?? err.message;
  }
  return meta?.errorMessage ?? "Something went wrong";
}

/**
 * The server's trace id, shown under the message. It's the only handle backend
 * has when a user reports a failure, so a toast that omits it makes the report
 * unactionable.
 */
function errorToastReference(err: unknown): string | undefined {
  return isApiError(err) && err.requestId
    ? `Reference: ${err.requestId}`
    : undefined;
}

/**
 * App-wide TanStack Query defaults.
 *  - Retry only transient failures, and only a couple of times.
 *  - Every mutation gets a sane error toast for free, tuned through `meta`.
 */
export const queryClient = new QueryClient({
  // On the cache rather than `defaultOptions.mutations`: a cache-level handler
  // runs *in addition to* a mutation's own `onError` instead of being replaced
  // by it, which is what lets rollback handlers drop their toast copy.
  mutationCache: new MutationCache({
    onError: (err, _variables, _context, mutation) => {
      const meta = mutation.meta;
      if (meta?.errorToast === false) return;
      toast.error(errorToastMessage(err, meta), {
        description: errorToastReference(err),
      });
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (count, err) =>
        err instanceof ApiError && err.isRetryable && count < 2,
      refetchOnWindowFocus: false,
    },
  },
});
