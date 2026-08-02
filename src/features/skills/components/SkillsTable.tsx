import {
  AppIcon,
  SectionLabel,
  Sparkline,
  SourceIcon,
  StatusBadge,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils/cn";

import type { Skill } from "../types";

// Version, status and the action button hug fixed widths — they hold a badge or
// an icon, never prose, and as `fr` tracks they stole width from the name column
// and left the status badge floating mid-cell. The actions column widens when
// the "Submit" button shares it with the inspect icon.
const COLUMNS = "grid-cols-[2.6fr_72px_0.85fr_1fr_112px_36px]";
const COLUMNS_WITH_SUBMIT = "grid-cols-[2.6fr_72px_0.85fr_1fr_112px_160px]";
const HEADERS = ["Skill", "Version", "Source lineage", "Calls · 30d", "Status", ""];

export interface SkillsTableProps {
  skills: Skill[];
  /** Shown when there are no rows (differs for browse vs. search). */
  emptyLabel?: string;
  /** Open a row's full body + version history. */
  onInspect: (skillId: string, skillName: string) => void;
  /**
   * Queue a draft for review (`POST /skills/{id}/submit`). Omit to hide the
   * action entirely — it's admin-only, and only a `draft` row can be submitted,
   * so the button is never rendered on any other status.
   */
  onSubmit?: (skillId: string, skillName: string) => void;
  /** Id of the row whose submit is in flight; disables just that button. */
  submittingId?: string | null;
}

/** Dense skills registry table built on a CSS grid (prototype `SkillsPage`). */
export function SkillsTable({
  skills,
  emptyLabel = "No skills to show yet.",
  onInspect,
  onSubmit,
  submittingId,
}: SkillsTableProps) {
  const columns = onSubmit ? COLUMNS_WITH_SUBMIT : COLUMNS;

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        {/* The submit column adds ~124px of fixed width; without a matching
            min-width bump the name column gets squeezed before the table
            scrolls. */}
        <div className={onSubmit ? "min-w-[840px]" : "min-w-[720px]"}>
          <div
            className={cn(
              "grid gap-3.5 border-b border-line bg-paper px-[22px] py-3",
              columns
            )}
          >
            {HEADERS.map((header, i) => (
              <SectionLabel key={i} className="pb-0 text-[9.5px]">
                {header}
              </SectionLabel>
            ))}
          </div>

          {skills.length === 0 ? (
            <div className="px-[22px] py-12 text-center text-sm text-ink-4">
              {emptyLabel}
            </div>
          ) : (
            skills.map((skill, i) => {
              const skillId = skill.id;
              const isSubmitting = Boolean(skillId && submittingId === skillId);
              // Only a draft can be queued — the backend 409s on anything else,
              // and the button has no meaning on a published row. The in-flight
              // row is the exception: its status is already optimistically
              // `review`, and dropping the button mid-submit would erase the
              // only feedback the click produced.
              const canSubmit = Boolean(
                onSubmit && skillId && (skill.status === "draft" || isSubmitting),
              );

              return (
                <div
                  key={skill.id ?? skill.name}
                  className={cn(
                    "grid items-center gap-3.5 px-[22px] py-3.5 transition-colors hover:bg-paper",
                    columns,
                    i < skills.length - 1 && "border-b border-line-soft"
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="grid size-[30px] shrink-0 place-items-center rounded-lg bg-cream text-brand">
                      <AppIcon name="skills" size={16} />
                    </span>
                    <span className="tnum truncate text-[13.5px] font-semibold text-ink">
                      {skill.name}
                    </span>
                  </div>
                  <Badge variant="outline" className="tnum w-fit">
                    {skill.v}
                  </Badge>
                  <div className="flex gap-1.5">
                    {skill.src.length === 0 ? (
                      <span className="text-[13px] text-ink-4">—</span>
                    ) : (
                      skill.src.map((id) => (
                        <SourceIcon key={id} id={id} size={18} branded />
                      ))
                    )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    {skill.calls ? (
                      <>
                        {skill.spark && (
                          <Sparkline
                            data={skill.spark}
                            width={58}
                            height={20}
                            fill={false}
                            color="var(--ink-3)"
                            strokeWidth={1.4}
                          />
                        )}
                        <span className="tnum text-[13px] font-semibold text-ink-2">
                          {skill.calls}
                        </span>
                      </>
                    ) : skill.similarity !== undefined ? (
                      <span className="tnum text-[13px] font-semibold text-ink-3">
                        {Math.round(skill.similarity * 100)}% match
                      </span>
                    ) : (
                      <span className="text-[13px] text-ink-4">—</span>
                    )}
                  </div>
                  {/* Grid items are blockified, so an unsized badge stretches to
                      fill the whole status column instead of hugging its label. */}
                  <StatusBadge status={skill.status} className="w-fit" />
                  <div className="flex items-center justify-end gap-1.5">
                    {canSubmit && skillId && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isSubmitting}
                        onClick={() => onSubmit?.(skillId, skill.name)}
                        aria-label={`Submit ${skill.name} for review`}
                      >
                        {isSubmitting ? "Submitting…" : "Submit"}
                      </Button>
                    )}
                    <button
                      type="button"
                      aria-label={`View ${skill.name} details and version history`}
                      // A row without an id can't be looked up — the browse and
                      // search schemas both carry one, so this only guards the type.
                      disabled={!skillId}
                      onClick={() => skillId && onInspect(skillId, skill.name)}
                      className="grid size-7 shrink-0 place-items-center rounded-md text-ink-3 transition-colors hover:bg-cream hover:text-ink disabled:opacity-40"
                    >
                      <AppIcon name="diff" size={15} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
}
