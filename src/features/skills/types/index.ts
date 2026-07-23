import type { SourceId } from "@/types/common";

export type SkillStatus = "stable" | "active" | "draft" | "review";

export type Skill = {
  /** Backend skill id (used for detail / version lookups). */
  id?: string;
  name: string;
  /** Version label (e.g. "v4"). */
  v: string;
  /** Source lineage. */
  src: SourceId[];
  status: SkillStatus;
  /**
   * Cosine similarity (0–1) when the row came from a search. Present on real
   * search results; absent for the static prototype rows.
   */
  similarity?: number;
  /**
   * Decorative usage metrics from the prototype. The backend search surface
   * doesn't carry these, so they're optional — the table shows a placeholder
   * when absent.
   */
  calls?: string;
  /** Relative update time (pre-formatted). */
  updated?: string;
  /** 7-point call sparkline series. */
  spark?: number[];
};
