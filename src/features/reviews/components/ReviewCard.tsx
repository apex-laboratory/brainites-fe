import { useEffect, useRef, useState } from "react";

import { AppIcon, SectionLabel, SourceIcon } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils/cn";

import type { Review } from "../types";
import type { ReviewVerdict } from "../hooks/useReviews";
import type { ResolveContradictionBody, WriteReviewBody } from "../api";
import { ConfidenceMeter } from "./ConfidenceMeter";
import { WriteCorrectionDialog } from "./WriteCorrectionDialog";

/** Which way the card slides as it leaves the queue. */
type ExitDir = "right" | "left" | "up";

/** Exit animation, landing just inside the card's 300ms transition. */
const EXIT_MS = 280;

export interface ReviewCardProps {
  review: Review;
  onResolve: (id: string, verdict: ReviewVerdict) => void;
  onWrite: (id: string, body: WriteReviewBody) => void;
  onResolveContradiction: (id: string, body: ResolveContradictionBody) => void;
  /** Whether this card is checked for bulk approve. */
  selected?: boolean;
  /** Toggle bulk-approve selection. Omit to hide the checkbox entirely. */
  onToggleSelect?: (id: string) => void;
}

/** A single review card. Plain reviews approve / reject / write-correct;
 * contradiction reviews pick an authoritative source or write the fix. */
export function ReviewCard({
  review,
  onResolve,
  onWrite,
  onResolveContradiction,
  selected = false,
  onToggleSelect,
}: ReviewCardProps) {
  const [exit, setExit] = useState<ExitDir | null>(null);
  const resolving = exit !== null;

  /** The resolution waiting on the exit animation, if one is in flight. */
  const pending = useRef<{ timer: number; run: () => void } | null>(null);

  // Play a brief exit animation, then run the resolution once it's off-screen.
  // Idempotent: once a dismissal is animating out, later clicks are ignored so a
  // double-click can't fire the resolve mutation (and its POST) twice.
  const dismiss = (dir: ExitDir, run: () => void) => {
    if (resolving) return;
    setExit(dir);
    const timer = window.setTimeout(() => {
      pending.current = null;
      run();
    }, EXIT_MS);
    pending.current = { timer, run };
  };

  // Unmounting mid-animation (navigating away, the queue refetching underneath
  // us) makes the animation moot but not the user's decision — so flush the
  // resolution rather than dropping it on the floor. Cancelling instead would
  // silently discard an approval the user already clicked.
  useEffect(
    () => () => {
      const inFlight = pending.current;
      if (!inFlight) return;
      pending.current = null;
      window.clearTimeout(inFlight.timer);
      inFlight.run();
    },
    [],
  );

  const act = (verdict: ReviewVerdict) =>
    dismiss(verdict === "approve" ? "right" : "left", () => onResolve(review.id, verdict));

  const applyWrite = (body: WriteReviewBody) =>
    dismiss("up", () => onWrite(review.id, body));

  const applyResolve = (body: ResolveContradictionBody) =>
    dismiss("up", () => onResolveContradiction(review.id, body));

  return (
    <Card
      className={cn(
        "overflow-hidden p-0 transition-[opacity,transform] duration-300 ease-out",
        exit === "right" && "translate-x-10 opacity-0",
        exit === "left" && "-translate-x-10 opacity-0",
        exit === "up" && "-translate-y-6 opacity-0"
      )}
    >
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-2.5">
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect(review.id)}
              aria-label={`Select "${review.title}" for bulk approve`}
              className="size-4 cursor-pointer accent-green"
            />
          )}
          <Badge variant="accent">{review.kind}</Badge>
          {(review.src || review.where) && (
            <span className="flex items-center gap-1.5 text-[12.5px] text-ink-3">
              {review.src && <SourceIcon id={review.src} size={14} branded />}
              {review.where}
            </span>
          )}
          <span className="ml-auto">
            <ConfidenceMeter value={review.conf} />
          </span>
        </div>

        <div className="text-lg font-bold tracking-[-0.015em] text-ink">
          {review.title}
        </div>

        {/* before / after diff */}
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <div className="flex-1 rounded-[10px] border border-[#C0392B]/20 bg-[#C0392B]/[0.06] px-3.5 py-2.5">
            <SectionLabel className="pb-0 text-[9.5px] text-[#B0463A]">
              − Before
            </SectionLabel>
            <div className="mt-1.5 text-[13.5px] text-ink-2 line-through decoration-[#C0392B]/50">
              {review.before}
            </div>
          </div>
          <div className="flex-1 rounded-[10px] border border-green/30 bg-green-soft px-3.5 py-2.5">
            <SectionLabel className="pb-0 text-[9.5px] text-green">
              + After
            </SectionLabel>
            <div className="mt-1.5 text-[13.5px] font-semibold text-ink">
              {review.after}
            </div>
          </div>
        </div>

        {/* evidence */}
        <div className="rounded-[10px] border-l-2 border-brand bg-cream px-4 py-3">
          <div className="text-sm italic leading-relaxed text-ink-2">
            {review.quote}
          </div>
          <div className="mt-2 text-[12.5px] text-ink-3">{review.who}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 border-t border-line bg-paper px-6 py-3">
        <SectionLabel className="pb-0 text-ink-4">
          {review.isContradiction ? "Two sources disagree — pick one" : "Review in under 30s"}
        </SectionLabel>
        {review.isContradiction ? (
          <div className="ml-auto flex flex-wrap gap-2.5">
            <Button
              variant="outline"
              size="sm"
              disabled={resolving}
              onClick={() => applyResolve({ choice: "source_a" })}
            >
              Keep current
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={resolving}
              onClick={() => applyResolve({ choice: "source_b" })}
            >
              Use proposed
            </Button>
            <WriteCorrectionDialog
              title="Write the authoritative version"
              description="Neither source is right on its own — write the correct logic. It publishes at full confidence."
              defaultValue={review.after}
              submitLabel="Resolve with this"
              onSubmit={(body) => applyResolve({ choice: "write", correction: body })}
              trigger={
                <Button variant="outline" size="sm">
                  <AppIcon name="diff" size={15} />
                  Write version
                </Button>
              }
            />
          </div>
        ) : (
          <div className="ml-auto flex flex-wrap gap-2.5">
            <Button
              variant="outline"
              size="sm"
              disabled={resolving}
              onClick={() => act("reject")}
            >
              <AppIcon name="close" size={15} />
              Reject
            </Button>
            <WriteCorrectionDialog
              defaultValue={review.after}
              onSubmit={applyWrite}
              trigger={
                <Button variant="outline" size="sm">
                  <AppIcon name="diff" size={15} />
                  Write correction
                </Button>
              }
            />
            <Button
              size="sm"
              disabled={resolving}
              className="bg-green text-white shadow-soft-1 hover:bg-green/90"
              onClick={() => act("approve")}
            >
              <AppIcon name="check" size={15} />
              Approve
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
