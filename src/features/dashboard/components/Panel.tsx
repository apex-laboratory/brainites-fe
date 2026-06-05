import { AppIcon } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils/cn";

export interface PanelProps {
  title: string;
  /** Optional count badge next to the title. */
  badge?: number;
  /** Optional right-aligned action link label. */
  action?: string;
  onAction?: () => void;
  /** Tint the badge with the accent color. */
  accent?: boolean;
  children: React.ReactNode;
  className?: string;
}

/** Card panel with a titled header + optional action link (prototype `Panel`). */
export function Panel({
  title,
  badge,
  action,
  onAction,
  accent,
  children,
  className,
}: PanelProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="flex items-center gap-2.5 border-b border-line px-[18px] py-3">
        <span className="text-[13.5px] font-bold tracking-[-0.01em] text-ink">
          {title}
        </span>
        {typeof badge === "number" && badge > 0 && (
          <span
            className={cn(
              "tnum rounded-full px-2 py-px text-[11px] font-bold",
              accent ? "bg-brand text-white" : "bg-cream text-ink-2"
            )}
          >
            {badge}
          </span>
        )}
        {action && (
          <button
            type="button"
            onClick={onAction}
            className="group ml-auto inline-flex items-center gap-1 text-[12.5px] font-semibold text-ink-3 transition-colors hover:text-brand-ink"
          >
            {action}
            <AppIcon
              name="arrow"
              size={13}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </button>
        )}
      </div>
      {children}
    </Card>
  );
}
