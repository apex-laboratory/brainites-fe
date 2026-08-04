import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useWorkspaceId } from "@/app/providers/AuthProvider";
import type { Stat } from "@/components/shared";
import { SOURCES, type SourceMeta } from "@/constants/sources";

import { sourceKeys, sourcesApi, type Source } from "../api";

export type SourceEntry = {
  source: Source;
  meta: SourceMeta;
};

/** Poll cadence while a history import runs. An import takes minutes, not
 * seconds, so this is about the card resolving on its own — not live progress. */
const IMPORT_POLL_MS = 5_000;

/** Sum a nullish per-source field, returning `null` when no source reports it. */
function sumReported(
  sources: Source[],
  pick: (s: Source) => number | null | undefined,
): number | null {
  const reported = sources.map(pick).filter((n): n is number => n != null);
  return reported.length ? reported.reduce((a, b) => a + b, 0) : null;
}

/** One definition of "healthy" so the stat strip and the header count can't drift. */
function countHealthy(sources: Source[]): number {
  return sources.filter((s) => s.syncStatus === "healthy").length;
}

function buildStats(sources: Source[]): Stat[] {
  const healthy = countHealthy(sources);
  const scored = sources.map((s) => s.health).filter((h): h is number => h != null);
  const avgHealth = scored.length
    ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length)
    : null;

  // Neither count is in the `GET /sources` payload yet — prefer pending items
  // when the backend reports them, fall back to channels, then to a dash.
  const pending = sumReported(sources, (s) => s.pendingItems);
  const channels = sumReported(sources, (s) => s.activeChannelCount);
  const fourth: Stat =
    pending != null
      ? { label: "Pending items", value: pending }
      : channels != null
        ? { label: "Active channels", value: channels }
        : { label: "Pending items", value: "—" };

  return [
    { label: "Sources connected", value: sources.length },
    { label: "Healthy", value: `${healthy} / ${sources.length}` },
    { label: "Avg. health", value: avgHealth == null ? "—" : `${avgHealth}%` },
    fourth,
  ];
}

/**
 * Read model for the Sources screen: the workspace's connected sources joined
 * with their display metadata, plus the summary stats for the strip. Sources
 * are workspace-scoped by JWT; the workspace id only keys the cache.
 */
export function useSources() {
  const workspaceId = useWorkspaceId();

  const query = useQuery({
    queryKey: sourceKeys.all(workspaceId),
    queryFn: () => sourcesApi.list(),
    // A history import runs server-side with no way to push us its result, so
    // poll while one is in flight — and stop the moment none is, so an idle
    // Sources page isn't refetching forever.
    refetchInterval: (q) =>
      (q.state.data ?? []).some((s) => s.syncStatus === "syncing") ? IMPORT_POLL_MS : false,
  });

  const sources = useMemo(
    () => (query.data ?? []).map((source) => ({ source, meta: SOURCES[source.provider] })),
    [query.data],
  );

  const stats = useMemo(() => buildStats(query.data ?? []), [query.data]);

  const healthyCount = useMemo(() => countHealthy(query.data ?? []), [query.data]);

  return { ...query, sources, stats, healthyCount };
}
