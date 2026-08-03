import { useMemo } from "react";

import { SOURCES, type SourceMeta } from "@/constants/sources";
import type { SyncStatus } from "../api";

import { useSources } from "./useSources";

export type SourceActivityEntry = {
  meta: SourceMeta;
  /** Present-participle verb, e.g. "Reading". */
  verb: string;
  /** What the source is reading right now (channel / page / repo). */
  target: string;
  /** 0–100 progress through the current target. */
  progress: number;
};

const VERB: Record<SyncStatus, string> = {
  syncing: "Reading",
  healthy: "Synced",
  pending: "Queued",
  error: "Sync error on",
  unknown: "Idle on",
};

const PROGRESS: Record<SyncStatus, number> = {
  syncing: 60, // in flight — the row's pulse dot carries the "live" signal
  healthy: 100,
  pending: 8,
  error: 0,
  unknown: 0,
};

/**
 * "Reading now" read model, built from the workspace's real `GET /sources`
 * rows — only connected sources appear, and verb/progress reflect each
 * source's actual `syncStatus`. (This used to be a fixture-driven animation
 * over every known provider, which showed sources the workspace had never
 * connected "reading" fabricated documents.)
 */
export function useSourceActivity() {
  const { sources: connected } = useSources();

  const sources: SourceActivityEntry[] = useMemo(
    () =>
      connected
        .filter(({ source }) => source.status !== "disconnected")
        .map(({ source }) => ({
          meta: SOURCES[source.provider],
          verb: VERB[source.syncStatus],
          target:
            source.extractedLabel ??
            (source.activeChannelCount != null
              ? `${source.activeChannelCount} channel${source.activeChannelCount === 1 ? "" : "s"}`
              : source.name),
          progress: PROGRESS[source.syncStatus],
        })),
    [connected],
  );

  return { sources };
}
