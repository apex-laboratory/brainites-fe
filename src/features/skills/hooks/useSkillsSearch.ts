import { useMemo, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { useWorkspaceId } from "@/app/providers/AuthProvider";
import { useDebounce } from "@/hooks/useDebounce";

import { skillKeys, skillsApi } from "../api";
import { mapListItem, mapSearchHit } from "../mappers";
import type { Skill } from "../types";

const BROWSE_PAGE_SIZE = 50;

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
