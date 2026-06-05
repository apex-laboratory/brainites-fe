import { Progress } from "@/components/ui/progress";
import { SectionLabel } from "@/components/shared";

import { BRAIN_USAGE } from "../data/workspace";

/** Brain usage meter pinned to the foot of the expanded sidebar. */
export function UsageMeter() {
  return (
    <div className="mt-2 border-t border-line px-2.5 py-3">
      <div className="mb-2 flex items-center justify-between">
        <SectionLabel className="whitespace-nowrap pb-0">Brain usage</SectionLabel>
        <span className="tnum text-[11.5px] font-semibold text-ink-3">
          {BRAIN_USAGE.percent}%
        </span>
      </div>
      <Progress
        value={BRAIN_USAGE.percent}
        className="h-[5px]"
        aria-label={`Brain usage ${BRAIN_USAGE.percent} percent`}
      />
      <p className="mt-2 text-[11.5px] text-ink-4">
        {BRAIN_USAGE.used} of {BRAIN_USAGE.limit} queries {BRAIN_USAGE.period}
      </p>
    </div>
  );
}
