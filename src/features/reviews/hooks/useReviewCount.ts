import { useQuery } from "@tanstack/react-query";

import { useWorkspaceId } from "@/app/providers/AuthProvider";

import { reviewKeys, reviewsApi } from "../api";

/**
 * Pending-review count for the sidebar/top-bar badge. Shares the `/reviews/stats`
 * query key with the Reviews page, so mounting it costs no extra request. Reviews
 * are admin-only: a non-admin's 403 simply resolves to 0 (no badge), which is the
 * right behavior — they can't action the queue anyway.
 */
export function useReviewCount(): number {
  const workspaceId = useWorkspaceId();

  const { data } = useQuery({
    queryKey: reviewKeys.stats(workspaceId),
    queryFn: () => reviewsApi.stats(),
    staleTime: 60_000,
  });

  return data?.pending ?? 0;
}
