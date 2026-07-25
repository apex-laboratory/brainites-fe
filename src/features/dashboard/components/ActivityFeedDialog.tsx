import { EmptyState, ErrorState, Skeleton, SourceIcon } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppIcon } from "@/components/shared";

import { useActivityFeed } from "../hooks/useActivityFeed";

export interface ActivityFeedDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * The full activity feed behind the overview's Activity panel preview.
 *
 * The query is gated on `open`, so a dashboard session that never opens this
 * costs nothing — the preview on the overview comes from the aggregated
 * `/overview` payload and is already on screen.
 */
export function ActivityFeedDialog({ open, onClose }: ActivityFeedDialogProps) {
  const {
    items,
    isPending,
    isError,
    error,
    refetch,
    hasMore,
    isFetchingMore,
    loadMore,
  } = useActivityFeed(open);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-[560px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Activity</DialogTitle>
          <DialogDescription>
            Everything the brain has done across this workspace, newest first.
          </DialogDescription>
        </DialogHeader>

        {isError ? (
          <ErrorState
            error={error}
            onRetry={() => refetch()}
            title="Couldn't load activity"
          />
        ) : isPending ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-12 rounded-xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            className="border-0 shadow-none"
            icon="sparkles"
            title="Nothing yet"
            sub="Once your sources start syncing, everything the brain does shows up here."
          />
        ) : (
          <div className="flex flex-col">
            {items.map((item, i) => (
              <div
                key={item.id}
                className={`flex gap-3 py-3 ${i ? "border-t border-line-soft" : ""}`}
              >
                <span className="mt-px">
                  {item.src ? (
                    <SourceIcon id={item.src} size={17} branded />
                  ) : (
                    <AppIcon name="sparkles" size={17} className="text-ink-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold tracking-[-0.01em] text-ink">
                    {item.txt}
                  </div>
                  {item.det && (
                    <div className="mt-px text-[12.5px] text-ink-3">{item.det}</div>
                  )}
                </div>
                <span className="tnum shrink-0 text-[11px] text-ink-4">{item.t}</span>
              </div>
            ))}

            {hasMore && (
              <div className="pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={loadMore}
                  disabled={isFetchingMore}
                >
                  {isFetchingMore ? "Loading…" : "Load more"}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
