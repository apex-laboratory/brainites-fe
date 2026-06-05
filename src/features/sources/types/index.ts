import type { SourceId } from "@/types/common";

export type SourceHealth = {
  /** Relative last-sync time (pre-formatted, e.g. "4m ago"). */
  sync: string;
  /** What was extracted (pre-formatted, e.g. "184 decisions"). */
  extracted: string;
  /** Pending review count. */
  pending: number;
  /** Health score 0–100. */
  health: number;
  /** Connected channels / pages / repos count. */
  channels: number;
  /** 7-day activity sparkline series. */
  spark: number[];
};

export type SourceHealthMap = Record<SourceId, SourceHealth>;
