import { Card } from "@/components/ui/card";
import { cn } from "@/utils/cn";

export type Stat = {
  label: string;
  value: React.ReactNode;
};

export interface StatStripProps {
  stats: Stat[];
  className?: string;
}

/**
 * Horizontal strip of headline stats on a single card (prototype stat strips
 * on Sources / Skills). Wraps to two columns below tablet width.
 */
export function StatStrip({ stats, className }: StatStripProps) {
  return (
    <Card className={cn("grid grid-cols-2 md:grid-cols-4", className)}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="border-line px-5 py-4 even:border-l md:border-l md:[&:nth-child(4n+1)]:border-l-0"
        >
          <div className="tnum text-[26px] font-semibold tracking-[-0.03em] text-ink">
            {stat.value}
          </div>
          <div className="mt-0.5 text-[12.5px] text-ink-3">{stat.label}</div>
        </div>
      ))}
    </Card>
  );
}
