import type { SourceId } from "@/types/common";

export type DecisionStatus = "approved" | "active" | "review";

export type Decision = {
  id: string;
  title: string;
  src: SourceId;
  /** Where the decision was found (channel, view, project…). */
  where: string;
  status: DecisionStatus;
  /** Confidence 0–100. */
  conf: number;
  /** Category / domain. */
  cat: string;
  owner: string;
  /** Owner accent color from the prototype. */
  oc: string;
  /** Usage count (pre-formatted, e.g. "2.1k"). */
  uses: string;
  /** Relative update time (pre-formatted, e.g. "2d ago"). */
  updated: string;
  body: string;
  /** Executable rule pseudocode. */
  rule: string;
};
