import type { SourceId } from "@/types/common";

export type SkillStatus = "stable" | "active" | "draft" | "review";

export type Skill = {
  name: string;
  /** Version label (e.g. "v4"). */
  v: string;
  /** Source lineage. */
  src: SourceId[];
  /** Call count (pre-formatted, e.g. "2.1k"). */
  calls: string;
  /** Relative update time (pre-formatted). */
  updated: string;
  status: SkillStatus;
  /** 7-point call sparkline series. */
  spark: number[];
};
