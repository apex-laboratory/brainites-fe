import {
  AppIcon,
  ErrorState,
  SectionLabel,
  Skeleton,
  SourceIcon,
  StatusBadge,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { asSourceIds } from "@/constants/sources";
import { formatRelativeTime } from "@/utils/date";

import { useSkill } from "../hooks/useSkill";
import { asStatus } from "../mappers";
import type { SkillVersionOut } from "../api";

export interface SkillDetailDialogProps {
  /** The skill to inspect; `null` keeps the dialog closed and both queries idle. */
  skillId: string | null;
  /** Name from the table row, shown as the title until the fetch lands. */
  skillName?: string;
  onClose: () => void;
}

/**
 * `exceptionsBlock` and `actions` are bare lists on the backend with no
 * committed element shape, so there's nothing honest to render them *as*. Show
 * the raw JSON rather than inventing a structure the backend hasn't promised.
 */
function RawBlock({ items }: { items: unknown[] }) {
  return (
    <pre className="max-h-52 overflow-auto rounded-[10px] bg-cream px-3.5 py-2.5 font-mono text-[12px] leading-relaxed text-ink-2">
      {JSON.stringify(items, null, 2)}
    </pre>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <SectionLabel className="pb-0">{label}</SectionLabel>
      {children}
    </div>
  );
}

/** One entry in the version timeline. */
function VersionRow({ version, isCurrent }: { version: SkillVersionOut; isCurrent: boolean }) {
  return (
    <li className="relative flex flex-col gap-1.5 border-l border-line pb-4 pl-4 last:pb-0">
      <span
        className={`absolute -left-[4.5px] top-1.5 size-2 rounded-full ${
          isCurrent ? "bg-brand" : "bg-line"
        }`}
        aria-hidden
      />
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="tnum">
          {version.version}
        </Badge>
        {isCurrent && <Badge variant="green">Current</Badge>}
        {version.changeType && (
          <span className="text-[12px] text-ink-3">{version.changeType}</span>
        )}
        {version.confidence != null && (
          <span className="tnum text-[12px] text-ink-4">
            {Math.round(version.confidence * 100)}% confidence
          </span>
        )}
        <span className="ml-auto text-[12px] text-ink-4">
          {formatRelativeTime(version.createdAt) ?? "—"}
        </span>
      </div>
      {version.baseLogic && (
        <p className="whitespace-pre-line text-[13px] leading-relaxed text-ink-2">
          {version.baseLogic}
        </p>
      )}
    </li>
  );
}

/**
 * Full skill body plus its version history, opened from the registry table.
 *
 * A dialog rather than a route: the table carries live search and paginated
 * browse state, and navigating away to a detail page would throw both away on
 * the trip back.
 */
export function SkillDetailDialog({
  skillId,
  skillName,
  onClose,
}: SkillDetailDialogProps) {
  const {
    skill,
    versions,
    isPending,
    isError,
    error,
    versionsFailed,
    isLoadingVersions,
    refetch,
  } = useSkill(skillId);

  const sources = asSourceIds(skill?.sourceProviders ?? []);

  return (
    <Dialog open={skillId !== null} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="flex max-h-[85vh] max-w-[640px] flex-col gap-0 overflow-hidden p-0">
        {/* `pr-14` keeps the wrapped title clear of the absolute close button. */}
        <DialogHeader className="shrink-0 gap-3 space-y-0 border-b border-line bg-paper px-6 pb-4 pr-14 pt-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid size-[30px] shrink-0 place-items-center rounded-lg bg-cream text-brand">
              <AppIcon name="skills" size={16} />
            </span>
            <div className="flex min-w-0 flex-col gap-2">
              <DialogTitle className="break-words text-[16px] leading-snug">
                {skill?.name ?? skillName ?? "Skill"}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2">
                {skill && (
                  <>
                    <Badge variant="outline" className="tnum">
                      {skill.version}
                    </Badge>
                    <StatusBadge status={asStatus(skill.status)} />
                  </>
                )}
                <DialogDescription className="text-[12px] text-ink-4">
                  {skill?.updatedAt
                    ? `Updated ${formatRelativeTime(skill.updatedAt) ?? "recently"}.`
                    : "The executable logic your agents call, and how it got here."}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-5">
          {isError ? (
            <ErrorState
              error={error}
              onRetry={refetch}
              title="Couldn't load this skill"
            />
          ) : isPending || !skill ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {skill.trigger && (
                <Field label="Trigger">
                  <p className="text-[13.5px] leading-relaxed text-ink-2">
                    {skill.trigger}
                  </p>
                </Field>
              )}

              <Field label="Base logic">
                <p className="whitespace-pre-line text-[13.5px] leading-relaxed text-ink">
                  {skill.baseLogic || "—"}
                </p>
              </Field>

              {skill.exceptionsBlock.length > 0 && (
                <Field label={`Exceptions · ${skill.exceptionsBlock.length}`}>
                  <RawBlock items={skill.exceptionsBlock} />
                </Field>
              )}

              {skill.actions.length > 0 && (
                <Field label={`Actions · ${skill.actions.length}`}>
                  <RawBlock items={skill.actions} />
                </Field>
              )}

              {(sources.length > 0 || skill.confidence != null) && (
                <div className="flex flex-wrap items-center gap-4 border-t border-line-soft pt-4">
                  {sources.length > 0 && (
                    <span className="flex items-center gap-1.5 text-[12.5px] text-ink-3">
                      <span className="flex gap-1">
                        {sources.map((id) => (
                          <SourceIcon key={id} id={id} size={16} branded />
                        ))}
                      </span>
                      {sources.length > 1
                        ? `Derived from ${sources.length} sources`
                        : "Source lineage"}
                    </span>
                  )}
                  {skill.confidence != null && (
                    <span className="tnum text-[12.5px] text-ink-3">
                      {Math.round(skill.confidence * 100)}% confidence
                    </span>
                  )}
                </div>
              )}

              <Field label="Version history">
                {versionsFailed ? (
                  <p className="text-[13px] text-ink-4">
                    Couldn't load the version history.
                  </p>
                ) : isLoadingVersions ? (
                  <Skeleton className="h-16 rounded-xl" />
                ) : versions.length === 0 ? (
                  <p className="text-[13px] text-ink-4">
                    No earlier versions — this is the first published revision.
                  </p>
                ) : (
                  <ol className="mt-1 flex flex-col">
                    {versions.map((version, i) => (
                      <VersionRow
                        key={version.version}
                        version={version}
                        isCurrent={i === 0}
                      />
                    ))}
                  </ol>
                )}
              </Field>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
