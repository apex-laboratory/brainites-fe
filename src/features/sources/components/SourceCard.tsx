import { useNavigate } from "react-router-dom";

import {
  AppIcon,
  Meter,
  MiniStat,
  SectionLabel,
  Sparkline,
  SourceTile,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";

import { useBackfillSource } from "../hooks/useBackfillSource";
import type { SourceEntry } from "../hooks/useSources";
import { ManageSourceDialog } from "./ManageSourceDialog";
import { SourceReadReportDialog } from "./SourceReadReportDialog";
import { SourceStatusLine } from "./SourceStatus";

export interface SourceCardProps {
  entry: SourceEntry;
}

/**
 * A single connected-source card.
 *
 * `GET /sources` returns only identity, status, and health today — the richer
 * counts (`extractedLabel`, `activeChannelCount`, `pendingItems`, `ingest7d`)
 * ship on the dashboard `overview` payload. Each block below renders only when
 * its field is present, so the card is honest now and fills out on its own once
 * the backend widens the payload.
 */
export function SourceCard({ entry }: SourceCardProps) {
  const { source, meta } = entry;
  const navigate = useNavigate();
  const backfill = useBackfillSource();

  // Server-owned: `needsBackfill` already accounts for an import in flight, so
  // the two are mutually exclusive and the panel below covers both states.
  const importing = source.syncStatus === "syncing";

  // Read a lot and kept nothing is the outcome that reads as a broken
  // integration, so it gets the amber treatment and the report one click away.
  const itemsRead = source.itemsRead;
  const nothingKept = (source.skillsKept ?? 0) === 0 && (itemsRead ?? 0) > 0;

  const stats = [
    source.extractedLabel && { label: "Knowledge", value: source.extractedLabel },
    source.activeChannelCount != null && {
      label: "Channels",
      value: `${source.activeChannelCount} active`,
    },
  ].filter((stat): stat is { label: string; value: string } => Boolean(stat));

  return (
    <Card className="flex flex-col p-[22px]">
      <div className="flex items-center gap-3">
        <SourceTile id={source.provider} size={46} iconSize={26} />
        <div className="min-w-0">
          <div className="text-[17px] font-bold tracking-[-0.01em] text-ink">
            {meta.name}
          </div>
          <SourceStatusLine source={source} className="mt-0.5" />
        </div>
        {source.pendingItems != null && source.pendingItems > 0 && (
          <Badge variant="amber" className="ml-auto shrink-0">
            {source.pendingItems} pending
          </Badge>
        )}
      </div>

      {source.name !== meta.name && (
        <div className="mt-2.5 truncate text-[12.5px] text-ink-3">{source.name}</div>
      )}

      {stats.length > 0 && (
        <div className="mt-[18px] grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <MiniStat key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </div>
      )}

      {(source.health != null || source.ingest7d) && (
        <div className="mt-4 flex items-end gap-3.5">
          {source.health != null && (
            <div className="flex-1">
              <div className="mb-1.5 flex justify-between">
                <SectionLabel className="pb-0 text-[9.5px]">Health</SectionLabel>
                <span className="tnum text-[11px] text-ink-3">{source.health}%</span>
              </div>
              <Meter value={source.health} tone="green" />
            </div>
          )}
          {source.ingest7d && (
            <div className="shrink-0">
              <SectionLabel className="pb-0 text-right text-[9.5px]">
                7d ingest
              </SectionLabel>
              <Sparkline
                data={source.ingest7d}
                width={72}
                height={22}
                color="var(--green)"
                className="mt-1"
              />
            </div>
          )}
        </div>
      )}

      {(source.needsBackfill || importing) && (
        <div className="mt-[18px] rounded-lg border border-amber/30 bg-amber/[0.06] p-3">
          <div className="text-[12.5px] text-ink-2">
            {importing
              ? "Importing everything from before this source was connected."
              : "This source only knows what's happened since it was connected."}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-2.5 w-full"
            disabled={importing || backfill.isPending}
            onClick={() => backfill.mutate(source.id)}
          >
            {importing ? (
              "Importing history…"
            ) : (
              <>
                <AppIcon name="refresh" size={14} />
                Import history
              </>
            )}
          </Button>
        </div>
      )}

      {itemsRead != null && itemsRead > 0 && (
        <SourceReadReportDialog
          source={source}
          meta={meta}
          trigger={
            <button
              type="button"
              className="mt-[18px] flex w-full items-center gap-1.5 rounded-[9px] border border-line px-3 py-2 text-left text-[12.5px] transition-colors hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <span className="text-ink-2">
                Read <span className="tnum font-bold text-ink">{itemsRead}</span> ·
                kept{" "}
                <span className={`tnum font-bold ${nothingKept ? "text-amber" : "text-ink"}`}>
                  {source.skillsKept ?? 0}
                </span>
              </span>
              <AppIcon name="arrow" size={13} className="ml-auto shrink-0 text-ink-4" />
            </button>
          }
        />
      )}

      <div className="mt-auto flex gap-2.5 pt-[18px]">
        <ManageSourceDialog
          source={source}
          meta={meta}
          trigger={
            <Button variant="outline" size="sm" className="flex-1">
              Manage
            </Button>
          }
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`${ROUTES.decisions}?source=${source.provider}`)}
        >
          View knowledge
          <AppIcon name="arrow" size={14} />
        </Button>
      </div>
    </Card>
  );
}
