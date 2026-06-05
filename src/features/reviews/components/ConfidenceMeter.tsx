import { Meter, type MeterTone } from "@/components/shared";

export interface ConfidenceMeterProps {
  /** Confidence 0–100. */
  value: number;
}

function toneFor(value: number): MeterTone {
  if (value >= 90) return "green";
  if (value >= 82) return "ink";
  return "amber";
}

/** Inline confidence meter + percentage (prototype `Conf`). */
export function ConfidenceMeter({ value }: ConfidenceMeterProps) {
  return (
    <div className="flex min-w-24 items-center gap-2">
      <Meter value={value} tone={toneFor(value)} className="flex-1" />
      <span className="tnum text-xs font-semibold text-ink-3">{value}%</span>
    </div>
  );
}
