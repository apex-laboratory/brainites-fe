import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "./errors";

/**
 * App-wide TanStack Query defaults.
 *  - Retry only transient failures, and only a couple of times.
 *  - Every mutation gets a sane error toast for free; individual mutations
 *    override `onError` when they need rollback or field-level messages.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (count, err) =>
        err instanceof ApiError && err.isRetryable && count < 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (err) =>
        toast.error(err instanceof ApiError ? err.message : "Something went wrong"),
    },
  },
});
