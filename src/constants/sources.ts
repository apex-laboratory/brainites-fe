import type { SourceId } from "@/types/common";

export type SourceMeta = {
  id: SourceId;
  name: string;
  /** Brand color used for restrained accents (matches prototype tokens). */
  color: string;
};

/** Source metadata, in the canonical display order used across the app.
 * Icons are resolved separately in `SourceIcon` via `react-icons/si`. */
export const SOURCES: Record<SourceId, SourceMeta> = {
  slack: { id: "slack", name: "Slack", color: "#4A154B" },
  notion: { id: "notion", name: "Notion", color: "#191919" },
  github: { id: "github", name: "GitHub", color: "#1B1A15" },
  jira: { id: "jira", name: "Jira", color: "#2684FF" },
  zendesk: { id: "zendesk", name: "Zendesk", color: "#17494D" },
  googledrive: { id: "googledrive", name: "Google Drive", color: "#1FA463" },
};

export const SOURCE_ORDER: SourceId[] = [
  "slack",
  "notion",
  "github",
  "jira",
  "zendesk",
  "googledrive",
];

export const SOURCE_LIST: SourceMeta[] = SOURCE_ORDER.map((id) => SOURCES[id]);
