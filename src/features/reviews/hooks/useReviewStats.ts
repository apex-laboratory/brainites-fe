import { queryOptions, useQuery } from "@tanstack/react-query";

import { useWorkspaceId } from "@/app/providers/AuthProvider";

import { reviewKeys, reviewsApi, type ReviewStats } from "../api";

/**
 * Poll cadence for `/reviews/stats`. The queue only moves when a human or the
 * extraction pipeline touches it, so this is about a tab left open across the
 * threshold — five minutes is far below the 24h/72h escalation steps and cheap
 * enough on an endpoint that returns five numbers.
 */
const STATS_POLL_MS = 5 * 60_000;

/**
 * The one definition of the review-stats query. Three places read it — the nav
 * badge, the escalation alert, and the Reviews page progress strip — and they
 * must agree, so they share a key *and* these options rather than each picking
 * their own staleness. TanStack dedupes the request across all of them.
 */
export function reviewStatsOptions(workspaceId: string) {
  return queryOptions({
    queryKey: reviewKeys.stats(workspaceId),
    queryFn: () => reviewsApi.stats(),
    staleTime: 60_000,
    refetchInterval: STATS_POLL_MS,
    // Overrides the app-wide `false`. Returning to the tab is exactly when a
    // stalled queue should be re-checked, and it's the cheapest way to catch a
    // threshold crossed while the tab sat in the background.
    refetchOnWindowFocus: true,
  });
}

/**
 * Review queue stats. Admin-only on the backend: a viewer/editor's 403 leaves
 * `data` undefined, which correctly yields no badge and no alerts — they can't
 * action the queue anyway.
 */
export function useReviewStats(): ReviewStats | undefined {
  const { data } = useQuery(reviewStatsOptions(useWorkspaceId()));
  return data;
}
