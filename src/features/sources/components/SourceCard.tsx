import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  AppIcon,
  Meter,
  MiniStat,
  SectionLabel,
  Sparkline,
  SourceTile,
  StatusIndicator,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";

import type { SourceHealthEntry } from "../hooks/useSourceHealth";

export interface SourceCardProps {
  entry: SourceHealthEntry;
}

/** A single connected-source card (prototype `SourceCard`). */
export function SourceCard({ entry }: SourceCardProps) {
  const { meta, health } = entry;
  const navigate = useNavigate();

  return (
    <Card className="p-[22px]">
      <div className="flex items-center gap-3">
        <SourceTile id={meta.id} size={46} iconSize={26} />
        <div className="min-w-0">
          <div className="text-[17px] font-bold tracking-[-0.01em] text-ink">
            {meta.name}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 whitespace-nowrap">
            <StatusIndicator tone="green" pulse />
            <span className="text-[12.5px] font-semibold text-green">
              Connected
            </span>
            <span className="text-[12.5px] text-ink-4">· synced {health.sync}</span>
          </div>
        </div>
        {health.pending > 0 && (
          <Badge variant="amber" className="ml-auto shrink-0">
            {health.pending} pending
          </Badge>
        )}
      </div>

      <div className="mt-[18px] grid grid-cols-2 gap-3">
        <MiniStat label="Knowledge" value={health.extracted} />
        <MiniStat label="Channels" value={`${health.channels} active`} />
      </div>

      <div className="mt-4 flex items-end gap-3.5">
        <div className="flex-1">
          <div className="mb-1.5 flex justify-between">
            <SectionLabel className="pb-0 text-[9.5px]">Health</SectionLabel>
            <span className="tnum text-[11px] text-ink-3">{health.health}%</span>
          </div>
          <Meter value={health.health} tone="green" />
        </div>
        <div className="shrink-0">
          <SectionLabel className="pb-0 text-right text-[9.5px]">
            7d ingest
          </SectionLabel>
          <Sparkline
            data={health.spark}
            width={72}
            height={22}
            color="var(--green)"
            className="mt-1"
          />
        </div>
      </div>

      <div className="mt-[18px] flex gap-2.5">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() =>
            toast.info(`${meta.name} settings`, {
              description: `Scope, channels and sync for ${meta.name}.`,
            })
          }
        >
          Manage
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(ROUTES.decisions)}
        >
          View knowledge
          <AppIcon name="arrow" size={14} />
        </Button>
      </div>
    </Card>
  );
}
