import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { useWorkspaceId } from "@/app/providers/AuthProvider";

import { decisionKeys, decisionsApi } from "../api";
import { mapDecision } from "../mappers";
import type { Decision } from "../types";

const PAGE_SIZE = 50;

/**
 * Owns the decisions list against `/decisions` — paginated (load-more via
 * cursor), workspace-keyed. Status filtering happens client-side in
 * `useDecisionFilters` so switching the filter never drops the loaded pages or
 * the current selection.
 */
export function useDecisions() {
  const workspaceId = useWorkspaceId();

  const params = { limit: PAGE_SIZE };
  const query = useInfiniteQuery({
    queryKey: decisionKeys.list(workspaceId, params),
    queryFn: ({ pageParam }) =>
      decisionsApi.list({ ...params, cursor: pageParam ?? undefined }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
  });

  const decisions = useMemo<Decision[]>(
    () => (query.data?.pages ?? []).flatMap((page) => page.items).map(mapDecision),
    [query.data],
  );

  return {
    decisions,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    hasMore: query.hasNextPage,
    isFetchingMore: query.isFetchingNextPage,
    loadMore: () => query.fetchNextPage(),
  };
}
