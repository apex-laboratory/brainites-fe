import type { SourceId } from "@/types/common";

export type ActivityKind = "skill" | "policy" | "decision" | "pattern";

export type ActivityItem = {
  /** Activity category — maps to an AppIcon at the component layer. */
  icon: ActivityKind;
  /** Headline text. */
  txt: string;
  /** Detail / subject. */
  det: string;
  src: SourceId;
  /** Relative time (pre-formatted, e.g. "12m"). */
  t: string;
};
