import { useState, type ReactNode } from "react";

import { ErrorState, SectionLabel, Skeleton, SourceTile } from "@/components/shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { SourceMeta } from "@/constants/sources";

import type { DiscardGroup, Source } from "../api";
import { useSourceReport } from "../hooks/useSourceReport";

export interface SourceReadReportDialogProps {
  source: Source;
  meta: SourceMeta;
  trigger: ReactNode;
}

/**
 * "What did this source actually give us?"
 *
 * A source can import its entire history successfully and produce zero skills —
 * a repo's pull requests are records of completed work, which the extraction
 * pipeline rejects on purpose. Without this dialog that outcome is
 * indistinguishable from a broken integration: the card says healthy, the review
 * queue stays empty, and nothing explains the gap.
 *
 * The query stays idle until the dialog opens, so a grid of cards doesn't fire
 * one aggregate request per source on mount.
 */
export function SourceReadReportDialog({
  source,
  meta,
  trigger,
}: SourceReadReportDialogProps) {
  const [open, setOpen] = useState(false);
  const report = useSourceReport(open ? source.id : null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <SourceTile id={source.provider} size={40} iconSize={22} />
            <div className="min-w-0">
              <DialogTitle>What we read from {meta.name}</DialogTitle>
            </div>
          </div>
          <DialogDescription className="pt-1">
            Everything this source has contributed since it was connected, and what
            happened to it.
          </DialogDescription>
        </DialogHeader>

        {report.isPending ? (
          <ReportSkeleton />
        ) : report.isError ? (
          <ErrorState
            error={report.error}
            onRetry={() => void report.refetch()}
            title="Couldn't load the report"
          />
        ) : (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-3 gap-3">
              <Tally label="Items read" value={report.data.itemsRead} />
              <Tally
                label="Became knowledge"
                value={report.data.skillsKept}
                // Zero kept out of a non-empty read is the state worth explaining,
                // and the breakdown below is the explanation.
                tone={
                  report.data.skillsKept === 0 && report.data.itemsRead > 0
                    ? "amber"
                    : "default"
                }
              />
              <Tally label="Not kept" value={report.data.discarded} />
            </div>

            {report.data.pendingItems > 0 && (
              <div className="text-[12.5px] text-ink-3">
                {report.data.pendingItems} item
                {report.data.pendingItems === 1 ? "" : "s"} still being read — these
                numbers will keep moving.
              </div>
            )}

            {report.data.discardedByStage.length > 0 && (
              <div>
                <SectionLabel className="pb-2">Why the rest wasn't kept</SectionLabel>
                <div className="flex flex-col gap-3">
                  {report.data.discardedByStage.map((group) => (
                    <DiscardRow key={group.stage} group={group} />
                  ))}
                </div>
              </div>
            )}

            {report.data.itemsRead === 0 && (
              <div className="text-[13px] text-ink-3">
                Nothing read yet. If this source was connected a while ago, its
                history may never have been imported.
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Tally({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "amber";
}) {
  return (
    <div className="rounded-[9px] bg-cream px-3.5 py-2.5">
      <div
        className={`tnum text-[22px] font-bold leading-none ${
          tone === "amber" ? "text-amber" : "text-ink"
        }`}
      >
        {value}
      </div>
      <div className="mt-1.5 text-[11.5px] text-ink-3">{label}</div>
    </div>
  );
}

/**
 * One reason-bucket. `label` is resolved backend-side from the pipeline stage, so
 * this renders whatever it's given rather than mapping internal stage names here.
 */
function DiscardRow({ group }: { group: DiscardGroup }) {
  return (
    <div className="rounded-lg border border-line p-3">
      <div className="flex items-baseline gap-2">
        <span className="tnum text-[13px] font-bold text-ink">{group.count}</span>
        <span className="text-[13px] text-ink-2">{group.label}</span>
      </div>
      {group.sampleReasons.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1.5">
          {group.sampleReasons.map((reason) => (
            <li
              key={reason}
              className="border-l-2 border-line pl-2.5 text-[12px] italic leading-snug text-ink-3"
            >
              {reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div aria-busy role="status" aria-label="Loading report">
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-[68px]" />
        ))}
      </div>
      <Skeleton className="mt-5 h-[92px] w-full" />
    </div>
  );
}
