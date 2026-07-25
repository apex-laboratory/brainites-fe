import type { SourceId } from "@/types/common";

export type Review = {
  id: string;
  title: string;
  /** Origin provider, or `null` when the review spans/omits a single source. */
  src: SourceId | null;
  /** Origin context (channel · message count, PR, view…). */
  where: string;
  /** What kind of change this proposes (e.g. "Policy change"). */
  kind: string;
  /** State before the proposed change. */
  before: string;
  /** State after the proposed change. */
  after: string;
  /** Supporting evidence quote. */
  quote: string;
  /** Who said it (attribution). */
  who: string;
  /** Confidence 0–100. */
  conf: number;
  /**
   * True when this is a contradiction card. Contradictions resolve differently
   * from a plain approve/reject: the reviewer picks the authoritative side
   * (`before` = source A / current, `after` = source B / proposed) or writes a
   * correction. See `POST /reviews/{id}/resolve`.
   */
  isContradiction: boolean;
};
