import { useMemo, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { useWorkspaceId } from "@/app/providers/AuthProvider";
import { useDebounce } from "@/hooks/useDebounce";
import { SOURCES } from "@/constants/sources";
import type { SourceId } from "@/types/common";
import { formatCompact } from "@/utils/format";
import { formatRelativeTime } from "@/utils/date";

import {
  skillKeys,
  skillsApi,
  type SkillListItem,
  type SkillSearchResult,
} from "../api";
import type { Skill, SkillStatus } from "../types";

const BROWSE_PAGE_SIZE = 50;

/** Keep only the providers we know how to render, in the given order. */
function asSources(providers: (string | null | undefined)[]): SourceId[] {
  const seen = new Set<SourceId>();
  for (const p of providers) {
    if (p && p in SOURCES) seen.add(p as SourceId);
  }
  return [...seen];
}

/** A published skill is `active`/`stable`; anything else falls back to `stable`. */
function asStatus(status: string | null | undefined): SkillStatus {
  return status === "active" || status === "draft" || status === "review"
    ? status
    : "stable";
}

/**
 * Turn backend usage metrics into the table's display fields. A skill with no
 * recorded interactions (empty series) carries no metrics, so the table renders
 * the placeholder (or, for a search hit, the `% match`) instead.
 */
function mapMetrics(calls30d: number, callSeries: number[], updatedAt?: string | null) {
  // The 30-day count and the 7-day sparkline are independent windows: show the
  // count whenever there were calls in the last 30 days, even if the last 7 were
  // quiet, and draw the sparkline only when the 7-day series actually has data.
  return {
    calls: calls30d > 0 ? formatCompact(calls30d) : undefined,
    spark: callSeries.some((n) => n > 0) ? callSeries : undefined,
    updated: formatRelativeTime(updatedAt) ?? undefined,
  };
}

/** Map a browse-list row onto the table's view model. */
function mapListItem(r: SkillListItem): Skill {
  return {
    id: r.id,
    name: r.name,
    v: r.version,
    src: asSources(r.sourceProviders),
    status: asStatus(r.status),
    ...mapMetrics(r.calls30d, r.callSeries, r.updatedAt),
  };
}

/** Map a search hit onto the table's view model (adds `similarity`). */
function mapSearchHit(r: SkillSearchResult): Skill {
  return {
    id: r.id,
    name: r.name,
    v: r.version,
    src: asSources([r.sourceAuthority]),
    status: asStatus(r.status),
    similarity: r.similarity,
    ...mapMetrics(r.calls30d, r.callSeries, r.updatedAt),
  };
}

/**
 * Owns the skills registry. With no query it browses `/skills` (paginated,
 * load-more via cursor) so the page shows a default registry view; with a
 * (debounced) query it semantically searches `/skills/search`. Both feed the
 * same table view model. Workspace-keyed so switching workspaces can't serve
 * stale rows.
 */
export function useSkillsSearch() {
  const workspaceId = useWorkspaceId();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query.trim(), 300);
  const hasQuery = debouncedQuery.length > 0;

  // Search — only while there's a query.
  const searchParams = { q: debouncedQuery, limit: 20 };
  const searchQuery = useQuery({
    queryKey: skillKeys.search(workspaceId, searchParams),
    queryFn: () => skillsApi.search(searchParams),
    enabled: hasQuery,
  });

  // Browse — the default view; paginated with a "Load more" affordance.
  const browseParams = { limit: BROWSE_PAGE_SIZE };
  const browseQuery = useInfiniteQuery({
    queryKey: skillKeys.list(workspaceId, browseParams),
    queryFn: ({ pageParam }) =>
      skillsApi.list({ ...browseParams, cursor: pageParam ?? undefined }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
    enabled: !hasQuery,
  });

  const skills = useMemo<Skill[]>(() => {
    if (hasQuery) return (searchQuery.data ?? []).map(mapSearchHit);
    return (browseQuery.data?.pages ?? [])
      .flatMap((page) => page.items)
      .map(mapListItem);
  }, [hasQuery, searchQuery.data, browseQuery.data]);

  const active = hasQuery ? searchQuery : browseQuery;

  return {
    query,
    setQuery,
    hasQuery,
    skills,
    isPending: active.isPending,
    isError: active.isError,
    error: active.error,
    // Browse pagination (no-ops while searching).
    hasMore: !hasQuery && browseQuery.hasNextPage,
    isFetchingMore: browseQuery.isFetchingNextPage,
    loadMore: () => browseQuery.fetchNextPage(),
  };
}
