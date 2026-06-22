import { useEffect, useState } from "react";

import { useMediaQuery } from "@/hooks";
import { SOURCE_ORDER, SOURCES, type SourceMeta } from "@/constants/sources";
import type { SourceId } from "@/types/common";

import { SOURCE_ACTIVITY } from "../data/source-activity";

/** How often the simulated ingestion progress advances. */
const TICK_MS = 110;

/** Per-source advance per tick (in % points). Deterministic and varied so
 * rows progress out of sync, the way independent sync workers would. */
const SPEED: Record<SourceId, number> = {
  slack: 2.4,
  notion: 1.6,
  github: 3.1,
  jira: 1.9,
  zendesk: 2.7,
  googledrive: 2.1,
};

/** Staggered starting offsets so the rows don't all begin in lockstep. */
const OFFSET: Record<SourceId, number> = {
  slack: 30,
  notion: 165,
  github: 80,
  jira: 220,
  zendesk: 120,
  googledrive: 195,
};

export type SourceActivityEntry = {
  meta: SourceMeta;
  /** Present-participle verb, e.g. "Reading". */
  verb: string;
  /** What the source is reading right now (channel / page / repo). */
  target: string;
  /** 0–100 progress through the current target. */
  progress: number;
};

/**
 * Live "Reading now" read model: surfaces what each connected source is
 * ingesting right now, with a progress bar that ticks forward and rolls onto
 * the next target. Reduced-motion users see a stable snapshot instead of
 * animation. The single side effect here is the timer.
 */
export function useSourceActivity() {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [elapsed, setElapsed] = useState<Record<SourceId, number>>(OFFSET);

  useEffect(() => {
    if (reduced) return;
    const timer = setInterval(() => {
      setElapsed((prev) => {
        const next = { ...prev };
        for (const id of SOURCE_ORDER) next[id] = prev[id] + SPEED[id];
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [reduced]);

  const sources: SourceActivityEntry[] = SOURCE_ORDER.map((id) => {
    const activity = SOURCE_ACTIVITY[id];
    const value = elapsed[id];
    const index = Math.floor(value / 100) % activity.targets.length;
    return {
      meta: SOURCES[id],
      verb: activity.verb,
      target: activity.targets[index],
      progress: Math.round(value % 100),
    };
  });

  return { sources };
}
