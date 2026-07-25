import type { SourceId } from "@/types/common";

/** What a source reads from while it syncs — drives the live "Reading now"
 * status (verb + rotating targets), the way Claude surfaces what it's working
 * on right now. */
export type SourceActivity = {
  /** Present-participle verb, e.g. "Reading", "Scanning". */
  verb: string;
  /** Singular noun for the read target, e.g. "channel", "page", "repo". */
  unit: string;
  /** Read targets the source cycles through (channels / pages / repos). */
  targets: string[];
};

export type SourceActivityMap = Record<SourceId, SourceActivity>;
