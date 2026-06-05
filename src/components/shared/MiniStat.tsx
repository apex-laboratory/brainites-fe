import { cn } from "@/utils/cn";

import { SectionLabel } from "./SectionLabel";

export interface MiniStatProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

/** Small label/value tile on a cream surface (prototype `Mini`). */
export function MiniStat({ label, value, className }: MiniStatProps) {
  return (
    <div className={cn("rounded-[9px] bg-cream px-3.5 py-2.5", className)}>
      <SectionLabel className="pb-0">{label}</SectionLabel>
      <div className="tnum mt-1 text-[14.5px] font-semibold tracking-[-0.01em] text-ink">
        {value}
      </div>
    </div>
  );
}
