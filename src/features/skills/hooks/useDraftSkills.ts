import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { useWorkspaceId } from "@/app/providers/AuthProvider";

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
 */
export function useDraftSkills() {
  const workspaceId = useWorkspaceId();
  const params = { status: "draft", limit: DRAFTS_PAGE_SIZE };

  const query = useInfiniteQuery({
    queryKey: skillKeys.list(workspaceId, params),
    queryFn: ({ pageParam }) =>
      skillsApi.list({ ...params, cursor: pageParam ?? undefined }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
  });

  const rawItems = useMemo<SkillListItem[]>(
    () => (query.data?.pages ?? []).flatMap((page) => page.items),
    [query.data],
  );
  const skills = useMemo<Skill[]>(() => rawItems.map(mapListItem), [rawItems]);

  return {
    skills,
    rawItems,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    hasMore: query.hasNextPage,
    isFetchingMore: query.isFetchingNextPage,
    loadMore: () => query.fetchNextPage(),
  };
}
