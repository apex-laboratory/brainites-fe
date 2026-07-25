import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useWorkspaceId } from "@/app/providers/AuthProvider";
import { asSourceId } from "@/constants/sources";

import {
  reviewKeys,
  reviewsApi,
  type ReviewOut,
  type ResolveContradictionBody,
  type WriteReviewBody,
} from "../api";
import type { Review } from "../types";

export type ReviewVerdict = "approve" | "reject";

/** Backend kind → a human label; unknown kinds pass through unchanged. */
const KIND_LABEL: Record<string, string> = {
  policy_change: "Policy change",
  new_decision: "New decision",
  contradiction: "Contradiction",
  exception: "Exception",
};

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
    isContradiction: r.kind === "contradiction",
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

  // Optimistic removal shared by every resolution path: drop the given ids from
  // the pending list, snapshotting for rollback on failure.
  const removeFromQueue = async (ids: string[]) => {
    await queryClient.cancelQueries({ queryKey: listKey });
    const previous = queryClient.getQueryData<ReviewOut[]>(listKey);
    const drop = new Set(ids);
    queryClient.setQueryData<ReviewOut[]>(listKey, (current) =>
      current?.filter((review) => !drop.has(review.id)),
    );
    return { previous };
  };
  const rollback = (context: { previous?: ReviewOut[] } | undefined) => {
    if (context?.previous) queryClient.setQueryData(listKey, context.previous);
  };
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: reviewKeys.all(workspaceId) });

  const resolve = useMutation({
    mutationFn: ({ id, verdict }: { id: string; verdict: ReviewVerdict }) =>
      verdict === "approve" ? reviewsApi.approve(id) : reviewsApi.reject(id),
    onMutate: ({ id }) => removeFromQueue([id]),
    onSuccess: (_result, { verdict }) => {
      toast.success(
        verdict === "approve"
          ? "Approved · merged into the brain"
          : "Rejected · change discarded",
      );
    },
    onError: (_err, _vars, context) => rollback(context),
    onSettled: invalidate,
    meta: { errorMessage: "Couldn't record that review" },
  });

  // Reviewer authors the correct skill logic directly (POST /reviews/{id}/write).
  const writeMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: WriteReviewBody }) =>
      reviewsApi.write(id, body),
    onMutate: ({ id }) => removeFromQueue([id]),
    onSuccess: () => toast.success("Correction published · confidence 1.0"),
    onError: (_err, _vars, context) => rollback(context),
    onSettled: invalidate,
    meta: { errorMessage: "Couldn't publish the correction" },
  });

  // Resolve a contradiction card (POST /reviews/{id}/resolve).
  const contradictionMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: ResolveContradictionBody }) =>
      reviewsApi.resolve(id, body),
    onMutate: ({ id }) => removeFromQueue([id]),
    onSuccess: () => toast.success("Contradiction resolved"),
    onError: (_err, _vars, context) => rollback(context),
    onSettled: invalidate,
    meta: { errorMessage: "Couldn't resolve the contradiction" },
  });

  // Approve many sweep-sourced reviews at once (POST /reviews/bulk-approve).
  const bulkMut = useMutation({
    mutationFn: ({ ids, comment }: { ids: string[]; comment?: string }) =>
      reviewsApi.bulkApprove(ids, comment),
    onMutate: ({ ids }) => removeFromQueue(ids),
    onSuccess: (result) => {
      toast.success(
        result.skipped > 0
          ? `Approved ${result.approved} · skipped ${result.skipped}`
          : `Approved ${result.approved}`,
      );
    },
    onError: (_err, _vars, context) => rollback(context),
    onSettled: invalidate,
    meta: { errorMessage: "Couldn't approve those reviews" },
  });

  const approve = useCallback(
    (id: string) => resolve.mutate({ id, verdict: "approve" }),
    [resolve],
  );
  const reject = useCallback(
    (id: string) => resolve.mutate({ id, verdict: "reject" }),
    [resolve],
  );
  const write = useCallback(
    (id: string, body: WriteReviewBody) => writeMut.mutate({ id, body }),
    [writeMut],
  );
  const resolveContradiction = useCallback(
    (id: string, body: ResolveContradictionBody) =>
      contradictionMut.mutate({ id, body }),
    [contradictionMut],
  );
  const bulkApprove = useCallback(
    (ids: string[], comment?: string) => bulkMut.mutate({ ids, comment }),
    [bulkMut],
  );

  return {
    queue,
    total,
    done,
    approve,
    reject,
    write,
    resolveContradiction,
    bulkApprove,
    isBulkApproving: bulkMut.isPending,
    isPending: listQuery.isPending,
    isError: listQuery.isError,
    error: listQuery.error,
    refetch: listQuery.refetch,
  };
}
