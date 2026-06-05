import { AppIcon, Sparkline, type AppIconName } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/utils/cn";

export type KpiTileData = {
  n: number;
  label: string;
  icon: AppIconName;
  spark: number[];
  /** Signed percentage trend (0 hides the chip). */
  trend: number;
  accent?: boolean;
};

/** Trend delta chip (arrow + percentage), green up / red down. */
function Trend({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className={cn(
        "tnum inline-flex items-center gap-0.5 text-[11.5px] font-bold",
        up ? "text-green" : "text-[#C0483A]"
      )}
    >
      <AppIcon name="arrowUp" size={11} className={cn(!up && "-scale-y-100")} />
      {Math.abs(value)}%
    </span>
  );
}

/** Animated KPI tile with sparkline + trend (prototype `CoverTile`). */
export function KpiTile({ n, label, icon, spark, trend, accent }: KpiTileData) {
  const value = useCountUp(n, true, 1100);

  return (
    <Card className="p-[17px]">
      <div className="flex items-center">
        <span
          className={cn(
            "grid size-[30px] place-items-center rounded-lg",
            accent ? "bg-brand-soft text-brand-ink" : "bg-cream text-ink-3"
          )}
        >
          <AppIcon name={icon} size={17} />
        </span>
        <span className="ml-auto">
          <Sparkline
            data={spark}
            width={76}
            height={24}
            color={accent ? "var(--accent-hex)" : "var(--ink-3)"}
          />
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-2.5">
        <span
          className={cn(
            "tnum text-[33px] font-semibold leading-none tracking-[-0.03em]",
            accent ? "text-brand" : "text-ink"
          )}
        >
          {value}
        </span>
        {trend !== 0 && <Trend value={trend} />}
      </div>
      <div className="mt-1.5 text-[12.5px] text-ink-3">{label}</div>
    </Card>
  );
}
