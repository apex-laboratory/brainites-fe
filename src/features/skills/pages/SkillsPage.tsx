import { useState } from "react";

import { useAuth } from "@/app/providers/AuthProvider";
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

import { DeleteSkillDialog } from "../components/DeleteSkillDialog";
import { DraftDetailDialog } from "../components/DraftDetailDialog";
import { EditSkillDialog } from "../components/EditSkillDialog";
import { NewSkillDialog } from "../components/NewSkillDialog";
import { SkillDetailDialog } from "../components/SkillDetailDialog";
import { SkillsTable } from "../components/SkillsTable";
import { useDraftSkills } from "../hooks/useDraftSkills";
import { useExportSkills } from "../hooks/useExportSkills";
import { useSkillsSearch } from "../hooks/useSkillsSearch";
import { useSkillsStats } from "../hooks/useSkillsStats";
import { useSubmitSkill } from "../hooks/useSubmitSkill";

type RegistryTab = "registry" | "drafts";

/**
 * Skills registry screen. Browses `/skills` by default (paginated) and switches
 * to semantic search (`/skills/search`) once you type. Header stats come from
 * `/skills/stats`.
 *
 * A second "Drafts" tab covers skills the pipeline extracted below the
 * review-queue confidence floor — those never get a `reviews` row, so the
 * Review Queue screen can't show them either; this is their only home. From
 * there an admin can promote one into the queue (`POST /skills/{id}/submit`).
 */
export function SkillsPage() {
  const [tab, setTab] = useState<RegistryTab>("registry");
  const { role } = useAuth();

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

  // The edit/delete targets, kept with their name so the dialogs can title
  // themselves before any fetch resolves.
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(null);

  // Row-action gating mirrors the submit rule: hide an action only when we
  // positively know the user lacks the role (`role` is `null` until the first
  // `/auth/me` resolves, and blanking the control for the owner on a cold load
  // reads as broken). A real 403 still surfaces as its own toast.
  // Edit is editor-or-admin; delete is admin-only.
  const canEdit = role === null || role === "editor" || role === "admin";
  const canDelete = role === null || role === "admin";

  // Submitting a draft is admin-only. Hide the action only when we positively
  // know the user isn't an admin — `role` is `null` until the first `/auth/me`
  // resolves it, and gating on a strict `=== "admin"` would blank the button
  // for the workspace owner on a cold load. A real non-admin still can't
  // submit: the 403 surfaces as its own toast (mirrors `StepLearning`).
  const knownNonAdmin = role !== null && role !== "admin";
  const submitSkill = useSubmitSkill();
  const submittingId = submitSkill.isPending
    ? (submitSkill.variables?.skillId ?? null)
    : null;

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
            <div className="relative">
              <AppIcon
                name="search"
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-4"
              />
              {tab === "registry" ? (
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search skills…"
                  aria-label="Search skills"
                  className="w-[200px] pl-9"
                />
              ) : (
                <Input
                  value={drafts.query}
                  onChange={(event) => drafts.setQuery(event.target.value)}
                  placeholder="Search drafts…"
                  aria-label="Search drafts"
                  className="w-[200px] pl-9"
                />
              )}
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
                onEdit={canEdit ? (id, name) => setEditing({ id, name }) : undefined}
                onDelete={
                  canDelete ? (id, name) => setDeleting({ id, name }) : undefined
                }
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
                queued for approval.
                {knownNonAdmin
                  ? " Read-only; an admin can send one to the review queue."
                  : " Submit one to put it in front of a reviewer."}
              </p>
              <SkillsTable
                skills={drafts.skills}
                onInspect={(id) => setInspectingDraftId(id)}
                onEdit={canEdit ? (id, name) => setEditing({ id, name }) : undefined}
                onDelete={
                  canDelete ? (id, name) => setDeleting({ id, name }) : undefined
                }
                onSubmit={
                  knownNonAdmin
                    ? undefined
                    : (id, name) => submitSkill.mutate({ skillId: id, name })
                }
                submittingId={submittingId}
                emptyLabel={
                  drafts.hasQuery
                    ? "No drafts match your search on the pages loaded so far."
                    : "No drafts below the review floor right now."
                }
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
      <EditSkillDialog
        skillId={editing?.id ?? null}
        skillName={editing?.name}
        onClose={() => setEditing(null)}
      />
      <DeleteSkillDialog skill={deleting} onClose={() => setDeleting(null)} />
      <DraftDetailDialog
        item={inspectingDraft}
        onClose={() => setInspectingDraftId(null)}
        onSubmit={
          knownNonAdmin || !inspectingDraft
            ? undefined
            : (note) =>
                submitSkill.mutate(
                  {
                    skillId: inspectingDraft.id,
                    name: inspectingDraft.name,
                    note,
                  },
                  // Close as soon as the write settles — including the "stale"
                  // 409/404 outcomes, where the row is equally out of date.
                  // The drafts refetch is about to drop this row, and a dialog
                  // left open over a vanishing row reads as a hang.
                  { onSuccess: () => setInspectingDraftId(null) },
                )
        }
        isSubmitting={submittingId === inspectingDraft?.id}
      />
    </Tabs>
  );
}
