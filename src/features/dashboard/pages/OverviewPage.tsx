import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AppIcon,
  ErrorState,
  Skeleton,
  SourceIcon,
  SourceTile,
  StatusBadge,
  StatusIndicator,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { SOURCES } from "@/constants/sources";
import { SourceActivityRow, useSourceActivity } from "@/features/sources";
import type { SourceId } from "@/types/common";

import { ActivityFeedDialog } from "../components/ActivityFeedDialog";
import { KpiTile } from "../components/KpiTile";
import { Panel } from "../components/Panel";
import { useDashboardOutlet } from "../hooks/useDashboardOutlet";
import { useOverview } from "../hooks/useOverview";

/** A provider's inline brand icon, or a neutral glyph when a row has no
 * attributed source (the payload allows a null `sourceProvider`). */
function SourceGlyph({ id, size }: { id: SourceId | null; size: number }) {
  if (id) return <SourceIcon id={id} size={size} branded />;
  return (
    <span className="grid shrink-0 place-items-center text-ink-3" style={{ width: size, height: size }}>
      <AppIcon name="sparkles" size={size} />
    </span>
  );
}

/** Dashboard home — mission-control overview (prototype `BrainPage`). */
export function OverviewPage() {
  const navigate = useNavigate();
  const [activityOpen, setActivityOpen] = useState(false);
  const { askBrain } = useDashboardOutlet();
  const {
    greeting,
    firstName,
    workspaceName,
    syncLabel,
    syncTone,
    kpis,
    reviews,
    recentDecisions,
    sourceHealth,
    activity,
    suggestions,
    isPending,
    isError,
    error,
    refetch,
  } = useOverview();
  const { sources: liveSources } = useSourceActivity();

  if (isPending) {
    return (
      <div className="mx-auto max-w-[1180px] px-6 pb-16 pt-7 md:px-10">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-6 h-28 w-full rounded-2xl" />
        <div className="mt-[22px] grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-xl" />
          ))}
        </div>
        <div className="mt-[22px] grid grid-cols-1 gap-[22px] lg:grid-cols-[minmax(0,1fr)_340px]">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-[1180px] px-6 pb-16 pt-7 md:px-10">
        <ErrorState
          error={error}
          onRetry={() => refetch()}
          title="Couldn't load your overview"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1180px] px-6 pb-16 pt-7 md:px-10">
      {/* greeting */}
      <div className="flex flex-wrap items-end gap-5">
        <div>
          <h1 className="font-display text-[31px] font-normal leading-[1.05] tracking-[0.015em] text-ink md:text-[36px]">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1.5 text-[15px] text-ink-3">
            Here&apos;s what {workspaceName || "your team"}&apos;s brain learned
            while you were away.
          </p>
        </div>
        {syncLabel && (
          <StatusIndicator
            tone={syncTone}
            label={syncLabel}
            pulse={syncTone === "live"}
            className="ml-auto"
          />
        )}
      </div>

      {/* hero ask */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-paper-2 to-paper p-[22px] shadow-soft-1">
        <div className="flex items-center gap-3.5">
          <span className="grid size-[46px] shrink-0 place-items-center rounded-[13px] bg-brand text-white shadow-[0_6px_18px_var(--accent-glow)]">
            <AppIcon name="brain" size={24} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[17px] font-bold tracking-[-0.02em] text-ink">
              Ask your company brain
            </div>
            <div className="mt-0.5 text-sm text-ink-3">
              Every decision, policy and skill your team has — one question away.
            </div>
          </div>
          <Button
            variant="solid"
            className="shrink-0"
            onClick={() => askBrain()}
          >
            <AppIcon name="sparkles" size={16} />
            Open brain
          </Button>
        </div>
        <div className="mt-[18px] flex flex-wrap items-center gap-x-[22px] gap-y-2 border-t border-line pt-4">
          <span className="text-[13px] font-semibold text-ink-4">Try asking</span>
          {suggestions.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => askBrain(question)}
              className="group inline-flex items-center gap-1.5 text-left text-[13.5px] font-medium tracking-[-0.01em] text-ink-2 transition-colors hover:text-brand-ink"
            >
              {question}
              <AppIcon
                name="arrow"
                size={13}
                className="text-ink-4 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-ink"
              />
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="mt-[22px] grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiTile key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* main grid */}
      <div className="mt-[22px] grid grid-cols-1 gap-[22px] lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* left column */}
        <div className="flex min-w-0 flex-col gap-[22px]">
          <Panel
            title="Needs your review"
            badge={reviews.length}
            action="Review all"
            onAction={() => navigate(ROUTES.reviews)}
            accent
          >
            <div className="flex flex-col">
              {reviews.map((review, i) => (
                <button
                  key={review.id}
                  type="button"
                  onClick={() => navigate(ROUTES.reviews)}
                  className={`flex items-center gap-3.5 px-[18px] py-3.5 text-left transition-colors hover:bg-paper ${
                    i ? "border-t border-line-soft" : ""
                  }`}
                >
                  <SourceTile id={review.src} size={34} iconSize={18} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold tracking-[-0.01em] text-ink">
                      {review.title}
                    </div>
                    <div className="mt-0.5 text-[12.5px] text-ink-3">
                      {review.kind}
                      {review.src ? ` · ${SOURCES[review.src].name}` : ""}
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {review.kind === "New skill" ? "Skill" : "Policy"}
                  </Badge>
                  <AppIcon
                    name="chevronRight"
                    size={16}
                    className="shrink-0 text-ink-4"
                  />
                </button>
              ))}
            </div>
          </Panel>

          <Panel
            title="Recently extracted"
            action="View all"
            onAction={() => navigate(ROUTES.decisions)}
          >
            <div className="flex flex-col">
              {recentDecisions.map((decision, i) => (
                <button
                  key={decision.id}
                  type="button"
                  onClick={() => navigate(ROUTES.decisions)}
                  className={`flex items-center gap-3.5 px-[18px] py-3.5 text-left transition-colors hover:bg-paper ${
                    i ? "border-t border-line-soft" : ""
                  }`}
                >
                  <SourceGlyph id={decision.src} size={18} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold tracking-[-0.01em] text-ink">
                      {decision.title}
                    </div>
                    <div className="mt-0.5 truncate text-[12.5px] text-ink-3">
                      {decision.body}
                    </div>
                  </div>
                  <StatusBadge status={decision.status} className="shrink-0" />
                  <span className="tnum w-9 shrink-0 text-right text-[11.5px] text-ink-4">
                    {decision.updated}
                  </span>
                </button>
              ))}
            </div>
          </Panel>
        </div>

        {/* right column */}
        <div className="flex flex-col gap-[22px]">
          <Panel
            title="Reading now"
            action="Manage"
            onAction={() => navigate(ROUTES.sources)}
          >
            <div className="flex flex-col">
              {liveSources.length ? (
                liveSources.map((source, i) => (
                  <SourceActivityRow
                    key={source.meta.id}
                    entry={source}
                    className={i ? "border-t border-line-soft" : undefined}
                  />
                ))
              ) : (
                <p className="px-[18px] py-4 text-[12.5px] text-ink-4">
                  No sources connected yet.
                </p>
              )}
            </div>
          </Panel>

          <Panel
            title="Source health"
            action="Manage"
            onAction={() => navigate(ROUTES.sources)}
          >
            <div className="flex flex-col">
              {sourceHealth.map((source, i) => (
                <div
                  key={source.meta.id}
                  className={`flex items-center gap-3 px-[18px] py-2.5 ${
                    i ? "border-t border-line-soft" : ""
                  }`}
                >
                  <SourceIcon id={source.meta.id} size={18} branded />
                  <span className="flex-1 text-[13.5px] font-semibold tracking-[-0.01em] text-ink">
                    {source.meta.name}
                  </span>
                  {source.pending > 0 ? (
                    <Badge variant="amber">{source.pending} pending</Badge>
                  ) : (
                    <span className="tnum text-[11.5px] text-ink-4">
                      {source.sync}
                    </span>
                  )}
                  <StatusIndicator tone={source.tone} pulse={source.tone === "live"} />
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            title="Activity"
            action="View all"
            onAction={() => setActivityOpen(true)}
          >
            <div className="flex flex-col">
              {activity.map((item, i) => (
                <div
                  key={`${item.txt}-${i}`}
                  className={`flex gap-3 px-[18px] py-3 ${
                    i ? "border-t border-line-soft" : ""
                  }`}
                >
                  <span className="mt-px">
                    <SourceGlyph id={item.src} size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold tracking-[-0.01em] text-ink">
                      {item.txt}
                    </div>
                    <div className="mt-px truncate text-[12.5px] text-ink-3">
                      {item.det}
                    </div>
                  </div>
                  <span className="tnum shrink-0 text-[11px] text-ink-4">
                    {item.t}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <ActivityFeedDialog
        open={activityOpen}
        onClose={() => setActivityOpen(false)}
      />
    </div>
  );
}
