import { useState } from "react";
import { toast } from "sonner";

import {
  AppIcon,
  MiniStat,
  NiceAvatar,
  SectionLabel,
  SourceIcon,
  SourceTile,
  StatusBadge,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SOURCES } from "@/constants/sources";

import type { Decision } from "../types";

export interface DecisionDetailProps {
  decision: Decision;
}

/** Right-hand decision detail (prototype `DecisionDetail`). */
export function DecisionDetail({ decision }: DecisionDetailProps) {
  const [ruleHead, ...ruleRest] = decision.rule.split(" ");
  const [pinned, setPinned] = useState(false);

  const sourceName = decision.src ? SOURCES[decision.src].name : "the source";

  const openSource = () => {
    toast.info(`Opening in ${sourceName}`, {
      description: decision.where || undefined,
    });
  };

  const togglePin = () => {
    setPinned((prev) => {
      const next = !prev;
      toast.success(next ? "Pinned to your brain" : "Removed from pinned", {
        description: decision.title,
      });
      return next;
    });
  };

  return (
    <div className="min-w-0 flex-1 overflow-y-auto px-6 pb-14 pt-7 md:px-8">
      <div className="flex items-center gap-2.5">
        <SourceTile id={decision.src} size={40} iconSize={22} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <SectionLabel className="pb-0">{decision.cat}</SectionLabel>
            <StatusBadge status={decision.status} />
          </div>
          <h2 className="mt-1 text-[23px] font-bold tracking-[-0.02em] text-ink">
            {decision.title}
          </h2>
        </div>
        <div className="ml-auto flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={openSource}>
            <AppIcon name="externalLink" size={14} />
            Source
          </Button>
          <Button
            variant={pinned ? "outline" : "solid"}
            size="sm"
            onClick={togglePin}
            aria-pressed={pinned}
          >
            <AppIcon name={pinned ? "check" : "pin"} size={14} />
            {pinned ? "Pinned" : "Pin"}
          </Button>
        </div>
      </div>

      <p className="mt-5 max-w-[640px] text-[15.5px] leading-relaxed text-ink-2">
        {decision.body}
      </p>

      {/* executable rule */}
      <div className="mt-[22px]">
        <SectionLabel className="mb-2 pb-0">Executable rule</SectionLabel>
        <div className="overflow-x-auto rounded-xl bg-solid px-[18px] py-4 font-mono text-[13px] leading-relaxed text-solid-ink">
          <span className="text-brand">{ruleHead}</span>
          {ruleRest.length > 0 && ` ${ruleRest.join(" ")}`}
        </div>
      </div>

      {/* meta grid */}
      <div className="mt-[22px] grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MiniStat label="Confidence" value={`${decision.conf}%`} />
        <MiniStat label="Times applied" value={`${decision.uses} / mo`} />
        <MiniStat
          label="Source"
          value={decision.where ? `${sourceName} · ${decision.where}` : sourceName}
        />
      </div>

      {/* provenance */}
      <Card className="mt-[22px] p-[18px]">
        <SectionLabel className="mb-3.5 pb-0">Provenance</SectionLabel>
        <div className="flex items-center gap-3">
          <NiceAvatar name={decision.owner} size={36} />
          <div className="flex-1">
            <div className="text-sm font-semibold text-ink">{decision.owner}</div>
            <div className="text-[12.5px] text-ink-3">Decision owner</div>
          </div>
          <div className="text-right">
            <div className="tnum text-sm font-semibold text-ink">
              {decision.conf}%
            </div>
            <div className="text-xs text-ink-3">extraction confidence</div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-line pt-4">
          <span className="text-[13px] text-ink-3">Extracted from</span>
          <Badge variant="outline" className="gap-1.5">
            {decision.src && <SourceIcon id={decision.src} size={13} branded />}
            {decision.where || sourceName}
          </Badge>
          <span className="tnum ml-auto text-[11.5px] text-ink-4">
            updated {decision.updated}
          </span>
        </div>
      </Card>
    </div>
  );
}
