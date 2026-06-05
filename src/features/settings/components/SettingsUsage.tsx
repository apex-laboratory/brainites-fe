import { SectionLabel, Sparkline } from "@/components/shared";
import { Card } from "@/components/ui/card";

import { USAGE_METRICS } from "../data/usage";

/** Settings → Usage tab: this-month metrics with sparklines. */
export function SettingsUsage() {
  return (
    <Card className="p-6">
      <SectionLabel className="mb-4 pb-0">This month</SectionLabel>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        {USAGE_METRICS.map((metric) => (
          <div key={metric.label} className="rounded-[11px] bg-cream p-4">
            <div className="text-[27px] font-semibold tracking-[-0.03em] text-ink">
              {metric.value}
            </div>
            <div className="mb-2.5 mt-0.5 text-[12.5px] text-ink-3">
              {metric.label}
            </div>
            <Sparkline
              data={metric.spark}
              width={120}
              height={28}
              color="var(--accent-hex)"
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
