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
   * Usage metrics from the backend (`calls30d` / `callSeries` / `updatedAt`).
   * Optional — a skill with no recorded interactions carries no series, and the
   * table falls back to a placeholder (or the `% match` on a search hit).
   */
  calls?: string;
  /** Relative update time (formatted from `updatedAt`). */
  updated?: string;
  /** 7-point daily call sparkline series (oldest→newest). */
  spark?: number[];
};
