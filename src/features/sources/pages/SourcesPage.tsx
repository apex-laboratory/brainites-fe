import {
  AppIcon,
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
  StatStrip,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { AddSourceDialog } from "../components/AddSourceDialog";
import { SourceCard } from "../components/SourceCard";
import { useConnectionLanding } from "../hooks/useConnectionLanding";
import { useSources } from "../hooks/useSources";

/** Connected sources overview. */
export function SourcesPage() {
  const { sources, stats, healthyCount, isPending, isError, error, refetch } = useSources();

  useConnectionLanding();

  const addSource = (
    <AddSourceDialog
      connected={sources.map(({ source }) => source.provider)}
      trigger={
        <Button variant="outline" size="sm">
          <AppIcon name="plus" size={15} />
          Add source
        </Button>
      }
    />
  );

  return (
    <div className="h-full overflow-y-auto">
      <PageHeader
        label={
          isPending
            ? "Loading…"
            : isError
              ? "Unavailable"
              : `Connected · ${healthyCount} of ${sources.length} healthy`
        }
        title="Sources"
        sub="Where your brain reads from. Read-only, synced continuously."
        right={addSource}
      />

      <div className="mx-auto max-w-[1180px] px-6 pb-14 pt-6 md:px-10">
        {isPending ? (
          <SourcesSkeleton />
        ) : isError ? (
          <ErrorState
            error={error}
            onRetry={() => void refetch()}
            title="Couldn't load your sources"
          />
        ) : sources.length === 0 ? (
          <EmptyState
            icon="sources"
            title="No sources connected yet"
            sub="Connect Slack, Notion, GitHub and more so your brain has something to read."
            action={addSource}
          />
        ) : (
          <>
            <StatStrip stats={stats} className="mb-[18px]" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sources.map((entry) => (
                <SourceCard key={entry.source.id} entry={entry} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Mirrors the loaded layout: a stat strip above a three-column card grid. */
function SourcesSkeleton() {
  return (
    <div aria-busy role="status" aria-label="Loading sources">
      <Skeleton className="mb-[18px] h-[92px] w-full" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Card key={i} className="p-[22px]">
            <div className="flex items-center gap-3">
              <Skeleton className="size-[46px] rounded-[9px]" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-2 h-3 w-32" />
              </div>
            </div>
            <Skeleton className="mt-[22px] h-2 w-full" />
            <Skeleton className="mt-[18px] h-8 w-full" />
          </Card>
        ))}
      </div>
    </div>
  );
}
