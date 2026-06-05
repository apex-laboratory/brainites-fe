import { AppIcon, PageHeader, StatStrip } from "@/components/shared";
import { Button } from "@/components/ui/button";

import { SourceCard } from "../components/SourceCard";
import { useSourceHealth } from "../hooks/useSourceHealth";

/** Connected sources overview (prototype `SourcesPage`). */
export function SourcesPage() {
  const { sources, stats } = useSourceHealth();

  return (
    <div className="h-full overflow-y-auto">
      <PageHeader
        label="Connected · 5 of 5 healthy"
        title="Sources"
        sub="Where your brain reads from. Read-only, synced continuously."
        right={
          <Button variant="outline" size="sm">
            <AppIcon name="plus" size={15} />
            Add source
          </Button>
        }
      />

      <div className="mx-auto max-w-[1180px] px-6 pb-14 pt-6 md:px-10">
        <StatStrip stats={stats} className="mb-[18px]" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sources.map((entry) => (
            <SourceCard key={entry.meta.id} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
}
