import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useWorkspaceId } from "@/app/providers/AuthProvider";
import type { AppIconName, StatusTone } from "@/components/shared";
import { asSourceId, SOURCES, type SourceMeta } from "@/constants/sources";
import type { SourceId } from "@/types/common";
import { compactMap } from "@/utils/array";
import { formatRelativeTime } from "@/utils/date";

import type { KpiTileData } from "../components/KpiTile";
import { dashboardApi, dashboardKeys, type Kpi, type Overview } from "../api";

const KPI_ICON: Record<Kpi["id"], AppIconName> = {
  decisions: "decision",
  policies: "document",
  skills: "skills",
  reviews: "review",
};

function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** Sync state → dot tone. A failing sync must never show the healthy green
 * "live" pulse; unknown states degrade to a neutral dot rather than green. */
const SYNC_TONE: Record<string, StatusTone> = {
  healthy: "live",
  syncing: "accent",
  pending: "neutral",
  error: "amber",
};

function syncTone(status: string | null | undefined): StatusTone {
  return status ? (SYNC_TONE[status] ?? "neutral") : "neutral";
}

// ── view-model item types (what OverviewPage renders) ───────────────────────
// `src` is nullable: the dashboard payload allows a null `sourceProvider` (an
// event/decision the backend couldn't attribute to one provider), and those rows
// must render with a neutral fallback icon rather than being silently dropped.
export type OverviewReview = { id: string; src: SourceId | null; title: string; kind: string };
export type OverviewDecision = {
  id: string;
  src: SourceId | null;
  title: string;
  body: string;
  status: string;
  updated: string;
};
export type OverviewSourceHealth = {
  meta: SourceMeta;
  pending: number;
  sync: string;
  tone: StatusTone;
};
export type OverviewActivity = { txt: string; det: string; src: SourceId | null; t: string };

function mapKpis(kpis: Overview["kpis"]): KpiTileData[] {
  return kpis.map((k) => ({
    n: k.value,
    label: k.label,
    icon: KPI_ICON[k.id],
    spark: k.spark,
    trend: k.trend,
    accent: k.id === "reviews",
  }));
}

function mapReviews(items: Overview["reviewPreview"]): OverviewReview[] {
  return items.map((r) => ({
    id: r.id,
    src: asSourceId(r.sourceProvider),
    title: r.title,
    kind: r.kind,
  }));
}

function mapDecisions(items: Overview["recentDecisions"], now: number): OverviewDecision[] {
  return items.map((d) => ({
    id: d.id,
    src: asSourceId(d.sourceProvider),
    title: d.title,
    body: d.summary ?? d.rule ?? "",
    status: d.status,
    updated: formatRelativeTime(d.updatedAt, now) ?? "",
  }));
}

function mapSourceHealth(items: Overview["sourceHealth"], now: number): OverviewSourceHealth[] {
  // A source connection always carries a known provider (non-null in the
  // schema), so an unrecognized one is real drift and is dropped — its brand
  // tile can't render without `SOURCES[id]`. The dot tone comes from the row's
  // own `syncStatus`, never a hardcoded green.
  return compactMap(items, (s) => {
    const src = asSourceId(s.provider);
    if (!src) return null;
    return {
      meta: SOURCES[src],
      pending: s.pendingItems,
      sync: formatRelativeTime(s.lastSyncedAt, now) ?? s.extractedLabel ?? "—",
      tone: syncTone(s.syncStatus),
    };
  });
}

function mapActivity(items: Overview["activity"], now: number): OverviewActivity[] {
  return items.map((a) => ({
    txt: a.title,
    det: a.detail ?? "",
    src: asSourceId(a.sourceProvider),
    t: formatRelativeTime(a.createdAt, now) ?? "",
  }));
}

/**
 * Read model for the Overview screen. Fetches the aggregated
 * `/workspaces/{id}/overview` payload and maps it into the view model the page
 * renders, dropping any row whose provider we don't recognize (so the source
 * icon/name lookups are always safe). Loading/error are surfaced as flags for
 * the page to render inline — never a toast.
 */
export function useOverview() {
  const workspaceId = useWorkspaceId();

  const query = useQuery({
    queryKey: dashboardKeys.overview(workspaceId),
    queryFn: () => dashboardApi.overview(workspaceId),
  });

  const view = useMemo(() => {
    const now = Date.now();
    const data = query.data;
    return {
      greeting: greetingForHour(new Date(now).getHours()),
      firstName: data?.greetingName ?? "",
      workspaceName: data?.workspace.name ?? "",
      workspacePlan: data?.workspace.plan ?? "",
      syncLabel: data?.sync.label ?? "",
      syncTone: syncTone(data?.sync.status),
      kpis: data ? mapKpis(data.kpis) : [],
      reviews: data ? mapReviews(data.reviewPreview) : [],
      recentDecisions: data ? mapDecisions(data.recentDecisions, now) : [],
      sourceHealth: data ? mapSourceHealth(data.sourceHealth, now) : [],
      activity: data ? mapActivity(data.activity, now) : [],
      suggestions: data?.recentQuestions ?? [],
    };
  }, [query.data]);

  return {
    ...view,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
