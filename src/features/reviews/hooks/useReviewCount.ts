import { useReviewStats } from "./useReviewStats";

/**
 * Pending-review count for the sidebar/top-bar badge — the passive, always-on
 * rung of the escalation. Shares `useReviewStats`' query, so mounting it costs
 * no extra request. A non-admin's 403 resolves to 0 (no badge), which is right:
 * they can't action the queue anyway.
 */
export function useReviewCount(): number {
  return useReviewStats()?.pending ?? 0;
}
