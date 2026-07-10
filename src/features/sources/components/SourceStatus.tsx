import { StatusIndicator } from "@/components/shared";
import { formatRelativeTime } from "@/utils/date";
import { cn } from "@/utils/cn";

import type { Source } from "../api";
import { TONE_TEXT, describeSource } from "../utils/status";

/** Status dot + label + last-synced time. */
export function SourceStatusLine({
  source,
  className,
}: {
  source: Source;
  className?: string;
}) {
  const { tone, label, pulse } = describeSource(source);
  const syncedAt = formatRelativeTime(source.lastSyncedAt);

  return (
    <div className={cn("flex items-center gap-1.5 whitespace-nowrap", className)}>
      <StatusIndicator
        tone={tone}
        pulse={pulse}
        label={label}
        labelClassName={cn("text-[12.5px] font-semibold", TONE_TEXT[tone])}
      />
      <span className="text-[12.5px] text-ink-4">
        {syncedAt ? `· synced ${syncedAt}` : "· never synced"}
      </span>
    </div>
  );
}
