import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { useWorkspaceId } from "@/app/providers/AuthProvider";
import { asSourceId } from "@/constants/sources";
import { formatCompact } from "@/utils/format";
import { formatRelativeTime } from "@/utils/date";

import { decisionKeys, decisionsApi, type DecisionOut } from "../api";
import type { Decision, DecisionStatus } from "../types";

const PAGE_SIZE = 50;

/** Coerce the backend status onto a known filterable status; default `review`. */
function asStatus(status: string): DecisionStatus {
  return status === "approved" || status === "active" || status === "review"
    ? status
    : "review";
}

/** Map the backend `DecisionOut` onto the page's view model, defaulting the many
 * nullable fields so the UI never renders `null`. */
function mapDecision(d: DecisionOut): Decision {
  return {
    id: d.id,
    title: d.title,
    src: asSourceId(d.provider),
    where: d.location ?? "",
    status: asStatus(d.status),
    conf: d.confidence ?? 0,
    cat: d.category ?? "General",
    owner: d.owner?.name ?? "Unassigned",
    oc: d.owner?.avatarColor ?? "#8A8577",
    uses: formatCompact(d.uses),
    updated: formatRelativeTime(d.updatedAt) ?? "—",
    body: d.body ?? "",
    rule: d.rule ?? "",
  };
}

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
