import type { SourceHealthMap } from "@/features/sources/types";

/** Static source-health records, one per connected source.
 *
 * The Sources screen reads from the live API; this fixture survives only for the
 * Overview screen and the "Reading now" simulation, which have not been migrated
 * yet (dashboard is phase 5 of FE_BE_INTEGRATION_PLAN.md). Delete it then. */
export const SOURCE_HEALTH: SourceHealthMap = {
  slack: { sync: "4m ago", extracted: "184 decisions", pending: 3, health: 98, channels: 18, spark: [20, 28, 24, 32, 30, 38, 42] },
  notion: { sync: "11m ago", extracted: "52 policies", pending: 0, health: 100, channels: 6, spark: [8, 10, 9, 12, 11, 14, 16] },
  github: { sync: "2m ago", extracted: "37 skills", pending: 1, health: 96, channels: 4, spark: [12, 14, 18, 16, 22, 26, 30] },
  jira: { sync: "26m ago", extracted: "44 decisions", pending: 2, health: 92, channels: 2, spark: [10, 12, 11, 14, 13, 16, 18] },
  zendesk: { sync: "8m ago", extracted: "61 patterns", pending: 0, health: 99, channels: 4, spark: [22, 26, 30, 28, 34, 38, 44] },
  google_drive: { sync: "5m ago", extracted: "48 documents", pending: 1, health: 97, channels: 7, spark: [14, 16, 20, 19, 24, 28, 33] },
  gmail: { sync: "9m ago", extracted: "23 commitments", pending: 0, health: 94, channels: 3, spark: [9, 11, 10, 13, 15, 14, 17] },
};
