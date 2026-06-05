import { cn } from "@/utils/cn";
import { Card } from "@/components/ui/card";
import { AppIcon, type AppIconName } from "@/components/shared/AppIcon";

export interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  /** Optional secondary line (e.g. "+12% this week"). */
  hint?: React.ReactNode;
  icon?: AppIconName;
  /** Optional trailing slot, e.g. a <Sparkline />. */
  trailing?: React.ReactNode;
  className?: string;
}

/** Compact KPI tile used across the dashboard. Numbers are tabular. */
export function MetricCard({
  label,
  value,
  hint,
  icon,
  trailing,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-ink-3">
            {icon && <AppIcon name={icon} size={14} />}
            <span className="text-xs font-medium">{label}</span>
          </div>
          <div className="tnum mt-2 text-2xl font-bold leading-none text-ink">
            {value}
          </div>
          {hint && <div className="mt-1.5 text-xs text-ink-3">{hint}</div>}
        </div>
        {trailing && <div className="shrink-0">{trailing}</div>}
      </div>
    </Card>
  );
}
