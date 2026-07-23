import { AppIcon, SourceTile } from "@/components/shared";
import { cn } from "@/utils/cn";

import type { Decision, DecisionStatus } from "../types";

const DOT_TONE: Record<DecisionStatus, string> = {
  approved: "bg-green",
  active: "bg-brand",
  review: "bg-amber",
};

export interface DecisionRowProps {
  decision: Decision;
  active: boolean;
  onClick: () => void;
}

/** A single decision in the master list. */
export function DecisionRow({ decision, active, onClick }: DecisionRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active}
      className={cn(
        "flex w-full items-center gap-3 border-l-2 px-4 py-3.5 text-left transition-colors",
        active
          ? "border-brand bg-paper-2"
          : "border-transparent hover:bg-paper"
      )}
    >
      {decision.src ? (
        <SourceTile id={decision.src} size={32} iconSize={17} />
      ) : (
        <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-cream text-ink-3">
          <AppIcon name="sparkles" size={17} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold tracking-[-0.01em] text-ink">
          {decision.title}
        </div>
        <div className="mt-0.5 text-xs text-ink-3">
          {decision.cat} · {decision.updated}
        </div>
      </div>
      <span
        aria-hidden
        className={cn("size-1.5 shrink-0 rounded-full", DOT_TONE[decision.status])}
      />
    </button>
  );
}
