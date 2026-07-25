import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useWorkspaceId } from "@/app/providers/AuthProvider";
import { asSourceId } from "@/constants/sources";
import {
  optimisticRemove,
  rollbackRemove,
  type OptimisticSnapshot,
} from "@/lib/api";

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

/** The queue-cache operations every resolution path shares. */
interface QueueCache {
  remove: (ids: string[]) => Promise<OptimisticSnapshot<ReviewOut>>;
  rollback: (context: OptimisticSnapshot<ReviewOut> | undefined) => void;
  invalidate: () => Promise<void>;
}

/**
 * One resolution mutation.
 *
 * Approve, reject, write and bulk-approve are the same mutation pointed at
 * different endpoints: drop the affected rows from the queue immediately,
 * restore them if the request fails, refetch either way. Only the request, the
 * ids it touches, and the two strings actually differ — so those are the
 * parameters, and the optimistic contract has one definition rather than four.
 */
function useResolution<V, R>(
  cache: QueueCache,
  options: {
    mutationFn: (variables: V) => Promise<R>;
    /** Which queue rows this call resolves. */
    ids: (variables: V) => string[];
    /** Success toast copy, from the result and what was sent. */
    onDone: (result: R, variables: V) => string;
    errorMessage: string;
  },
) {
  return useMutation<R, Error, V, OptimisticSnapshot<ReviewOut>>({
    mutationFn: options.mutationFn,
    onMutate: (variables) => cache.remove(options.ids(variables)),
    onSuccess: (result, variables) => toast.success(options.onDone(result, variables)),
    onError: (_err, _vars, context) => cache.rollback(context),
    onSettled: () => cache.invalidate(),
    meta: { errorMessage: options.errorMessage },
  });
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
  const cache: QueueCache = {
    remove: (ids) => optimisticRemove<ReviewOut>(queryClient, listKey, ids),
    rollback: (context) => rollbackRemove(queryClient, listKey, context),
    invalidate: () =>
      queryClient.invalidateQueries({ queryKey: reviewKeys.all(workspaceId) }),
  };

  const resolve = useResolution(cache, {
    mutationFn: ({ id, verdict }: { id: string; verdict: ReviewVerdict }) =>
      verdict === "approve" ? reviewsApi.approve(id) : reviewsApi.reject(id),
    ids: ({ id }) => [id],
    onDone: (_result, { verdict }) =>
      verdict === "approve"
        ? "Approved · merged into the brain"
        : "Rejected · change discarded",
    errorMessage: "Couldn't record that review",
  });

  // Reviewer authors the correct skill logic directly (POST /reviews/{id}/write).
  const writeMut = useResolution(cache, {
    mutationFn: ({ id, body }: { id: string; body: WriteReviewBody }) =>
      reviewsApi.write(id, body),
    ids: ({ id }) => [id],
    onDone: () => "Correction published · confidence 1.0",
    errorMessage: "Couldn't publish the correction",
  });

  // Resolve a contradiction card (POST /reviews/{id}/resolve).
  const contradictionMut = useResolution(cache, {
    mutationFn: ({ id, body }: { id: string; body: ResolveContradictionBody }) =>
      reviewsApi.resolve(id, body),
    ids: ({ id }) => [id],
    onDone: () => "Contradiction resolved",
    errorMessage: "Couldn't resolve the contradiction",
  });

  // Approve many sweep-sourced reviews at once (POST /reviews/bulk-approve).
  const bulkMut = useResolution(cache, {
    mutationFn: ({ ids, comment }: { ids: string[]; comment?: string }) =>
      reviewsApi.bulkApprove(ids, comment),
    ids: ({ ids }) => ids,
    onDone: (result) =>
      result.skipped > 0
        ? `Approved ${result.approved} · skipped ${result.skipped}`
        : `Approved ${result.approved}`,
    errorMessage: "Couldn't approve those reviews",
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
