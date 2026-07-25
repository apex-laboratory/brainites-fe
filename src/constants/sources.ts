import type { SourceId } from "@/types/common";

export type SourceMeta = {
  id: SourceId;
  name: string;
  /** Brand color used for restrained accents (matches prototype tokens). */
  color: string;
  /** One-line description of what this source contributes. */
  tag: string;
};

/** Source metadata, in the canonical display order used across the app.
 * Keys are the backend's provider ids, so a source's `provider` indexes this
 * map directly. Icons are resolved separately in `SourceIcon` via `react-icons/si`. */
export const SOURCES: Record<SourceId, SourceMeta> = {
  slack: { id: "slack", name: "Slack", color: "#4A154B", tag: "Conversations & decisions" },
  notion: { id: "notion", name: "Notion", color: "#191919", tag: "Policies & playbooks" },
  github: { id: "github", name: "GitHub", color: "#1B1A15", tag: "Code reviews & runbooks" },
  jira: { id: "jira", name: "Jira", color: "#2684FF", tag: "Tickets & incidents" },
  zendesk: { id: "zendesk", name: "Zendesk", color: "#17494D", tag: "Support patterns" },
  google_drive: { id: "google_drive", name: "Google Drive", color: "#1FA463", tag: "Docs, sheets & slides" },
  gmail: { id: "gmail", name: "Gmail", color: "#EA4335", tag: "Threads & commitments" },
};

/** Narrow a raw backend provider string to a known `SourceId`, or `null` if it
 * isn't one we render. Keeps `SOURCES[id]` lookups from ever indexing undefined.
 * The single home for this guard — hooks and mappers import it rather than
 * re-declaring it. */
export function asSourceId(provider: string | null | undefined): SourceId | null {
  return provider && provider in SOURCES ? (provider as SourceId) : null;
}

/** List form of {@link asSourceId}: narrow a provider array, dropping unknowns
 * and de-duplicating (so a source lineage never shows the same icon twice). */
export function asSourceIds(providers: readonly (string | null | undefined)[]): SourceId[] {
  const seen = new Set<SourceId>();
  for (const p of providers) {
    const id = asSourceId(p);
    if (id) seen.add(id);
  }
  return [...seen];
}

export const SOURCE_ORDER: SourceId[] = [
  "slack",
  "notion",
  "github",
  "jira",
  "zendesk",
  "google_drive",
  "gmail",
];

export const SOURCE_LIST: SourceMeta[] = SOURCE_ORDER.map((id) => SOURCES[id]);
