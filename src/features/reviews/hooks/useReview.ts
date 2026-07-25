import { useQuery } from "@tanstack/react-query";

import { useWorkspaceId } from "@/app/providers/AuthProvider";

import { reviewKeys, reviewsApi } from "../api";
import { mapReview } from "../mappers";
import type { Review } from "../types";

/**
 * A single review, read fresh from `GET /reviews/{id}`.
 *
 * The queue list is fetched once and then held while the reviewer works through
 * it, so a card's proposed text can be minutes old by the time someone opens it
 * to author a correction — and reviews are admin-editable, so another admin may
 * have moved it. This re-reads the one review being acted on.
 *
 * Pass `null` to keep the query idle (the usual case: nothing is open).
 */
export function useReview(reviewId: string | null): {
  review: Review | null;
  isLoading: boolean;
} {
  const workspaceId = useWorkspaceId();

  const query = useQuery({
    queryKey: reviewKeys.detail(workspaceId, reviewId ?? "idle"),
    queryFn: () => reviewsApi.get(reviewId as string),
    enabled: reviewId !== null,
    // Always re-read on open: a cached copy would defeat the point.
    staleTime: 0,
  });

  const fresh = query.data && query.data.id === reviewId ? query.data : null;

  return {
    review: fresh ? mapReview(fresh) : null,
    isLoading: query.isLoading,
  };
}
