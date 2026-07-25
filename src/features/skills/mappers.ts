import { asSourceIds } from "@/constants/sources";
import { formatCompact } from "@/utils/format";
import { formatRelativeTime } from "@/utils/date";

import type { SkillListItem, SkillSearchResult } from "./api";
import type { Skill, SkillStatus } from "./types";

/** A published skill is `active`/`stable`; anything else falls back to `stable`. */
export function asStatus(status: string | null | undefined): SkillStatus {
  return status === "active" || status === "draft" || status === "review"
    ? status
    : "stable";
}

/**
 * Turn backend usage metrics into the table's display fields. A skill with no
 * recorded interactions (empty series) carries no metrics, so the table renders
 * the placeholder (or, for a search hit, the `% match`) instead.
 */
function mapMetrics(calls30d: number, callSeries: number[], updatedAt?: string | null) {
  // The 30-day count and the 7-day sparkline are independent windows: show the
  // count whenever there were calls in the last 30 days, even if the last 7 were
  // quiet, and draw the sparkline only when the 7-day series actually has data.
  return {
    calls: calls30d > 0 ? formatCompact(calls30d) : undefined,
    spark: callSeries.some((n) => n > 0) ? callSeries : undefined,
    updated: formatRelativeTime(updatedAt) ?? undefined,
  };
}

/** Map a browse-list row onto the table's view model. */
export function mapListItem(r: SkillListItem): Skill {
  return {
    id: r.id,
    name: r.name,
    v: r.version,
    src: asSourceIds(r.sourceProviders),
    status: asStatus(r.status),
    ...mapMetrics(r.calls30d, r.callSeries, r.updatedAt),
  };
}

/** Map a search hit onto the table's view model (adds `similarity`). */
export function mapSearchHit(r: SkillSearchResult): Skill {
  return {
    id: r.id,
    name: r.name,
    v: r.version,
    src: asSourceIds([r.sourceAuthority]),
    status: asStatus(r.status),
    similarity: r.similarity,
    ...mapMetrics(r.calls30d, r.callSeries, r.updatedAt),
  };
}
