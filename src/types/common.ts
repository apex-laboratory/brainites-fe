/** Shared cross-feature types. */

/** The knowledge sources Brainite reads from. These are the backend's provider
 * ids verbatim (`app/integrations/__init__.py`), so a wire `provider` value can
 * be used directly as a `SourceId` — no translation layer. */
export type SourceId =
  | "slack"
  | "notion"
  | "github"
  | "jira"
  | "zendesk"
  | "google_drive"
  | "gmail";

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
