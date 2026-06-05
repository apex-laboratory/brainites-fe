import { cn } from "@/utils/cn";

export type StatusTone = "live" | "green" | "amber" | "accent" | "neutral";

const DOT_COLOR: Record<StatusTone, string> = {
  live: "bg-green",
  green: "bg-green",
  amber: "bg-amber",
  accent: "bg-primary",
  neutral: "bg-ink-4",
};

export interface StatusIndicatorProps {
  tone?: StatusTone;
  label?: string;
  /** Subtle pulse for live/sync states. */
  pulse?: boolean;
  className?: string;
}

/**
 * Small status dot for live/sync states. Always paired with (or labelled
 * by) text so meaning never relies on color alone.
 */
export function StatusIndicator({
  tone = "neutral",
  label,
  pulse = false,
  className,
}: StatusIndicatorProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      role="status"
      aria-label={label ?? tone}
    >
      <span className="relative flex size-2">
        {pulse && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full rounded-full opacity-60 motion-safe:animate-ping",
              DOT_COLOR[tone]
            )}
          />
        )}
        <span
          className={cn(
            "relative inline-flex size-2 rounded-full",
            DOT_COLOR[tone]
          )}
        />
      </span>
      {label && <span className="text-xs text-ink-3">{label}</span>}
    </span>
  );
}
