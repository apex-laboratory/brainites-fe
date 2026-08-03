import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { useWorkspaceId } from "@/app/providers/AuthProvider";

import { decisionKeys, decisionsApi } from "../api";
import { mapDecision } from "../mappers";
import type { Decision } from "../types";

const PAGE_SIZE = 50;

export type DecisionsQuery = {
  /** Backend status filter; omit for "all". */
  status?: string;
  /** Provider id, e.g. from a source card's "View knowledge". */
  source?: string;
};

/**
 * Owns the decisions list against `/decisions` — paginated (load-more via
 * cursor), workspace-keyed.
 *
 * Filters are sent to the backend rather than applied to the loaded pages, so
 * a filter searches the whole workspace; each filter combination is its own
 * cached, independently paginated query (the params are part of the key).
 */
export function useDecisions({ status, source }: DecisionsQuery = {}) {
  const workspaceId = useWorkspaceId();

  const params = { limit: PAGE_SIZE, status, source };
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
