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

import type { AppIconName } from "@/components/shared";

import type { Skill } from "../types";

/** One square icon button in a row's Actions cluster. `danger` tints the hover
 * red for the destructive delete; every button keeps a 28px hit target. */
function IconAction({
  icon,
  label,
  onClick,
  disabled,
  variant = "default",
}: {
  icon: AppIconName;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-md text-ink-3 transition-colors disabled:opacity-40",
        variant === "danger"
          ? "hover:bg-destructive/10 hover:text-destructive"
          : "hover:bg-cream hover:text-ink",
      )}
    >
      <AppIcon name={icon} size={15} />
    </button>
  );
}

// Version, status and the actions cluster hug fixed widths — they hold a badge
// or icon buttons, never prose, and as `fr` tracks they stole width from the
// name column and left the status badge floating mid-cell. The actions column
// widens when the "Submit" button shares it with the edit/view/delete icons.
const COLUMNS = "grid-cols-[2.6fr_72px_0.85fr_1fr_112px_124px]";
const COLUMNS_WITH_SUBMIT = "grid-cols-[2.6fr_72px_0.85fr_1fr_112px_240px]";
const HEADERS = [
  "Skill",
  "Version",
  "Source lineage",
  "Calls · 30d",
  "Status",
  "Actions",
];

export interface SkillsTableProps {
  skills: Skill[];
  /** Shown when there are no rows (differs for browse vs. search). */
  emptyLabel?: string;
  /** Open a row's full body + version history (the "view" action and the
   * clickable skill name both call this). */
  onInspect: (skillId: string, skillName: string) => void;
  /**
   * Open the edit dialog for a row. Omit to hide the edit action — it's gated to
   * editors and admins, so a viewer never sees it.
   */
  onEdit?: (skillId: string, skillName: string) => void;
  /**
   * Delete a row. Omit to hide the delete action — it's admin-only, so lower
   * roles never see it.
   */
  onDelete?: (skillId: string, skillName: string) => void;
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
  onEdit,
  onDelete,
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
        <div className={onSubmit ? "min-w-[920px]" : "min-w-[800px]"}>
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
                    {/* The name is the primary way into a row's detail. A row
                        without an id can't be looked up (guards the type only —
                        both schemas carry one), so it falls back to plain text. */}
                    {skillId ? (
                      <button
                        type="button"
                        onClick={() => onInspect(skillId, skill.name)}
                        className="tnum truncate rounded-sm text-left text-[13.5px] font-semibold text-ink transition-colors hover:text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`Open ${skill.name} details`}
                      >
                        {skill.name}
                      </button>
                    ) : (
                      <span className="tnum truncate text-[13.5px] font-semibold text-ink">
                        {skill.name}
                      </span>
                    )}
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
                  <div className="flex items-center justify-end gap-1">
                    {canSubmit && skillId && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isSubmitting}
                        onClick={() => onSubmit?.(skillId, skill.name)}
                        aria-label={`Submit ${skill.name} for review`}
                        className="mr-1"
                      >
                        {isSubmitting ? "Submitting…" : "Submit"}
                      </Button>
                    )}
                    {/* Edit — editor/admin only (hidden when `onEdit` is omitted). */}
                    {onEdit && skillId && (
                      <IconAction
                        icon="edit"
                        label={`Edit ${skill.name}`}
                        onClick={() => onEdit(skillId, skill.name)}
                      />
                    )}
                    {/* View — available to everyone; also reachable via the name. */}
                    <IconAction
                      icon="view"
                      label={`View ${skill.name} details and version history`}
                      // A row without an id can't be looked up — the browse and
                      // search schemas both carry one, so this only guards the type.
                      disabled={!skillId}
                      onClick={() => skillId && onInspect(skillId, skill.name)}
                    />
                    {/* Delete — admin only (hidden when `onDelete` is omitted). */}
                    {onDelete && skillId && (
                      <IconAction
                        icon="delete"
                        label={`Delete ${skill.name}`}
                        variant="danger"
                        onClick={() => onDelete(skillId, skill.name)}
                      />
                    )}
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
