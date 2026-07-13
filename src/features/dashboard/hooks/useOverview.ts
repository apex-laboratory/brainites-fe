import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useWorkspaceId } from "@/app/providers/AuthProvider";
import type { AppIconName } from "@/components/shared";
import { SOURCES, type SourceMeta } from "@/constants/sources";
import type { SourceId } from "@/types/common";
import { formatRelativeTime } from "@/utils/date";

import type { KpiTileData } from "../components/KpiTile";
import { dashboardApi, dashboardKeys, type Kpi, type Overview } from "../api";

const KPI_ICON: Record<Kpi["id"], AppIconName> = {
  decisions: "decision",
  policies: "document",
  skills: "skills",
  reviews: "review",
};

/** A backend provider string → a known `SourceId`, or `null` if unrecognized.
 * Keeps the icon/name lookups (`SOURCES[id]`) from ever indexing undefined. */
function asSourceId(provider: string | null | undefined): SourceId | null {
  return provider && provider in SOURCES ? (provider as SourceId) : null;
}

function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// ── view-model item types (what OverviewPage renders) ───────────────────────
export type OverviewReview = { id: string; src: SourceId; title: string; kind: string };
export type OverviewDecision = {
  id: string;
  src: SourceId;
  title: string;
  body: string;
  status: string;
  updated: string;
};
export type OverviewSourceHealth = { meta: SourceMeta; pending: number; sync: string };
export type OverviewActivity = { txt: string; det: string; src: SourceId; t: string };

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
  return items.flatMap((r) => {
    const src = asSourceId(r.sourceProvider);
    return src ? [{ id: r.id, src, title: r.title, kind: r.kind }] : [];
  });
}

function mapDecisions(items: Overview["recentDecisions"], now: number): OverviewDecision[] {
  return items.flatMap((d) => {
    const src = asSourceId(d.sourceProvider);
    if (!src) return [];
    return [
      {
        id: d.id,
        src,
        title: d.title,
        body: d.summary ?? d.rule ?? "",
        status: d.status,
        updated: formatRelativeTime(d.updatedAt, now) ?? "",
      },
    ];
  });
}

function mapSourceHealth(items: Overview["sourceHealth"], now: number): OverviewSourceHealth[] {
  return items.flatMap((s) => {
    const src = asSourceId(s.provider);
    if (!src) return [];
    return [
      {
        meta: SOURCES[src],
        pending: s.pendingItems,
        sync: formatRelativeTime(s.lastSyncedAt, now) ?? s.extractedLabel ?? "—",
      },
    ];
  });
}

function mapActivity(items: Overview["activity"], now: number): OverviewActivity[] {
  return items.flatMap((a) => {
    const src = asSourceId(a.sourceProvider);
    if (!src) return [];
    return [
      {
        txt: a.title,
        det: a.detail ?? "",
        src,
        t: formatRelativeTime(a.createdAt, now) ?? "",
      },
    ];
  });
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
      syncLabel: data?.sync.label ?? "",
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
