import { useState } from "react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCompact } from "@/utils/format";

import { DraftDetailDialog } from "../components/DraftDetailDialog";
import { NewSkillDialog } from "../components/NewSkillDialog";
import { SkillDetailDialog } from "../components/SkillDetailDialog";
import { SkillsTable } from "../components/SkillsTable";
import { useDraftSkills } from "../hooks/useDraftSkills";
import { useExportSkills } from "../hooks/useExportSkills";
import { useSkillsSearch } from "../hooks/useSkillsSearch";
import { useSkillsStats } from "../hooks/useSkillsStats";

type RegistryTab = "registry" | "drafts";

/**
 * Skills registry screen. Browses `/skills` by default (paginated) and switches
 * to semantic search (`/skills/search`) once you type. Header stats come from
 * `/skills/stats`.
 *
 * A second "Drafts" tab covers skills the pipeline extracted below the
 * review-queue confidence floor — those never get a `reviews` row, so the
 * Review Queue screen can't show them either; this is their only home.
 */
export function SkillsPage() {
  const [tab, setTab] = useState<RegistryTab>("registry");

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
  const drafts = useDraftSkills();
  const { exportBundle, isExporting } = useExportSkills();
  const statsQuery = useSkillsStats();

  // The row's name is kept alongside the id so the dialog can title itself
  // before the detail fetch resolves.
  const [inspecting, setInspecting] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [inspectingDraftId, setInspectingDraftId] = useState<string | null>(null);
  const inspectingDraft =
    drafts.rawItems.find((item) => item.id === inspectingDraftId) ?? null;

  const stats: Stat[] = statsQuery.data
    ? [
        { label: "Total", value: formatCompact(statsQuery.data.total) },
        { label: "Stable", value: formatCompact(statsQuery.data.stable) },
        { label: "In review", value: formatCompact(statsQuery.data.inReview) },
        { label: "Draft", value: formatCompact(statsQuery.data.draft) },
        { label: "Calls · 30d", value: formatCompact(statsQuery.data.calls30d) },
      ]
    : [];

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => setTab(value as RegistryTab)}
      className="h-full overflow-y-auto"
    >
      <PageHeader
        label="Registry · MCP-ready"
        title="Skills"
        sub="Executable capabilities your agents call. Versioned, with full source lineage."
        right={
          <>
            <TabsList>
              <TabsTrigger value="registry">Registry</TabsTrigger>
              <TabsTrigger value="drafts">
                Drafts
                {statsQuery.data && statsQuery.data.draft > 0
                  ? ` · ${statsQuery.data.draft}`
                  : ""}
              </TabsTrigger>
            </TabsList>
            {tab === "registry" && (
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
            )}
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

        <TabsContent value="registry" className="mt-0 flex flex-col gap-5">
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
                onInspect={(id, name) => setInspecting({ id, name })}
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
        </TabsContent>

        <TabsContent value="drafts" className="mt-0 flex flex-col gap-5">
          {drafts.isError ? (
            <ErrorState error={drafts.error} title="Couldn't load drafts" />
          ) : drafts.isPending ? (
            <Skeleton className="h-[280px] rounded-xl" />
          ) : (
            <>
              <p className="text-[13px] text-ink-4">
                Extracted below the review-queue confidence floor — not yet
                queued for approval. Read-only.
              </p>
              <SkillsTable
                skills={drafts.skills}
                onInspect={(id) => setInspectingDraftId(id)}
                emptyLabel="No drafts below the review floor right now."
              />
              {drafts.hasMore && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={drafts.loadMore}
                    disabled={drafts.isFetchingMore}
                  >
                    {drafts.isFetchingMore ? "Loading…" : "Load more"}
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </div>

      <SkillDetailDialog
        skillId={inspecting?.id ?? null}
        skillName={inspecting?.name}
        onClose={() => setInspecting(null)}
      />
      <DraftDetailDialog
        item={inspectingDraft}
        onClose={() => setInspectingDraftId(null)}
      />
    </Tabs>
  );
}
