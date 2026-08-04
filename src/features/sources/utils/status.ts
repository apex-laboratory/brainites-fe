import type { StatusTone } from "@/components/shared";

import type { Source, SourceStatus } from "../api";

export type SourcePresentation = {
  tone: StatusTone;
  label: string;
  pulse: boolean;
};

const STATUS_LABEL: Record<SourceStatus, string> = {
  connected: "Connected",
  disconnected: "Disconnected",
  error: "Connection error",
  pending: "Connecting…",
  unknown: "Unknown state",
};

/** Tailwind text color per tone, so a label never relies on the dot alone. */
export const TONE_TEXT: Record<StatusTone, string> = {
  green: "text-green",
  amber: "text-amber",
  accent: "text-primary",
  live: "text-green",
  neutral: "text-ink-3",
};

/**
 * How a source reads at a glance. A source that isn't `connected` reports its
 * connection state; a connected one reports how its sync is going.
 */
export function describeSource(source: Source): SourcePresentation {
  if (source.status !== "connected") {
    return {
      tone: source.status === "pending" ? "accent" : "neutral",
      label: STATUS_LABEL[source.status],
      pulse: source.status === "pending",
    };
  }

  // A source whose history was never imported is the one state the user has to
  // act on, so it outranks the sync labels below — "Awaiting first sync" reads
  // like something that resolves on its own, and this one never does.
  if (source.needsBackfill) {
    return { tone: "amber", label: "History not imported", pulse: false };
  }

  switch (source.syncStatus) {
    case "healthy":
      return { tone: "green", label: "Connected", pulse: true };
    case "syncing":
      return { tone: "accent", label: "Importing history", pulse: true };
    case "pending":
      return { tone: "amber", label: "Awaiting first sync", pulse: false };
    case "error":
      return { tone: "amber", label: "Sync error", pulse: false };
    default:
      return { tone: "neutral", label: "Connected", pulse: false };
  }
}
