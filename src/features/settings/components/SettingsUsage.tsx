import { SectionLabel, Skeleton, Sparkline } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { useUsage } from "@/features/dashboard";

/** Compact count: 18400 → "18.4k". Exact below 1000 so small workspaces see
 * their real numbers rather than a rounded-to-nothing "0k". */
function compact(n: number): string {
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
}

/**
 * Settings → Usage tab: measured counters from `GET /workspaces/{id}/usage`.
 *
 * Only the query series has real per-day history, so it's the only tile with a
 * sparkline — the other two are point-in-time counts and get no fabricated
 * trend line.
 */
export function SettingsUsage() {
  const { usage, isPending, isError } = useUsage();

  if (isPending) {
    return (
      <Card className="p-6">
        <SectionLabel className="mb-4 pb-0">Last 30 days</SectionLabel>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[118px] rounded-[11px]" />
          ))}
        </div>
      </Card>
    );
  }

  if (isError || !usage) {
    return (
      <Card className="p-6">
        <SectionLabel className="mb-4 pb-0">Last 30 days</SectionLabel>
        <p className="text-[12.5px] text-ink-4">Usage isn't available right now.</p>
      </Card>
    );
  }

  const metrics = [
    {
      label: "Brain queries",
      value: compact(usage.queries30d),
      spark: usage.querySeries,
    },
    {
      label: "Answered from a skill",
      value: compact(usage.skillsServed30d),
      spark: null,
    },
    { label: "Skills live", value: compact(usage.activeSkills), spark: null },
  ];

  return (
    <Card className="p-6">
      <SectionLabel className="mb-4 pb-0">Last 30 days</SectionLabel>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-[11px] bg-cream p-4">
            <div className="text-[27px] font-semibold tracking-[-0.03em] text-ink">
              {metric.value}
            </div>
            <div className="mb-2.5 mt-0.5 text-[12.5px] text-ink-3">
              {metric.label}
            </div>
            {metric.spark ? (
              <Sparkline
                data={metric.spark}
                width={120}
                height={28}
                color="var(--accent-hex)"
              />
            ) : (
              <div className="h-[28px]" />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
