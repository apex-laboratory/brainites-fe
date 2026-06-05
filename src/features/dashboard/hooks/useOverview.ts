import { SOURCE_ORDER, SOURCES } from "@/constants/sources";
import { DECISIONS } from "@/features/decisions";
import { REVIEWS } from "@/features/reviews";
import { SOURCE_HEALTH } from "@/features/sources";
import type { SourceHealth } from "@/features/sources/types";
import type { SourceMeta } from "@/constants/sources";

import { ACTIVITY } from "../data/activity";
import { RECENT_QUESTIONS } from "../data/recent-questions";
import { CURRENT_USER } from "../data/workspace";
import type { KpiTileData } from "../components/KpiTile";

const KPIS: KpiTileData[] = [
  { n: 184, label: "Decisions", icon: "decision", spark: [120, 138, 150, 162, 170, 178, 184], trend: 8 },
  { n: 52, label: "Policies", icon: "document", spark: [30, 36, 40, 44, 46, 49, 52], trend: 6 },
  { n: 37, label: "Skills live", icon: "skills", spark: [12, 18, 22, 26, 30, 34, 37], trend: 12 },
  { n: 3, label: "Awaiting review", icon: "review", accent: true, spark: [6, 5, 7, 4, 5, 4, 3], trend: -25 },
];

function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export type SourceHealthRow = SourceHealth & { meta: SourceMeta };

/**
 * Read model for the Overview screen. Pulls the static fixtures together so
 * the page stays a thin composition layer.
 */
export function useOverview() {
  const greeting = greetingForHour(new Date().getHours());
  const firstName = CURRENT_USER.name.split(" ")[0];

  const sourceHealth: SourceHealthRow[] = SOURCE_ORDER.map((id) => ({
    ...SOURCE_HEALTH[id],
    meta: SOURCES[id],
  }));

  return {
    greeting,
    firstName,
    kpis: KPIS,
    reviews: REVIEWS,
    recentDecisions: DECISIONS.slice(0, 4),
    sourceHealth,
    activity: ACTIVITY,
    suggestions: RECENT_QUESTIONS,
  };
}
