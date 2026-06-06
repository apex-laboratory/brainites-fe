import { toast } from "sonner";

import {
  AppIcon,
  SectionLabel,
  Sparkline,
  SourceIcon,
  StatusBadge,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils/cn";

import type { Skill } from "../types";

const COLUMNS = "grid-cols-[2.6fr_0.6fr_0.85fr_1fr_0.95fr_52px]";
const HEADERS = ["Skill", "Version", "Source lineage", "Calls · 30d", "Status", ""];

export interface SkillsTableProps {
  skills: Skill[];
}

/** Dense skills registry table built on a CSS grid (prototype `SkillsPage`). */
export function SkillsTable({ skills }: SkillsTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div
            className={cn(
              "grid gap-3.5 border-b border-line bg-paper px-[22px] py-3",
              COLUMNS
            )}
          >
            {HEADERS.map((header, i) => (
              <SectionLabel key={i} className="pb-0 text-[9.5px]">
                {header}
              </SectionLabel>
            ))}
          </div>

          {skills.length === 0 ? (
            <div className="px-[22px] py-12 text-center text-sm text-ink-4">
              No skills match your search.
            </div>
          ) : (
            skills.map((skill, i) => (
              <div
                key={skill.name}
                className={cn(
                  "grid items-center gap-3.5 px-[22px] py-3.5 transition-colors hover:bg-paper",
                  COLUMNS,
                  i < skills.length - 1 && "border-b border-line-soft"
                )}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="grid size-[30px] shrink-0 place-items-center rounded-lg bg-cream text-brand">
                    <AppIcon name="skills" size={16} />
                  </span>
                  <span className="tnum truncate text-[13.5px] font-semibold text-ink">
                    {skill.name}
                  </span>
                </div>
                <Badge variant="outline" className="tnum w-fit">
                  {skill.v}
                </Badge>
                <div className="flex gap-1.5">
                  {skill.src.map((id) => (
                    <SourceIcon key={id} id={id} size={18} branded />
                  ))}
                </div>
                <div className="flex items-center gap-2.5">
                  <Sparkline
                    data={skill.spark}
                    width={58}
                    height={20}
                    fill={false}
                    color="var(--ink-3)"
                    strokeWidth={1.4}
                  />
                  <span className="tnum text-[13px] font-semibold text-ink-2">
                    {skill.calls}
                  </span>
                </div>
                <StatusBadge status={skill.status} />
                <button
                  type="button"
                  aria-label={`View ${skill.name} diff`}
                  onClick={() =>
                    toast.info(`${skill.name} ${skill.v}`, {
                      description: `Last updated ${skill.updated} · ${skill.calls} calls in 30d.`,
                    })
                  }
                  className="grid size-7 place-items-center justify-self-end rounded-md text-ink-3 transition-colors hover:bg-cream hover:text-ink"
                >
                  <AppIcon name="diff" size={15} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
