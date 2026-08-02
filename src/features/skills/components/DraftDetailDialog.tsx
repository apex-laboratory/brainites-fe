import { useEffect, useState } from "react";

import {
  AppIcon,
  SectionLabel,
  SourceIcon,
  StatusBadge,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { asSourceId } from "@/constants/sources";
import { formatRelativeTime } from "@/utils/date";

import { asStatus } from "../mappers";
import { SUBMIT_NOTE_MAX_LENGTH, type SkillListItem } from "../api";

/**
 * `exceptionsBlock` is a bare list on the backend with no committed element
 * shape (mirrors `SkillDetailDialog`'s `RawBlock`).
 */
function RawBlock({ items }: { items: unknown[] }) {
  return (
    <pre className="max-h-52 overflow-auto rounded-[10px] border border-line-soft bg-cream px-3.5 py-2.5 font-mono text-[12px] leading-relaxed text-ink-2">
      {JSON.stringify(items, null, 2)}
    </pre>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <SectionLabel className="pb-0">{label}</SectionLabel>
      {children}
    </div>
  );
}

export interface DraftDetailDialogProps {
  /**
   * The draft row to inspect, straight from the `GET /skills?status=draft`
   * list — `/skills/{id}` is published-only and 404s on a draft, so there's
   * nothing to fetch here. `null` keeps the dialog closed.
   */
  item: SkillListItem | null;
  onClose: () => void;
  /**
   * Queue this draft for review with an optional reviewer note. Omit to keep
   * the dialog read-only — submitting is admin-only, so a viewer/editor never
   * gets the footer.
   */
  onSubmit?: (note?: string) => void;
  /** The submit is in flight; disables the footer button. */
  isSubmitting?: boolean;
}

/**
 * Draft inspector. Skills below the review-queue confidence floor never get a
 * `reviews` row, so unlike a published skill there's no version history and no
 * live endpoint to poll — this just renders the list row.
 *
 * An admin can promote the draft from here via `POST /skills/{id}/submit`,
 * attaching a note the reviewer sees on the card (the note lands on the review,
 * not on the skill, so it never becomes part of the published logic).
 *
 * Laid out as a fixed header over a scrolling body: draft names run long, and
 * a wrapping title in the scroll flow used to run under the close button.
 */
export function DraftDetailDialog({
  item,
  onClose,
  onSubmit,
  isSubmitting = false,
}: DraftDetailDialogProps) {
  const authority = asSourceId(item?.sourceAuthority);
  const captured = item?.updatedAt ? formatRelativeTime(item.updatedAt) : null;
  const [note, setNote] = useState("");

  // Clear the note whenever a different draft is opened — carrying one row's
  // reviewer context onto the next row's review card would be a silent mix-up.
  useEffect(() => setNote(""), [item?.id]);

  const noteTooLong = note.length > SUBMIT_NOTE_MAX_LENGTH;
  const canSubmit = Boolean(onSubmit) && !isSubmitting && !noteTooLong;

  return (
    <Dialog open={item !== null} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="flex max-h-[85vh] max-w-[620px] flex-col gap-0 overflow-hidden p-0">
        {/* `pr-14` keeps the wrapped title clear of the absolute close button. */}
        <DialogHeader className="shrink-0 gap-3 space-y-0 border-b border-line bg-paper px-6 pb-4 pr-14 pt-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid size-[30px] shrink-0 place-items-center rounded-lg bg-cream text-brand">
              <AppIcon name="skills" size={16} />
            </span>
            <div className="flex min-w-0 flex-col gap-2">
              <DialogTitle className="break-words text-[16px] leading-snug">
                {item?.name ?? "Skill"}
              </DialogTitle>
              {item && (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="tnum">
                    {item.version}
                  </Badge>
                  <StatusBadge status={asStatus(item.status)} />
                  {captured && (
                    <span className="flex items-center gap-1 text-[12px] text-ink-4">
                      <AppIcon name="clock" size={13} />
                      Captured {captured}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-5">
          <DialogDescription className="flex items-start gap-2.5 rounded-[10px] border border-line-soft bg-cream px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-3">
            <AppIcon
              name="warning"
              size={14}
              className="mt-[3px] shrink-0 text-amber"
            />
            <span>
              Below the review-queue confidence floor — extracted, but not
              queued for approval.
              {onSubmit
                ? " Submit it to put it in front of a reviewer."
                : " Read-only."}
            </span>
          </DialogDescription>

          {item && (
            <div className="mt-5 flex flex-col gap-5">
              <Field label="Base logic">
                <p className="whitespace-pre-line text-[13.5px] leading-relaxed text-ink">
                  {item.baseLogic || "—"}
                </p>
              </Field>

              {item.exceptionsBlock.length > 0 && (
                <Field label={`Exceptions · ${item.exceptionsBlock.length}`}>
                  <RawBlock items={item.exceptionsBlock} />
                </Field>
              )}

              {item.description && (
                <Field label="Notes">
                  <p className="text-[13.5px] leading-relaxed text-ink-2">
                    {item.description}
                  </p>
                </Field>
              )}

              {authority && (
                <div className="flex items-center gap-1.5 border-t border-line-soft pt-4 text-[12.5px] text-ink-3">
                  <SourceIcon id={authority} size={16} branded />
                  Source of authority
                </div>
              )}

              {onSubmit && (
                <Field label="Note for the reviewer · optional">
                  <Textarea
                    id="draft-submit-note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Confirmed with the billing lead — ready to publish."
                    rows={2}
                    aria-invalid={noteTooLong}
                  />
                  {noteTooLong && (
                    <span className="text-[12px] text-destructive">
                      {note.length.toLocaleString()} / {SUBMIT_NOTE_MAX_LENGTH.toLocaleString()}{" "}
                      characters — trim it before submitting.
                    </span>
                  )}
                </Field>
              )}
            </div>
          )}
        </div>

        {item && onSubmit && (
          <div className="flex shrink-0 justify-end gap-2 border-t border-line bg-paper px-6 py-4">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="solid"
              size="sm"
              disabled={!canSubmit}
              onClick={() => onSubmit(note.trim() || undefined)}
            >
              <AppIcon name="review" size={15} />
              {isSubmitting ? "Submitting…" : "Submit for review"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
