/** Shared cross-feature types. */

/** The five knowledge sources Brainite reads from. */
export type SourceId = "slack" | "notion" | "github" | "jira" | "zendesk";

/** Status keys reused across decisions, skills, and reviews. */
export type StatusKey =
  | "approved"
  | "active"
  | "review"
  | "stable"
  | "draft";

/** A semantic tone for badges / status dots that must not rely on color
 * alone (paired with a label or icon at the call site). */
export type Tone = "neutral" | "accent" | "green" | "amber";
