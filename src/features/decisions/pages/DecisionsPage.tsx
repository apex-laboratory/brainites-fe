import {
  EmptyState,
  ErrorState,
  PageHeader,
  Segmented,
  Skeleton,
} from "@/components/shared";
import { Button } from "@/components/ui/button";

import { DecisionDetail } from "../components/DecisionDetail";
import { DecisionRow } from "../components/DecisionRow";
import { useDecision } from "../hooks/useDecision";
import { useDecisionFilters } from "../hooks/useDecisionFilters";
import { useDecisions } from "../hooks/useDecisions";
import { useSelectedDecision } from "../hooks/useSelectedDecision";

/** Decisions master–detail screen, backed by `/decisions`. */
export function DecisionsPage() {
  const {
    decisions,
    isPending,
    isError,
    error,
    refetch,
    hasMore,
    isFetchingMore,
    loadMore,
  } = useDecisions();
  const { filter, setFilter, filtered, options } = useDecisionFilters(decisions);
  const { selectedId, setSelectedId, selected } = useSelectedDecision(filtered);
  // The list row renders immediately; the detail fetch refines it in place.
  const { decision: openDecision } = useDecision(selectedId, selected);

  const count = decisions.length;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        label={`Company logic · ${count} decision${count === 1 ? "" : "s"}`}
        title="Decisions"
        sub="The calls your team has made, extracted and made executable."
        right={
          isPending || isError ? undefined : (
            <Segmented
              value={filter}
              options={options}
              onChange={setFilter}
              ariaLabel="Filter decisions by status"
            />
          )
        }
      />

      {isError ? (
        <div className="mx-auto w-full max-w-[780px] px-6 pt-6 md:px-10">
          <ErrorState
            error={error}
            onRetry={() => refetch()}
            title="Couldn't load decisions"
          />
        </div>
      ) : isPending ? (
        <div className="flex flex-col gap-2 px-4 py-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-[62px] rounded-xl" />
          ))}
        </div>
      ) : decisions.length === 0 ? (
        <div className="mx-auto w-full max-w-[780px] px-6 pt-6 md:px-10">
          <EmptyState
            icon="sparkles"
            title="No decisions yet"
            sub="As the brain extracts operational calls from your sources, they'll appear here."
          />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <div className="shrink-0 overflow-y-auto border-line py-2 max-lg:max-h-72 max-lg:border-b lg:w-[340px] lg:border-r">
            {filtered.map((decision) => (
              <DecisionRow
                key={decision.id}
                decision={decision}
                active={decision.id === selectedId}
                onClick={() => setSelectedId(decision.id)}
              />
            ))}
            {hasMore && (
              <div className="px-4 py-3">
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

          {openDecision && (
            <DecisionDetail key={openDecision.id} decision={openDecision} />
          )}
        </div>
      )}
    </div>
  );
}
