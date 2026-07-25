import { type ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import { useReview } from "../hooks/useReview";
import type { WriteReviewBody } from "../api";

export interface WriteCorrectionDialogProps {
  trigger: ReactNode;
  title?: string;
  description?: string;
  /** Prefill for the base-logic editor (e.g. the review's proposed text). */
  defaultValue?: string;
  /**
   * The review being corrected. When set, the dialog re-reads it on open so the
   * reviewer edits the *current* proposed text rather than a queue row that may
   * have been fetched minutes ago.
   */
  reviewId?: string;
  submitLabel?: string;
  /** Fired with the authored correction when the reviewer submits. */
  onSubmit: (body: WriteReviewBody) => void;
}

/**
 * A reviewer-authored correction: the human writes the skill's base logic
 * directly. Backs both `POST /reviews/{id}/write` and the "write" choice of a
 * contradiction `resolve`. Publishes at confidence 1.0 on the backend.
 */
export function WriteCorrectionDialog({
  trigger,
  title = "Write the correct logic",
  description = "Replace the proposed change with the correct version. It publishes at full confidence (human-confirmed).",
  defaultValue = "",
  reviewId,
  submitLabel = "Publish correction",
  onSubmit,
}: WriteCorrectionDialogProps) {
  const [open, setOpen] = useState(false);
  // `null` means "untouched", so the prefill can still change underneath the
  // editor when the fresh read lands. Storing a copy of the prefill instead
  // would pin the textarea to whatever was known at mount.
  const [draft, setDraft] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  const { review, isLoading } = useReview(open && reviewId ? reviewId : null);
  const prefill = review?.after ?? defaultValue;
  const baseLogic = draft ?? prefill;

  const reset = () => {
    setDraft(null);
    setComment("");
  };

  const submit = () => {
    const trimmed = baseLogic.trim();
    if (!trimmed) return;
    onSubmit({ baseLogic: trimmed, ...(comment.trim() ? { comment: comment.trim() } : {}) });
    setOpen(false);
    reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="correction-logic" className="text-[13px] font-semibold text-ink-2">
              Correct logic
            </label>
            <Textarea
              id="correction-logic"
              autoFocus
              value={baseLogic}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Refunds are allowed within 30 days of delivery for unopened items…"
              rows={6}
            />
            {isLoading && (
              <span className="text-[12px] text-ink-4">
                Checking for a newer version…
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="correction-comment" className="text-[13px] font-semibold text-ink-2">
              Note <span className="font-normal text-ink-4">(optional)</span>
            </label>
            <Textarea
              id="correction-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Why this is the authoritative version."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="submit" variant="solid" disabled={!baseLogic.trim()}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
