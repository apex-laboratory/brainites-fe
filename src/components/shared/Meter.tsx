import { cn } from "@/utils/cn";

export type MeterTone = "ink" | "accent" | "green" | "amber";

const BAR_TONE: Record<MeterTone, string> = {
  ink: "bg-ink",
  accent: "bg-brand",
  green: "bg-green",
  amber: "bg-amber",
};

export interface MeterProps {
  /** Fill percentage 0–100. */
  value: number;
  tone?: MeterTone;
  /** Track classes (e.g. height). */
  className?: string;
}

/**
 * Thin progress bar (the prototype `.meter`). Distinct from shadcn `Progress`
 * because the fill color is data-driven (confidence, health, progress).
 */
export function Meter({ value, tone = "ink", className }: MeterProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("h-[5px] overflow-hidden rounded-full bg-cream", className)}
    >
      <span
        className={cn("block h-full rounded-full transition-all", BAR_TONE[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
