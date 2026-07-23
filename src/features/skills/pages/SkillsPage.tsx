import {
  AppIcon,
  ErrorState,
  PageHeader,
  Skeleton,
  StatStrip,
  type Stat,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCompact } from "@/utils/format";

import { NewSkillDialog } from "../components/NewSkillDialog";
import { SkillsTable } from "../components/SkillsTable";
import { useExportSkills } from "../hooks/useExportSkills";
import { useSkillsSearch } from "../hooks/useSkillsSearch";
import { useSkillsStats } from "../hooks/useSkillsStats";

/**
 * Skills registry screen. Browses `/skills` by default (paginated) and switches
 * to semantic search (`/skills/search`) once you type. Header stats come from
 * `/skills/stats`.
 */
export function SkillsPage() {
  const {
    query,
    setQuery,
    hasQuery,
    skills,
    isPending,
    isError,
    error,
    hasMore,
    isFetchingMore,
    loadMore,
  } = useSkillsSearch();
  const { exportBundle, isExporting } = useExportSkills();
  const statsQuery = useSkillsStats();

  const stats: Stat[] = statsQuery.data
    ? [
        { label: "Total", value: formatCompact(statsQuery.data.total) },
        { label: "Stable", value: formatCompact(statsQuery.data.stable) },
        { label: "In review", value: formatCompact(statsQuery.data.inReview) },
        { label: "Calls · 30d", value: formatCompact(statsQuery.data.calls30d) },
      ]
    : [];

  return (
    <div className="h-full overflow-y-auto">
      <PageHeader
        label="Registry · MCP-ready"
        title="Skills"
        sub="Executable capabilities your agents call. Versioned, with full source lineage."
        right={
          <>
            <div className="relative">
              <AppIcon
                name="search"
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-4"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search skills…"
                aria-label="Search skills"
                className="w-[200px] pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportBundle}
              disabled={isExporting}
            >
              <AppIcon name="externalLink" size={15} />
              {isExporting ? "Exporting…" : "Export"}
            </Button>
            <NewSkillDialog
              trigger={
                <Button variant="solid" size="sm">
                  <AppIcon name="plus" size={15} />
                  New skill
                </Button>
              }
            />
          </>
        }
      />

      <div className="mx-auto flex max-w-[1100px] flex-col gap-5 px-6 pb-14 pt-6 md:px-10">
        {stats.length > 0 && <StatStrip stats={stats} />}

        {isError ? (
          <ErrorState
            error={error}
            title={hasQuery ? "Couldn't search skills" : "Couldn't load the registry"}
          />
        ) : isPending ? (
          <Skeleton className="h-[280px] rounded-xl" />
        ) : (
          <>
            <SkillsTable
              skills={skills}
              emptyLabel={
                hasQuery
                  ? "No skills match your search."
                  : "No skills in the registry yet."
              }
            />
            {hasMore && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadMore}
                  disabled={isFetchingMore}
                >
                  {isFetchingMore ? "Loading…" : "Load more"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
