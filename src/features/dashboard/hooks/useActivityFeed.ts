import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { useWorkspaceId } from "@/app/providers/AuthProvider";
import { asSourceId } from "@/constants/sources";
import type { SourceId } from "@/types/common";
import { formatRelativeTime } from "@/utils/date";

import { dashboardApi, dashboardKeys } from "../api";

const PAGE_SIZE = 30;

export type ActivityFeedItem = {
  id: string;
  txt: string;
  det: string;
  /** `null` when the event has no source, or one the UI doesn't know. */
  src: SourceId | null;
  /** Relative time, pre-formatted. */
  t: string;
};

/**
 * The full activity feed (`GET /workspaces/{id}/activity`), cursor-paginated.
 *
 * The overview's own payload embeds a short activity preview; this is the
 * "everything" view behind it. Kept idle until asked for — `enabled` is false
 * while the feed isn't open — so the dashboard doesn't pay for a second
 * activity request nobody looked at.
 */
export function useActivityFeed(enabled: boolean) {
  const workspaceId = useWorkspaceId();

  const query = useInfiniteQuery({
    queryKey: dashboardKeys.activity(workspaceId),
    queryFn: ({ pageParam }) =>
      dashboardApi.activity(workspaceId, {
        limit: PAGE_SIZE,
        cursor: pageParam ?? undefined,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
    enabled,
  });

  const items = useMemo<ActivityFeedItem[]>(
    () =>
      (query.data?.pages ?? [])
        .flatMap((page) => page.items)
        .map((event) => ({
          id: event.id,
          txt: event.title,
          det: event.detail ?? "",
          src: asSourceId(event.sourceProvider),
          t: formatRelativeTime(event.createdAt) ?? "",
        })),
    [query.data],
  );

  return {
    items,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    hasMore: query.hasNextPage,
    isFetchingMore: query.isFetchingNextPage,
    loadMore: () => query.fetchNextPage(),
  };
}
