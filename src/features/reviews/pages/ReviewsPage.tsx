import { useMemo, useState } from "react";

import { AppIcon, ErrorState, Meter, PageHeader, Skeleton } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { ReviewCard } from "../components/ReviewCard";
import { useReviews } from "../hooks/useReviews";

/** Review queue triage screen (prototype `ReviewsPage`). */
export function ReviewsPage() {
  const {
    queue,
    total,
    done,
    approve,
    reject,
    write,
    resolveContradiction,
    bulkApprove,
    isBulkApproving,
    isPending,
    isError,
    error,
    refetch,
  } = useReviews();
  const progress = total === 0 ? 100 : (done / total) * 100;

  // Bulk-approve selection. Ids are intersected with the live queue so a stale
  // pick (item resolved elsewhere) never lingers in the count or the request.
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const selectedIds = useMemo(
    () => queue.filter((r) => selected.has(r.id)).map((r) => r.id),
    [queue, selected],
  );
  const allSelected = queue.length > 0 && selectedIds.length === queue.length;

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const clearSelection = () => setSelected(new Set());
  const selectAll = () =>
    setSelected(allSelected ? new Set() : new Set(queue.map((r) => r.id)));
  const approveSelected = () => {
    if (selectedIds.length === 0) return;
    bulkApprove(selectedIds);
    clearSelection();
  };

  return (
    <div className="h-full overflow-y-auto">
      <PageHeader
        label="Operational · triage"
        title="Review queue"
        sub="Proposed changes the brain detected. Approve to merge into company logic."
        right={
          isPending || isError ? undefined : (
            <Badge variant="amber">{queue.length} pending</Badge>
          )
        }
      />

      <div className="mx-auto max-w-[780px] px-6 pb-14 pt-6 md:px-10">
        {isError ? (
          <ErrorState
            error={error}
            onRetry={() => refetch()}
            title="Couldn't load the review queue"
          />
        ) : isPending ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-[68px] rounded-2xl" />
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-[220px] rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
        {/* progress strip */}
        <Card className="mb-[18px] flex items-center gap-[18px] px-5 py-4">
          <div className="flex-1">
            <div className="mb-2 flex justify-between">
              <span className="text-[13.5px] font-semibold text-ink">
                Review queue cleared
              </span>
              <span className="tnum text-[12.5px] text-ink-3">
                {done} / {total}
              </span>
            </div>
            <Meter value={progress} tone="green" className="h-[7px]" />
          </div>
          <div className="h-9 w-px bg-line" />
          <div className="text-center">
            <div className="text-[22px] font-semibold tracking-[-0.03em] text-ink">
              ~30s
            </div>
            <div className="text-[11.5px] text-ink-3">avg per item</div>
          </div>
        </Card>

        {queue.length > 0 && (
          <div className="mb-3 flex items-center gap-3">
            <button
              type="button"
              onClick={selectAll}
              className="text-[12.5px] font-semibold text-ink-3 transition-colors hover:text-ink"
            >
              {allSelected ? "Deselect all" : "Select all"}
            </button>
            {selectedIds.length > 0 && (
              <span className="tnum text-[12.5px] text-ink-4">
                {selectedIds.length} selected
              </span>
            )}
            {selectedIds.length > 0 && (
              <div className="ml-auto flex items-center gap-2.5">
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  Clear
                </Button>
                <Button
                  size="sm"
                  className="bg-green text-white shadow-soft-1 hover:bg-green/90"
                  disabled={isBulkApproving}
                  onClick={approveSelected}
                >
                  <AppIcon name="check" size={15} />
                  {isBulkApproving ? "Approving…" : `Approve ${selectedIds.length}`}
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {queue.length === 0 ? (
            <Card className="px-6 py-16 text-center">
              <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-green-soft">
                <AppIcon name="check" size={26} className="text-green" />
              </div>
              <h2 className="text-[22px] font-bold text-ink">Queue clear</h2>
              <p className="mt-2 text-ink-3">
                Every proposed change has been reviewed. The brain is up to date.
              </p>
            </Card>
          ) : (
            queue.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                selected={selected.has(review.id)}
                onToggleSelect={toggleSelect}
                onResolve={(id, verdict) =>
                  verdict === "approve" ? approve(id) : reject(id)
                }
                onWrite={write}
                onResolveContradiction={resolveContradiction}
              />
            ))
          )}
        </div>
          </>
        )}
      </div>
    </div>
  );
}
