import { useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { useWorkspaceId } from "@/app/providers/AuthProvider";
import { useDebounce } from "@/hooks/useDebounce";

import { skillKeys, skillsApi, type SkillListItem } from "../api";
import { mapListItem } from "../mappers";
import type { Skill } from "../types";

const DRAFTS_PAGE_SIZE = 50;

/**
 * Browses `GET /skills?status=draft` — skills the pipeline extracted below the
 * review-queue confidence floor (`routing.review_queue_confidence_floor` in
 * `source_authority.yaml`). Those never get a `reviews` row, so they're
 * otherwise invisible in the dashboard (not in the registry, not in the queue).
 *
 * Returns both the table view model and the raw rows: the detail dialog reads
 * straight off the raw row instead of fetching `/skills/{id}`, which is
 * scoped to published statuses and would 404 on a draft.
 *
 * Filtering is client-side over the pages fetched so far — `/skills/search` is
 * semantic search over published skills with no status filter, so there's no
 * server-side draft search to call. "Load more" stays available while filtering
 * so a miss can be widened by pulling the next page.
 */
export function useDraftSkills() {
  const workspaceId = useWorkspaceId();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query.trim().toLowerCase(), 200);
  const hasQuery = debouncedQuery.length > 0;

  const params = { status: "draft", limit: DRAFTS_PAGE_SIZE };

  const queryResult = useInfiniteQuery({
    queryKey: skillKeys.list(workspaceId, params),
    queryFn: ({ pageParam }) =>
      skillsApi.list({ ...params, cursor: pageParam ?? undefined }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
  });

  const rawItems = useMemo<SkillListItem[]>(
    () => (queryResult.data?.pages ?? []).flatMap((page) => page.items),
    [queryResult.data],
  );
  const skills = useMemo<Skill[]>(() => {
    const matches = hasQuery
      ? rawItems.filter((item) =>
          [item.name, item.baseLogic, item.description].some((field) =>
            field?.toLowerCase().includes(debouncedQuery),
          ),
        )
      : rawItems;
    return matches.map(mapListItem);
  }, [rawItems, hasQuery, debouncedQuery]);

  return {
    skills,
    rawItems,
    query,
    queryResult,
    setQuery,
    hasQuery,
    isPending: queryResult.isPending,
    isError: queryResult.isError,
    error: queryResult.error,
    hasMore: queryResult.isNextPage,
    isFetchingMore: queryResult.isFetchingNextPage,
    loadMore: () => queryResult.fetchNextPage(),
  };
}
