import { useState } from "react";

import { AppIcon, SectionLabel, SourceIcon } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils/cn";

import type { Review } from "../types";
import type { ReviewVerdict } from "../hooks/useReviews";
import type { WriteReviewBody } from "../api";
import { ConfidenceMeter } from "./ConfidenceMeter";
import { WriteCorrectionDialog } from "./WriteCorrectionDialog";

/** Which way the card slides as it leaves the queue. */
type ExitDir = "right" | "left" | "up";

export interface ReviewCardProps {
  review: Review;
  onResolve: (id: string, verdict: ReviewVerdict) => void;
  onWrite: (id: string, body: WriteReviewBody) => void;
}

/** A single review with before/after diff and approve / reject / write-correction. */
export function ReviewCard({ review, onResolve, onWrite }: ReviewCardProps) {
  const [exit, setExit] = useState<ExitDir | null>(null);

  // Play a brief exit animation, then run the resolution once it's off-screen.
  const dismiss = (dir: ExitDir, run: () => void) => {
    setExit(dir);
    window.setTimeout(run, 280);
  };

  const act = (verdict: ReviewVerdict) =>
    dismiss(verdict === "approve" ? "right" : "left", () => onResolve(review.id, verdict));

  const applyWrite = (body: WriteReviewBody) =>
    dismiss("up", () => onWrite(review.id, body));

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

      <div className="flex items-center gap-2.5 border-t border-line bg-paper px-6 py-3">
        <SectionLabel className="pb-0 text-ink-4">Review in under 30s</SectionLabel>
        <div className="ml-auto flex gap-2.5">
          <Button variant="outline" size="sm" onClick={() => act("reject")}>
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
            className="bg-green text-white shadow-soft-1 hover:bg-green/90"
            onClick={() => act("approve")}
          >
            <AppIcon name="check" size={15} />
            Approve
          </Button>
        </div>
      </div>
    </Card>
  );
}
