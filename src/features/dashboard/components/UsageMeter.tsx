import { SectionLabel, Skeleton, Sparkline } from "@/components/shared";

import { useUsage } from "../hooks/useUsage";

/**
 * Brain usage summary pinned to the foot of the expanded sidebar.
 *
 * Shows the measured 30-day query count and its 7-day shape. Deliberately not a
 * progress bar: there is no quota behind `GET /usage`, so a "% of limit" would
 * be an invented number.
 */
export function UsageMeter() {
  const { usage, isPending, isError } = useUsage();

  if (isError) return null; // an accessory panel; never a sidebar error state

  return (
    <div className="mt-2 border-t border-line px-2.5 py-3">
      <div className="mb-2 flex items-center justify-between">
        <SectionLabel className="whitespace-nowrap pb-0">Brain usage</SectionLabel>
        {isPending ? (
          <Skeleton className="h-[13px] w-10" />
        ) : (
          <span className="tnum text-[11.5px] font-semibold text-ink-3">
            {usage?.queries30d ?? 0}
          </span>
        )}
      </div>
      {isPending ? (
        <Skeleton className="h-[28px] w-full" />
      ) : (
        <Sparkline
          data={usage?.querySeries ?? []}
          width={168}
          height={28}
          color="var(--accent-hex)"
        />
      )}
      <p className="mt-2 text-[11.5px] text-ink-4">
        {isPending ? "Loading usage…" : "queries in the last 30 days"}
      </p>
    </div>
  );
}
