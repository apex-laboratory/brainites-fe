import { Meter, SourceIcon, StatusIndicator } from "@/components/shared";
import { cn } from "@/utils/cn";

import type { SourceActivityEntry } from "../hooks/useSourceActivity";

export interface SourceActivityRowProps {
  entry: SourceActivityEntry;
  className?: string;
}

/** A single live-ingestion row: source name + what it's reading right now,
 * with a progress bar — the "Claude is reading X" status, per source. */
export function SourceActivityRow({ entry, className }: SourceActivityRowProps) {
  const { meta, verb, target, progress } = entry;

  return (
    <div className={cn("px-[18px] py-3", className)}>
      <div className="flex items-center gap-3">
        <SourceIcon id={meta.id} size={17} branded />
        <div className="flex min-w-0 flex-1 items-baseline gap-1.5">
          <span className="text-[13px] font-semibold tracking-[-0.01em] text-ink">
            {meta.name}
          </span>
          <span className="truncate text-[12.5px] text-ink-3">
            {verb}{" "}
            <span className="font-medium text-ink-2">{target}</span>
            <span className="text-ink-4">…</span>
          </span>
        </div>
        <StatusIndicator
          tone="live"
          pulse
          label={`${verb} ${target}`}
          className="shrink-0"
        />
      </div>
      <Meter value={progress} tone="accent" className="mt-2" />
    </div>
  );
}
