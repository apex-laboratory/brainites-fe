import type { Stat } from "@/components/shared";
import { SOURCE_ORDER, SOURCES, type SourceMeta } from "@/constants/sources";

import { SOURCE_HEALTH } from "../data/source-health";
import type { SourceHealth } from "../types";

export type SourceHealthEntry = {
  meta: SourceMeta;
  health: SourceHealth;
};

/** Read model for the Sources screen: per-source records + summary stats. */
export function useSourceHealth() {
  const sources: SourceHealthEntry[] = SOURCE_ORDER.map((id) => ({
    meta: SOURCES[id],
    health: SOURCE_HEALTH[id],
  }));

  const count = SOURCE_ORDER.length;
  const totalPending = SOURCE_ORDER.reduce(
    (sum, id) => sum + SOURCE_HEALTH[id].pending,
    0
  );
  const avgHealth = Math.round(
    SOURCE_ORDER.reduce((sum, id) => sum + SOURCE_HEALTH[id].health, 0) / count
  );

  const stats: Stat[] = [
    { label: "Sources connected", value: `${count} / ${count}` },
    { label: "Avg. health", value: `${avgHealth}%` },
    { label: "Pending items", value: totalPending },
    { label: "Knowledge extracted", value: "378" },
  ];

  return { sources, stats };
}
