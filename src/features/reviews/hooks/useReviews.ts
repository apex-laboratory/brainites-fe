import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useWorkspaceId } from "@/app/providers/AuthProvider";
import { isApiError } from "@/lib/api";
import { SOURCES } from "@/constants/sources";
import type { SourceId } from "@/types/common";

import { reviewKeys, reviewsApi, type ReviewOut } from "../api";
import type { Review } from "../types";

export type ReviewVerdict = "approve" | "reject";

/** Backend kind → a human label; unknown kinds pass through unchanged. */
const KIND_LABEL: Record<string, string> = {
  policy_change: "Policy change",
  new_decision: "New decision",
  contradiction: "Contradiction",
  exception: "Exception",
};

function asSourceId(provider: string | null | undefined): SourceId | null {
  return provider && provider in SOURCES ? (provider as SourceId) : null;
}

/** Map the backend `ReviewOut` onto the card's view model, defaulting the many
 * nullable fields so the UI never renders `null`. */
function mapReview(r: ReviewOut): Review {
  return {
    id: r.id,
    title: r.title,
    src: asSourceId(r.sourceProvider),
    where: r.sourceLocation ?? "",
    kind: KIND_LABEL[r.kind] ?? r.kind,
    before: r.beforeText ?? "",
    after: r.afterText ?? "",
    quote: r.evidenceQuote ?? "",
    who: r.evidenceAuthor ?? "",
    conf: r.confidence ?? 0,
  };
}

/**
 * Owns the review queue against the real API: lists pending reviews, tracks the
 * approve/reject totals from `/stats`, and resolves items with an optimistic
 * removal (snapshot + rollback on failure). Admin-only on the backend — a
 * non-admin's list request 403s and surfaces via `isError`.
 */
export function useReviews() {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();

  const listKey = reviewKeys.list(workspaceId, { status: "pending" });
  const statsKey = reviewKeys.stats(workspaceId);

  const listQuery = useQuery({
    queryKey: listKey,
    queryFn: () => reviewsApi.list({ status: "pending" }),
  });
  const statsQuery = useQuery({
    queryKey: statsKey,
    queryFn: () => reviewsApi.stats(),
  });

  const queue = useMemo(
    () => (listQuery.data ?? []).map(mapReview),
    [listQuery.data],
  );

  const stats = statsQuery.data;
  const total = stats
    ? stats.pending + stats.approved + stats.rejected
    : queue.length;
  const done = stats ? stats.approved + stats.rejected : 0;

  const resolve = useMutation({
    mutationFn: ({ id, verdict }: { id: string; verdict: ReviewVerdict }) =>
      verdict === "approve" ? reviewsApi.approve(id) : reviewsApi.reject(id),

    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const previous = queryClient.getQueryData<ReviewOut[]>(listKey);
      queryClient.setQueryData<ReviewOut[]>(listKey, (current) =>
        current?.filter((review) => review.id !== id),
      );
      return { previous };
    },

    onSuccess: (_result, { verdict }) => {
      toast.success(
        verdict === "approve"
          ? "Approved · merged into the brain"
          : "Rejected · change discarded",
      );
    },

    // Overriding onError opts out of the global toast — restore + raise our own.
    onError: (err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(listKey, context.previous);
      toast.error(isApiError(err) ? err.message : "Couldn't record that review");
    },

    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: reviewKeys.all(workspaceId) }),
  });

  const approve = useCallback(
    (id: string) => resolve.mutate({ id, verdict: "approve" }),
    [resolve],
  );
  const reject = useCallback(
    (id: string) => resolve.mutate({ id, verdict: "reject" }),
    [resolve],
  );

  return {
    queue,
    total,
    done,
    approve,
    reject,
    isPending: listQuery.isPending,
    isError: listQuery.isError,
    error: listQuery.error,
    refetch: listQuery.refetch,
  };
}
